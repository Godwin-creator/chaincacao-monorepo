import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseAnon) {
  supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
    },
  })
} else {
  console.warn('[ChainCacao] Variables Supabase absentes — mode démonstration activé (données mock).')
}

export { supabase }
