/**
 * Talking to the Davecore BQ system (API, sign-in, calculators). The website is static
 * (GitHub Pages), so all dynamic features go through this API with a bearer token.
 */
export interface BqUser { id: string, name: string, email: string, role: 'admin' | 'professional' | 'member' }

const TOKEN_KEY = 'davecore.bq.token'

export function useBqBase() {
  return String(useRuntimeConfig().public.bqApiBase || '').replace(/\/+$/, '')
}

export function errorMessage(e: unknown): string {
  const err = e as { data?: { statusMessage?: string, message?: string }, statusMessage?: string, message?: string }
  if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) return 'Cannot reach the Davecore BQ service right now. Please try again shortly.'
  return err?.data?.statusMessage || err?.data?.message || err?.statusMessage || err?.message || 'Something went wrong.'
}

/** Signed-in state, shared across the app and kept in localStorage. */
export function useAuth() {
  const token = useState<string | null>('bq-token', () => null)
  const user = useState<BqUser | null>('bq-user', () => null)
  const ready = useState('bq-auth-ready', () => false)

  function save(t: string | null) {
    token.value = t
    if (import.meta.client) {
      try {
        if (t) localStorage.setItem(TOKEN_KEY, t)
        else localStorage.removeItem(TOKEN_KEY)
      }
      catch { /* private mode: keep in memory only */ }
    }
  }

  async function login(email: string, password: string) {
    const res = await $fetch<{ token: string, user: BqUser }>(`${useBqBase()}/api/auth/token`, { method: 'POST', body: { email, password } })
    save(res.token)
    user.value = res.user
    return res.user
  }

  function logout() {
    save(null)
    user.value = null
  }

  /** Restore the session from localStorage (client only). */
  async function restore() {
    if (!import.meta.client || ready.value) return
    try {
      const stored = localStorage.getItem(TOKEN_KEY)
      if (stored) {
        token.value = stored
        const res = await $fetch<{ user: BqUser }>(`${useBqBase()}/api/auth/me`, { headers: { Authorization: `Bearer ${stored}` } })
        user.value = res.user
      }
    }
    catch {
      save(null)
      user.value = null
    }
    finally {
      ready.value = true
    }
  }

  return { token, user, ready, login, logout, restore, isAdmin: computed(() => user.value?.role === 'admin') }
}

/** $fetch against the BQ API, sending the bearer token when signed in. */
export function useBqApi() {
  const { token, logout } = useAuth()
  return async function api<T>(path: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const headers: Record<string, string> = { ...(opts?.headers as Record<string, string> | undefined) }
    if (token.value) headers.Authorization = `Bearer ${token.value}`
    try {
      return await $fetch<T>(`${useBqBase()}${path}`, { ...opts, headers } as never) as T
    }
    catch (e) {
      if ((e as { statusCode?: number }).statusCode === 401) logout()
      throw e
    }
  }
}

/** Calculator switches from the BQ admin (null while loading or if the API is unreachable). */
export function useBqFeatures() {
  return useAsyncData('bq-features', () => $fetch<{ flags: Record<string, boolean>, modules: Record<string, boolean> }>(`${useBqBase()}/api/public/features`).catch(() => null), { server: false, lazy: true })
}
