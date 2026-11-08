<script setup lang="ts">
import { PLAN_TYPES, type Plan } from '~/data/plans'

defineProps<{ plan: Plan }>()
</script>

<template>
  <NuxtLink :to="`/plans/${plan.slug}`" class="group flex flex-col rounded-lg border border-default bg-default overflow-hidden transition hover:border-primary/60 hover:shadow-md">
    <div class="bg-elevated/50 border-b border-default" :class="plan.images?.length ? '' : 'p-3'">
      <PlanImage v-if="plan.images?.length" :src="plan.images[0]!" :alt="`${plan.name} preview`" class="aspect-[4/3]" />
      <FloorPlan v-else-if="plan.floors.length" :floor="plan.floors[0]!" compact />
      <div v-else class="aspect-[4/3] grid place-items-center text-dimmed">
        <UIcon name="i-lucide-layout-panel-left" class="size-10" />
      </div>
    </div>
    <div class="p-4 flex flex-col flex-1">
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-[10px] font-mono text-muted">
            {{ plan.code }}
          </p>
          <h3 class="font-display text-xl font-semibold text-highlighted group-hover:text-primary transition">
            {{ plan.name }}
          </h3>
        </div>
        <UBadge variant="subtle" :label="PLAN_TYPES[plan.type]" />
      </div>
      <p class="text-sm text-muted mt-1">
        {{ plan.bedrooms }} bedroom{{ plan.bedrooms > 1 ? 's' : '' }} · {{ plan.bathrooms }} bath · {{ plan.floorAreas.reduce((s, a) => s + a, 0) }} m²{{ plan.floorAreas.length > 1 ? ` · ${plan.floorAreas.length} floors` : '' }}
      </p>
      <div class="mt-auto pt-4 flex items-end justify-between">
        <p class="text-xs text-muted">
          Drawing set
          <span class="block font-mono text-base font-semibold text-highlighted">KES {{ plan.price.toLocaleString('en-KE') }}</span>
        </p>
        <span class="text-sm font-medium text-primary inline-flex items-center gap-1">View plan <UIcon name="i-lucide-arrow-right" class="transition group-hover:translate-x-0.5" /></span>
      </div>
    </div>
  </NuxtLink>
</template>
