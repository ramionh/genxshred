/**
 * Opt-In Form Handler with Supabase Integration
 * Handles form submission and saves data to Supabase database
 */

class OptInFormHandler {
    constructor() {
        this.supabaseUrl = window.SUPABASE_CONFIG?.url || '';
        this.supabaseKey = window.SUPABASE_CONFIG?.anonKey || '';
        this.supabase = null;
        this.form = null;
        this.submitButton = null;
        this.skipButton = null;
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupForm());
        } else {
            this.setupForm();
        }
    }

    async initSupabase() {
        if (!this.supabaseUrl || !this.supabaseKey) {
            console.error('Supabase URL and key must be configured');
            return false;
        }

        try {
            // Initialize Supabase client
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
    }

    setupForm() {
        this.form = document.getElementById('wf-form-Opt-In-Form');
        this.submitButton = this.form?.querySelector('input[type="submit"]');
        this.skipButton = this.form?.querySelector('.button.is-secondary');
        this.successDiv = this.form?.parentElement?.querySelector('.w-form-done');
        this.errorDiv = this.form?.parentElement?.querySelector('.w-form-fail');

        if (!this.form) {
            console.error('Opt-in form not found');
            return;
        }

        console.log('Opt-in form handler initialized');

        // Add form submission handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Add skip button handler
        if (this.skipButton) {
            this.skipButton.addEventListener('click', (e) => this.handleSkip(e));
        }
    }

    async handleSubmit(event) {
        console.log('Form submission intercepted by Supabase handler');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        if (!await this.initSupabase()) {
            console.error('Supabase initialization failed');
            this.showError('Configuration error. Please try again later.');
            return;
        }

        console.log('Supabase initialized successfully');

        // Get form data
        const formData = this.getFormData();
        console.log('Form data collected:', formData);
        
        // Validate form data
        const validation = this.validateForm(formData);
        if (!validation.isValid) {
            console.log('Form validation failed:', validation.message);
            this.showError(validation.message);
            return;
        }

        console.log('Form validation passed');

        // Show loading state
        this.setLoadingState(true);

        try {
            // Save to Supabase
            console.log('Attempting to save to Supabase...');
            await this.saveToSupabase(formData);
            console.log('Successfully saved to Supabase');
            
            // Show success message
            this.showSuccess();
            
            // Optional: Redirect after successful opt-in
            setTimeout(() => {
                // Uncomment and customize the redirect as needed
                // window.location.href = 'coaching.html';
            }, 3000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            
            // Check if it's a duplicate email error
            if (error.message.includes('duplicate') || error.message.includes('unique')) {
                this.showError('This email is already registered. Thank you for your interest!');
            } else {
                this.showError('Failed to process your opt-in. Please try again.');
            }
        } finally {
            this.setLoadingState(false);
        }
    }

    handleSkip(event) {
        event.preventDefault();
        
        // Optional: Track skip action
        console.log('User skipped opt-in');
        
        // Redirect to next page or show alternative action
        // window.location.href = 'coaching.html';
        
        // For now, just show a message
        alert('You can always opt-in later by visiting our opt-in page again.');
    }

    getFormData() {
        const formData = new FormData(this.form);
        return {
            first_name: formData.get('First-Name')?.trim() || '',
            last_name: formData.get('Last-Name')?.trim() || '',
            email: formData.get('Email')?.trim() || '',
            phone_number: formData.get('Phone-Number')?.trim() || '',
            opted_in: formData.get('Opt-In-Checkbox') ? true : false,
            ip_address: null, // Will be handled server-side if needed
            user_agent: navigator.userAgent,
            submitted_at: new Date().toISOString()
        };
    }

    validateForm(data) {
        // Check required fields
        if (!data.first_name) {
            return { isValid: false, message: 'Please enter your first name.' };
        }

        if (!data.last_name) {
            return { isValid: false, message: 'Please enter your last name.' };
        }

        if (!data.email) {
            return { isValid: false, message: 'Please enter your email address.' };
        }

        if (!data.phone_number) {
            return { isValid: false, message: 'Please enter your phone number.' };
        }

        if (!data.opted_in) {
            return { isValid: false, message: 'Please accept the Terms of Service and Privacy Policy to continue.' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        // Validate phone number format (basic validation)
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(data.phone_number)) {
            return { isValid: false, message: 'Please enter a valid phone number.' };
        }

        // Check name length
        if (data.first_name.length < 2 || data.last_name.length < 2) {
            return { isValid: false, message: 'Names must be at least 2 characters long.' };
        }

        return { isValid: true };
    }

    async saveToSupabase(data) {
        const { data: result, error } = await this.supabase
            .from('opt_in_submissions')
            .insert([{
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone_number: data.phone_number,
                opted_in: data.opted_in,
                user_agent: data.user_agent,
                submitted_at: data.submitted_at
            }]);

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        return result;
    }

    setLoadingState(isLoading) {
        if (!this.submitButton) return;

        if (isLoading) {
            this.submitButton.value = 'Processing...';
            this.submitButton.disabled = true;
            this.submitButton.style.opacity = '0.7';
        } else {
            this.submitButton.value = 'Continue';
            this.submitButton.disabled = false;
            this.submitButton.style.opacity = '1';
        }
    }

    showSuccess() {
        this.hideMessages();
        if (this.successDiv) {
            // Update success message
            this.successDiv.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h3 style="color: #28a745; margin-bottom: 10px;">🎉 Welcome to Gen X Shred!</h3>
                    <p>You've successfully opted in to receive our exclusive fitness tips, workout plans, and special offers. Check your email for a welcome message!</p>
                </div>
            `;
            this.successDiv.style.display = 'block';
            this.successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Hide the form after success
        if (this.form) {
            this.form.style.display = 'none';
        }
    }

    showError(message) {
        this.hideMessages();
        if (this.errorDiv) {
            this.errorDiv.innerHTML = `
                <div style="padding: 20px; text-align: center; background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 8px;">
                    <h3 style="color: #dc3545; margin-bottom: 10px;">❌ Oops!</h3>
                    <p style="color: #dc3545;">${message}</p>
                </div>
            `;
            this.errorDiv.style.display = 'block';
            this.errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        setTimeout(() => this.hideMessages(), 7000);
    }

    hideMessages() {
        if (this.successDiv) this.successDiv.style.display = 'none';
        if (this.errorDiv) this.errorDiv.style.display = 'none';
    }

    showSuccess() {
        // Hide error message
        this.hideError();
        
        // Show custom success message for opt-in
        const successDiv = document.querySelector('.w-form-done');
        const failDiv = document.querySelector('.w-form-fail');
        
        if (successDiv) {
            const successText = successDiv.querySelector('div');
            if (successText) {
                successText.innerHTML = `
                    <strong>🎉 Welcome to Gen X Shred!</strong><br>
                    You've successfully opted in to receive our exclusive fitness tips, 
                    workout plans, and special offers. Check your email for a welcome message!
                `;
            }
            successDiv.style.display = 'block';
        }
        
        if (failDiv) {
            failDiv.style.display = 'none';
        }

        // Hide the form after successful submission
        if (this.form) {
            this.form.style.display = 'none';
        }
    }

    showError(message) {
        // Hide success message
        const successDiv = document.querySelector('.w-form-done');
        if (successDiv) {
            successDiv.style.display = 'none';
        }

        // Show error message
        const failDiv = document.querySelector('.w-form-fail');
        if (failDiv) {
            const errorText = failDiv.querySelector('div');
            if (errorText) {
                errorText.textContent = message;
            }
            failDiv.style.display = 'block';
        }

        // Hide error message after 7 seconds
        setTimeout(() => {
            this.hideError();
        }, 7000);
    }

    hideError() {
        const failDiv = document.querySelector('.w-form-fail');
        if (failDiv) {
            failDiv.style.display = 'none';
        }
    }
}

// Initialize the opt-in form handler when the script loads
new OptInFormHandler();
