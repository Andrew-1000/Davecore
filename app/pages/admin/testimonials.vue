<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Testimonials' })

/*
 * Real client testimonials only. Clients send them from "Share your experience" (they arrive
 * unpublished, with a private contact so you can confirm them); staff can add one a client
 * gave in person, with their permission.
 */
interface Row { id: string, quote: string, name: string, role: string, location: string, project: string, rating: number | null, source: 'client' | 'admin', published: boolean, sort: number, created_at: string }
const COLUMNS = 'id, quote, name, role, location, project, rating, source, published, sort, created_at'

const sb = useSupabase()!
const toast = useToast()
const rows = ref<Row[] | null>(null)
const contacts = ref<Record<string, string>>({})
const loadError = ref('')
const tab = ref<'pending' | 'published'>('pending')
const page = ref(1)
const PAGE_SIZE = 10

async function load() {
  loadError.value = ''
  const [list, rpc] = await Promise.all([
    sb.from('testimonials').select(COLUMNS).order('sort').order('created_at', { ascending: false }),
    sb.rpc('admin_testimonial_contacts')
  ])
  if (list.error) loadError.value = supabaseError(list.error)
  else rows.value = list.data as Row[]
  if (!rpc.error) contacts.value = Object.fromEntries((rpc.data as { id: string, contact: string }[]).map(r => [r.id, r.contact]))
}
onMounted(load)

