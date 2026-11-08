// Static company website, deployed to GitHub Pages.
// - Website sign-in, plans, testimonials, contact details and enquiries: Supabase (supabase/schema.sql)
// - Embedded cost calculators and their on/off switches: the Davecore BQ system
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  colorMode: { preference: 'light', fallback: 'light' },
  app: {
    // Base path comes from NUXT_APP_BASE_URL: "/" locally or with a custom domain,
    // "/<repo>/" on GitHub Pages project sites (set by the deploy workflow).
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Davecore Construction',
      meta: [
        { name: 'description', content: 'Davecore Construction: architectural design, construction, ready-made house plans and Bills of Quantities in Kenya.' },
        { name: 'theme-color', content: '#1d4ed8' }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${(process.env.NUXT_APP_BASE_URL || '/').replace(/\/?$/, '/')}favicon.svg` }]
    }
  },
  runtimeConfig: {
    public: {
      /** Davecore BQ system base URL (embedded calculators). */
      bqApiBase: 'http://localhost:3000',
      /** Supabase project URL and publishable (anon) key. Safe to expose: access is enforced by
       *  row-level security in supabase/schema.sql. Empty = use the built-in content in app/data. */
      supabaseUrl: '',
      supabaseKey: '',
      siteKey: 'davecore'
    }
  },
  nitro: {
    preset: 'github_pages',
    // Nuxt adds the (base-prefixed) home page; links are crawled from there
    prerender: { crawlLinks: true }
  },
  typescript: { strict: true }
})
