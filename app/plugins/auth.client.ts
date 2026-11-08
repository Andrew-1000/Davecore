/** Restore a saved website session on first load. */
export default defineNuxtPlugin(() => {
  useSiteAuth().init()
})
