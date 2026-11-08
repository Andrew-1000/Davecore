<script setup lang="ts">
import { SITE } from '~/data/site'

/** Landing page of the password-reset email: Supabase signs the user in from the link; they choose a new password. */
useSeoMeta({ title: `Choose a new password | ${SITE.name}`, robots: 'noindex' })
const { user, ready, setPassword } = useSiteAuth()
const password = ref('')
const confirm = ref('')
const saving = ref(false)
const error = ref('')
const done = ref(false)

async function submit() {
  error.value = ''
  if (password.value.length < 8) { error.value = 'Use at least 8 characters.'; return }
  if (password.value !== confirm.value) { error.value = 'The two passwords do not match.'; return }
  saving.value = true
  try {
    await setPassword(password.value)
    done.value = true
  }
  catch (e) {
    error.value = supabaseError(e)
  }
  finally {
    saving.value = false
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
          Choose a new password
        </h1>
        <ClientOnly>
          <div v-if="!ready" class="py-10 text-center text-muted">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
          </div>
          <div v-else-if="done" class="mt-6 space-y-4">
            <UAlert color="success" variant="subtle" icon="i-lucide-check" title="Password changed" />
            <UButton to="/admin" block size="lg" label="Go to the website admin" />
          </div>
          <div v-else-if="!user" class="mt-6 space-y-4">
            <UAlert color="warning" variant="subtle" icon="i-lucide-link-2-off" title="This reset link has expired or was already used" />
            <UButton to="/login" block color="neutral" variant="outline" label="Request a new link" />
          </div>
          <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
            <UFormField label="New password" required>
              <UInput v-model="password" type="password" autocomplete="new-password" required class="w-full" size="lg" />
            </UFormField>
            <UFormField label="Repeat the new password" required>
              <UInput v-model="confirm" type="password" autocomplete="new-password" required class="w-full" size="lg" />
            </UFormField>
            <p v-if="error" class="text-sm text-error">
              {{ error }}
            </p>
            <UButton type="submit" block size="lg" :loading="saving" label="Save password" />
          </form>
        </ClientOnly>
      </div>
    </div>
  </UContainer>
</template>
