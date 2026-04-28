import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Lazily created so module import doesn't throw when env vars aren't set (e.g. build-time prerender)
let _instance: SupabaseClient<Database> | null = null

function getInstance(): SupabaseClient<Database> {
  if (!_instance) {
    _instance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _instance
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    const instance = getInstance()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (instance as any)[prop as string]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    return typeof value === 'function' ? (value as Function).bind(instance) : value
  },
})
