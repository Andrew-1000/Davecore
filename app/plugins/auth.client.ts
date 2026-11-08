/** Restore a saved website session on first load. */
export default defineNuxtPlugin(() => {
  const { restore } = useAuth()
  restore()
})
