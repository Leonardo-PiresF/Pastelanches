import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const temSupabase = Boolean(url && anon)

export const supabase = temSupabase ? createClient(url, anon) : null
