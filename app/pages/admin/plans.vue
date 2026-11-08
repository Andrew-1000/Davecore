<script setup lang="ts">
import { PLAN_TYPES, type Floor, type Plan } from '~/data/plans'
import { PLAN_COLUMNS, slugify, type PlanRow } from '~/composables/useContent'

definePageMeta({ layout: 'admin', title: 'House plans' })

const sb = useSupabase()!
const toast = useToast()
const rows = ref<PlanRow[] | null>(null)
const loadError = ref('')
const search = ref('')
const page = ref(1)
const PAGE_SIZE = 10

async function load() {
  loadError.value = ''
  const { data, error } = await sb.from('plans').select(PLAN_COLUMNS).order('sort').order('name')
  if (error) loadError.value = supabaseError(error)
  else rows.value = data as PlanRow[]
}
onMounted(load)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (rows.value ?? []).filter(r => !q || `${r.name} ${r.code} ${r.type}`.toLowerCase().includes(q))
})
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
watch(search, () => { page.value = 1 })

// ── Publish switch (optimistic) ──
const toggling = ref<string | null>(null)
async function setPublished(r: PlanRow, published: boolean) {
  toggling.value = r.id
  rows.value = (rows.value ?? []).map(x => x.id === r.id ? { ...x, published } : x)
  const { error } = await sb.from('plans').update({ published }).eq('id', r.id)
  toggling.value = null
  if (error) {
    rows.value = (rows.value ?? []).map(x => x.id === r.id ? { ...x, published: !published } : x)
    toast.add({ title: supabaseError(error), color: 'error' })
  }
  else toast.add({ title: `${r.name} ${published ? 'is now on the website' : 'hidden from the website'}`, color: 'success', icon: 'i-lucide-check' })
}

// ── Editor ──
interface Draft {
  id: string | null
  name: string
  code: string
  slug: string
  slugTouched: boolean
  type: Plan['type']
  bedrooms: number
  bathrooms: number
  floorAreas: string
  minPlot: string
  style: string
  price: number
  summary: string
  features: string
  images: string[]
  pdfPath: string | null
  floorsJson: string
  published: boolean
  sort: number
}
const open = ref(false)
const draft = ref<Draft | null>(null)
const saving = ref(false)
const formError = ref('')
const uploading = ref<'images' | 'pdf' | null>(null)
const confirmDelete = ref(false)

function edit(r?: PlanRow) {
  formError.value = ''
  confirmDelete.value = false
  draft.value = r
    ? { id: r.id, name: r.name, code: r.code, slug: r.slug, slugTouched: true, type: r.type, bedrooms: r.bedrooms, bathrooms: r.bathrooms, floorAreas: (r.floor_areas ?? []).join(', '), minPlot: r.min_plot, style: r.style, price: Number(r.price), summary: r.summary, features: (r.features ?? []).join('\n'), images: [...(r.images ?? [])], pdfPath: r.pdf_path, floorsJson: (r.floors ?? []).length ? JSON.stringify(r.floors, null, 2) : '', published: r.published, sort: r.sort }
    : { id: null, name: '', code: '', slug: '', slugTouched: false, type: 'bungalow', bedrooms: 3, bathrooms: 2, floorAreas: '', minPlot: '50 × 100 ft', style: '', price: 0, summary: '', features: '', images: [], pdfPath: null, floorsJson: '', published: false, sort: (rows.value?.length ?? 0) * 10 }
  open.value = true
}

// Suggest the web address from the name until the admin edits it
watch(() => draft.value && [draft.value.name, draft.value.bedrooms, draft.value.type], () => {
  const d = draft.value
  if (d && !d.slugTouched) d.slug = slugify(`${d.name} ${d.type === 'apartment' ? 'apartment block' : `${d.bedrooms} bedroom ${d.type}`}`)
})

