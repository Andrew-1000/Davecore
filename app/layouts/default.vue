<script setup lang="ts">
import { SITE } from '~/data/site'

const { user } = useAuth()
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
        <UButton v-if="user" to="/account" color="neutral" variant="ghost" icon="i-lucide-user-round" :label="user.name.split(' ')[0]" class="hidden sm:inline-flex" />
        <UButton v-else to="/login" color="neutral" variant="ghost" icon="i-lucide-log-in" label="Sign in" class="hidden sm:inline-flex" />
        <UButton to="/contact" label="Get a quote" class="hidden md:inline-flex" />
      </template>
      <template #body>
        <UNavigationMenu :items="[...links, user ? { label: 'My account', to: '/account' } : { label: 'Sign in', to: '/login' }]" orientation="vertical" class="-mx-2.5" />
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
            {{ SITE.intro }}
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
            <li v-if="SITE.contact.phone">
              <UIcon name="i-lucide-phone" class="align-[-2px]" /> {{ SITE.contact.phone }}
            </li>
            <li v-if="SITE.contact.email">
              <UIcon name="i-lucide-mail" class="align-[-2px]" /> {{ SITE.contact.email }}
            </li>
            <li><UIcon name="i-lucide-map-pin" class="align-[-2px]" /> {{ SITE.contact.address }}</li>
            <li class="text-slate-500">
              {{ SITE.contact.hours }}
            </li>
          </ul>
        </div>
      </UContainer>
      <div class="border-t border-white/10">
        <UContainer class="py-4 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
          <span>© {{ year }} {{ SITE.name }}</span>
          <span>Estimates on this site are indicative. A measured Bill of Quantities gives a tender-ready price.</span>
        </UContainer>
      </div>
    </footer>
  </div>
</template>
