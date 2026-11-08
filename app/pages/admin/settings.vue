<script setup lang="ts">
import { mergeSettings, type SiteSettings } from '~/composables/useContent'

definePageMeta({ layout: 'admin', title: 'Contact & company' })

const sb = useSupabase()!
const toast = useToast()
const form = ref<SiteSettings | null>(null)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  const { data, error: e } = await sb.from('site_settings').select('key, value')
  if (e) error.value = supabaseError(e)
  form.value = mergeSettings((data ?? []) as { key: string, value: Record<string, unknown> }[])
})

async function save() {
  if (!form.value) return
  error.value = ''
  saving.value = true
  const c = form.value.contact
  const { error: e } = await sb.from('site_settings').upsert([
    { key: 'contact', value: { phone: c.phone.trim(), whatsapp: c.whatsapp.replace(/\D/g, ''), email: c.email.trim(), address: c.address.trim(), hours: c.hours.trim() } },
    { key: 'company', value: { intro: form.value.intro.trim() } }
  ])
  saving.value = false
  if (e) error.value = supabaseError(e)
  else toast.add({ title: 'Saved', description: 'The website shows the new details now.', color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <div class="max-w-2xl">
    <div v-if="!form" class="py-16 text-center text-muted">
      <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
    </div>
    <form v-else class="space-y-6" @submit.prevent="save">
      <section class="rounded-lg border border-default p-5 grid sm:grid-cols-2 gap-4">
        <h2 class="sm:col-span-2 font-semibold">
          Contact details
        </h2>
        <UFormField label="Phone" help="Shown on the site, with a call link.">
          <UInput v-model="form.contact.phone" placeholder="07xx xxx xxx" class="w-full" />
        </UFormField>
        <UFormField label="WhatsApp number" help="International format, e.g. 2547XXXXXXXX. Empty hides the button.">
          <UInput v-model="form.contact.whatsapp" placeholder="2547XXXXXXXX" class="w-full font-mono" />
        </UFormField>
        <UFormField label="Email" class="sm:col-span-2">
          <UInput v-model="form.contact.email" type="email" class="w-full" />
        </UFormField>
        <UFormField label="Address" class="sm:col-span-2">
          <UInput v-model="form.contact.address" class="w-full" />
        </UFormField>
        <UFormField label="Opening hours" class="sm:col-span-2">
          <UInput v-model="form.contact.hours" class="w-full" />
        </UFormField>
      </section>
      <section class="rounded-lg border border-default p-5">
        <h2 class="font-semibold">
          Company introduction
        </h2>
        <p class="text-xs text-muted">
          Shown on the home page, the about page and in the footer.
        </p>
        <UTextarea v-model="form.intro" :rows="3" autoresize class="w-full mt-3" />
      </section>
      <p v-if="error" class="text-sm text-error">
        {{ error }}
      </p>
      <UButton type="submit" size="lg" :loading="saving" label="Save changes" />
    </form>
  </div>
</template>
