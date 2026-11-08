<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Enquiries' })

interface Row { id: string, kind: string, name: string, phone: string, email: string, subject: string, message: string, plan_ref: string, status: 'new' | 'contacted' | 'closed', created_at: string }

const sb = useSupabase()!
const toast = useToast()
const rows = ref<Row[] | null>(null)
const total = ref(0)
const page = ref(1)
const status = ref<'all' | Row['status']>('new')
const loadError = ref('')
const PAGE_SIZE = 15

async function load() {
  loadError.value = ''
  let q = sb.from('enquiries').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE - 1)
  if (status.value !== 'all') q = q.eq('status', status.value)
  const { data, error, count } = await q
  if (error) loadError.value = supabaseError(error)
  else {
    rows.value = data as Row[]
    total.value = count ?? 0
  }
}
onMounted(load)
watch(page, load)
watch(status, () => {
  if (page.value === 1) load()
  else page.value = 1
})

const STATUSES = [
  { value: 'new', label: 'New', color: 'warning' },
  { value: 'contacted', label: 'Contacted', color: 'info' },
  { value: 'closed', label: 'Closed', color: 'neutral' }
] as const
const KINDS: Record<string, string> = { consultation: 'Consultation', quote: 'Quote / BQ', plan: 'House plan', contact: 'General' }

async function setStatus(r: Row, value: Row['status']) {
  const before = r.status
  rows.value = (rows.value ?? []).map(x => x.id === r.id ? { ...x, status: value } : x)
  const { error } = await sb.from('enquiries').update({ status: value }).eq('id', r.id)
  if (error) {
    rows.value = (rows.value ?? []).map(x => x.id === r.id ? { ...x, status: before } : x)
    toast.add({ title: supabaseError(error), color: 'error' })
  }
}

const expanded = ref<string | null>(null)
const fmt = (s: string) => new Date(s).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const waNumber = (phone: string) => phone.replace(/\D/g, '').replace(/^0/, '254')
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-3">
      <USelect v-model="status" :items="[{ value: 'all', label: 'All enquiries' }, ...STATUSES.map(s => ({ value: s.value, label: s.label }))]" class="w-44" />
      <span class="text-sm text-muted">{{ total }} enquir{{ total === 1 ? 'y' : 'ies' }}</span>
      <UButton class="ms-auto" color="neutral" variant="ghost" icon="i-lucide-refresh-cw" label="Refresh" @click="load" />
    </div>

    <UAlert v-if="loadError" class="mt-4" color="error" variant="subtle" :title="loadError" />

    <div class="mt-4 rounded-lg border border-default overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-elevated/50 text-left text-xs uppercase tracking-wider text-muted">
          <tr>
            <th class="px-4 py-2.5 font-medium">
              Received
            </th>
            <th class="px-4 py-2.5 font-medium">
              From
            </th>
            <th class="px-4 py-2.5 font-medium">
              About
            </th>
            <th class="px-4 py-2.5 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-if="rows === null">
            <td colspan="4" class="px-4 py-10 text-center text-muted">
              <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
            </td>
          </tr>
          <template v-for="r in rows ?? []" :key="r.id">
            <tr class="hover:bg-elevated/30 cursor-pointer align-top" @click="expanded = expanded === r.id ? null : r.id">
              <td class="px-4 py-2.5 whitespace-nowrap text-muted">
                {{ fmt(r.created_at) }}
              </td>
              <td class="px-4 py-2.5">
                <p class="font-medium">
                  {{ r.name }}
                </p>
                <p class="text-xs text-muted font-mono">
                  {{ [r.phone, r.email].filter(Boolean).join(' · ') }}
                </p>
              </td>
              <td class="px-4 py-2.5">
                <UBadge variant="subtle" color="neutral" size="sm" :label="KINDS[r.kind] ?? r.kind" />
                <span class="ms-2">{{ r.subject || (r.plan_ref ? `Plan ${r.plan_ref}` : '') }}</span>
              </td>
              <td class="px-4 py-2.5" @click.stop>
                <USelect :model-value="r.status" :items="STATUSES.map(s => ({ value: s.value, label: s.label }))" size="sm" class="w-36" @update:model-value="(v) => setStatus(r, v as Row['status'])" />
              </td>
            </tr>
            <tr v-if="expanded === r.id" class="bg-elevated/20">
              <td colspan="4" class="px-4 py-4">
                <p class="whitespace-pre-line text-sm">
                  {{ r.message || 'No message.' }}
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <UButton v-if="r.phone" size="xs" color="neutral" variant="outline" icon="i-lucide-phone" :label="`Call ${r.phone}`" :href="`tel:${r.phone.replace(/\s/g, '')}`" />
                  <UButton v-if="r.phone" size="xs" color="neutral" variant="outline" icon="i-lucide-message-circle" label="WhatsApp" :href="`https://wa.me/${waNumber(r.phone)}`" target="_blank" />
                  <UButton v-if="r.email" size="xs" color="neutral" variant="outline" icon="i-lucide-mail" :label="r.email" :href="`mailto:${r.email}?subject=${encodeURIComponent(r.subject || 'Your enquiry')}`" />
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="rows && !rows.length">
            <td colspan="4" class="px-4 py-10 text-center text-muted">
              No enquiries here.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="total > PAGE_SIZE" class="mt-4 flex justify-end">
      <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
    </div>
  </div>
</template>
