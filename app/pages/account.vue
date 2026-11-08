<script setup lang="ts">
import { SITE } from '~/data/site'

/*
 * Signed-in area. Everyone sees their BQ projects; administrators also get the website
 * controls: switching the calculators shown on this site on or off (stored in the BQ system).
 */
useSeoMeta({ title: `My account | ${SITE.name}` })
const { user, ready, logout, isAdmin } = useAuth()
const api = useBqApi()
const base = useBqBase()
const toast = useToast()

watchEffect(() => {
  if (ready.value && !user.value) navigateTo('/login')
})

interface Project { id: string, name: string, client: string, status: string, revision: number, currency: string, grandTotal: number, updatedAt: string }
interface Flag { key: string, label: string, description: string, enabled: boolean, category: string }

const projects = ref<Project[] | null>(null)
const flags = ref<Flag[] | null>(null)
const loadError = ref('')

async function load() {
  loadError.value = ''
  try {
    projects.value = await api<Project[]>('/api/projects')
    if (isAdmin.value) flags.value = await api<Flag[]>('/api/admin/ref/flags')
  }
  catch (e) {
    loadError.value = errorMessage(e)
  }
}
watch(user, (u) => { if (u) load() }, { immediate: true })

const busy = ref<string | null>(null)
async function toggle(flag: Flag, enabled: boolean) {
  busy.value = flag.key
  const previous = flag.enabled
  flags.value = (flags.value ?? []).map(f => f.key === flag.key ? { ...f, enabled } : f)
  try {
    await api(`/api/admin/ref/flags/${flag.key}`, { method: 'PUT', body: { enabled } })
    toast.add({ title: `${flag.label} ${enabled ? 'switched on' : 'switched off'}`, color: 'success', icon: 'i-lucide-check' })
  }
  catch (e) {
    flags.value = (flags.value ?? []).map(f => f.key === flag.key ? { ...f, enabled: previous } : f)
    toast.add({ title: errorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    busy.value = null
  }
}

const STATUS: Record<string, { label: string, color: 'neutral' | 'warning' | 'info' | 'success' }> = {
  draft: { label: 'Draft', color: 'neutral' }, submitted: { label: 'In review', color: 'warning' }, approved: { label: 'Approved', color: 'info' }, issued: { label: 'Issued', color: 'success' }
}

function signOut() {
  logout()
  navigateTo('/')
}
</script>

<template>
  <UContainer class="py-10">
    <div v-if="!ready || !user" class="py-24 text-center text-muted">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
    </div>
    <template v-else>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="sheet-label">
            My account
          </p>
          <h1 class="font-display text-3xl font-semibold mt-1">
            Hello, {{ user.name.split(' ')[0] }}
          </h1>
          <p class="text-sm text-muted">
            {{ user.email }} · {{ user.role === 'admin' ? 'Administrator' : user.role === 'professional' ? 'Professional' : 'Member' }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton :to="`${base}/projects`" target="_blank" icon="i-lucide-external-link" label="Open BQ workspace" />
          <UButton color="neutral" variant="outline" icon="i-lucide-log-out" label="Sign out" @click="signOut" />
        </div>
      </div>

      <UAlert v-if="loadError" class="mt-6" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="loadError" />

      <div class="mt-8 grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
        <section class="rounded-lg border border-default">
          <div class="px-5 py-3 border-b border-default flex items-center justify-between">
            <h2 class="font-display text-xl font-semibold">
              My Bills of Quantities
            </h2>
            <UButton size="sm" variant="ghost" :to="`${base}/projects/new`" target="_blank" icon="i-lucide-plus" label="New BQ" />
          </div>
          <div v-if="projects === null" class="p-8 text-center text-muted">
            <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
          </div>
          <ul v-else class="divide-y divide-default">
            <li v-for="p in projects" :key="p.id" class="px-5 py-3 flex items-center justify-between gap-4">
              <div class="min-w-0">
                <p class="font-medium truncate">
                  {{ p.name }}
                </p>
                <p class="text-xs text-muted">
                  {{ p.client || 'No client' }} · Rev {{ p.revision }} · updated {{ new Date(p.updatedAt).toLocaleDateString('en-KE') }}
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <UBadge :color="STATUS[p.status]?.color" variant="subtle" :label="STATUS[p.status]?.label ?? p.status" />
                <span class="font-mono text-sm hidden sm:inline">{{ p.currency }} {{ Math.round(p.grandTotal).toLocaleString('en-KE') }}</span>
                <UButton size="xs" color="neutral" variant="outline" :to="`${base}/projects/${p.id}`" target="_blank" trailing-icon="i-lucide-arrow-up-right" label="Open" />
              </div>
            </li>
            <li v-if="!projects.length" class="px-5 py-10 text-center text-sm text-muted">
              No BQs yet. Start one in the BQ workspace, or <NuxtLink to="/contact" class="text-primary underline">ask us to prepare it</NuxtLink>.
            </li>
          </ul>
          <p class="px-5 py-3 border-t border-default text-xs text-dimmed">
            The BQ workspace opens in a new tab; sign in there with the same email and password.
          </p>
        </section>

        <section v-if="isAdmin" class="rounded-lg border border-default">
          <div class="px-5 py-3 border-b border-default">
            <h2 class="font-display text-xl font-semibold">
              Website controls
            </h2>
            <p class="text-xs text-muted">
              Switch the calculators and features shown on this website. Changes apply immediately.
            </p>
          </div>
          <div v-if="flags === null" class="p-6 text-center text-muted">
            <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
          </div>
          <div v-else class="p-5 space-y-4">
            <USwitch
              v-for="f in flags"
              :key="f.key"
              :model-value="f.enabled"
              :loading="busy === f.key"
              :label="f.label"
              :description="f.description"
              @update:model-value="(v: boolean) => toggle(f, v)"
            />
          </div>
          <div class="px-5 py-3 border-t border-default">
            <UButton size="sm" variant="link" :to="`${base}/admin`" target="_blank" trailing-icon="i-lucide-external-link" label="Full admin back-office" class="-ms-2.5" />
          </div>
        </section>
      </div>
    </template>
  </UContainer>
</template>
