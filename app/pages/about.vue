<script setup lang="ts">
import { SITE, PROCESS } from '~/data/site'

useSeoMeta({ title: `About | ${SITE.name}` })
const { data: settings } = useSiteSettings()
const values = [
  { icon: 'i-lucide-ruler', title: 'Measured, not guessed', text: 'Every project is priced from a measured Bill of Quantities, so the number you approve is the number you build to.' },
  { icon: 'i-lucide-eye', title: 'Open books', text: 'You see the rates, the quantities and the progress. Changes are priced and agreed before they happen.' },
  { icon: 'i-lucide-shield-check', title: 'Built to the drawings', text: 'Qualified supervision on site, approvals in place and quality checks at every stage.' }
]
</script>

<template>
  <div>
    <section class="border-b border-default relative">
      <div class="absolute inset-0 sheet-grid" aria-hidden="true" />
      <UContainer class="relative py-14 max-w-4xl">
        <p class="sheet-label">
          About us
        </p>
        <h1 class="font-display text-4xl font-semibold mt-2">
          {{ SITE.name }}
        </h1>
        <p class="text-lg text-muted mt-4">
          {{ settings.intro }} We work with homeowners, landlords and developers across Kenya, from a first conversation about budget to handing over the keys.
        </p>
      </UContainer>
    </section>
    <UContainer class="py-14 grid md:grid-cols-3 gap-6">
      <div v-for="v in values" :key="v.title" class="rounded-lg border border-default p-6">
        <UIcon :name="v.icon" class="size-7 text-primary" />
        <h2 class="font-display text-xl font-semibold mt-4">
          {{ v.title }}
        </h2>
        <p class="text-sm text-muted mt-2">
          {{ v.text }}
        </p>
      </div>
    </UContainer>
    <section class="bg-elevated/40 border-t border-default">
      <UContainer class="py-14">
        <h2 class="font-display text-3xl font-semibold">
          How a project runs
        </h2>
        <ol class="mt-6 space-y-3 max-w-3xl">
          <li v-for="(p, i) in PROCESS" :key="p.title" class="flex gap-4">
            <span class="size-8 shrink-0 rounded-full bg-primary text-inverted grid place-items-center font-mono text-sm">{{ i + 1 }}</span>
            <p><b>{{ p.title }}.</b> <span class="text-muted">{{ p.text }}</span></p>
          </li>
        </ol>
        <UButton class="mt-8" to="/contact" size="lg" label="Start a conversation" trailing-icon="i-lucide-arrow-right" />
      </UContainer>
    </section>
  </div>
</template>
