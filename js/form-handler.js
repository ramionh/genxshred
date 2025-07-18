// form-handler.js - Handle opt-in form submissions
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wf-form-Opt-In-Form');
    const successMessage = document.querySelector('.w-form-done');
    const errorMessage = document.querySelector('.w-form-fail');
    const submitButton = form.querySelector('input[type="submit"]');
    
    // Hide messages initially
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Disable submit button to prevent double submission
        submitButton.disabled = true;
        submitButton.value = 'Submitting...';
        
        // Get form data
        const formData = new FormData(form);
        
        // Send AJAX request
        fetch('process-form.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                successMessage.style.display = 'block';
                successMessage.innerHTML = '<div>' + data.message + '</div>';
                errorMessage.style.display = 'none';
                
                // Reset form
                form.reset();
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
                
            } else {
                // Show error message
                errorMessage.style.display = 'block';
                errorMessage.innerHTML = '<div>Error: ' + data.message + '</div>';
                successMessage.style.display = 'none';
                
                // Scroll to error message
                errorMessage.scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.style.display = 'block';
            errorMessage.innerHTML = '<div>An error occurred while submitting the form. Please try again.</div>';
            successMessage.style.display = 'none';
        })
        .finally(() => {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.value = 'Continue';
        });
    });
    
    // Add form validation styling
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            this.style.borderColor = '#ff4444';
        });
        
        input.addEventListener('input', function(e) {
            if (this.checkValidity()) {
                this.style.borderColor = '';
            }
        });
    });
    
    // Checkbox validation
    const checkbox = form.querySelector('#Opt-In-Checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                this.style.outline = '';
            }
        });
    }
});
