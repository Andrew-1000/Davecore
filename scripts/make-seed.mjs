// Writes supabase/seed.sql from the built-in content (app/data). Run: node scripts/make-seed.mjs
import { writeFileSync } from 'node:fs'
import { PLANS } from '../app/data/plans.ts'
import { SITE } from '../app/data/site.ts'

const q = s => `'${String(s).replace(/'/g, "''")}'`
const arr = (a, cast) => `array[${a.map(x => cast === 'numeric' ? Number(x) : q(x)).join(', ')}]::${cast}[]`
const lines = [
  '-- Davecore website: starting content, copied from the built-in site data (app/data).',
  '-- Run once after schema.sql: SQL Editor → New query → paste → Run. Existing rows are left alone.',
  '-- Regenerate with: node scripts/make-seed.mjs',
  ''
]
PLANS.forEach((p, i) => {
  lines.push(`insert into public.plans (slug, code, name, type, bedrooms, bathrooms, floor_areas, min_plot, style, price, summary, features, floors, published, sort)
values (${q(p.slug)}, ${q(p.code)}, ${q(p.name)}, ${q(p.type)}, ${p.bedrooms}, ${p.bathrooms}, ${arr(p.floorAreas, 'numeric')}, ${q(p.minPlot)}, ${q(p.style)}, ${p.price}, ${q(p.summary)}, ${arr(p.features, 'text')}, ${q(JSON.stringify(p.floors))}::jsonb, true, ${(i + 1) * 10})
on conflict (slug) do nothing;
`)
})
lines.push(`insert into public.site_settings (key, value) values
  ('contact', ${q(JSON.stringify(SITE.contact))}::jsonb),
  ('company', ${q(JSON.stringify({ intro: SITE.intro }))}::jsonb)
on conflict (key) do nothing;
`)
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), lines.join('\n'))
console.log(`supabase/seed.sql: ${PLANS.length} plans + contact settings`)
