// Static company website, deployed to GitHub Pages. Everything dynamic (sign-in, enquiries,
// calculators, feature switches) comes from the Davecore BQ system API at runtime.
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
      /** Davecore BQ system base URL (API, sign-in, embedded calculators). */
      bqApiBase: 'http://localhost:3000',
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