const pending = computed(() => (rows.value ?? []).filter(r => !r.published))
const published = computed(() => (rows.value ?? []).filter(r => r.published))
const shown = computed(() => (tab.value === 'pending' ? pending.value : published.value))
const paged = computed(() => shown.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
watch(tab, () => { page.value = 1 })
onMounted(() => { watch(rows, (r) => { if (r && !pending.value.length && tab.value === 'pending') tab.value = 'published' }, { once: true }) })

const busy = ref<string | null>(null)
async function setPublished(r: Row, value: boolean) {
  busy.value = r.id
  const { error } = await sb.from('testimonials').update({ published: value }).eq('id', r.id)
  busy.value = null
  if (error) return toast.add({ title: supabaseError(error), color: 'error' })
  rows.value = (rows.value ?? []).map(x => x.id === r.id ? { ...x, published: value } : x)
  toast.add({ title: value ? `${r.name}'s testimonial is now on the website` : 'Removed from the website', color: 'success', icon: 'i-lucide-check' })
}

const confirmId = ref<string | null>(null)
async function remove(r: Row) {
  busy.value = r.id
  const { error } = await sb.from('testimonials').delete().eq('id', r.id)
  busy.value = null
  confirmId.value = null
  if (error) return toast.add({ title: supabaseError(error), color: 'error' })
  rows.value = (rows.value ?? []).filter(x => x.id !== r.id)
  toast.add({ title: 'Testimonial deleted', color: 'success' })
}

// ── Add / edit ──
const open = ref(false)
const draft = ref<{ id: string | null, quote: string, name: string, role: string, location: string, project: string, rating: number, published: boolean, sort: number, consent: boolean } | null>(null)
const saving = ref(false)
const formError = ref('')

function edit(r?: Row) {
  formError.value = ''
  draft.value = r
    ? { id: r.id, quote: r.quote, name: r.name, role: r.role, location: r.location, project: r.project, rating: r.rating ?? 0, published: r.published, sort: r.sort, consent: true }
    : { id: null, quote: '', name: '', role: 'Homeowner', location: '', project: '', rating: 5, published: true, sort: 0, consent: false }
  open.value = true
}

async function save() {
  const d = draft.value
  if (!d) return
  formError.value = ''
  if (!d.id && !d.consent) { formError.value = 'Confirm that the client gave these words and agreed to publication.'; return }
  const record = { quote: d.quote.trim(), name: d.name.trim(), role: d.role.trim(), location: d.location.trim(), project: d.project.trim(), rating: d.rating || null, published: d.published, sort: d.sort }
  saving.value = true
  const { data, error } = d.id
    ? await sb.from('testimonials').update(record).eq('id', d.id).select(COLUMNS).single()
    : await sb.from('testimonials').insert({ ...record, source: 'admin' }).select(COLUMNS).single()
  saving.value = false
  if (error) { formError.value = supabaseError(error); return }
  const saved = data as Row
  rows.value = d.id ? (rows.value ?? []).map(r => r.id === saved.id ? saved : r) : [saved, ...(rows.value ?? [])]
  open.value = false
  toast.add({ title: 'Testimonial saved', color: 'success', icon: 'i-lucide-check' })
}

const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex rounded-md border border-default overflow-hidden text-sm" role="tablist">
        <button type="button" role="tab" :aria-selected="tab === 'pending'" class="px-3 py-1.5 border-e border-default" :class="tab === 'pending' ? 'bg-primary text-inverted' : 'hover:bg-elevated'" @click="tab = 'pending'">
          Waiting for approval <span class="font-mono ms-1">{{ pending.length }}</span>
        </button>
        <button type="button" role="tab" :aria-selected="tab === 'published'" class="px-3 py-1.5" :class="tab === 'published' ? 'bg-primary text-inverted' : 'hover:bg-elevated'" @click="tab = 'published'">
          On the website <span class="font-mono ms-1">{{ published.length }}</span>
        </button>
      </div>
      <UButton class="ms-auto" icon="i-lucide-plus" label="Add a testimonial" @click="edit()" />
    </div>
    <p class="mt-3 text-sm text-muted">
      Clients send testimonials from the <a :href="siteUrl('/share-your-experience')" target="_blank" rel="noopener" class="text-primary underline">Share your experience</a> page. Check each one with the client before approving it.
    </p>

    <UAlert v-if="loadError" class="mt-4" color="error" variant="subtle" :title="loadError" />

    <div v-if="rows === null" class="py-16 text-center text-muted">
      <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
    </div>
    <div v-else-if="!shown.length" class="mt-6 rounded-lg border border-dashed border-default py-14 text-center text-muted">
      {{ tab === 'pending' ? 'Nothing waiting for approval.' : 'No testimonials on the website yet. The section stays hidden until you publish one.' }}
    </div>
    <ul v-else class="mt-4 space-y-3">
      <li v-for="r in paged" :key="r.id" class="rounded-lg border border-default p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="font-medium">
              {{ r.name }} <span class="text-muted font-normal">· {{ [r.role, r.project, r.location].filter(Boolean).join(' · ') }}</span>
            </p>
            <p class="text-xs text-muted mt-0.5 flex flex-wrap gap-x-3">
              <span>{{ r.source === 'client' ? 'Sent by the client' : 'Added by staff' }} · {{ fmtDate(r.created_at) }}</span>
              <span v-if="r.rating">{{ '★'.repeat(r.rating) }}<span class="opacity-30">{{ '★'.repeat(5 - r.rating) }}</span></span>
              <span v-if="contacts[r.id]" class="font-mono">Contact: {{ contacts[r.id] }}</span>
            </p>
            <p class="mt-2 text-sm whitespace-pre-line">
              “{{ r.quote }}”
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <UButton v-if="!r.published" size="sm" icon="i-lucide-check" label="Approve" :loading="busy === r.id" @click="setPublished(r, true)" />
            <UButton v-else size="sm" color="neutral" variant="outline" icon="i-lucide-eye-off" label="Unpublish" :loading="busy === r.id" @click="setPublished(r, false)" />
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" aria-label="Edit" @click="edit(r)" />
            <UButton v-if="confirmId !== r.id" size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" aria-label="Delete" @click="confirmId = r.id" />
            <template v-else>
              <UButton size="sm" color="error" label="Delete" :loading="busy === r.id" @click="remove(r)" />
              <UButton size="sm" color="neutral" variant="ghost" label="Keep" @click="confirmId = null" />
            </template>
          </div>
        </div>
      </li>
    </ul>
    <div v-if="shown.length > PAGE_SIZE" class="mt-4 flex justify-end">
      <UPagination v-model:page="page" :total="shown.length" :items-per-page="PAGE_SIZE" />
    </div>

    <UModal v-model:open="open" :title="draft?.id ? 'Edit testimonial' : 'Add a testimonial'" :description="draft?.id ? 'Correct typos only; keep the client\'s meaning.' : 'Use the client\'s own words, with their permission.'">
      <template #body>
        <form v-if="draft" id="testimonial-form" class="grid sm:grid-cols-2 gap-4" @submit.prevent="save">
          <UFormField label="Client's words" required class="sm:col-span-2">
            <UTextarea v-model="draft.quote" required minlength="10" maxlength="1000" :rows="4" autoresize class="w-full" />
          </UFormField>
          <UFormField label="Name as shown" required>
            <UInput v-model="draft.name" required class="w-full" />
          </UFormField>
          <UFormField label="Role">
            <UInput v-model="draft.role" placeholder="Homeowner" class="w-full" />
          </UFormField>
          <UFormField label="Project">
            <UInput v-model="draft.project" placeholder="3-bedroom bungalow" class="w-full" />
          </UFormField>
          <UFormField label="Location">
            <UInput v-model="draft.location" placeholder="Kitengela" class="w-full" />
          </UFormField>
          <UFormField label="Rating (0 = none)">
            <UInputNumber v-model="draft.rating" :min="0" :max="5" class="w-full" />
          </UFormField>
          <UFormField label="Order" help="Lower shows first.">
            <UInputNumber v-model="draft.sort" class="w-full" />
          </UFormField>
          <USwitch v-model="draft.published" class="sm:col-span-2" label="Show on the website" />
          <UCheckbox v-if="!draft.id" v-model="draft.consent" class="sm:col-span-2" label="These are the client's own words and they agreed to publication." />
          <p v-if="formError" class="sm:col-span-2 text-sm text-error">
            {{ formError }}
          </p>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" label="Cancel" @click="open = false" />
          <UButton type="submit" form="testimonial-form" :loading="saving" label="Save" />
        </div>
      </template>
    </UModal>
  </div>
</template>
