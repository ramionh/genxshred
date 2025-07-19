/**
 * Contact Form Handler with Supabase Integration
 * Handles form submission and saves data to Supabase database
 */

class ContactFormHandler {
    constructor() {
        this.supabaseUrl = window.SUPABASE_CONFIG?.url || '';
        this.supabaseKey = window.SUPABASE_CONFIG?.anonKey || '';
        this.supabase = null;
        this.form = null;
        this.submitButton = null;
        
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
        this.form = document.getElementById('wf-form-Contact-Form');
        this.submitButton = this.form?.querySelector('input[type="submit"]');

        if (!this.form) {
            console.error('Contact form not found');
            return;
        }

        // Add event listener for form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!await this.initSupabase()) {
            this.showError('Configuration error. Please try again later.');
            return;
        }

        // Get form data
        const formData = this.getFormData();
        
        // Validate form data
        const validation = this.validateForm(formData);
        if (!validation.isValid) {
            this.showError(validation.message);
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Save to Supabase
            await this.saveToSupabase(formData);
            
            // Show success message
            this.showSuccess();
            
            // Reset form
            this.form.reset();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showError('Failed to send message. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        return {
            name: formData.get('Name')?.trim() || '',
            email: formData.get('Email')?.trim() || '',
            subject: formData.get('Subject')?.trim() || '',
            message: formData.get('Message')?.trim() || '',
            submitted_at: new Date().toISOString()
        };
    }

    validateForm(data) {
        // Check required fields
        if (!data.name) {
            return { isValid: false, message: 'Please enter your name.' };
        }

        if (!data.email) {
            return { isValid: false, message: 'Please enter your email address.' };
        }

        if (!data.message) {
            return { isValid: false, message: 'Please enter a message.' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        // Check message length
        if (data.message.length < 10) {
            return { isValid: false, message: 'Please enter a message with at least 10 characters.' };
        }

        return { isValid: true };
    }

    async saveToSupabase(data) {
        const { data: result, error } = await this.supabase
            .from('contact_submissions')
            .insert([{
                name: data.name,
                email: data.email,
                subject: data.subject || null,
                message: data.message,
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
            this.submitButton.value = 'Sending...';
            this.submitButton.disabled = true;
            this.submitButton.style.opacity = '0.7';
        } else {
            this.submitButton.value = 'Send Message';
            this.submitButton.disabled = false;
            this.submitButton.style.opacity = '1';
        }
    }

    showSuccess() {
        // Hide error message
        this.hideError();
        
        // Show Webflow success message
        const successDiv = document.querySelector('.w-form-done');
        const failDiv = document.querySelector('.w-form-fail');
        
        if (successDiv) {
            successDiv.style.display = 'block';
        }
        if (failDiv) {
            failDiv.style.display = 'none';
        }

        // Hide success message after 5 seconds
        setTimeout(() => {
            if (successDiv) {
                successDiv.style.display = 'none';
            }
        }, 5000);
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

// Initialize the contact form handler when the script loads
new ContactFormHandler();
