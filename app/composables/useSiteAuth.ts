import type { User } from '@supabase/supabase-js'

/**
 * Website sign-in (Supabase Auth). Independent of the BQ system: these accounts are for staff
 * who manage the website's plans, testimonials, contact details and enquiries.
 */
export function useSiteAuth() {
  const user = useState<User | null>('site-user', () => null)
  const isAdmin = useState('site-is-admin', () => false)
  const ready = useState('site-auth-ready', () => false)
  const configured = !!useSupabase()

  async function checkAdmin(u: User | null) {
    const sb = useSupabase()
    if (!u || !sb) {
      isAdmin.value = false
      return
    }
    // RLS lets each user see only their own row: present = admin
    const { data } = await sb.from('site_admins').select('user_id').eq('user_id', u.id).maybeSingle()
    isAdmin.value = !!data
  }

  async function login(email: string, password: string) {
    const sb = useSupabase()
    if (!sb) throw new Error('Website sign-in is not set up yet.')
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    await checkAdmin(data.user)
    return data.user
  }

  async function logout() {
    await useSupabase()?.auth.signOut()
    user.value = null
    isAdmin.value = false
  }

  async function sendPasswordReset(email: string) {
    const sb = useSupabase()
    if (!sb) throw new Error('Website sign-in is not set up yet.')
    const redirectTo = `${location.origin}${useRuntimeConfig().app.baseURL.replace(/\/?$/, '/')}reset-password`
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw error
  }

  async function setPassword(password: string) {
    const sb = useSupabase()
    if (!sb) throw new Error('Website sign-in is not set up yet.')
    const { error } = await sb.auth.updateUser({ password })
    if (error) throw error
  }

  /** Called once in the browser (plugins/auth.client.ts). */
  async function init() {
    const sb = useSupabase()
    if (!sb || ready.value) {
      ready.value = true
      return
    }
    const { data } = await sb.auth.getSession()
    user.value = data.session?.user ?? null
    await checkAdmin(user.value).catch(() => { isAdmin.value = false })
    ready.value = true
    sb.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null
      if (next?.id !== user.value?.id) {
        user.value = next
        checkAdmin(next).catch(() => { isAdmin.value = false })
      }
    })
  }

  return { user, isAdmin, ready, configured, login, logout, sendPasswordReset, setPassword, init }
}
