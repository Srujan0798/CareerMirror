
/**
 * APPLICATION CONFIGURATION
 * 
 * To go live with Supabase:
 * 1. Run the SQL in `backend/supabase_schema.sql` in your Supabase SQL Editor.
 * 2. Paste your ANON_KEY below.
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://curusunnvnsadfswupae.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "", 
  },
  
  // Feature Flags
  features: {
    useRealBackend: true, 
  }
};

// Helper to check if we can connect
export const isSupabaseConfigured = () => {
  return config.supabase.url.length > 0 && 
         config.supabase.anonKey.length > 10 &&
         config.features.useRealBackend;
};
