import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

// Force use config values since we don't have .env file
const supabaseUrl = config.SUPABASE_URL
const supabaseAnonKey = config.SUPABASE_ANON_KEY

console.log('🔌 Supabase client configuration:')
console.log('🔌 URL:', supabaseUrl)
console.log('🔌 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔌 Supabase client created:', supabase)

// Test the connection immediately
console.log('🔌 Testing Supabase connection...')
supabase.from('users').select('count').then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error)
  } else {
    console.log('✅ Supabase connection test successful:', data)
  }
}).catch(err => {
  console.error('❌ Supabase connection test exception:', err)
})

