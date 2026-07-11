import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore } from '@/store/auth'
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, Stars } from '@/components/ui'
import { MapPin, BadgeCheck, Briefcase, IndianRupee } from 'lucide-react'

export function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const isCustomer = user?.role === 'CUSTOMER'

  const provider = useQuery({
    queryKey: ['provider', id],
    queryFn: () => api.getProviderById(id!),
    enabled: !!id,
  })
  const reviews = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.getReviewsForProvider(id!),
    enabled: !!id,
  })

  const bookingsQuery = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => api.getMyBookings(user!.id, 'CUSTOMER'),
    enabled: !!user?.id && isCustomer,
  })

  const activeBooking = bookingsQuery.data?.find(
    (b) => b.providerId === id && ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)
  )

  if (provider.isPending) return <LoadingState label="Loading profile…" />
  if (provider.isError)
    return <ErrorState message={(provider.error as Error).message} onRetry={() => provider.refetch()} />

  const p = provider.data

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-secondary-foreground">
              {p.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-semibold">
                {p.name}
                <BadgeCheck className="size-5 text-success" aria-label="Verified provider" />
              </h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden />
                {p.areaLabel}, Pune
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={p.rating} />
                <span className="text-sm text-muted-foreground">
                  {p.rating || 'New'} · {p.reviewCount} reviews
                </span>
              </div>
            </div>
          </div>
          <Badge tone={p.available ? 'success' : 'neutral'}>{p.available ? 'Available now' : 'Currently busy'}</Badge>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-pretty">{p.bio}</p>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
          <div>
            <p className="flex items-center justify-center gap-1 text-lg font-semibold">
              <Briefcase className="size-4 text-muted-foreground" aria-hidden />
              {p.yearsExperience} yrs
            </p>
            <p className="text-xs text-muted-foreground">Experience</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{p.completedJobs}</p>
            <p className="text-xs text-muted-foreground">Jobs completed</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-0.5 text-lg font-semibold">
              <IndianRupee className="size-4 text-muted-foreground" aria-hidden />
              {p.hourlyRate}/hr
            </p>
            <p className="text-xs text-muted-foreground">Rate</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          {p.available ? (
            activeBooking ? (
              <Button asChild size="lg" className="w-full sm:w-auto" variant="secondary">
                <Link to={`/bookings/${activeBooking.id}`}>
                  View active booking
                </Link>
              </Button>
            ) : (
              <Link
                to={`/book/${p.id}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Book now
              </Link>
            )
          ) : (
            <Button size="lg" className="w-full sm:w-auto" disabled>
              Not accepting bookings
            </Button>
          )}
        </div>
      </Card>

      <section aria-labelledby="reviews-heading" className="flex flex-col gap-3">
        <h2 id="reviews-heading" className="text-lg font-semibold">
          Reviews
        </h2>
        {reviews.isPending && <LoadingState label="Loading reviews…" />}
        {reviews.isError && (
          <ErrorState message={(reviews.error as Error).message} onRetry={() => reviews.refetch()} />
        )}
        {reviews.data?.length === 0 && (
          <EmptyState title="No reviews yet" description="Be the first to book and review this provider." />
        )}
        {reviews.data?.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{r.customerName}</p>
              <Stars rating={r.rating} size={14} />
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{r.comment}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </Card>
        ))}
      </section>
    </div>
  )
}
