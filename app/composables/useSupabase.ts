import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The website's Supabase client (website sign-in and content), or null when the site is not
 * connected to Supabase yet, in which case pages fall back to the built-in content in app/data.
 */
let client: SupabaseClient | null | undefined

export function useSupabase(): SupabaseClient | null {
  if (client !== undefined) return client
  const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
  // Accept the URL as copied from Supabase's Data API page too (…supabase.co/rest/v1/)
  const url = String(supabaseUrl || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  const key = String(supabaseKey || '').trim()
  client = url && key
    ? createClient(url, key, {
        auth: {
          // Sessions only exist in the browser; the build (prerender) reads public content only
          persistSession: import.meta.client,
          autoRefreshToken: import.meta.client,
          detectSessionInUrl: import.meta.client,
          storageKey: 'davecore.site.auth'
        }
      })
    : null
  return client
}

/** Public URL of a preview image in the "plan-images" bucket. */
export function planImageUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return useSupabase()?.storage.from('plan-images').getPublicUrl(path).data.publicUrl ?? ''
}

export function supabaseError(e: unknown): string {
  const err = e as { message?: string, error_description?: string }
  const msg = err?.message || err?.error_description || ''
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return 'Cannot reach the server right now. Please check your connection and try again.'
  if (/Invalid login credentials/i.test(msg)) return 'Wrong email or password.'
  if (/Email not confirmed/i.test(msg)) return 'This email address has not been confirmed yet.'
  if (/row-level security|permission denied/i.test(msg)) return 'You do not have permission to do that.'
  return msg || 'Something went wrong.'
}
