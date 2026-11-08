/**
 * Company details and copy. Edit here; empty contact fields are simply hidden on the site.
 */
export const SITE = {
  key: 'davecore',
  name: 'Davecore Construction',
  short: 'Davecore',
  tagline: 'Design · Cost · Build',
  intro: 'We design homes, cost them properly and build them, with a Bill of Quantities behind every shilling.',
  contact: {
    /** e.g. '+254 7XX XXX XXX' (shown as text; also used for the call link) */
    phone: '',
    /** WhatsApp number in international format without +, e.g. '2547XXXXXXXX' */
    whatsapp: '',
    email: '',
    address: 'Nairobi, Kenya',
    hours: 'Monday–Friday 8:00–17:00 · Saturday 9:00–13:00'
  }
}

export interface Service { key: string, icon: string, title: string, summary: string, points: string[] }

export const SERVICES: Service[] = [
  {
    key: 'design',
    icon: 'i-lucide-drafting-compass',
    title: 'Architectural design',
    summary: 'Custom house plans drawn around your plot, your family and your budget.',
    points: ['Site visit and brief', 'Floor plans, elevations and sections', '3D views on request', 'Drawings ready for county approval']
  },
  {
    key: 'bq',
    icon: 'i-lucide-file-spreadsheet',
    title: 'Quantity surveying & BQs',
    summary: 'Bills of Quantities and cost plans so you know the price before you break ground.',
    points: ['Order-of-cost estimates', 'Detailed, tender-ready BQs', 'Material schedules', 'Valuations during construction']
  },
  {
    key: 'build',
    icon: 'i-lucide-hard-hat',
    title: 'Construction',
    summary: 'From foundations to finishes, built to the drawings and the BQ.',
    points: ['Residential homes and maisonettes', 'Apartment blocks', 'Site supervision and quality checks', 'Progress reports with photos']
  },
  {
    key: 'renovation',
    icon: 'i-lucide-paint-roller',
    title: 'Renovations & extensions',
    summary: 'Add a floor, extend a kitchen or modernise a whole house.',
    points: ['Structural assessment', 'Extension design', 'Phased works while you live in', 'Finishes upgrades']
  },
  {
    key: 'plans',
    icon: 'i-lucide-layout-panel-left',
    title: 'Ready-made house plans',
    summary: 'Proven designs you can buy today and adapt to your plot.',
    points: ['Bungalows, maisonettes and apartments', 'Full drawing sets', 'Optional Bill of Quantities', 'Adaptation service']
  },
  {
    key: 'pm',
    icon: 'i-lucide-clipboard-check',
    title: 'Project management',
    summary: 'One team coordinating designers, fundis, suppliers and approvals.',
    points: ['Procurement and scheduling', 'Cost control against the BQ', 'Approvals (county, NCA, NEMA)', 'Handover and snag lists']
  }
]

/** How a project runs with us, aligned with the stages in the BQ system. */
export const PROCESS = [
  { title: 'Consult', text: 'We listen to what you want, visit the plot and give an order-of-cost estimate.' },
  { title: 'Design', text: 'Architect and engineer prepare drawings, structure and specification.' },
  { title: 'Cost', text: 'A measured Bill of Quantities prices every item, so the budget is clear.' },
  { title: 'Build', text: 'Construction against the drawings and BQ, with regular progress reports.' },
  { title: 'Hand over', text: 'Snagging, final account and the keys to your building.' }
]
