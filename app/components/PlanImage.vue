<script setup lang="ts">
import { SITE } from '~/data/site'

/** Uploaded plan preview image with a repeating watermark over it. */
withDefaults(defineProps<{ src: string, alt: string, contain?: boolean }>(), { contain: false })
const mark = `${SITE.short.toUpperCase()} · PREVIEW`
const pattern = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='260' height='120'><text x='0' y='60' transform='rotate(-24 130 60)' font-family='sans-serif' font-size='18' font-weight='700' letter-spacing='4' fill='rgba(37,99,235,0.16)'>${mark}</text></svg>`)}")`
</script>

<template>
  <div class="relative overflow-hidden select-none" @contextmenu.prevent>
    <img :src="src" :alt="alt" class="size-full" :class="contain ? 'object-contain' : 'object-cover'" loading="lazy" draggable="false">
    <div class="absolute inset-0 pointer-events-none" :style="{ backgroundImage: pattern }" aria-hidden="true" />
  </div>
</template>
