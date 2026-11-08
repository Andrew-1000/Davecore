/**
 * Full path of a page on this site, including the base path (e.g. /Davecore/ on GitHub Pages).
 * Use it for links that open in a new tab: NuxtLink treats target="_blank" links as external
 * and does not add the base path itself.
 */
export function siteUrl(path = '/') {
  const base = useRuntimeConfig().app.baseURL.replace(/\/?$/, '/')
  return base + path.replace(/^\/+/, '')
}
