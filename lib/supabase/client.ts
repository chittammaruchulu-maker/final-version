import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured')
  }

  // Always create a fresh client so it reads the latest session from cookies.
  // A cached singleton causes RLS queries to return empty results after
  // sign-in/sign-out because the stale client holds no auth token.
  return createBrowserClient(url, key)
}
