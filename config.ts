
/**
 * APPLICATION CONFIGURATION
 * 
 * To go live with Supabase:
 * 1. Run the SQL in `backend/supabase_schema.sql` in your Supabase SQL Editor.
 * 2. Paste your ANON_KEY below.
 */

export const config = {
  supabase: {
    url: "https://curusunnvnsadfswupae.supabase.co",
    // 🛑 ACTION REQUIRED: Replace with your actual Supabase Anon Key
    anonKey: process.env.SUPABASE_KEY || "", 
  },
  
  // Feature Flags
  features: {
    useRealBackend: false, // Set to true once you have added the anonKey
  }
};

// Helper to check if we can connect
export const isSupabaseConfigured = () => {
  return config.supabase.url.length > 0 && config.supabase.anonKey.length > 10;
};
