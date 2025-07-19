const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  console.log('📨 Received webhook event:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
      default:
        console.log(`🤷‍♂️ Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  console.log('🎉 Checkout session completed:', session.id);
  
  const customerEmail = session.customer_details?.email || session.customer_email;
  const customerName = session.customer_details?.name;
  const customerId = session.customer;

  if (!customerEmail) {
    console.error('❌ No customer email found in session');
    return;
  }

  try {
    // Get subscription details if it's a subscription
    let subscriptionTier = 'one-time';
    let subscriptionId = null;
    
    if (session.mode === 'subscription' && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      subscriptionId = subscription.id;
      
      // Determine tier based on price
      if (subscription.items.data.length > 0) {
        const priceId = subscription.items.data[0].price.id;
        subscriptionTier = getPlanNameFromPriceId(priceId);
      }
    }

    // Create or update profile
    await upsertProfile(customerEmail, customerName, customerId);
    
    // Create or update subscriber
    await upsertSubscriber(customerEmail, customerId, subscriptionTier, subscriptionId);

    console.log('✅ Successfully processed checkout session');
  } catch (error) {
    console.error('❌ Error processing checkout session:', error);
    throw error;
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  console.log('📝 Subscription created:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const customerEmail = customer.email;
    
    if (!customerEmail) {
      console.error('❌ No customer email found');
      return;
    }

    const subscriptionTier = getPlanNameFromPriceId(subscription.items.data[0].price.id);
    
    await upsertSubscriber(
      customerEmail, 
      subscription.customer, 
      subscriptionTier, 
      subscription.id,
      true, // is_active
      new Date(subscription.current_period_end * 1000) // subscription_end
    );

    console.log('✅ Successfully processed subscription creation');
  } catch (error) {
    console.error('❌ Error processing subscription creation:', error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const customerEmail = customer.email;
    
    if (!customerEmail) {
      console.error('❌ No customer email found');
      return;
    }

    const subscriptionTier = getPlanNameFromPriceId(subscription.items.data[0].price.id);
    const isActive = subscription.status === 'active';
    
    await upsertSubscriber(
      customerEmail, 
      subscription.customer, 
      subscriptionTier, 
      subscription.id,
      isActive,
      new Date(subscription.current_period_end * 1000)
    );

    console.log('✅ Successfully processed subscription update');
  } catch (error) {
    console.error('❌ Error processing subscription update:', error);
    throw error;
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  try {
    const { error } = await supabase
      .from('subscribers')
      .update({ 
        is_active: false, 
        subscribed: false,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', subscription.customer);

    if (error) throw error;
    console.log('✅ Successfully deactivated subscription');
  } catch (error) {
    console.error('❌ Error processing subscription deletion:', error);
    throw error;
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded for invoice:', invoice.id);
  
  if (invoice.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      
      // Generate new auth code for successful payment
      const newAuthCode = generateAuthCode();
      console.log(`🔢 Generated new auth code for successful payment: ${newAuthCode}`);
      
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          is_active: true,
          subscribed: true,
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          auth_code: newAuthCode,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', subscription.customer);

      if (error) throw error;
      console.log('✅ Successfully updated subscription after payment');
    } catch (error) {
      console.error('❌ Error processing payment success:', error);
      throw error;
    }
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  console.log('💳 Payment failed for invoice:', invoice.id);
  
  if (invoice.subscription) {
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', invoice.customer);

      if (error) throw error;
      console.log('✅ Successfully updated subscription after payment failure');
    } catch (error) {
      console.error('❌ Error processing payment failure:', error);
      throw error;
    }
  }
}

// Create or update profile
async function upsertProfile(email, fullName, stripeCustomerId) {
  try {
    // Parse name if provided
    let firstName = null;
    let lastName = null;
    
    if (fullName) {
      const nameParts = fullName.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || null;
    }

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw fetchError;
    }

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || existingProfile.full_name,
          first_name: firstName || existingProfile.first_name,
          last_name: lastName || existingProfile.last_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id);

      if (updateError) throw updateError;
      console.log('✅ Updated existing profile');
    } else {
      // Create new profile (this requires auth.users entry first)
      // For now, we'll skip profile creation and just handle subscribers
      console.log('ℹ️ Profile creation skipped - requires authenticated user');
    }
  } catch (error) {
    console.error('❌ Error upserting profile:', error);
    // Don't throw - we don't want to fail the webhook for profile issues
  }
}

// Create or update subscriber
async function upsertSubscriber(email, stripeCustomerId, subscriptionTier, subscriptionId = null, isActive = true, subscriptionEnd = null) {
  try {
    const subscriberData = {
      email,
      stripe_customer_id: stripeCustomerId,
      subscribed: isActive,
      subscription_tier: subscriptionTier,
      is_active: isActive,
      updated_at: new Date().toISOString()
    };

    // Generate a random 6-digit auth code for new/active subscriptions
    if (isActive) {
      subscriberData.auth_code = generateAuthCode();
      console.log(`🔢 Generated auth code for ${email}: ${subscriberData.auth_code}`);
    }

    if (subscriptionEnd) {
      subscriberData.subscription_end = subscriptionEnd.toISOString();
    }

    // Upsert subscriber (insert or update)
    const { error } = await supabase
      .from('subscribers')
      .upsert(subscriberData, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      });

    if (error) throw error;
    console.log('✅ Successfully upserted subscriber');
  } catch (error) {
    console.error('❌ Error upserting subscriber:', error);
    throw error;
  }
}

// Generate random 6-digit auth code
function generateAuthCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to get plan name from price ID
function getPlanNameFromPriceId(priceId) {
  const priceMap = {
    'price_1RmQJhGOLHhy7CIrBCyjShQV': 'monthly-coaching',
    'price_1RmQL8GOLHhy7CIrM9Pxj86W': 'weekly-coaching',
    'price_1RmeY1GOLHhy7CIrHcVzyMmt': 'trial-membership'
  };

  return priceMap[priceId] || 'unknown';
}
