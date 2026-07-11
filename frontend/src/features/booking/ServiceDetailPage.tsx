import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import {
  Card,
  Button,
  LoadingState,
  ErrorState,
  Badge,
  Stars,
  cn,
} from '@/components/ui'
import { CategoryIcon } from '@/components/CategoryIcon'
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, IndianRupee, Wrench, Sparkles, Users } from 'lucide-react'

// Service-specific detail content for each category — in production this
// would come from the API; for the MVP we define it alongside the frontend.
const SERVICE_DETAILS: Record<string, {
  longDescription: string
  includes: string[]
  estimatedDuration: string
  whyUs: string[]
  tips: string
}> = {
  '11111111-1111-4111-8111-000000000001': {
    longDescription:
      'From fixing a faulty switchboard to complete house rewiring, our certified electricians handle all residential and commercial electrical work with safety as the top priority. Same-day service available for most repairs.',
    includes: [
      'Switchboard repair and replacement',
      'MCB / RCCB installation',
      'Fan and light fixture installation',
      'Wiring and rewiring',
      'Power backup and inverter setup',
      'Earth leakage testing',
    ],
    estimatedDuration: '1–3 hours',
    whyUs: [
      'Licensed and insured professionals',
      'Safety-certified equipment',
      'Warranty on all work',
      'Transparent pricing — no hidden charges',
    ],
    tips: 'Turn off the mains before we arrive. List all the issues you need fixed so we can quote accurately.',
  },
  '11111111-1111-4111-8111-000000000002': {
    longDescription:
      'Leaky taps, clogged drains, bathroom installations — our plumbers fix it all. Fully equipped for both minor repairs and major renovation work across Pune.',
    includes: [
      'Tap and mixer repair / replacement',
      'Pipe leak detection and fixing',
      'Basin, sink and geyser installation',
      'Drain and sewer unclogging',
      'Bathroom waterproofing',
      'Concealed piping',
    ],
    estimatedDuration: '1–4 hours',
    whyUs: [
      '10+ years experience on average',
      'Latest diagnostic tools',
      'Guaranteed workmanship',
      'Emergency service available',
    ],
    tips: 'Clear the area under the sink or around the fixture. Take photos of the issue if possible.',
  },
  '11111111-1111-4111-8111-000000000003': {
    longDescription:
      'Beat the Pune heat! Expert AC servicing, repair and installation for all brands — split, window, cassette and central systems. We use eco-friendly refrigerants and follow all safety protocols.',
    includes: [
      'Split AC servicing and gas refill',
      'Window AC installation and removal',
      'PCB and compressor repair',
      'Coil cleaning and deep service',
      'Inverter AC diagnostics',
      'AMC contracts for homes and offices',
    ],
    estimatedDuration: '1–3 hours',
    whyUs: [
      'Certified HVAC technicians',
      'All major brands covered',
      'Genuine spare parts',
      'Service warranty provided',
    ],
    tips: 'Clean or replace your AC filters monthly. Schedule servicing before summer for best rates.',
  },
  '11111111-1111-4111-8111-000000000004': {
    longDescription:
      'Deep cleaning that actually makes a difference. Our trained teams use eco-friendly products and professional-grade equipment to transform your home from top to bottom.',
    includes: [
      'Full home deep clean (1BHK / 2BHK / 3BHK)',
      'Kitchen: chimney, hob, cabinets, tiles',
      'Bathroom: scrubbing, descaling, disinfection',
      'Sofa and carpet shampooing',
      'Marble and tile polishing',
      'Balcony and window cleaning',
    ],
    estimatedDuration: '3–8 hours (depends on home size)',
    whyUs: [
      'Trained and background-checked staff',
      'Eco-friendly, pet-safe chemicals',
      'Equipment brought by the team',
      'Satisfaction guaranteed or we re-clean free',
    ],
    tips: 'Secure valuables and small items. Let us know about any delicate surfaces beforehand.',
  },
  '11111111-1111-4111-8111-000000000005': {
    longDescription:
      'Premium salon services at your doorstep. No more traffic and waiting — our experienced stylists and beauticians bring the full salon experience to your home.',
    includes: [
      'Haircut, styling and colouring',
      'Facial and clean-up for all skin types',
      'Bridal and party makeup',
      'Manicure and pedicure',
      'Threading, waxing and bleaching',
      'Mehendi application',
    ],
    estimatedDuration: '30 min – 3 hours',
    whyUs: [
      'Professional-grade products used',
      'Hygiene-certified tools',
      'Experienced with all hair and skin types',
      'Flexible timings — early morning to late evening',
    ],
    tips: 'Wash your hair before a haircut appointment. For facials, avoid makeup beforehand.',
  },
}

