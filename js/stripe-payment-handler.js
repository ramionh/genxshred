class StripePaymentHandler {
    constructor() {
        this.stripe = window.stripe;
        this.config = window.STRIPE_CONFIG;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Find all Select buttons and add click handlers
        const selectButtons = document.querySelectorAll('.pricing-select-btn');
        selectButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handlePlanSelection(e));
        });
    }

    handlePlanSelection(event) {
        event.preventDefault();
        
        // Determine which plan was selected
        const button = event.target;
        const card = button.closest('.contact_card');
        const priceElement = card.querySelector('h4');
        const priceText = priceElement.textContent;
        
        let priceId;
        let planName;
        
        if (priceText.includes('$149')) {
            priceId = this.config.priceIds.monthly;
            planName = 'Monthly Calls Plan';
        } else if (priceText.includes('$189')) {
            priceId = this.config.priceIds.weekly;
            planName = 'Weekly Calls Plan';
        }

        if (!priceId) {
            console.error('Could not determine price ID for selected plan');
            this.showError('Unable to process payment. Please try again.');
            return;
        }

        this.createCheckoutSession(priceId, planName);
    }

    async createCheckoutSession(priceId, planName) {
        try {
            // Show loading state
            this.setLoadingState(true);

            // Debug logging
            console.log('Creating checkout session for:', { priceId, planName });
            console.log('Calling Netlify Function endpoint...');

            // Create checkout session using Netlify Function
            const response = await fetch('/.netlify/functions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: priceId,
                    planName: planName
                })
            });

            console.log('Response status:', response.status);
            console.log('Response URL:', response.url);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
                }
                console.error('Server error:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const session = await response.json();
            console.log('Session created successfully:', session);

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.sessionId
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

        } catch (error) {
            console.error('Error creating checkout session:', error);
            
            // More specific error messages
            if (error.message.includes('404')) {
                this.showError('Payment system is being set up. Please try again in a few minutes or contact support.');
            } else if (error.message.includes('Failed to fetch')) {
                this.showError('Network connection error. Please check your internet connection and try again.');
            } else {
                this.showError(`Unable to process payment: ${error.message}. Please try again or contact support.`);
            }
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        const buttons = document.querySelectorAll('.pricing-select-btn');
        buttons.forEach(button => {
            if (isLoading) {
                button.textContent = 'Processing...';
                button.disabled = true;
                button.style.opacity = '0.7';
            } else {
                button.textContent = 'Select';
                button.disabled = false;
                button.style.opacity = '1';
            }
        });
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('stripe-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'stripe-error-message';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(errorDiv);
        }

        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new StripePaymentHandler();
});
