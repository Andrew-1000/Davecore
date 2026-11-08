import { PLANS, type Plan, type Floor } from '~/data/plans'
import { SITE } from '~/data/site'
import type { Testimonial } from '~/data/testimonials'

/*
 * Website content, live from Supabase (managed in the website admin), falling back to the
 * built-in content in app/data when Supabase is not connected or cannot be reached.
 *
 * Pages are prerendered at build time with the content of that moment, then refreshed in the
 * browser on every visit, so admin edits show immediately without rebuilding the site.
 */

export interface PlanRow {
  id: string
  slug: string
  code: string
  name: string
  type: Plan['type']
  bedrooms: number
  bathrooms: number
  floor_areas: (number | string)[]
  min_plot: string
  style: string
  price: number | string
  summary: string
  features: string[]
  floors: Floor[]
  images: string[]
  pdf_path: string | null
  published: boolean
  sort: number
}

export const PLAN_COLUMNS = 'id, slug, code, name, type, bedrooms, bathrooms, floor_areas, min_plot, style, price, summary, features, floors, images, pdf_path, published, sort'

export function planFromRow(r: PlanRow): Plan {
  return {
    slug: r.slug,
    code: r.code,
    name: r.name,
    type: r.type,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    floorAreas: (r.floor_areas ?? []).map(Number),
    minPlot: r.min_plot,
    style: r.style,
    price: Number(r.price),
    summary: r.summary,
    features: r.features ?? [],
    floors: Array.isArray(r.floors) ? r.floors : [],
    images: (r.images ?? []).map(planImageUrl)
  }
}

/**
 * useAsyncData that also refreshes in the browser once the page is shown. Prerendered data
 * (from the build, or a route's _payload.json on client navigation) would otherwise be reused.
 * During hydration Nuxt answers refresh() from that cache, so wait until hydration is done.
 */
function useLive<T>(key: string, load: () => Promise<T>, fallback: () => T) {
  const res = useAsyncData<T>(key, load, { default: fallback })
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    onMounted(() => {
      if (nuxtApp.isHydrating) nuxtApp.hooks.hookOnce('app:suspense:resolve', () => { res.refresh() })
      else res.refresh()
    })
  }
  return res
}

export function usePlans() {
  return useLive('plans', async () => {
    const sb = useSupabase()
    if (!sb) return PLANS
    const { data, error } = await sb.from('plans').select(PLAN_COLUMNS).eq('published', true).order('sort').order('name')
    if (error) return PLANS
    return (data as PlanRow[]).map(planFromRow)
  }, () => (useSupabase() ? [] : PLANS))
}

export function usePlan(slug: string) {
  return useLive(`plan:${slug}`, async () => {
    const sb = useSupabase()
    const builtIn = PLANS.find(p => p.slug === slug) ?? null
    if (!sb) return builtIn
    const { data, error } = await sb.from('plans').select(PLAN_COLUMNS).eq('slug', slug).eq('published', true).maybeSingle()
    if (error) return builtIn
    return data ? planFromRow(data as PlanRow) : null
  }, () => null as Plan | null)
}

export function useTestimonials() {
  return useLive('testimonials', async () => {
    const sb = useSupabase()
    if (!sb) return [] as Testimonial[]
    const { data, error } = await sb.from('testimonials').select('id, quote, name, role, location, project, rating').eq('published', true).order('sort').order('created_at', { ascending: false })
    return error ? [] : (data as Testimonial[])
  }, () => [] as Testimonial[])
}

export interface ContactSettings { phone: string, whatsapp: string, email: string, address: string, hours: string }
export interface SiteSettings { contact: ContactSettings, intro: string }

export const DEFAULT_SETTINGS: SiteSettings = { contact: { ...SITE.contact }, intro: SITE.intro }

export function mergeSettings(rows: { key: string, value: Record<string, unknown> }[]): SiteSettings {
  const contact = rows.find(r => r.key === 'contact')?.value ?? {}
  const company = rows.find(r => r.key === 'company')?.value ?? {}
  const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d)
  return {
    contact: {
      phone: str(contact.phone, SITE.contact.phone),
      whatsapp: str(contact.whatsapp, SITE.contact.whatsapp),
      email: str(contact.email, SITE.contact.email),
      address: str(contact.address, SITE.contact.address),
      hours: str(contact.hours, SITE.contact.hours)
    },
    intro: str(company.intro, SITE.intro) || SITE.intro
  }
}

export function useSiteSettings() {
  return useLive('site-settings', async () => {
    const sb = useSupabase()
    if (!sb) return DEFAULT_SETTINGS
    const { data, error } = await sb.from('site_settings').select('key, value')
    return error ? DEFAULT_SETTINGS : mergeSettings(data as { key: string, value: Record<string, unknown> }[])
  }, () => DEFAULT_SETTINGS)
}

/** URL-safe slug from a plan name, e.g. "Amani 3 bedroom bungalow" → "amani-3-bedroom-bungalow". */
export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-')
