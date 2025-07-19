-- Supabase SQL Setup for Contact Form Submissions
-- Run this SQL in your Supabase SQL editor to create the necessary table

-- Create the contact_submissions table
CREATE TABLE contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on email for faster queries
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);

-- Create an index on submitted_at for faster date-based queries
CREATE INDEX idx_contact_submissions_submitted_at ON contact_submissions(submitted_at);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow insertions from authenticated and anonymous users
CREATE POLICY "Allow contact form submissions" ON contact_submissions
FOR INSERT 
TO public
WITH CHECK (true);

-- Create a policy to allow reading submissions (for admin dashboard if needed)
-- You might want to restrict this to authenticated users only
CREATE POLICY "Allow reading contact submissions" ON contact_submissions
FOR SELECT 
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT INSERT ON contact_submissions TO anon;
GRANT SELECT ON contact_submissions TO authenticated;
