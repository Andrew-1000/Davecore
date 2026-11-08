<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { SITE } from '~/data/site'

/** Website admin shell. Only signed-in website admins get past the gate (and RLS enforces it server-side too). */
const { user, isAdmin, ready, configured, logout } = useSiteAuth()
const route = useRoute()

const signingOut = ref(false)
watchEffect(() => {
  if (!import.meta.client || !ready.value || signingOut.value) return
  if (!configured || !user.value || !isAdmin.value) navigateTo('/login')
})

const nav = computed<NavigationMenuItem[]>(() => [
  { label: 'Overview', icon: 'i-lucide-layout-dashboard', to: '/admin', exact: true },
  { label: 'House plans', icon: 'i-lucide-house', to: '/admin/plans' },
  { label: 'Testimonials', icon: 'i-lucide-message-square-quote', to: '/admin/testimonials' },
  { label: 'Enquiries', icon: 'i-lucide-inbox', to: '/admin/enquiries' },
  { label: 'Contact & company', icon: 'i-lucide-building-2', to: '/admin/settings' }
])

async function signOut() {
  // Switch the sign-in gate off, or it would redirect to the login page as the session ends
  signingOut.value = true
  await logout()
  await navigateTo('/')
}
useHead({ meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div class="min-h-dvh bg-default">
    <ClientOnly>
      <template #fallback>
        <div class="min-h-dvh grid place-items-center text-muted">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
        </div>
      </template>
      <div v-if="!ready || !user || !isAdmin" class="min-h-dvh grid place-items-center text-muted">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
      </div>
      <UDashboardGroup v-else unit="rem" storage="local">
        <UDashboardSidebar id="site-admin" collapsible resizable :ui="{ footer: 'border-t border-default' }">
          <template #header="{ collapsed }">
            <SiteLogo v-if="!collapsed" />
            <UIcon v-else name="i-lucide-house" class="size-5 mx-auto text-primary" />
          </template>
          <template #default="{ collapsed }">
            <p v-if="!collapsed" class="px-2.5 pt-2 text-[10px] font-semibold tracking-[0.16em] uppercase text-dimmed">
              Website admin
            </p>
            <UNavigationMenu :collapsed="collapsed" :items="nav" orientation="vertical" tooltip />
            <UNavigationMenu
              :collapsed="collapsed"
              :items="[{ label: 'View website', icon: 'i-lucide-external-link', to: siteUrl('/'), target: '_blank' }]"
              :external-icon="false"
              orientation="vertical"
              tooltip
              class="mt-auto"
            />
          </template>
          <template #footer="{ collapsed }">
            <div class="flex items-center gap-2 w-full min-w-0">
              <UIcon name="i-lucide-user-round" class="size-4 shrink-0 text-muted" />
              <span v-if="!collapsed" class="text-sm truncate flex-1" :title="user.email">{{ user.email }}</span>
              <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-log-out" :aria-label="`Sign out of ${SITE.short} admin`" @click="signOut" />
            </div>
          </template>
        </UDashboardSidebar>
        <UDashboardPanel :id="`site-admin-${String(route.name)}`" :ui="{ body: '*:shrink-0' }">
          <template #header>
            <UDashboardNavbar :title="String(route.meta.title ?? 'Website admin')">
              <template #leading>
                <UDashboardSidebarCollapse />
              </template>
            </UDashboardNavbar>
          </template>
          <template #body>
            <slot />
          </template>
        </UDashboardPanel>
      </UDashboardGroup>
    </ClientOnly>
  </div>
</template>
