import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Snowflake,
  ShieldCheck,
  Star,
  MapPin,
  ArrowRight,
  Search,
  CalendarCheck,
  BadgeCheck,
} from 'lucide-react'
import { api } from '@/api'
import type { ServiceCategory } from '@/types'
import { useAuthStore, homeForRole } from '@/store/auth'

const heroCategories = [
  { icon: Zap, label: 'Electrician' },
  { icon: Wrench, label: 'Plumber' },
  { icon: Sparkles, label: 'Cleaning' },
  { icon: Hammer, label: 'Carpenter' },
  { icon: Paintbrush, label: 'Painter' },
  { icon: Snowflake, label: 'AC Repair' },
]

const steps = [
  {
    icon: Search,
    title: 'Pick a service',
    body: 'Browse categories and compare verified professionals near you — ratings, prices, and distance up front.',
  },
  {
    icon: CalendarCheck,
    title: 'Book a slot',
    body: 'Choose a date and time that works for you. Your request goes straight to the professional.',
  },
  {
    icon: BadgeCheck,
    title: 'Track and rate',
    body: 'Follow live status from accepted to completed, then rate your experience to help the community.',
  },
]

export function LandingPage() {
  const user = useAuthStore((s) => s.user)
  const [categories, setCategories] = useState<ServiceCategory[]>([])

  useEffect(() => {
    let cancelled = false
    api.getCategories().then((cats) => {
      if (!cancelled) setCategories(cats.slice(0, 6))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const browseHref = user ? homeForRole(user.role) : '/register'

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Wrench className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">KaamSetu</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main">
            {user ? (
              <Link
                to={browseHref}
                className="inline-flex h-9 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
              >
                Open app
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Trusted local pros across Pune
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Skilled hands for every job in your home
              </h1>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
                KaamSetu connects you with verified electricians, plumbers, cleaners, and more — compare ratings and prices, book a slot, and track the job live.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={browseHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Book a service
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Join as a professional
                </Link>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
                <div>
                  <dt className="text-xs text-muted-foreground">Verified pros</dt>
                  <dd className="text-xl font-semibold">150+</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Jobs completed</dt>
                  <dd className="text-xl font-semibold">4,800+</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Avg. rating</dt>
                  <dd className="flex items-center gap-1 text-xl font-semibold">
                    4.7
                    <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                  </dd>
                </div>
              </dl>
            </div>
            <div className="order-1 md:order-2">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <img
                  src="/images/hero-worker.png"
                  alt="A smiling verified electrician ready for a home visit"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-y border-border bg-card" aria-labelledby="services-heading">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="flex items-end justify-between">
              <div>
                <h2 id="services-heading" className="text-2xl font-semibold tracking-tight">
                  Popular services
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Everything your home needs, in one place.</p>
              </div>
              <Link to={browseHref} className="hidden items-center gap-1 text-sm font-medium text-foreground hover:text-primary sm:inline-flex">
                See all
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {(categories.length > 0 ? categories : heroCategories.map((c) => ({ id: c.label, name: c.label, description: '', basePrice: 0, icon: '' }))).map(
                (cat, i) => {
                  const Icon = heroCategories[i % heroCategories.length].icon
                  return (
                    <li key={cat.id}>
                      <Link
                        to={browseHref}
                        className="flex h-full flex-col items-center gap-3 rounded-lg border border-border bg-background p-5 text-center transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                          <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </Link>
                    </li>
                  )
                },
              )}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-2xl font-semibold tracking-tight">
            How KaamSetu works
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                    {i + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Trust */}
        <section className="border-y border-border bg-secondary" aria-labelledby="trust-heading">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
            <div>
              <h2 id="trust-heading" className="text-balance text-2xl font-semibold tracking-tight text-secondary-foreground">
                Every professional is verified before they take a job
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-secondary-foreground/70">
                Our team reviews identity documents and work credentials for every provider. Look for the verified badge — it means they&apos;ve been checked by KaamSetu.
              </p>
            </div>
            <ul className="grid gap-3">
              {[
                'Identity and document verification',
                'Transparent pricing before you book',
                'Live job status from request to completion',
                'Community ratings on every profile',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-lg bg-secondary-foreground/5 px-4 py-3 text-sm text-secondary-foreground">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">Ready to get it done?</h2>
          <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Create a free account to book trusted local professionals, or grow your business as a verified provider.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-card px-8 text-sm font-medium transition-colors hover:bg-muted"
            >
              Log in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>KaamSetu — local services, done right.</p>
          <p>Demo app. All data is simulated.</p>
        </div>
      </footer>
    </div>
  )
}
