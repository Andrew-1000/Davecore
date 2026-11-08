/**
 * The Davecore BQ system: only the embedded cost calculators and their on/off switches come
 * from it. Website sign-in and content are separate (see useSupabase / useSiteAuth).
 */
export function useBqBase() {
  return String(useRuntimeConfig().public.bqApiBase || '').replace(/\/+$/, '')
}

export function errorMessage(e: unknown): string {
  const err = e as { data?: { statusMessage?: string, message?: string }, statusMessage?: string, message?: string }
  if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) return 'Cannot reach the server right now. Please try again shortly.'
  return err?.data?.statusMessage || err?.data?.message || err?.statusMessage || err?.message || 'Something went wrong.'
}

/** Calculator switches from the BQ admin (null while loading or if the BQ system is unreachable). */
export function useBqFeatures() {
  return useAsyncData('bq-features', () => $fetch<{ flags: Record<string, boolean>, modules: Record<string, boolean> }>(`${useBqBase()}/api/public/features`).catch(() => null), { server: false, lazy: true })
}
