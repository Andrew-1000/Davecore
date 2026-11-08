<script setup lang="ts">
import { SITE } from '~/data/site'

/*
 * The Davecore BQ system's calculators, embedded. The BQ admin decides which are switched on,
 * and must list this website's address under Admin → Website integration so it may be framed.
 */
useSeoMeta({ title: `Cost tools | ${SITE.name}` })
const base = useBqBase()
const route = useRoute()
const { data: features, status } = useBqFeatures()

const tab = ref<'estimate' | 'materials'>(route.query.tool === 'materials' ? 'materials' : 'estimate')
const estimatorOn = computed(() => features.value?.flags.cost_estimator !== false)
const materialsOn = computed(() => features.value?.flags.material_calculators !== false)
watchEffect(() => {
  if (features.value && tab.value === 'estimate' && !estimatorOn.value && materialsOn.value) tab.value = 'materials'
})

// Pass plan details (?type=&areas=) through to the cost calculator
const passQuery = computed(() => {
  const q = new URLSearchParams()
  for (const k of ['type', 'areas', 'finish', 'location']) if (route.query[k]) q.set(k, String(route.query[k]))
  return q.toString()
})
const query = computed(() => passQuery.value ? `?${passQuery.value}` : '')
const src = computed(() => tab.value === 'estimate' ? `${base}/embed/estimate${query.value}` : `${base}/embed/calculators`)
const fullScreen = computed(() => tab.value === 'estimate' ? `${base}/estimate${query.value}` : `${base}/calculators`)
</script>

<template>
  <div>
    <section class="border-b border-default relative">
      <div class="absolute inset-0 sheet-grid" aria-hidden="true" />
      <UContainer class="relative py-12">
        <p class="sheet-label">
          Free cost tools
        </p>
        <h1 class="font-display text-4xl font-semibold mt-2">
          Price your building before you build it
        </h1>
        <p class="text-muted mt-3 max-w-2xl">
          The cost calculator gives an order-of-cost figure from your floor area, town and finish. The material calculators take off cement, sand, ballast, steel, timber and more, element by element. Both use Davecore's current rates.
        </p>
        <div class="mt-6 flex flex-wrap gap-2" role="tablist">
          <UButton :variant="tab === 'estimate' ? 'solid' : 'outline'" :color="tab === 'estimate' ? 'primary' : 'neutral'" icon="i-lucide-calculator" label="Cost calculator" :disabled="!estimatorOn" role="tab" :aria-selected="tab === 'estimate'" @click="tab = 'estimate'" />
          <UButton :variant="tab === 'materials' ? 'solid' : 'outline'" :color="tab === 'materials' ? 'primary' : 'neutral'" icon="i-lucide-boxes" label="Material calculators" :disabled="!materialsOn" role="tab" :aria-selected="tab === 'materials'" @click="tab = 'materials'" />
          <ClientOnly>
            <UButton color="neutral" variant="link" :to="fullScreen" target="_blank" trailing-icon="i-lucide-external-link" label="Open full screen" class="ms-auto" />
          </ClientOnly>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-8">
      <!-- Everything below depends on live data (feature switches, URL query): browser only -->
      <ClientOnly>
        <template #fallback>
          <div class="py-24 text-center text-muted">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
          </div>
        </template>
      <div v-if="status === 'pending' || status === 'idle'" class="py-24 text-center text-muted">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
      </div>
      <div v-else-if="features === null" class="rounded-lg border border-dashed border-default py-16 text-center">
        <UIcon name="i-lucide-cloud-off" class="size-8 text-dimmed" />
        <p class="mt-3 font-medium">
          The cost tools are temporarily unavailable.
        </p>
        <p class="text-sm text-muted mt-1">
          Please try again later, or <NuxtLink to="/contact" class="text-primary underline">ask us for an estimate</NuxtLink>.
        </p>
      </div>
      <div v-else-if="!estimatorOn && !materialsOn" class="rounded-lg border border-dashed border-default py-16 text-center text-muted">
        The calculators are switched off at the moment. <NuxtLink to="/contact" class="text-primary underline">Contact us</NuxtLink> for a quote.
      </div>
      <iframe
        v-else
        :key="src"
        :src="src"
        :title="tab === 'estimate' ? 'Construction cost calculator' : 'Material calculators'"
        class="w-full rounded-lg border border-default bg-default"
        :style="{ height: tab === 'estimate' ? '2000px' : '1900px' }"
        loading="lazy"
      />
      </ClientOnly>
    </UContainer>
  </div>
</template>
