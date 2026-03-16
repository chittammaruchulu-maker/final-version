import { createClient } from "@supabase/supabase-js"

/**
 * Returns a Supabase client using the service role key.
 * This bypasses RLS entirely — only use in server-side code (API routes, Server Components).
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: url=${!!url} key=${!!key}`)
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
