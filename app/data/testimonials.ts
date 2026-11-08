/**
 * Client testimonials. Only real testimonials, given by real clients with their permission.
 * Clients send them through the "Share your experience" page and an admin approves them in the
 * website admin; staff can also add one a client gave in person. The home page section stays
 * hidden until at least one is published.
 */
export interface Testimonial {
  id?: string
  quote: string
  name: string
  /** e.g. 'Homeowner', 'Landlord' */
  role: string
  location?: string
  /** e.g. '3-bedroom bungalow' */
  project?: string
  /** 1–5, optional */
  rating?: number | null
}