function parseFloors(json: string): Floor[] {
  if (!json.trim()) return []
  const v = JSON.parse(json)
  if (!Array.isArray(v) || !v.every(f => typeof f?.name === 'string' && typeof f?.width === 'number' && typeof f?.depth === 'number' && Array.isArray(f?.rooms))) throw new Error('Room layout must be a list of floors: [{ "name", "width", "depth", "rooms": [...] }]')
  return v
}

async function save() {
  const d = draft.value
  if (!d) return
  formError.value = ''
  let floors: Floor[]
  try { floors = parseFloors(d.floorsJson) }
  catch (e) { formError.value = `Room layout: ${(e as Error).message}`; return }
  const floorAreas = d.floorAreas.split(/[,\s]+/).filter(Boolean).map(Number)
  if (floorAreas.some(n => !Number.isFinite(n) || n <= 0)) { formError.value = 'Floor areas must be numbers in m², separated by commas (one per floor).'; return }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) { formError.value = 'Web address may only use lowercase letters, numbers and dashes.'; return }
  const record = {
    name: d.name.trim(), code: d.code.trim(), slug: d.slug, type: d.type, bedrooms: d.bedrooms, bathrooms: d.bathrooms,
    floor_areas: floorAreas, min_plot: d.minPlot.trim(), style: d.style.trim(), price: d.price || 0, summary: d.summary.trim(),
    features: d.features.split('\n').map(s => s.trim()).filter(Boolean), images: d.images, pdf_path: d.pdfPath, floors, published: d.published, sort: d.sort
  }
  saving.value = true
  const { data, error } = d.id
    ? await sb.from('plans').update(record).eq('id', d.id).select(PLAN_COLUMNS).single()
    : await sb.from('plans').insert(record).select(PLAN_COLUMNS).single()
  saving.value = false
  if (error) {
    formError.value = /duplicate key.*slug/.test(error.message) ? 'Another plan already uses this web address.' : /duplicate key.*code/.test(error.message) ? 'Another plan already uses this code.' : supabaseError(error)
    return
  }
  const saved = data as PlanRow
  rows.value = d.id ? (rows.value ?? []).map(r => r.id === saved.id ? saved : r) : [...(rows.value ?? []), saved]
  open.value = false
  toast.add({ title: `${saved.name} saved`, description: saved.published ? 'Live on the website now.' : 'Saved as a draft (not on the website).', color: 'success', icon: 'i-lucide-check' })
}

async function remove() {
  const d = draft.value
  if (!d?.id) return
  saving.value = true
  const { error } = await sb.from('plans').delete().eq('id', d.id)
  saving.value = false
  if (error) { formError.value = supabaseError(error); return }
  // Tidy up its files (best effort)
  if (d.images.length) await sb.storage.from('plan-images').remove(d.images.filter(p => !/^https?:/.test(p)))
  if (d.pdfPath) await sb.storage.from('plan-files').remove([d.pdfPath])
  rows.value = (rows.value ?? []).filter(r => r.id !== d.id)
  open.value = false
  toast.add({ title: `${d.name} deleted`, color: 'success' })
}

const safeName = (n: string) => n.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-')

async function uploadImages(e: Event) {
  const input = e.target as HTMLInputElement
  const d = draft.value
  if (!d || !input.files?.length) return
  uploading.value = 'images'
  formError.value = ''
  for (const file of Array.from(input.files)) {
    const path = `${d.slug || 'plan'}/${Date.now()}-${safeName(file.name)}`
    const { error } = await sb.storage.from('plan-images').upload(path, file, { contentType: file.type, upsert: false })
    if (error) { formError.value = `${file.name}: ${supabaseError(error)}`; break }
    d.images.push(path)
  }
  if (d.id) await sb.from('plans').update({ images: d.images }).eq('id', d.id)
  uploading.value = null
  input.value = ''
}

async function removeImage(path: string) {
  const d = draft.value
  if (!d) return
  d.images = d.images.filter(p => p !== path)
  if (!/^https?:/.test(path)) await sb.storage.from('plan-images').remove([path])
  if (d.id) await sb.from('plans').update({ images: d.images }).eq('id', d.id)
}

