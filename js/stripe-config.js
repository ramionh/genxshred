// Stripe Configuration
// Uses environment variables for security
const STRIPE_CONFIG = {
    // For Netlify, you can access build-time environment variables
    // Set STRIPE_PUBLISHABLE_KEY in your Netlify environment variables
    publishableKey: 'pk_live_51RZlAAGOLHhy7CIraslBhtePtrTJX8e4KSzjjJHXwtfvuJ9g7sRe43ydGPhcq3cvdr8QwlrXy17AWD4IqrFVLE8A00UJsBvbM9',
    // Add your PRICE IDs (not product IDs) from your Stripe dashboard
    // These should start with 'price_' not 'prod_'
    priceIds: {
        monthly: 'price_YOUR_MONTHLY_PRICE_ID', // $149/month plan - replace with actual price ID
        weekly: 'price_YOUR_WEEKLY_PRICE_ID'    // $189/month plan - replace with actual price ID
    }
};

// Initialize Stripe
const stripe = Stripe(STRIPE_CONFIG.publishableKey);

// Export for use in other files
window.STRIPE_CONFIG = STRIPE_CONFIG;
window.stripe = stripe;
