import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || config.SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

