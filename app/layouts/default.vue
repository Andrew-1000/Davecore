<script setup lang="ts">
import { SITE } from '~/data/site'

const { isAdmin } = useSiteAuth()
const { data: settings } = useSiteSettings()
const links = [
  { label: 'Services', to: '/services' },
  { label: 'House plans', to: '/plans' },
  { label: 'Cost tools', to: '/tools' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' }
]
const year = new Date().getFullYear()
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-default">
    <UHeader :ui="{ root: 'border-b border-default bg-default/90 backdrop-blur' }">
      <template #left>
        <SiteLogo />
      </template>
      <UNavigationMenu :items="links" variant="link" />
      <template #right>
        <ClientOnly>
          <UButton v-if="isAdmin" to="/admin" color="neutral" variant="ghost" icon="i-lucide-layout-dashboard" label="Admin" class="hidden sm:inline-flex" />
        </ClientOnly>
        <UButton to="/contact" label="Get a quote" class="hidden md:inline-flex" />
      </template>
      <template #body>
        <UNavigationMenu :items="isAdmin ? [...links, { label: 'Website admin', to: '/admin' }] : links" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>

    <footer class="bg-slate-950 text-slate-300">
      <UContainer class="py-12 grid gap-10 md:grid-cols-4">
        <div class="md:col-span-2">
          <SiteLogo inverted />
          <p class="mt-4 text-sm max-w-sm text-slate-400">
            {{ settings.intro }}
          </p>
        </div>
        <div>
          <p class="sheet-label !text-slate-500">
            Explore
          </p>
          <ul class="mt-3 space-y-2 text-sm">
            <li v-for="l in links" :key="l.to">
              <NuxtLink :to="l.to" class="hover:text-white">
                {{ l.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <p class="sheet-label !text-slate-500">
            Contact
          </p>
          <ul class="mt-3 space-y-2 text-sm">
            <li v-if="settings.contact.phone">
              <a :href="`tel:${settings.contact.phone.replace(/s/g, '')}`" class="hover:text-white"><UIcon name="i-lucide-phone" class="align-[-2px]" /> {{ settings.contact.phone }}</a>
            </li>
            <li v-if="settings.contact.whatsapp">
              <a :href="`https://wa.me/${settings.contact.whatsapp}`" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 hover:text-white">
                <svg viewBox="0 0 24 24" class="size-4 text-[#25D366]" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m5.8 14.02c-.24.68-1.42 1.3-1.96 1.35-.5.05-1.13.07-1.83-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.14.31-.29.48-.14.17-.3.38-.43.5-.14.15-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.41.29.15.46.12.62-.07.17-.2.72-.84.91-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.7-.17 1.38" /></svg>
                WhatsApp us
              </a>
            </li>
            <li v-if="settings.contact.email">
              <UIcon name="i-lucide-mail" class="align-[-2px]" /> {{ settings.contact.email }}
            </li>
            <li><UIcon name="i-lucide-map-pin" class="align-[-2px]" /> {{ settings.contact.address }}</li>
            <li class="text-slate-500">
              {{ settings.contact.hours }}
            </li>
          </ul>
        </div>
      </UContainer>
      <div class="border-t border-white/10">
        <UContainer class="py-4 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
          <span class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {{ year }} {{ SITE.name }}</span>
            <NuxtLink to="/share-your-experience" class="inline-flex items-center gap-1.5 text-slate-300 hover:text-white">
              <UIcon name="i-lucide-message-square-quote" class="size-3.5" /> Share your experience
            </NuxtLink>
            <NuxtLink to="/login" class="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-2.5 py-1 text-slate-200 hover:text-white hover:border-white/40 hover:bg-white/5">
              <UIcon name="i-lucide-lock-keyhole" class="size-3.5" /> Staff sign in
            </NuxtLink>
          </span>
          <span>Estimates on this site are indicative. A measured Bill of Quantities gives a tender-ready price.</span>
        </UContainer>
      </div>
    </footer>
  </div>
</template>
