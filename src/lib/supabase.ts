import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CLE, SUPABASE_URL } from '../config'

export const supabase = createClient(SUPABASE_URL, SUPABASE_CLE, {
  // PKCE : le lien du mail revient avec ?code=… plutôt qu'avec #access_token=…,
  // ce qui ne gêne pas la navigation de l'application (qui utilise le # pour ses pages).
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
})
