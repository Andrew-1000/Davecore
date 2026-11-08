<script setup lang="ts">
import { SITE } from '~/data/site'

/**
 * Contact / consultation / plan enquiry. Saved in Supabase (website admin → Enquiries); until the
 * site is connected to Supabase, it goes to the BQ system (BQ admin → Website enquiries).
 */
const props = withDefaults(defineProps<{ kind?: 'consultation' | 'plan' | 'contact' | 'quote', planRef?: string, subject?: string, chooseKind?: boolean }>(), { kind: 'consultation', planRef: '', subject: '', chooseKind: false })
const emit = defineEmits<{ sent: [] }>()

const form = reactive({ kind: props.kind, name: '', phone: '', email: '', subject: props.subject, message: '', website: '' })
const sending = ref(false)
const sent = ref(false)
const error = ref('')
const kinds = [
  { label: 'Book a consultation', value: 'consultation' },
  { label: 'Request a quote / BQ', value: 'quote' },
  { label: 'Ask about a house plan', value: 'plan' },
  { label: 'General enquiry', value: 'contact' }
]

async function submit() {
  error.value = ''
  if (!form.phone && !form.email) {
    error.value = 'Please give a phone number or an email so we can reach you.'
    return
  }
  if (form.website) { sent.value = true; return } // honeypot: silently drop bots
  sending.value = true
  try {
    const sb = useSupabase()
    if (sb) {
      const { error: e } = await sb.from('enquiries').insert({ kind: form.kind, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim(), plan_ref: props.planRef })
      if (e) throw new Error(supabaseError(e))
    }
    else await $fetch(`${useBqBase()}/api/site/enquiries`, {
      method: 'POST',
      body: { site: SITE.key, kind: form.kind, name: form.name, phone: form.phone, email: form.email, subject: form.subject, message: form.message, planRef: props.planRef, website: form.website }
    })
    sent.value = true
    emit('sent')
  }
  catch (e) {
    error.value = errorMessage(e)
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="sent" class="rounded-lg border border-success/40 bg-success/10 p-6 text-center">
      <UIcon name="i-lucide-circle-check" class="size-8 text-success" />
      <p class="mt-2 font-semibold">
        Thank you, {{ form.name.split(' ')[0] }}.
      </p>
      <p class="text-sm text-muted mt-1">
        We've received your message and will get back to you within one working day.
      </p>
    </div>
    <form v-else class="grid sm:grid-cols-2 gap-4" @submit.prevent="submit">
      <UFormField v-if="chooseKind" label="What can we help with?" class="sm:col-span-2">
        <USelect v-model="form.kind" :items="kinds" class="w-full" />
      </UFormField>
      <UFormField label="Your name" required class="sm:col-span-2">
        <UInput v-model="form.name" required minlength="2" autocomplete="name" class="w-full" />
      </UFormField>
      <UFormField label="Phone">
        <UInput v-model="form.phone" type="tel" autocomplete="tel" placeholder="07xx xxx xxx" class="w-full" />
      </UFormField>
      <UFormField label="Email">
        <UInput v-model="form.email" type="email" autocomplete="email" class="w-full" />
      </UFormField>
      <UFormField label="Subject" class="sm:col-span-2">
        <UInput v-model="form.subject" class="w-full" :placeholder="planRef ? `Plan ${planRef}` : 'e.g. 3-bedroom bungalow in Ruiru'" />
      </UFormField>
      <UFormField label="Message" class="sm:col-span-2">
        <UTextarea v-model="form.message" :rows="4" autoresize class="w-full" placeholder="Plot location and size, what you want to build, timeline…" />
      </UFormField>
      <!-- honeypot: hidden from people, tempting for bots -->
      <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">
      <p v-if="error" class="sm:col-span-2 text-sm text-error">
        {{ error }}
      </p>
      <div class="sm:col-span-2">
        <UButton type="submit" size="lg" :loading="sending" icon="i-lucide-send" label="Send message" />
      </div>
    </form>
  </div>
</template>
