<script setup lang="ts">
import { SITE, SERVICES } from '~/data/site'

useSeoMeta({ title: `Services | ${SITE.name}` })
</script>

<template>
  <div>
    <section class="border-b border-default relative">
      <div class="absolute inset-0 sheet-grid" aria-hidden="true" />
      <UContainer class="relative py-14">
        <p class="sheet-label">
          Services
        </p>
        <h1 class="font-display text-4xl font-semibold mt-2">
          Everything your build needs
        </h1>
        <p class="text-muted mt-3 max-w-2xl">
          Use us for one stage or the whole project: design, costing, approvals, construction and handover.
        </p>
      </UContainer>
    </section>
    <UContainer class="py-14 space-y-6">
      <article v-for="(s, i) in SERVICES" :id="s.key" :key="s.key" class="grid md:grid-cols-[4rem_1fr_1fr] gap-6 rounded-lg border border-default p-6 scroll-mt-20">
        <span class="font-mono text-sm text-primary">{{ String(i + 1).padStart(2, '0') }}</span>
        <div>
          <h2 class="font-display text-2xl font-semibold flex items-center gap-2">
            <UIcon :name="s.icon" class="text-primary" /> {{ s.title }}
          </h2>
          <p class="text-muted mt-2">
            {{ s.summary }}
          </p>
        </div>
        <ul class="space-y-2">
          <li v-for="p in s.points" :key="p" class="flex gap-2 text-sm">
            <UIcon name="i-lucide-check" class="size-4 mt-0.5 text-success shrink-0" /> {{ p }}
          </li>
        </ul>
      </article>
      <div class="rounded-lg bg-elevated/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p class="font-display text-xl">
          Not sure where to start? A consultation costs you nothing.
        </p>
        <UButton to="/contact" size="lg" label="Book a consultation" trailing-icon="i-lucide-arrow-right" />
      </div>
    </UContainer>
  </div>
</template>
