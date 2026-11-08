<script setup lang="ts">
import { SITE } from '~/data/site'
import { PLAN_INCLUDES, PLAN_TYPES, planBySlug } from '~/data/plans'

const route = useRoute()
const plan = planBySlug(String(route.params.slug))
if (!plan) throw createError({ statusCode: 404, statusMessage: 'Plan not found', fatal: true })
useSeoMeta({ title: `${plan.name} ${PLAN_TYPES[plan.type].toLowerCase()} plan (${plan.code}) | ${SITE.name}`, description: plan.summary })

const floorTab = ref(0)
const totalArea = plan.floorAreas.reduce((s, a) => s + a, 0)
const enquireOpen = ref(false)
// Prefill the cost calculator with this plan's building type and floor areas
const estimateLink = { path: '/tools', query: { type: plan.type, areas: plan.floorAreas.join(',') } }
</script>

<template>
  <UContainer v-if="plan" class="py-10">
    <UButton to="/plans" color="neutral" variant="link" icon="i-lucide-arrow-left" label="All plans" class="-ms-2.5" />
    <div class="mt-4 grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-8 items-start">
      <div>
        <p class="font-mono text-xs text-muted">
          {{ plan.code }}
        </p>
        <h1 class="font-display text-4xl font-semibold text-highlighted">
          {{ plan.name }}
        </h1>
        <p class="text-muted mt-2 max-w-2xl">
          {{ plan.summary }}
        </p>

        <div class="mt-6 rounded-sm border-2 border-accented p-1.5">
          <div class="border border-default">
            <div class="flex items-center justify-between border-b border-default px-3 py-2">
              <div v-if="plan.floors.length > 1" class="flex gap-1">
                <UButton v-for="(f, i) in plan.floors" :key="f.name" size="xs" :variant="floorTab === i ? 'solid' : 'ghost'" :color="floorTab === i ? 'primary' : 'neutral'" :label="f.name" @click="floorTab = i" />
              </div>
              <span v-else class="text-[10px] uppercase tracking-widest text-muted">{{ plan.floors[0]!.name }}</span>
              <span class="text-[10px] uppercase tracking-widest text-muted">Watermarked preview</span>
            </div>
            <div class="p-3 sm:p-6 bg-elevated/30">
              <FloorPlan :floor="plan.floors[floorTab]!" />
            </div>
          </div>
        </div>
        <p v-if="plan.type === 'apartment'" class="mt-2 text-xs text-muted">
          Typical floor shown; the block repeats it on {{ plan.floorAreas.length }} levels.
        </p>

        <div class="mt-8 grid sm:grid-cols-2 gap-6">
          <div>
            <h2 class="font-display text-xl font-semibold">
              Highlights
            </h2>
            <ul class="mt-3 space-y-2">
              <li v-for="f in plan.features" :key="f" class="flex gap-2 text-sm">
                <UIcon name="i-lucide-check" class="size-4 mt-0.5 text-success shrink-0" /> {{ f }}
              </li>
            </ul>
          </div>
          <div>
            <h2 class="font-display text-xl font-semibold">
              The drawing set includes
            </h2>
            <ul class="mt-3 space-y-2">
              <li v-for="f in PLAN_INCLUDES" :key="f" class="flex gap-2 text-sm">
                <UIcon name="i-lucide-file-text" class="size-4 mt-0.5 text-primary shrink-0" /> {{ f }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Title block -->
      <aside class="lg:sticky lg:top-20 rounded-sm border-2 border-accented p-1.5">
        <div class="border border-default">
          <dl class="grid grid-cols-2 text-sm">
            <div class="px-3 py-2 border-b border-e border-default">
              <dt class="text-[9px] uppercase tracking-widest text-dimmed">
                Type
              </dt><dd>{{ PLAN_TYPES[plan.type] }}</dd>
            </div>
            <div class="px-3 py-2 border-b border-default">
              <dt class="text-[9px] uppercase tracking-widest text-dimmed">
                Style
              </dt><dd>{{ plan.style }}</dd>
            </div>
            <div class="px-3 py-2 border-b border-e border-default">
              <dt class="text-[9px] uppercase tracking-widest text-dimmed">
                Bedrooms
              </dt><dd class="font-mono">
                {{ plan.bedrooms }}
              </dd>
            </div>
            <div class="px-3 py-2 border-b border-default">
              <dt class="text-[9px] uppercase tracking-widest text-dimmed">
                Bathrooms
              </dt><dd class="font-mono">
                {{ plan.bathrooms }}
              </dd>
            </div>
            <div class="px-3 py-2 border-b border-e border-default">
              <dt class="text-[9px] uppercase tracking-widest text-dimmed">
                Floor area
              </dt><dd class="font-mono">
                {{ totalArea }} m²
              </dd>
            </div>
            <div class="px-3 py-2 border-b border-default">
              <dt class="text-[9px] uppercase tracking-widest text-dimmed">
                Min. plot
              </dt><dd class="font-mono">
                {{ plan.minPlot }}
              </dd>
            </div>
          </dl>
          <div class="px-4 py-4 border-b border-default bg-primary/5">
            <p class="text-[9px] uppercase tracking-widest text-dimmed">
              Drawing set price
            </p>
            <p class="font-mono text-3xl font-bold text-primary mt-1">
              KES {{ plan.price.toLocaleString('en-KE') }}
            </p>
          </div>
          <div class="p-4 space-y-2">
            <UButton block size="lg" icon="i-lucide-shopping-bag" label="Buy or enquire" @click="enquireOpen = true" />
            <UButton block color="neutral" variant="outline" icon="i-lucide-calculator" label="Estimate the cost to build" :to="estimateLink" />
            <p class="text-[11px] text-dimmed pt-1">
              Online M-Pesa checkout is coming soon. For now, send an enquiry and we'll confirm payment and send the drawings.
            </p>
          </div>
        </div>
      </aside>
    </div>

    <UModal v-model:open="enquireOpen" :title="`Buy or enquire: ${plan.name} (${plan.code})`" description="Tell us how to reach you. We'll confirm the price, payment and any changes you need.">
      <template #body>
        <EnquiryForm kind="plan" :plan-ref="plan.code" :subject="`Plan ${plan.code} · ${plan.name}`" />
      </template>
    </UModal>
  </UContainer>
</template>
