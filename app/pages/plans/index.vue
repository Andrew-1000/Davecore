<script setup lang="ts">
import { SITE } from '~/data/site'
import { PLANS, PLAN_TYPES } from '~/data/plans'

useSeoMeta({ title: `House plans | ${SITE.name}` })

const type = ref<'all' | keyof typeof PLAN_TYPES>('all')
const beds = ref<number>(0)
const shown = computed(() => PLANS.filter(p => (type.value === 'all' || p.type === type.value) && (!beds.value || p.bedrooms >= beds.value)))
</script>

<template>
  <div>
    <section class="border-b border-default relative">
      <div class="absolute inset-0 sheet-grid" aria-hidden="true" />
      <UContainer class="relative py-14">
        <p class="sheet-label">
          Ready-made house plans
        </p>
        <h1 class="font-display text-4xl font-semibold mt-2">
          Choose a plan, build with confidence
        </h1>
        <p class="text-muted mt-3 max-w-2xl">
          Each plan comes as a complete drawing set. Previews are watermarked; you receive the full-resolution PDFs after purchase. We can adapt any plan to your plot and prepare its Bill of Quantities.
        </p>
      </UContainer>
    </section>
    <UContainer class="py-10">
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <div class="flex rounded-md border border-default overflow-hidden text-sm" role="radiogroup" aria-label="Plan type">
          <button
            v-for="opt in [{ v: 'all', l: 'All' }, ...Object.entries(PLAN_TYPES).map(([v, l]) => ({ v, l }))]"
            :key="opt.v"
            type="button"
            role="radio"
            :aria-checked="type === opt.v"
            class="px-3 py-1.5 border-e border-default last:border-e-0"
            :class="type === opt.v ? 'bg-primary text-inverted' : 'hover:bg-elevated'"
            @click="type = opt.v as typeof type"
          >
            {{ opt.l }}
          </button>
        </div>
        <USelect v-model="beds" :items="[{ label: 'Any bedrooms', value: 0 }, { label: '2+ bedrooms', value: 2 }, { label: '3+ bedrooms', value: 3 }, { label: '4+ bedrooms', value: 4 }]" class="w-44" />
        <span class="text-sm text-muted ms-auto">{{ shown.length }} plan{{ shown.length === 1 ? '' : 's' }}</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <PlanCard v-for="p in shown" :key="p.slug" :plan="p" />
      </div>
      <p v-if="!shown.length" class="text-center text-muted py-16">
        No plans match. Try fewer filters, or ask us for a custom design.
      </p>
    </UContainer>
  </div>
</template>
