<script setup lang="ts">
import { SITE } from '~/data/site'

useSeoMeta({ title: `Sign in | ${SITE.name}` })
const { login, user } = useAuth()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

watchEffect(() => {
  if (user.value) navigateTo('/account')
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await login(form.email, form.password)
    await navigateTo('/account')
  }
  catch (e) {
    error.value = errorMessage(e)
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
          {{ SITE.short }} account
        </p>
        <h1 class="font-display text-3xl font-semibold mt-1">
          Sign in
        </h1>
        <p class="text-sm text-muted mt-1">
          Use your Davecore BQ account to see your projects and Bills of Quantities.
        </p>
        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <UFormField label="Email" required>
            <UInput v-model="form.email" type="email" autocomplete="email" required class="w-full" size="lg" />
          </UFormField>
          <UFormField label="Password" required>
            <UInput v-model="form.password" type="password" autocomplete="current-password" required class="w-full" size="lg" />
          </UFormField>
          <p v-if="error" class="text-sm text-error">
            {{ error }}
          </p>
          <UButton type="submit" block size="lg" :loading="loading" label="Sign in" />
        </form>
        <p class="text-sm text-muted mt-6">
          No account yet? <a :href="`${useBqBase()}/register`" target="_blank" rel="noopener" class="text-primary font-medium">Create one on Davecore BQ</a>, then sign in here.
        </p>
      </div>
    </div>
  </UContainer>
</template>
