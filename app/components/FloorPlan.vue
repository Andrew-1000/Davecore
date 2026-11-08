<script setup lang="ts">
import type { Floor } from '~/data/plans'

/**
 * Watermarked preview of a floor plan, drawn from the room layout (metres). The watermark
 * keeps previews from being used as the purchased drawing set.
 */
const props = withDefaults(defineProps<{ floor: Floor, watermark?: string, compact?: boolean }>(), { watermark: 'DAVECORE · PREVIEW', compact: false })
const S = 40 // px per metre
const pad = computed(() => props.compact ? 10 : 34)
const vbW = computed(() => props.floor.width * S + pad.value * 2)
const vbH = computed(() => props.floor.depth * S + pad.value * 2)
const fill = (kind?: string) => kind === 'wet' ? 'fill-sky-100 dark:fill-sky-950' : kind === 'circulation' ? 'fill-slate-100 dark:fill-slate-800' : kind === 'outdoor' ? 'fill-emerald-50 dark:fill-emerald-950' : 'fill-white dark:fill-slate-900'
</script>

<template>
  <svg :viewBox="`0 0 ${vbW} ${vbH}`" class="w-full h-auto select-none" role="img" :aria-label="`${floor.name} preview, ${floor.width} by ${floor.depth} metres`">
    <defs>
      <pattern :id="`wm-${floor.name.replace(/\W/g, '')}`" width="260" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
        <text x="0" y="60" font-size="18" font-weight="700" letter-spacing="4" class="fill-primary/15" font-family="ui-sans-serif, system-ui">{{ watermark }}</text>
      </pattern>
    </defs>
    <g :transform="`translate(${pad} ${pad})`">
      <rect
        v-for="(r, i) in floor.rooms"
        :key="i"
        :x="r.x * S"
        :y="r.y * S"
        :width="r.w * S"
        :height="r.h * S"
        :class="fill(r.kind)"
        class="stroke-slate-700 dark:stroke-slate-300"
        :stroke-width="r.kind === 'outdoor' ? 1.5 : 3"
        :stroke-dasharray="r.kind === 'outdoor' ? '6 4' : undefined"
      />
      <template v-if="!compact">
        <g v-for="(r, i) in floor.rooms" :key="`t${i}`">
          <text :x="(r.x + r.w / 2) * S" :y="(r.y + r.h / 2) * S - 2" text-anchor="middle" :font-size="r.w * S < 90 ? 10 : 13" font-weight="600" class="fill-slate-800 dark:fill-slate-100" font-family="ui-sans-serif, system-ui">{{ r.name }}</text>
          <text :x="(r.x + r.w / 2) * S" :y="(r.y + r.h / 2) * S + 13" text-anchor="middle" font-size="10" class="fill-slate-500" font-family="ui-monospace, monospace">{{ r.w }} × {{ r.h }} m</text>
        </g>
        <!-- overall dimensions -->
        <line x1="0" :y1="-16" :x2="floor.width * S" :y2="-16" class="stroke-slate-400" />
        <text :x="floor.width * S / 2" y="-21" text-anchor="middle" font-size="11" class="fill-slate-500" font-family="ui-monospace, monospace">{{ floor.width }} m</text>
        <line :x1="-16" y1="0" :x2="-16" :y2="floor.depth * S" class="stroke-slate-400" />
        <text :x="-21" :y="floor.depth * S / 2" text-anchor="middle" font-size="11" class="fill-slate-500" font-family="ui-monospace, monospace" :transform="`rotate(-90 ${-21} ${floor.depth * S / 2})`">{{ floor.depth }} m</text>
      </template>
    </g>
    <rect width="100%" height="100%" :fill="`url(#wm-${floor.name.replace(/\W/g, '')})`" pointer-events="none" />
  </svg>
</template>
