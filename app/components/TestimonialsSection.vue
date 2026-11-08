<script setup lang="ts">
/** Approved client testimonials. Hidden until at least one is published in the website admin. */
const { data: items } = useTestimonials()
const initials = (name: string) => name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
</script>

<template>
  <section v-if="items.length" class="border-t border-default">
    <UContainer class="py-16 sm:py-20">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="sheet-label">
            Client notes
          </p>
          <h2 class="font-display text-3xl sm:text-4xl font-semibold mt-2">
            What our clients say
          </h2>
        </div>
        <UButton to="/share-your-experience" color="neutral" variant="link" trailing-icon="i-lucide-arrow-right" label="Worked with us? Share your experience" />
      </div>

      <div class="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <figure
          v-for="t in items"
          :key="t.id ?? t.quote"
          class="relative flex flex-col rounded-lg border border-default bg-default p-6"
        >
          <!-- Drawing-sheet style tag: what and where -->
          <p class="font-mono text-[11px] uppercase tracking-wider text-muted truncate">
            {{ [t.project, t.location].filter(Boolean).join(' · ') || 'Client' }}
          </p>

          <div v-if="t.rating" class="mt-4 flex gap-0.5 text-primary" :aria-label="`Rated ${t.rating} out of 5`">
            <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" class="size-4" :class="n <= t.rating ? '' : 'opacity-25'" aria-hidden="true">
              <path fill="currentColor" d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z" />
            </svg>
          </div>

          <blockquote class="mt-3 flex-1 text-default leading-relaxed whitespace-pre-line">
            <UIcon name="i-lucide-quote" class="size-5 text-primary/40 -ms-0.5 mb-1 block" />
            {{ t.quote }}
          </blockquote>

          <figcaption class="mt-5 pt-4 border-t border-dashed border-default flex items-center gap-3">
            <span class="size-9 shrink-0 grid place-items-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {{ initials(t.name) }}
            </span>
            <span class="leading-tight">
              <span class="block font-medium text-highlighted">{{ t.name }}</span>
              <span v-if="t.role" class="block text-sm text-muted">{{ t.role }}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </UContainer>
  </section>
</template>
