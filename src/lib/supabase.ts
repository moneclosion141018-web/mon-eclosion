import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CLE, SUPABASE_URL } from '../config'

export const supabase = createClient(SUPABASE_URL, SUPABASE_CLE, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
