/**
 * Supabase Configuration
 * Update these values with your actual Supabase project details
 */

// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://fxbgfoymkdtmnlnuqqty.supabase.co',           // e.g., 'https://your-project.supabase.co'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Ymdmb3lta2R0bW5sbnVxcXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Mzg4MDYsImV4cCI6MjA2MDIxNDgwNn0.8timNyreYUzWaSyc4bQcn8bH8xZqatCdNGnLeqKPVGg'  // Your anon/public key from Supabase dashboard
};

// Make configuration available globally
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
