# Contact Form Supabase Integration Setup Guide

## Overview
This guide will help you set up the contact form to save submissions to your Supabase database instead of using PHP files.

## Prerequisites
- A Supabase account and project
- Basic knowledge of Supabase dashboard

## Step 1: Set Up Supabase Database

### 1.1 Create the Database Table
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL script to create the `contact_submissions` table

### 1.2 Verify Table Creation
1. Go to the Table Editor in your Supabase dashboard
2. You should see a new table called `contact_submissions` with the following columns:
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR)
   - `email` (VARCHAR)
   - `subject` (VARCHAR, optional)
   - `message` (TEXT)
   - `submitted_at` (TIMESTAMP)
   - `created_at` (TIMESTAMP)

## Step 2: Configure Supabase Connection

### 2.1 Get Your Supabase Credentials
1. In your Supabase dashboard, go to Settings → API
2. Copy your Project URL (e.g., `https://your-project.supabase.co`)
3. Copy your `anon/public` key

### 2.2 Update Configuration
1. Open `js/supabase-config.js`
2. Replace the placeholder values with your actual Supabase credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://your-project.supabase.co',
       anonKey: 'your-anon-key-here'
   };
   ```

## Step 3: Test the Integration

### 3.1 Local Testing
1. Open `contact.html` in a web server (not file:// protocol)
2. Fill out the contact form
3. Submit the form
4. Check your Supabase dashboard → Table Editor → contact_submissions

### 3.2 Production Testing
1. Deploy your files to your web server
2. Test the contact form on your live website
3. Verify submissions are appearing in Supabase

## Step 4: Features and Functionality

### 4.1 Form Validation
The form includes client-side validation for:
- Required fields (name, email, message)
- Email format validation
- Minimum message length (10 characters)

### 4.2 User Experience
- Loading state during submission
- Success message display
- Error message display
- Form reset after successful submission

### 4.3 Data Storage
Each submission includes:
- Contact person's name
- Email address
- Subject (optional)
- Message content
- Timestamp of submission

## Step 5: Viewing Submissions

### 5.1 Supabase Dashboard
1. Go to Table Editor → contact_submissions
2. View all submissions in a table format
3. Export data as needed

### 5.2 Query Examples
```sql
-- Get all submissions from today
SELECT * FROM contact_submissions 
WHERE submitted_at >= CURRENT_DATE;

-- Get submissions by email
SELECT * FROM contact_submissions 
WHERE email = 'user@example.com';

-- Count submissions by date
SELECT DATE(submitted_at) as date, COUNT(*) as count 
FROM contact_submissions 
GROUP BY DATE(submitted_at) 
ORDER BY date DESC;
```

## Step 6: Security Considerations

### 6.1 Row Level Security (RLS)
- RLS is enabled on the table
- Anonymous users can only insert data
- Authenticated users can read data (for admin purposes)

### 6.2 Rate Limiting
Consider implementing rate limiting in Supabase Edge Functions if you experience spam.

### 6.3 Data Validation
Server-side validation is handled by Supabase's column constraints and RLS policies.

## Step 7: Troubleshooting

### 7.1 Common Issues

**Error: "Configuration error"**
- Check that `supabase-config.js` has the correct URL and API key
- Verify the API key is the `anon/public` key, not the service role key

**Error: "Failed to send message"**
- Check browser console for detailed error messages
- Verify the table exists in Supabase
- Check RLS policies allow insertions

**Form not submitting**
- Ensure you're accessing the page via HTTP/HTTPS, not file:// protocol
- Check that all required JavaScript files are loading
- Verify the form ID matches the JavaScript selector

### 7.2 Browser Console Debugging
1. Open browser developer tools (F12)
2. Go to Console tab
3. Submit the form and check for error messages

## Step 8: Optional Enhancements

### 8.1 Email Notifications
Set up Supabase Edge Functions to send email notifications when new submissions arrive.

### 8.2 Admin Dashboard
Create a simple admin page to view and manage submissions using Supabase's JavaScript client.

### 8.3 Spam Protection
Implement additional validation or use services like reCAPTCHA for spam protection.

## Files Created/Modified

### New Files:
- `js/contact-form-handler.js` - Main form handling logic
- `js/supabase-config.js` - Supabase configuration
- `supabase-setup.sql` - Database setup script
- `README-CONTACT-FORM-SETUP.md` - This setup guide

### Modified Files:
- `contact.html` - Added script references for Supabase integration

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your Supabase project settings
3. Check browser console for error messages
4. Ensure all files are uploaded to your web server

## Security Note

The `anon/public` key is safe to use in client-side code as it only allows the operations defined by your RLS policies. Never use the `service_role` key in client-side code.
