import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Custom no-op lock to bypass navigator.locks which can get permanently stuck
// when a tab crashes or the auth state change handler doesn't release the lock.
// Safe for single-tab dashboard applications.
async function lockNoOp(_name, _acquireTimeout, fn) {
  return await fn()
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
        lock: lockNoOp,
      },
    })
  : null
