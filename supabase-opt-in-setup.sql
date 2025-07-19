-- Supabase SQL Setup for Opt-In Form Submissions
-- Run this SQL in your Supabase SQL editor to create the necessary table

-- Create the opt_in_submissions table
CREATE TABLE opt_in_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    opted_in BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique index on email to prevent duplicate opt-ins
CREATE UNIQUE INDEX idx_opt_in_submissions_email ON opt_in_submissions(email);

-- Create an index on submitted_at for faster date-based queries
CREATE INDEX idx_opt_in_submissions_submitted_at ON opt_in_submissions(submitted_at);

-- Create an index on phone number for faster phone-based queries
CREATE INDEX idx_opt_in_submissions_phone ON opt_in_submissions(phone_number);

-- Enable Row Level Security (RLS)
ALTER TABLE opt_in_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow insertions from authenticated and anonymous users
CREATE POLICY "Allow opt-in submissions" ON opt_in_submissions
FOR INSERT 
TO public
WITH CHECK (true);

-- Create a policy to allow reading submissions (for admin dashboard if needed)
-- You might want to restrict this to authenticated users only
CREATE POLICY "Allow reading opt-in submissions" ON opt_in_submissions
FOR SELECT 
TO authenticated
USING (true);

-- Create a policy to allow updates (for unsubscribe functionality if needed)
CREATE POLICY "Allow updating opt-in status" ON opt_in_submissions
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON opt_in_submissions TO anon;
GRANT SELECT, UPDATE ON opt_in_submissions TO authenticated;

-- Create a view for marketing purposes (excludes sensitive data)
CREATE VIEW marketing_subscribers AS
SELECT 
    id,
    first_name,
    last_name,
    email,
    opted_in,
    submitted_at
FROM opt_in_submissions
WHERE opted_in = true;

-- Grant access to the view
GRANT SELECT ON marketing_subscribers TO authenticated;
