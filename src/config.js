// Configuration file for BetMe app
// In production, these should be environment variables

// Debug logging to see what's being read
console.log('🔍 Environment variables check:');
console.log('🔍 REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('🔍 REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? `${process.env.REACT_APP_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined');

export const config = {
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'YOUR_ACTUAL_SUPABASE_URL_HERE',
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ACTUAL_SUPABASE_ANON_KEY_HERE',
  
  // Environment configuration - FORCE SUPABASE MODE
  ENVIRONMENT: 'supabase', // 'demo' | 'supabase'
  
  // Feature flags - FORCE SUPABASE MODE
  FEATURES: {
    USE_SUPABASE: true,
    USE_DEMO_DATA: false,
    ENABLE_REALTIME: true,
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