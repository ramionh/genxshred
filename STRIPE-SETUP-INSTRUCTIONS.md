# Stripe Integration Setup Instructions

## 🔑 Step 1: Get Your Stripe Keys

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. In the left sidebar, click **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key** (use test keys for testing)

## 📝 Step 2: Update Configuration Files

### Update `js/stripe-config.js`:
```javascript
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE', // Replace this
    priceIds: {
        monthly: 'price_YOUR_MONTHLY_PLAN_PRICE_ID',  // $149/month plan
        weekly: 'price_YOUR_WEEKLY_PLAN_PRICE_ID'     // $189/month plan
    }
};
```

### Update `create-checkout-session.php`:
```php
\Stripe\Stripe::setApiKey('sk_test_YOUR_ACTUAL_SECRET_KEY_HERE'); // Replace this
```

## 💰 Step 3: Create Products and Prices in Stripe

1. In your Stripe Dashboard, go to **Products**
2. Click **+ Add product**

### For the $149/month plan:
- **Name**: Motivational Coaching Program w/Monthly Calls
- **Pricing**: $149.00 USD / month (recurring)
- **Copy the Price ID** (starts with `price_...`)

### For the $189/month plan:
- **Name**: Motivational Coaching Program w/Weekly Calls  
- **Pricing**: $189.00 USD / month (recurring)
- **Copy the Price ID** (starts with `price_...`)

## 🔧 Step 4: Update URLs in PHP File

In `create-checkout-session.php`, update these URLs to match your domain:

```php
'success_url' => 'https://YOUR_DOMAIN.com/success.html?session_id={CHECKOUT_SESSION_ID}',
'cancel_url' => 'https://YOUR_DOMAIN.com/coaching.html',
```

## 🚀 Step 5: Install Stripe PHP Library

If you're using the PHP backend, install the Stripe PHP library:

```bash
composer require stripe/stripe-php
```

Or download it manually from [GitHub](https://github.com/stripe/stripe-php).

## 🧪 Step 6: Test the Integration

1. Use test mode in Stripe (keys starting with `pk_test_` and `sk_test_`)
2. Test with these card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - Use any future date for expiry and any 3-digit CVC

## 📱 How It Works

1. User clicks **Select** button on coaching plan
2. JavaScript detects which plan was selected ($149 or $189)
3. Creates Stripe Checkout session via your PHP backend
4. Redirects user to Stripe's secure payment page
5. After successful payment, redirects to `success.html`
6. After cancelled payment, redirects back to `coaching.html`

## 🔒 Security Notes

- Never expose your secret key in frontend JavaScript
- Always validate webhooks in production
- Use HTTPS in production
- Consider implementing webhook endpoints for subscription management

## 🎯 Next Steps

1. Set up webhook endpoints for subscription events
2. Create customer portal for subscription management
3. Add email notifications for successful payments
4. Implement customer database to track subscriptions

## 🆘 Need Help?

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/checkout/quickstart)
- [Stripe Testing](https://stripe.com/docs/testing)

Replace all placeholder values with your actual Stripe data, and you'll have a fully functional payment system!
