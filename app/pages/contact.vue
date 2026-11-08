<script setup lang="ts">
import { SITE } from '~/data/site'

useSeoMeta({ title: `Contact | ${SITE.name}` })
const { data: settings } = useSiteSettings()
const c = computed(() => settings.value.contact)
</script>

<template>
  <div>
    <section class="border-b border-default relative">
      <div class="absolute inset-0 sheet-grid" aria-hidden="true" />
      <UContainer class="relative py-14">
        <p class="sheet-label">
          Contact
        </p>
        <h1 class="font-display text-4xl font-semibold mt-2">
          Let's talk about your project
        </h1>
        <p class="text-muted mt-3 max-w-2xl">
          Book a free consultation, request a quote or Bill of Quantities, or ask about a house plan. We reply within one working day.
        </p>
      </UContainer>
    </section>
    <UContainer class="py-12 grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-10 items-start">
      <div class="rounded-lg border border-default p-6">
        <EnquiryForm choose-kind />
      </div>
      <aside class="space-y-4 text-sm">
        <div class="rounded-lg border border-default p-5 space-y-3">
          <p v-if="c.phone" class="flex gap-2">
            <UIcon name="i-lucide-phone" class="size-4 mt-0.5 text-primary" /> <span>{{ c.phone }} <a :href="`tel:${c.phone.replace(/\s/g, '')}`" class="text-primary underline ms-1">call</a></span>
          </p>
          <p v-if="c.whatsapp" class="flex gap-2">
            <UIcon name="i-lucide-message-circle" class="size-4 mt-0.5 text-primary" /> <a :href="`https://wa.me/${c.whatsapp}`" target="_blank" rel="noopener" class="text-primary underline">WhatsApp us</a>
          </p>
          <p v-if="c.email" class="flex gap-2">
            <UIcon name="i-lucide-mail" class="size-4 mt-0.5 text-primary" /> {{ c.email }}
          </p>
          <p class="flex gap-2">
            <UIcon name="i-lucide-map-pin" class="size-4 mt-0.5 text-primary" /> {{ c.address }}
          </p>
          <p class="flex gap-2 text-muted">
            <UIcon name="i-lucide-clock" class="size-4 mt-0.5" /> {{ c.hours }}
          </p>
        </div>
        <div class="rounded-lg bg-elevated/50 p-5">
          <p class="font-medium">
            Want a number first?
          </p>
          <p class="text-muted mt-1">
            Try the free cost calculator for an instant estimate.
          </p>
          <UButton class="mt-3" size="sm" to="/tools" icon="i-lucide-calculator" label="Open cost tools" />
        </div>
      </aside>
    </UContainer>
  </div>
</template>
