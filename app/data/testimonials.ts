/**
 * Client testimonials shown on the home page.
 *
 * Add real quotes only, with the client's permission. Entries marked `sample: true` are
 * placeholders: they show (labelled "Sample") while developing locally and are never shown on
 * the live site. Delete them once real testimonials are in. If no real testimonials remain,
 * the section is hidden on the live site.
 */
export interface Testimonial {
  /** The client's words */
  quote: string
  name: string
  /** e.g. 'Homeowner', 'Landlord', 'Project manager, ABC Ltd' */
  role: string
  /** Where the project was, e.g. 'Kitengela' */
  location?: string
  /** What was done, e.g. '3-bedroom bungalow' */
  project?: string
  /** 1–5; leave out to hide stars */
  rating?: number
  sample?: boolean
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Sample testimonial: the Bill of Quantities matched what we actually spent within a few percent, and every stage was explained before we paid for it.',
    name: 'Sample client',
    role: 'Homeowner',
    location: 'Town',
    project: '3-bedroom bungalow',
    rating: 5,
    sample: true
  },
  {
    quote: 'Sample testimonial: we bought a ready-made plan, had it adapted to our plot and got a costed BQ the same week. No surprises on site.',
    name: 'Sample client',
    role: 'Landlord',
    location: 'Town',
    project: 'Apartment block',
    rating: 5,
    sample: true
  },
  {
    quote: 'Sample testimonial: the free cost calculator gave us a realistic budget before we even called. The final quote was close to it.',
    name: 'Sample client',
    role: 'First-time builder',
    location: 'Town',
    project: '4-bedroom maisonette',
    rating: 4,
    sample: true
  }
]

/** Testimonials to show: real ones always, samples only while developing locally. */
export const visibleTestimonials = (dev: boolean) => TESTIMONIALS.filter(t => dev || !t.sample)
