# Opt-In Form Setup Instructions

## Overview
The opt-in form has been enhanced to save submissions to a text file on the server and provide success/error feedback to users.

## Files Added/Modified

### New Files:
1. **process-form.php** - Server-side PHP script that handles form submissions
2. **js/form-handler.js** - JavaScript file for AJAX form handling
3. **test-form.html** - Simple test page for the form functionality

### Modified Files:
1. **opt-in.html** - Updated to use the new form processing system

## Setup Requirements

### Option 1: Local Development with PHP
1. Install PHP on your system (if not already installed)
2. Start a local PHP server:
   ```bash
   php -S localhost:8000
   ```
3. Open your browser and navigate to `http://localhost:8000/opt-in.html`

### Option 2: Web Server with PHP Support
1. Upload all files to your web server
2. Ensure PHP is enabled on your hosting provider
3. Set appropriate permissions for the script to write files (chmod 755 or 644)

## How It Works

### Form Submission Process:
1. User fills out the form and clicks "Continue"
2. JavaScript prevents default form submission
3. Form data is sent via AJAX to `process-form.php`
4. PHP script validates the data
5. If valid, data is saved to `opt-in-submissions.txt`
6. Success/error message is displayed to the user

### Data Storage:
- Form submissions are saved to `opt-in-submissions.txt`
- Each submission includes timestamp, name, email, phone, and opt-in status
- Format: `[YYYY-MM-DD HH:MM:SS] FirstName LastName | Email: email@example.com | Phone: +1234567890 | Opted In: Yes`

### Form Validation:
- All fields are required
- Email format validation
- Phone number format validation
- Terms acceptance checkbox must be checked

## Features

### Client-Side:
- Real-time form validation
- AJAX submission (no page refresh)
- Success/error message display
- Form reset after successful submission
- Button state management during submission

### Server-Side:
- Input sanitization and validation
- Email format validation
- Phone number format validation
- Data persistence to text file
- JSON response format
- Error handling

## Testing

### Quick Test:
1. Open `test-form.html` in your browser
2. Fill out the form with test data
3. Submit and verify the response
4. Check if `opt-in-submissions.txt` was created and contains your data

### Production Testing:
1. Test the actual `opt-in.html` form
2. Verify all validation rules work correctly
3. Check that data is being saved properly
4. Test error scenarios (missing fields, invalid email, etc.)

## Security Considerations

### Current Implementation:
- Input sanitization to prevent XSS attacks
- Basic validation for email and phone formats
- Data is stored in plain text file

### Recommendations for Production:
1. Use a database instead of text files for better security and scalability
2. Add CSRF protection
3. Implement rate limiting to prevent spam
4. Add server-side logging for debugging
5. Consider encrypting sensitive data
6. Set up proper file permissions
7. Add backup and recovery procedures

## Troubleshooting

### Common Issues:
1. **Form not submitting**: Check if PHP is running and `process-form.php` is accessible
2. **No success message**: Check browser console for JavaScript errors
3. **File not created**: Verify write permissions on the directory
4. **Validation errors**: Check PHP error logs for detailed error messages

### Debug Mode:
The PHP script includes error reporting for debugging. For production, comment out these lines:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Customization

### Modifying Form Fields:
1. Update the HTML form in `opt-in.html`
2. Modify the PHP validation in `process-form.php`
3. Update the JavaScript handler in `js/form-handler.js`

### Changing Data Format:
Modify the `$dataLine` variable in `process-form.php` to change how data is stored in the text file.

### Adding Email Notifications:
You can extend `process-form.php` to send email notifications when forms are submitted by adding PHP mail functionality.

## Support
For issues or questions, check the browser console and server error logs for detailed error messages.