export function ServiceDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [bookingMode, setBookingMode] = useState<'auto' | 'choose'>('auto')

  const { data: categories, isPending, isError, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const category = categories?.find((c) => c.id === categoryId)

  // Use API fields if available (with rich content), otherwise fall back to hardcoded details
  const details = category
    ? category.longDescription
      ? category
      : SERVICE_DETAILS[categoryId!]
    : undefined

  if (isPending) return <LoadingState label="Loading…" />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
  if (!category || !details) return <ErrorState message="Service not found." />

  const ctaLink = bookingMode === 'auto'
    ? `/book/auto/${category.id}`
    : `/services/${category.id}/providers`

  const ctaLabel = bookingMode === 'auto'
    ? `Auto-assign technician — ₹${category.basePrice}`
    : `Browse technicians — ₹${category.basePrice}`

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back + breadcrumb */}
      <Link
        to="/browse"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All services
      </Link>

      {/* Hero section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                <CategoryIcon icon={category.icon} className="size-7 text-primary" />
              </span>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{category.name}</h1>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {details.longDescription}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-baseline gap-1">
              <span className="text-3xl font-bold">₹{category.basePrice}</span>
              <span className="text-sm text-muted-foreground">starting price</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* What's included */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="size-5 text-success" aria-hidden />
              What's included
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {details.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Duration + trust markers */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Clock className="size-5 text-muted-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium">Est. duration</p>
                <p className="text-sm text-muted-foreground">{details.estimatedDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <ShieldCheck className="size-5 text-muted-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium">Verified pros</p>
                <p className="text-sm text-muted-foreground">Background-checked professionals</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <IndianRupee className="size-5 text-muted-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium">Transparent pricing</p>
                <p className="text-sm text-muted-foreground">No hidden charges, pay per hour</p>
              </div>
            </div>
          </div>

          {/* Why us */}
          <section className="mt-6 border-t border-border pt-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Wrench className="size-5 text-muted-foreground" aria-hidden />
              Why choose KaamSetu
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {details.whyUs.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 size-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Tips */}
          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              💡 Pro tip
            </p>
            <p className="mt-1 text-sm">{details.tips}</p>
          </div>

          {/* Booking mode selector + CTA */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-base font-semibold">How would you like to book?</h3>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              {/* Auto-assign option */}
              <button
                type="button"
                onClick={() => setBookingMode('auto')}
                className={cn(
                  'flex flex-1 cursor-pointer items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                  bookingMode === 'auto'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <span className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                  bookingMode === 'auto' ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                )}>
                  {bookingMode === 'auto' && (
                    <span className="size-2 rounded-full bg-white" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                    <span className="text-sm font-semibold">Auto-assign the best technician</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recommended · Fastest match based on distance, rating & availability
                  </p>
                </div>
              </button>

              {/* Choose yourself option */}
              <button
                type="button"
                onClick={() => setBookingMode('choose')}
                className={cn(
                  'flex flex-1 cursor-pointer items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                  bookingMode === 'choose'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <span className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                  bookingMode === 'choose' ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                )}>
                  {bookingMode === 'choose' && (
                    <span className="size-2 rounded-full bg-white" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" aria-hidden />
                    <span className="text-sm font-semibold">Choose a technician yourself</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Browse and pick from available providers near you
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-2xl font-bold">₹{category.basePrice}</p>
              </div>
              <Link
                to={ctaLink}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

