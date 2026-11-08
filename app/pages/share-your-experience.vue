<script setup lang="ts">
import { SITE } from '~/data/site'

/*
 * Clients send a testimonial here. It is saved unpublished; an admin checks it with the client
 * (using the contact given, which is never shown) and approves it in the website admin.
 */
useSeoMeta({ title: `Share your experience | ${SITE.name}`, description: `Built with ${SITE.short}? Tell others what it was like.` })
const sb = useSupabase()
const form = reactive({ name: '', role: 'Homeowner', project: '', location: '', rating: 5, quote: '', contact: '', consent: false, website: '' })
const sending = ref(false)
const sent = ref(false)
const error = ref('')
const roles = ['Homeowner', 'Landlord', 'Developer', 'Business owner', 'Other']

async function submit() {
  error.value = ''
  if (form.website) { sent.value = true; return } // honeypot: silently drop bots
  if (!form.consent) { error.value = 'Please confirm we may publish your testimonial.'; return }
  if (form.quote.trim().length < 20) { error.value = 'Please write at least a sentence or two about your experience.'; return }
  if (!sb) { error.value = 'This form is not available yet. Please send your feedback through the contact page.'; return }
  sending.value = true
  try {
    const { error: e } = await sb.from('testimonials').insert({
      quote: form.quote.trim(),
      name: form.name.trim(),
      role: form.role === 'Other' ? '' : form.role,
      project: form.project.trim(),
      location: form.location.trim(),
      rating: form.rating || null,
      contact: form.contact.trim(),
      source: 'client',
      published: false,
      sort: 0
    })
    if (e) throw e
    sent.value = true
  }
  catch (e) {
    error.value = supabaseError(e)
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <section class="border-b border-default relative">
      <div class="absolute inset-0 sheet-grid" aria-hidden="true" />
      <UContainer class="relative py-14">
        <p class="sheet-label">
          Client notes
        </p>
        <h1 class="font-display text-4xl font-semibold mt-2">
          Share your experience
        </h1>
        <p class="text-muted mt-3 max-w-2xl">
          Did we design, cost or build for you? A few honest words help other families plan with confidence. We read every note and publish it once we've confirmed it with you.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 max-w-3xl">
      <div v-if="sent" class="rounded-lg border border-success/40 bg-success/10 p-8 text-center">
        <UIcon name="i-lucide-circle-check" class="size-9 text-success" />
        <p class="mt-3 text-lg font-semibold">
          Thank you{{ form.name ? `, ${form.name.split(' ')[0]}` : '' }}.
        </p>
        <p class="text-muted mt-1">
          We've received your testimonial. We'll confirm it with you before it appears on the site.
        </p>
        <UButton class="mt-5" to="/" color="neutral" variant="outline" label="Back to home" />
      </div>

      <form v-else class="rounded-lg border border-default p-6 sm:p-8 grid sm:grid-cols-2 gap-5" @submit.prevent="submit">
        <UFormField label="Your name, as it should appear" required class="sm:col-span-2" help="First name and initial is fine, e.g. Wanjiru K.">
          <UInput v-model="form.name" required minlength="2" maxlength="120" autocomplete="name" class="w-full" />
        </UFormField>
        <UFormField label="You are a">
          <USelect v-model="form.role" :items="roles" class="w-full" />
        </UFormField>
        <UFormField label="Rating">
          <div class="flex gap-1 h-8 items-center" role="radiogroup" aria-label="Rating out of 5">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              role="radio"
              :aria-checked="form.rating === n"
              :aria-label="`${n} star${n > 1 ? 's' : ''}`"
              class="text-primary transition hover:scale-110"
              @click="form.rating = n"
            >
              <svg viewBox="0 0 24 24" class="size-6" :class="n <= form.rating ? '' : 'opacity-25'" aria-hidden="true">
                <path fill="currentColor" d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z" />
              </svg>
            </button>
          </div>
        </UFormField>
        <UFormField label="What did we do for you?">
          <UInput v-model="form.project" maxlength="120" placeholder="e.g. 3-bedroom bungalow, BQ, house plan" class="w-full" />
        </UFormField>
        <UFormField label="Where?">
          <UInput v-model="form.location" maxlength="120" placeholder="e.g. Kitengela" class="w-full" />
        </UFormField>
        <UFormField label="Your experience" required class="sm:col-span-2">
          <UTextarea v-model="form.quote" required :rows="5" maxlength="1000" autoresize class="w-full" placeholder="What was it like working with us? Was the budget accurate? Would you recommend us?" />
          <template #hint>
            <span class="text-xs">{{ form.quote.length }}/1000</span>
          </template>
        </UFormField>
        <UFormField label="Phone or email" class="sm:col-span-2" help="Only so we can confirm the testimonial with you. Never shown on the site.">
          <UInput v-model="form.contact" maxlength="200" autocomplete="tel" placeholder="07xx xxx xxx" class="w-full" />
        </UFormField>
        <!-- honeypot: hidden from people, tempting for bots -->
        <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">
        <UCheckbox v-model="form.consent" class="sm:col-span-2" :label="`I agree that ${SITE.short} may publish this testimonial with my name as written above.`" />
        <p v-if="error" class="sm:col-span-2 text-sm text-error">
          {{ error }}
        </p>
        <div class="sm:col-span-2">
          <UButton type="submit" size="lg" :loading="sending" icon="i-lucide-send" label="Send testimonial" />
        </div>
      </form>
    </UContainer>
  </div>
</template>
