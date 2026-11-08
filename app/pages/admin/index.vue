<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Overview' })

const sb = useSupabase()
const counts = ref<{ live: number, drafts: number, pending: number, published: number, newEnquiries: number } | null>(null)
const { data: features, status: featureStatus } = useBqFeatures()
const bq = useBqBase()

async function count(table: string, apply: (q: any) => any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { count: n } = await apply(sb!.from(table).select('id', { count: 'exact', head: true }))
  return n ?? 0
}

onMounted(async () => {
  if (!sb) return
  const [live, drafts, pending, published, newEnquiries] = await Promise.all([
    count('plans', q => q.eq('published', true)),
    count('plans', q => q.eq('published', false)),
    count('testimonials', q => q.eq('published', false)),
    count('testimonials', q => q.eq('published', true)),
    count('enquiries', q => q.eq('status', 'new'))
  ])
  counts.value = { live, drafts, pending, published, newEnquiries }
})

const CALCULATORS: [string, string][] = [['cost_estimator', 'Cost calculator'], ['material_calculators', 'Material calculators'], ['estimate_requests', 'Estimate requests']]
</script>

<template>
  <div class="space-y-6">
    <div class="grid sm:grid-cols-3 gap-4">
      <NuxtLink to="/admin/enquiries" class="rounded-lg border border-default p-5 hover:border-primary/60 transition">
        <p class="text-sm text-muted flex items-center gap-2">
          <UIcon name="i-lucide-inbox" /> New enquiries
        </p>
        <p class="font-mono text-3xl font-semibold mt-2">{{ counts?.newEnquiries ?? '–' }}</p>
      </NuxtLink>
      <NuxtLink to="/admin/testimonials" class="rounded-lg border border-default p-5 hover:border-primary/60 transition">
        <p class="text-sm text-muted flex items-center gap-2">
          <UIcon name="i-lucide-message-square-quote" /> Testimonials waiting for approval
        </p>
        <p class="font-mono text-3xl font-semibold mt-2">{{ counts?.pending ?? '–' }}</p>
        <p class="text-xs text-muted mt-1">{{ counts ? `${counts.published} published` : '' }}</p>
      </NuxtLink>
      <NuxtLink to="/admin/plans" class="rounded-lg border border-default p-5 hover:border-primary/60 transition">
        <p class="text-sm text-muted flex items-center gap-2">
          <UIcon name="i-lucide-house" /> House plans on the site
        </p>
        <p class="font-mono text-3xl font-semibold mt-2">{{ counts?.live ?? '–' }}</p>
        <p class="text-xs text-muted mt-1">{{ counts ? `${counts.drafts} draft${counts.drafts === 1 ? '' : 's'}` : '' }}</p>
      </NuxtLink>
    </div>

    <section class="rounded-lg border border-default">
      <div class="px-5 py-3 border-b border-default flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="font-semibold">
            Cost calculators on the website
          </h2>
          <p class="text-xs text-muted">
            The calculators come from the BQ system; switch them on or off in its admin.
          </p>
        </div>
        <UButton :to="`${bq}/admin/features`" target="_blank" size="sm" color="neutral" variant="outline" trailing-icon="i-lucide-external-link" label="Open BQ admin" />
      </div>
      <div class="p-5">
        <p v-if="featureStatus === 'pending' || featureStatus === 'idle'" class="text-sm text-muted">
          Checking…
        </p>
        <p v-else-if="!features" class="text-sm text-warning flex items-center gap-2">
          <UIcon name="i-lucide-cloud-off" /> The BQ system cannot be reached, so the cost tools page shows "temporarily unavailable".
        </p>
        <ul v-else class="flex flex-wrap gap-2">
          <li v-for="[key, label] in CALCULATORS" :key="key">
            <UBadge :color="features.flags[key] === false ? 'neutral' : 'success'" variant="subtle" size="lg" :icon="features.flags[key] === false ? 'i-lucide-circle-off' : 'i-lucide-circle-check'" :label="`${label}: ${features.flags[key] === false ? 'off' : 'on'}`" />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
