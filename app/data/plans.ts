/**
 * Built-in house plan catalogue. Used until the website is connected to Supabase; after that,
 * plans are managed in the website admin (this list is the seed data in supabase/seed.sql).
 * Room layouts are in metres and drive the drawn, watermarked previews. Prices: drawing set, KES.
 */
export interface Room { name: string, x: number, y: number, w: number, h: number, kind?: 'wet' | 'circulation' | 'outdoor' }
export interface Floor { name: string, width: number, depth: number, rooms: Room[] }
export interface Plan {
  slug: string
  code: string
  name: string
  type: 'bungalow' | 'maisonette' | 'apartment'
  bedrooms: number
  bathrooms: number
  /** Room layouts for the drawn preview (may be empty when preview images are uploaded instead) */
  floors: Floor[]
  /** Preview image URLs (watermarked), uploaded in the website admin */
  images?: string[]
  /** Gross floor area per floor, m² (used for the cost estimate). */
  floorAreas: number[]
  minPlot: string
  style: string
  price: number
  summary: string
  features: string[]
}

export const PLAN_INCLUDES = [
  'Floor plans for every level (A3, PDF)',
  'Front, rear and side elevations',
  'Sections and roof plan',
  'Door and window schedule',
  'Foundation layout'
]

export const PLANS: Plan[] = [
  {
    slug: 'kito-2-bedroom-bungalow',
    code: 'DC-B201',
    name: 'Kito',
    type: 'bungalow',
    bedrooms: 2,
    bathrooms: 1,
    floorAreas: [75],
    minPlot: '40 × 60 ft',
    style: 'Compact modern',
    price: 25000,
    summary: 'An efficient starter home with an open living and dining area, two bedrooms and a separate kitchen.',
    features: ['Open-plan living & dining', 'Separate kitchen with store', 'Two bedrooms', 'Easy to extend later'],
    floors: [{
      name: 'Ground floor', width: 10, depth: 7.5,
      rooms: [
        { name: 'Living / dining', x: 0, y: 0, w: 5.5, h: 4.5 },
        { name: 'Kitchen', x: 5.5, y: 0, w: 4.5, h: 3 },
        { name: 'Bath', x: 5.5, y: 3, w: 2, h: 1.5, kind: 'wet' },
        { name: 'Store', x: 7.5, y: 3, w: 2.5, h: 1.5 },
        { name: 'Bedroom 1', x: 0, y: 4.5, w: 4, h: 3 },
        { name: 'Bedroom 2', x: 4, y: 4.5, w: 3.5, h: 3 },
        { name: 'Porch', x: 7.5, y: 4.5, w: 2.5, h: 3, kind: 'outdoor' }
      ]
    }]
  },
  {
    slug: 'amani-3-bedroom-bungalow',
    code: 'DC-B302',
    name: 'Amani',
    type: 'bungalow',
    bedrooms: 3,
    bathrooms: 2,
    floorAreas: [120],
    minPlot: '50 × 100 ft',
    style: 'Contemporary family',
    price: 35000,
    summary: 'A family bungalow with a master en-suite, generous living room and a kitchen with pantry.',
    features: ['Master bedroom with en-suite', 'Separate dining', 'Kitchen with pantry', 'Central corridor keeps bedrooms private'],
    floors: [{
      name: 'Ground floor', width: 12, depth: 10,
      rooms: [
        { name: 'Living', x: 0, y: 0, w: 6, h: 5 },
        { name: 'Dining', x: 6, y: 0, w: 3, h: 5 },
        { name: 'Kitchen', x: 9, y: 0, w: 3, h: 3.5 },
        { name: 'Pantry', x: 9, y: 3.5, w: 3, h: 1.5 },
        { name: 'Corridor', x: 0, y: 5, w: 12, h: 1.2, kind: 'circulation' },
        { name: 'Master', x: 0, y: 6.2, w: 4.5, h: 3.8 },
        { name: 'En-suite', x: 4.5, y: 6.2, w: 1.8, h: 1.9, kind: 'wet' },
        { name: 'Bath', x: 4.5, y: 8.1, w: 1.8, h: 1.9, kind: 'wet' },
        { name: 'Bedroom 2', x: 6.3, y: 6.2, w: 3, h: 3.8 },
        { name: 'Bedroom 3', x: 9.3, y: 6.2, w: 2.7, h: 3.8 }
      ]
    }]
  },
  {
    slug: 'baraka-4-bedroom-bungalow',
    code: 'DC-B403',
    name: 'Baraka',
    type: 'bungalow',
    bedrooms: 4,
    bathrooms: 3,
    floorAreas: [160],
    minPlot: '50 × 100 ft',
    style: 'Spacious single-storey',
    price: 45000,
    summary: 'Four bedrooms on one level, two of them en-suite, around a large family living space.',
    features: ['Two en-suite bedrooms', 'Family lounge and formal living', 'Kitchen, pantry and laundry', 'No stairs: suits all ages'],
    floors: [{
      name: 'Ground floor', width: 16, depth: 10,
      rooms: [
        { name: 'Living', x: 0, y: 0, w: 6, h: 5 },
        { name: 'Dining', x: 6, y: 0, w: 4, h: 5 },
        { name: 'Kitchen', x: 10, y: 0, w: 3.5, h: 3.5 },
        { name: 'Laundry', x: 13.5, y: 0, w: 2.5, h: 3.5, kind: 'wet' },
        { name: 'Pantry', x: 10, y: 3.5, w: 6, h: 1.5 },
        { name: 'Corridor', x: 0, y: 5, w: 16, h: 1.2, kind: 'circulation' },
        { name: 'Master', x: 0, y: 6.2, w: 4.5, h: 3.8 },
        { name: 'En-suite', x: 4.5, y: 6.2, w: 1.8, h: 3.8, kind: 'wet' },
        { name: 'Bedroom 2', x: 6.3, y: 6.2, w: 3.5, h: 3.8 },
        { name: 'Bath', x: 9.8, y: 6.2, w: 1.8, h: 3.8, kind: 'wet' },
        { name: 'Bedroom 3', x: 11.6, y: 6.2, w: 2.2, h: 3.8 },
        { name: 'Bedroom 4', x: 13.8, y: 6.2, w: 2.2, h: 3.8 }
      ]
    }]
  },
  {
    slug: 'neema-4-bedroom-maisonette',
    code: 'DC-M404',
    name: 'Neema',
    type: 'maisonette',
    bedrooms: 4,
    bathrooms: 3,
    floorAreas: [110, 110],
    minPlot: '50 × 100 ft',
    style: 'Two-storey family home',
    price: 60000,
    summary: 'Living spaces and a guest room downstairs; master suite, two bedrooms and a family lounge upstairs.',
    features: ['Guest bedroom on the ground floor', 'Master suite with walk-in closet', 'Upstairs family lounge', 'Balcony off the master'],
    floors: [
      {
        name: 'Ground floor', width: 11, depth: 10,
        rooms: [
          { name: 'Living', x: 0, y: 0, w: 6, h: 5.5 },
          { name: 'Dining', x: 6, y: 0, w: 5, h: 3.5 },
          { name: 'Kitchen', x: 6, y: 3.5, w: 5, h: 3 },
          { name: 'Stairs', x: 0, y: 5.5, w: 2.5, h: 4.5, kind: 'circulation' },
          { name: 'Guest bedroom', x: 2.5, y: 5.5, w: 3.5, h: 4.5 },
          { name: 'Bath', x: 6, y: 6.5, w: 2, h: 3.5, kind: 'wet' },
          { name: 'Store', x: 8, y: 6.5, w: 3, h: 3.5 }
        ]
      },
      {
        name: 'First floor', width: 11, depth: 10,
        rooms: [
          { name: 'Master', x: 0, y: 0, w: 5, h: 5 },
          { name: 'En-suite', x: 5, y: 0, w: 2, h: 2.5, kind: 'wet' },
          { name: 'Closet', x: 5, y: 2.5, w: 2, h: 2.5 },
          { name: 'Bedroom 3', x: 7, y: 0, w: 4, h: 5 },
          { name: 'Stairs', x: 0, y: 5.5, w: 2.5, h: 4.5, kind: 'circulation' },
          { name: 'Landing / lounge', x: 2.5, y: 5, w: 4, h: 5 },
          { name: 'Bath', x: 6.5, y: 5, w: 1.5, h: 5, kind: 'wet' },
          { name: 'Bedroom 4', x: 8, y: 5, w: 3, h: 5 }
        ]
      }
    ]
  },
  {
    slug: 'upendo-apartment-block',
    code: 'DC-A805',
    name: 'Upendo',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    floorAreas: [216, 216, 216, 216],
    minPlot: '50 × 100 ft',
    style: 'Ground + 3 rental block',
    price: 150000,
    summary: 'A rental block of eight 2-bedroom units, two per floor, around a central stair core.',
    features: ['8 × 2-bedroom units', 'Central stair core', 'Each unit with balcony', 'Designed for rental returns'],
    floors: [{
      name: 'Typical floor', width: 18, depth: 12,
      rooms: [
        { name: 'Unit A · living', x: 0, y: 0, w: 5, h: 5 },
        { name: 'Kitchen', x: 5, y: 0, w: 3, h: 3 },
        { name: 'Bath', x: 5, y: 3, w: 3, h: 2, kind: 'wet' },
        { name: 'Bed 1', x: 0, y: 5, w: 4, h: 4 },
        { name: 'Bed 2', x: 4, y: 5, w: 4, h: 4 },
        { name: 'Balcony', x: 0, y: 9, w: 8, h: 3, kind: 'outdoor' },
        { name: 'Stairs & lobby', x: 8, y: 0, w: 2, h: 12, kind: 'circulation' },
        { name: 'Unit B · living', x: 13, y: 0, w: 5, h: 5 },
        { name: 'Kitchen', x: 10, y: 0, w: 3, h: 3 },
        { name: 'Bath', x: 10, y: 3, w: 3, h: 2, kind: 'wet' },
        { name: 'Bed 1', x: 14, y: 5, w: 4, h: 4 },
        { name: 'Bed 2', x: 10, y: 5, w: 4, h: 4 },
        { name: 'Balcony', x: 10, y: 9, w: 8, h: 3, kind: 'outdoor' }
      ]
    }]
  }
]

export const PLAN_TYPES: Record<Plan['type'], string> = { bungalow: 'Bungalow', maisonette: 'Maisonette', apartment: 'Apartment block' }

export const planBySlug = (slug: string) => PLANS.find(p => p.slug === slug)
