import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://absqrdsvpsztuwmsrmpx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic3FyZHN2cHN6dHV3bXNybXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzY0NjYsImV4cCI6MjA2OTU1MjQ2Nn0.fAsbdNBnm__4Sg4ojKrCOEg5KaplGSUAtbFeehMmZLI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

