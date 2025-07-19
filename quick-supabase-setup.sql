-- Quick Setup SQL for Supabase (copy and paste this into Supabase SQL editor)

-- Create the opt_in_submissions table
CREATE TABLE IF NOT EXISTS opt_in_submissions (
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_opt_in_submissions_email ON opt_in_submissions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE opt_in_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow insertions from authenticated and anonymous users
DROP POLICY IF EXISTS "Allow opt-in submissions" ON opt_in_submissions;
CREATE POLICY "Allow opt-in submissions" ON opt_in_submissions
FOR INSERT 
TO public
WITH CHECK (true);

-- Create a policy to allow reading submissions (for admin dashboard if needed)
DROP POLICY IF EXISTS "Allow reading opt-in submissions" ON opt_in_submissions;
CREATE POLICY "Allow reading opt-in submissions" ON opt_in_submissions
FOR SELECT 
TO authenticated
USING (true);
