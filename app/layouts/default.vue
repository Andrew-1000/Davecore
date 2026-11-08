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
          <span>© {{ year }} {{ SITE.name }} · <NuxtLink to="/share-your-experience" class="hover:text-white">Share your experience</NuxtLink> · <NuxtLink to="/login" class="hover:text-white">Staff sign in</NuxtLink></span>
          <span>Estimates on this site are indicative. A measured Bill of Quantities gives a tender-ready price.</span>
        </UContainer>
      </div>
    </footer>
  </div>
</template>
