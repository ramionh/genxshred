const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  try {
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe configuration error' }),
      };
    }

    // Parse request body
    const { priceId, planName } = JSON.parse(event.body);

    // Validate required parameters
    if (!priceId || !planName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters: priceId and planName' }),
      };
    }

    // Get the site URL from headers or use a fallback
    const siteUrl = event.headers.origin || 
                   event.headers.referer?.replace(/\/$/, '') || 
                   `https://${event.headers.host}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // For recurring payments
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/coaching.html`,
      metadata: {
        plan_name: planName,
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true, // Allow discount codes
      subscription_data: {
        metadata: {
          plan_name: planName,
        },
      },
    });

    // Return session ID
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
    };

  } catch (error) {
    console.error('Stripe error:', error);
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Unable to create checkout session' 
      }),
    };
  }
};
