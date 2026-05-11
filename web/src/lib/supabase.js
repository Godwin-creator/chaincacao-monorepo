import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl)  throw new Error('Variable manquante : VITE_SUPABASE_URL (voir .env.example)')
if (!supabaseAnon) throw new Error('Variable manquante : VITE_SUPABASE_ANON_KEY (voir .env.example)')

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
})
