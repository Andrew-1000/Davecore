<script setup lang="ts">
import { SITE } from '~/data/site'

/** Staff sign-in for the website admin (plans, testimonials, contact details, enquiries). */
useSeoMeta({ title: `Sign in | ${SITE.name}`, robots: 'noindex' })
const { login, sendPasswordReset, user, isAdmin, ready, configured } = useSiteAuth()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const mode = ref<'signin' | 'reset'>('signin')
const resetSent = ref(false)

watchEffect(() => {
  if (ready.value && user.value && isAdmin.value) navigateTo('/admin')
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    if (mode.value === 'reset') {
      await sendPasswordReset(form.email)
      resetSent.value = true
      return
    }
    await login(form.email, form.password)
    if (isAdmin.value) await navigateTo('/admin')
    else error.value = 'This account is not a website administrator.'
  }
  catch (e) {
    error.value = supabaseError(e)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-16 flex justify-center">
    <div class="w-full max-w-md rounded-sm border-2 border-accented p-1.5">
      <div class="border border-default p-6 sm:p-8">
        <p class="sheet-label">
          {{ SITE.short }} website admin
        </p>
        <h1 class="font-display text-3xl font-semibold mt-1">
          {{ mode === 'reset' ? 'Reset password' : 'Sign in' }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ mode === 'reset' ? 'We will email you a link to choose a new password.' : 'For staff who manage the website: plans, testimonials, contact details and enquiries.' }}
        </p>

        <UAlert v-if="!configured" class="mt-6" color="warning" variant="subtle" icon="i-lucide-plug-zap" title="Website sign-in is not set up yet" description="Connect the site to Supabase (see the README), then sign in here." />

        <div v-else-if="resetSent" class="mt-6 rounded-lg border border-success/40 bg-success/10 p-4 text-sm">
          If <strong>{{ form.email }}</strong> has an account, a reset link is on its way. Open it on this device.
        </div>

        <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
          <UFormField label="Email" required>
            <UInput v-model="form.email" type="email" autocomplete="email" required class="w-full" size="lg" />
          </UFormField>
          <UFormField v-if="mode === 'signin'" label="Password" required>
            <PasswordInput v-model="form.password" autocomplete="current-password" required class="w-full" size="lg" />
          </UFormField>
          <p v-if="error" class="text-sm text-error">
            {{ error }}
          </p>
          <UButton type="submit" block size="lg" :loading="loading" :label="mode === 'reset' ? 'Send reset link' : 'Sign in'" />
        </form>

        <p v-if="configured" class="text-sm text-muted mt-6">
          <button v-if="mode === 'signin'" type="button" class="text-primary font-medium" @click="mode = 'reset'; error = ''">
            Forgot your password?
          </button>
          <button v-else type="button" class="text-primary font-medium" @click="mode = 'signin'; resetSent = false; error = ''">
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  </UContainer>
</template>
