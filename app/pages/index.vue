<script setup lang="ts">
import { SITE, SERVICES, PROCESS } from '~/data/site'
import { PLANS } from '~/data/plans'

useSeoMeta({ title: `${SITE.name}: design, cost and build`, description: SITE.intro })
const featured = PLANS.slice(0, 3)
const { data: features } = useBqFeatures()
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 sheet-grid" aria-hidden="true" />
      <UContainer class="relative py-16 sm:py-24 grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
        <div>
          <p class="sheet-label">
            {{ SITE.name }} · {{ SITE.tagline }}
          </p>
          <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-highlighted mt-4 leading-[1.05]">
            Homes designed, costed and built properly.
          </h1>
          <p class="mt-6 text-lg text-muted max-w-xl">
            {{ SITE.intro }} Start with a free estimate, pick a ready-made plan, or talk to our team about a custom design.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton size="xl" to="/tools" icon="i-lucide-calculator" label="Estimate my build" />
            <UButton size="xl" color="neutral" variant="outline" to="/plans" trailing-icon="i-lucide-arrow-right" label="Browse house plans" />
          </div>
        </div>
        <!-- Drawing-sheet card -->
        <div class="rounded-sm border-2 border-accented p-1.5 bg-default shadow-lg max-w-lg lg:ms-auto w-full">
          <div class="border border-default">
            <div class="flex justify-between border-b border-default px-4 py-2 text-[10px] uppercase tracking-widest text-muted">
              <span>Plan {{ PLANS[1]!.code }} · {{ PLANS[1]!.name }}</span><span>Ground floor</span>
            </div>
            <div class="p-3">
              <FloorPlan :floor="PLANS[1]!.floors[0]!" />
            </div>
            <div class="grid grid-cols-3 border-t border-default text-xs">
              <div class="px-3 py-2 border-e border-default">
                <p class="text-[9px] uppercase tracking-widest text-dimmed">
                  Bedrooms
                </p><p class="font-mono">
                  {{ PLANS[1]!.bedrooms }}
                </p>
              </div>
              <div class="px-3 py-2 border-e border-default">
                <p class="text-[9px] uppercase tracking-widest text-dimmed">
                  Area
                </p><p class="font-mono">
                  {{ PLANS[1]!.floorAreas[0] }} m²
                </p>
              </div>
              <div class="px-3 py-2">
                <p class="text-[9px] uppercase tracking-widest text-dimmed">
                  Plot
                </p><p class="font-mono">
                  {{ PLANS[1]!.minPlot }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Services -->
    <UContainer class="py-16 sm:py-20">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p class="sheet-label">
            What we do
          </p>
          <h2 class="font-display text-3xl sm:text-4xl font-semibold mt-2">
            One team from first sketch to handover
          </h2>
        </div>
        <UButton to="/services" color="neutral" variant="link" trailing-icon="i-lucide-arrow-right" label="All services" />
      </div>
      <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-default border border-default rounded-lg overflow-hidden">
        <div v-for="s in SERVICES" :key="s.key" class="bg-default p-6">
          <UIcon :name="s.icon" class="size-7 text-primary" />
          <h3 class="font-display text-xl font-semibold mt-4">
            {{ s.title }}
          </h3>
          <p class="text-sm text-muted mt-2">
            {{ s.summary }}
          </p>
        </div>
      </div>
    </UContainer>

    <!-- Plans -->
    <section class="bg-elevated/40 border-y border-default">
      <UContainer class="py-16 sm:py-20">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p class="sheet-label">
              Ready-made house plans
            </p>
            <h2 class="font-display text-3xl sm:text-4xl font-semibold mt-2">
              Proven designs, ready to build
            </h2>
            <p class="text-muted mt-2 max-w-xl">
              Buy a complete drawing set, then let us adapt it to your plot and price it with a Bill of Quantities.
            </p>
          </div>
          <UButton to="/plans" trailing-icon="i-lucide-arrow-right" label="See all plans" />
        </div>
        <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <PlanCard v-for="p in featured" :key="p.slug" :plan="p" />
        </div>
      </UContainer>
    </section>

    <!-- Process -->
    <UContainer class="py-16 sm:py-20">
      <p class="sheet-label">
        How we work
      </p>
      <h2 class="font-display text-3xl sm:text-4xl font-semibold mt-2">
        Five clear stages
      </h2>
      <ol class="mt-8 grid md:grid-cols-5 gap-4">
        <li v-for="(p, i) in PROCESS" :key="p.title" class="relative rounded-lg border border-default p-5">
          <span class="font-mono text-sm text-primary">{{ String(i + 1).padStart(2, '0') }}</span>
          <p class="font-display text-lg font-semibold mt-2">
            {{ p.title }}
          </p>
          <p class="text-sm text-muted mt-1">
            {{ p.text }}
          </p>
        </li>
      </ol>
    </UContainer>

    <!-- Cost tools -->
    <section class="bg-primary text-white">
      <UContainer class="py-14 grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <h2 class="font-display text-3xl font-semibold">
            What will your building cost?
          </h2>
          <p class="mt-2 text-white/80 max-w-2xl">
            Use our free cost calculator and material calculators, built on current Kenyan rates. No sign-up needed.
            <span v-if="features && features.flags.cost_estimator === false" class="block mt-1 text-white/60">(The calculators are being updated; please check back soon.)</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton size="lg" color="neutral" class="bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100" to="/tools" icon="i-lucide-calculator" label="Open cost tools" />
          <UButton size="lg" color="neutral" variant="outline" class="bg-transparent text-white ring-white/60 hover:bg-white/10 active:bg-white/20" to="/contact" label="Talk to us" />
        </div>
      </UContainer>
    </section>
  </div>
</template>
