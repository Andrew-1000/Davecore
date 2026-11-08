<script setup lang="ts">
import { SITE } from '~/data/site'

defineProps<{ inverted?: boolean }>()
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-2.5" :aria-label="`${SITE.name} home`">
    <svg viewBox="0 0 32 32" class="size-9 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="7" class="fill-primary" />
      <path d="M9 8h7a8 8 0 0 1 0 16H9z" fill="none" stroke="white" stroke-width="2.6" stroke-linejoin="round" />
      <path d="M9 16h12" stroke="white" stroke-width="2" opacity=".55" />
    </svg>
    <span class="leading-none">
      <span class="block font-display text-lg font-semibold" :class="inverted ? 'text-white' : 'text-highlighted'">{{ SITE.short }}</span>
      <span class="block text-[10px] tracking-[0.2em] uppercase mt-0.5" :class="inverted ? 'text-white/60' : 'text-muted'">Construction</span>
    </span>
  </NuxtLink>
</template>
