// Stripe Configuration
// Replace with your actual Stripe publishable key
const STRIPE_CONFIG = {
    publishableKey: 'pk_live_51RZlAAGOLHhy7CIraslBhtePtrTJX8e4KSzjjJHXwtfvuJ9g7sRe43ydGPhcq3cvdr8QwlrXy17AWD4IqrFVLE8A00UJsBvbM9', // Replace with your actual publishable key
    // Add your price IDs from your Stripe dashboard
    priceIds: {
        monthly: 'prod_ShpzOEAMKArLqd', // $149/month plan
        weekly: 'prod_Shq17Rno26yjtb'    // $189/month plan
    }
};

// Initialize Stripe
const stripe = Stripe(STRIPE_CONFIG.publishableKey);

// Export for use in other files
window.STRIPE_CONFIG = STRIPE_CONFIG;
window.stripe = stripe;