async function uploadPdf(e: Event) {
  const input = e.target as HTMLInputElement
  const d = draft.value
  const file = input.files?.[0]
  if (!d || !file) return
  uploading.value = 'pdf'
  formError.value = ''
  const path = `${d.slug || 'plan'}/${Date.now()}-${safeName(file.name)}`
  const { error } = await sb.storage.from('plan-files').upload(path, file, { contentType: 'application/pdf' })
  if (error) formError.value = `${file.name}: ${supabaseError(error)}`
  else {
    if (d.pdfPath) await sb.storage.from('plan-files').remove([d.pdfPath])
    d.pdfPath = path
    if (d.id) await sb.from('plans').update({ pdf_path: path }).eq('id', d.id)
  }
  uploading.value = null
  input.value = ''
}

async function downloadPdf(path: string) {
  const { data, error } = await sb.storage.from('plan-files').createSignedUrl(path, 60)
  if (error) toast.add({ title: supabaseError(error), color: 'error' })
  else window.open(data.signedUrl, '_blank', 'noopener')
}

const typeItems = Object.entries(PLAN_TYPES).map(([value, label]) => ({ value, label }))
const thumb = (r: PlanRow) => r.images?.[0] ? planImageUrl(r.images[0]) : ''
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-3">
      <UInput v-model="search" icon="i-lucide-search" placeholder="Search plans" class="w-64" />
      <span class="text-sm text-muted">{{ filtered.length }} plan{{ filtered.length === 1 ? '' : 's' }}</span>
      <UButton class="ms-auto" icon="i-lucide-plus" label="Add a plan" @click="edit()" />
    </div>

    <UAlert v-if="loadError" class="mt-4" color="error" variant="subtle" :title="loadError" />

    <div class="mt-4 rounded-lg border border-default overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-elevated/50 text-left text-xs uppercase tracking-wider text-muted">
          <tr>
            <th class="px-4 py-2.5 font-medium">
              Plan
            </th>
            <th class="px-4 py-2.5 font-medium">
              Type
            </th>
            <th class="px-4 py-2.5 font-medium text-right">
              Price (KES)
            </th>
            <th class="px-4 py-2.5 font-medium">
              Files
            </th>
            <th class="px-4 py-2.5 font-medium">
              On website
            </th>
            <th class="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-if="rows === null">
            <td colspan="6" class="px-4 py-10 text-center text-muted">
              <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
            </td>
          </tr>
          <tr v-for="r in paged" :key="r.id" class="hover:bg-elevated/30">
            <td class="px-4 py-2.5">
              <div class="flex items-center gap-3">
                <div class="size-10 shrink-0 rounded border border-default bg-elevated/50 grid place-items-center overflow-hidden">
                  <img v-if="thumb(r)" :src="thumb(r)" alt="" class="size-full object-cover">
                  <UIcon v-else name="i-lucide-layout-panel-left" class="size-5 text-dimmed" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium truncate">
                    {{ r.name }}
                  </p>
                  <p class="font-mono text-xs text-muted">
                    {{ r.code }} · {{ r.bedrooms }} bed · {{ (r.floor_areas ?? []).map(Number).reduce((s, a) => s + a, 0) }} m²
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-2.5">
              {{ PLAN_TYPES[r.type] }}
            </td>
            <td class="px-4 py-2.5 text-right font-mono">
              {{ Number(r.price).toLocaleString('en-KE') }}
            </td>
            <td class="px-4 py-2.5">
              <div class="flex gap-1.5">
                <UBadge :color="r.images?.length || r.floors?.length ? 'success' : 'warning'" variant="subtle" size="sm" :label="r.images?.length ? `${r.images.length} image${r.images.length > 1 ? 's' : ''}` : r.floors?.length ? 'Drawn preview' : 'No preview'" />
                <UBadge :color="r.pdf_path ? 'success' : 'neutral'" variant="subtle" size="sm" :label="r.pdf_path ? 'PDF' : 'No PDF'" />
              </div>
            </td>
            <td class="px-4 py-2.5">
              <USwitch :model-value="r.published" :loading="toggling === r.id" :aria-label="`Show ${r.name} on the website`" @update:model-value="(v: boolean) => setPublished(r, v)" />
            </td>
            <td class="px-4 py-2.5 text-right">
              <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-pencil" label="Edit" @click="edit(r)" />
            </td>
          </tr>
          <tr v-if="rows && !filtered.length">
            <td colspan="6" class="px-4 py-10 text-center text-muted">
              {{ rows.length ? 'No plans match your search.' : 'No plans yet. Add your first one.' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="filtered.length > PAGE_SIZE" class="mt-4 flex justify-end">
      <UPagination v-model:page="page" :total="filtered.length" :items-per-page="PAGE_SIZE" />
    </div>

    <USlideover v-model:open="open" :title="draft?.id ? `Edit ${draft.name}` : 'Add a house plan'" :ui="{ content: 'max-w-2xl' }">
      <template #body>
        <form v-if="draft" id="plan-form" class="grid sm:grid-cols-2 gap-4" @submit.prevent="save">
          <UFormField label="Name" required>
            <UInput v-model="draft.name" required placeholder="e.g. Amani" class="w-full" />
          </UFormField>
          <UFormField label="Plan code" required>
            <UInput v-model="draft.code" required placeholder="e.g. DC-B302" class="w-full font-mono" />
          </UFormField>
          <UFormField label="Web address" required class="sm:col-span-2" :help="`/plans/${draft.slug || '…'}`">
            <UInput v-model="draft.slug" required class="w-full font-mono" @update:model-value="draft.slugTouched = true" />
          </UFormField>
          <UFormField label="Type">
            <USelect v-model="draft.type" :items="typeItems" class="w-full" />
          </UFormField>
          <UFormField label="Style">
            <UInput v-model="draft.style" placeholder="e.g. Contemporary family" class="w-full" />
          </UFormField>
          <UFormField label="Bedrooms">
            <UInputNumber v-model="draft.bedrooms" :min="0" :max="100" class="w-full" />
          </UFormField>
          <UFormField label="Bathrooms">
            <UInputNumber v-model="draft.bathrooms" :min="0" :max="100" class="w-full" />
          </UFormField>
          <UFormField label="Floor area per floor (m²)" help="One number per floor, e.g. 110, 110. Used by the cost calculator.">
            <UInput v-model="draft.floorAreas" placeholder="120" class="w-full font-mono" />
          </UFormField>
          <UFormField label="Minimum plot">
            <UInput v-model="draft.minPlot" class="w-full" />
          </UFormField>
          <UFormField label="Drawing set price (KES)">
            <UInputNumber v-model="draft.price" :min="0" :step="500" class="w-full" />
          </UFormField>
          <UFormField label="Order on the site" help="Lower numbers show first.">
            <UInputNumber v-model="draft.sort" class="w-full" />
          </UFormField>
          <UFormField label="Summary" class="sm:col-span-2">
            <UTextarea v-model="draft.summary" :rows="2" autoresize class="w-full" />
          </UFormField>
          <UFormField label="Highlights" help="One per line." class="sm:col-span-2">
            <UTextarea v-model="draft.features" :rows="4" autoresize class="w-full" />
          </UFormField>

          <!-- Preview images -->
          <div class="sm:col-span-2 rounded-lg border border-default p-4">
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="font-medium text-sm">
                  Preview images
                </p>
                <p class="text-xs text-muted">
                  Public. Upload watermarked previews only (PNG, JPG or WebP, up to 10 MB).
                </p>
              </div>
              <label class="cursor-pointer">
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple class="sr-only" :disabled="uploading !== null" @change="uploadImages">
                <span class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium ring ring-inset ring-accented hover:bg-elevated">
                  <UIcon :name="uploading === 'images' ? 'i-lucide-loader-circle' : 'i-lucide-image-plus'" :class="uploading === 'images' && 'animate-spin'" /> Upload
                </span>
              </label>
            </div>
            <div v-if="draft.images.length" class="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
              <div v-for="p in draft.images" :key="p" class="relative group aspect-[4/3] rounded border border-default overflow-hidden bg-elevated/40">
                <img :src="planImageUrl(p)" alt="" class="size-full object-cover">
                <UButton size="xs" color="error" icon="i-lucide-x" class="absolute top-1 end-1 opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Remove image" @click="removeImage(p)" />
              </div>
            </div>
            <p v-else class="mt-3 text-xs text-dimmed">
              {{ draft.floorsJson ? 'No images: the drawn room layout is shown instead.' : 'No images yet.' }}
            </p>
          </div>

          <!-- Full drawing set -->
          <div class="sm:col-span-2 rounded-lg border border-default p-4">
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="font-medium text-sm">
                  Full drawing set (PDF)
                </p>
                <p class="text-xs text-muted">
                  Private: never shown on the website. Sent to buyers after payment.
                </p>
              </div>
              <label class="cursor-pointer">
                <input type="file" accept="application/pdf" class="sr-only" :disabled="uploading !== null" @change="uploadPdf">
                <span class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium ring ring-inset ring-accented hover:bg-elevated">
                  <UIcon :name="uploading === 'pdf' ? 'i-lucide-loader-circle' : 'i-lucide-file-up'" :class="uploading === 'pdf' && 'animate-spin'" /> {{ draft.pdfPath ? 'Replace' : 'Upload' }}
                </span>
              </label>
            </div>
            <p v-if="draft.pdfPath" class="mt-3 text-sm flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="text-primary" />
              <span class="font-mono text-xs truncate">{{ draft.pdfPath.split('/').pop() }}</span>
              <UButton size="xs" variant="link" label="Open" @click="downloadPdf(draft.pdfPath)" />
            </p>
          </div>

          <UCollapsible class="sm:col-span-2">
            <UButton color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-chevron-down" label="Advanced: drawn room layout (JSON)" class="-ms-2.5" />
            <template #content>
              <UTextarea v-model="draft.floorsJson" :rows="8" class="w-full font-mono text-xs mt-2" placeholder="[{ &quot;name&quot;: &quot;Ground floor&quot;, &quot;width&quot;: 12, &quot;depth&quot;: 10, &quot;rooms&quot;: [{ &quot;name&quot;: &quot;Living&quot;, &quot;x&quot;: 0, &quot;y&quot;: 0, &quot;w&quot;: 6, &quot;h&quot;: 5 }] }]" />
              <p class="text-xs text-muted mt-1">
                Metres from the top-left corner. Room kind may be "wet", "circulation" or "outdoor". Leave empty to use images only.
              </p>
            </template>
          </UCollapsible>

          <USwitch v-model="draft.published" class="sm:col-span-2" label="Show on the website" description="Off keeps it as a draft only admins can see." />
          <p v-if="formError" class="sm:col-span-2 text-sm text-error">
            {{ formError }}
          </p>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full items-center gap-2">
          <template v-if="draft?.id">
            <UButton v-if="!confirmDelete" color="error" variant="ghost" icon="i-lucide-trash-2" label="Delete" @click="confirmDelete = true" />
            <template v-else>
              <span class="text-sm text-error">Delete this plan and its files?</span>
              <UButton color="error" size="sm" :loading="saving" label="Yes, delete" @click="remove" />
              <UButton color="neutral" variant="ghost" size="sm" label="No" @click="confirmDelete = false" />
            </template>
          </template>
          <div class="ms-auto flex gap-2">
            <UButton color="neutral" variant="ghost" label="Cancel" @click="open = false" />
            <UButton type="submit" form="plan-form" :loading="saving" :disabled="uploading !== null" label="Save plan" />
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
