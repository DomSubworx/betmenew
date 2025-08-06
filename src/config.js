// Configuration file for BetMe app
// In production, these should be environment variables

export const config = {
  SUPABASE_URL: 'https://absqrdsvpsztuwmsrmpx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic3FyZHN2cHN6dHV3bXNybXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzY0NjYsImV4cCI6MjA2OTU1MjQ2Nn0.fAsbdNBnm__4Sg4ojKrCOEg5KaplGSUAtbFeehMmZLI',
  
  // Environment configuration
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'demo', // 'demo' | 'supabase'
  
  // Feature flags
  FEATURES: {
    USE_SUPABASE: process.env.REACT_APP_USE_SUPABASE === 'true',
    USE_DEMO_DATA: process.env.REACT_APP_USE_DEMO_DATA !== 'false',
    ENABLE_REALTIME: process.env.REACT_APP_ENABLE_REALTIME === 'true',
  },
  
  // Demo data configuration
  DEMO: {
    AUTO_SAVE_INTERVAL: 5000, // 5 seconds
    PERSIST_TO_LOCALSTORAGE: true,
    MAX_BETS_PER_USER: 10,
    MAX_INVITATIONS_PER_BET: 8,
  }
};

// Helper functions
export const isDemoMode = () => config.ENVIRONMENT === 'demo' || config.FEATURES.USE_DEMO_DATA;
export const isSupabaseMode = () => config.ENVIRONMENT === 'supabase' && config.FEATURES.USE_SUPABASE;
export const shouldUseSupabase = () => isSupabaseMode() && !isDemoMode(); 