import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore } from '@/store/auth'
import {
  Card,
  Badge,
  StatusBadge,
  Button,
  LoadingState,
  ErrorState,
  EmptyState,
  Stars,
} from '@/components/ui'
import { CalendarDays, MapPin, ChevronRight, BriefcaseBusiness, IndianRupee, ShieldCheck, ShieldAlert } from 'lucide-react'
import type { Booking } from '@/types'

function BookingRow({ b }: { b: Booking }) {
  return (
    <Link to={`/provider/bookings/${b.id}`} className="group block">
      <Card className="flex items-center gap-4 p-4 transition-colors group-hover:border-primary">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{b.categoryName}</span>
            <StatusBadge status={b.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">for {b.customerName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {new Date(b.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {b.address}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">₹{b.price}</span>
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        </div>
      </Card>
    </Link>
  )
}

export function ProviderDashboardPage() {
  const user = useAuthStore((s) => s.user)!
  const storedProfile = useAuthStore((s) => s.providerProfile)
  const setProviderProfile = useAuthStore((s) => s.setProviderProfile)
  const qc = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['providerProfile', user.id],
    queryFn: () => api.getProviderByUserId(user.id),
    initialData: storedProfile ?? undefined,
  })

  const bookingsQuery = useQuery({
    queryKey: ['bookings', user.id, 'provider'],
    queryFn: () => api.getMyBookings(user.id, 'PROVIDER'),
    refetchInterval: 5000,
  })

  const availabilityMutation = useMutation({
    mutationFn: (available: boolean) =>
      api.updateProviderProfile(profileQuery.data!.id, { available }),
    onSuccess: (profile) => {
      setProviderProfile(profile)
      qc.setQueryData(['providerProfile', user.id], profile)
    },
  })

  const profile = profileQuery.data
  const bookings = bookingsQuery.data

  const requested = bookings?.filter((b) => b.status === 'REQUESTED') ?? []
  const active = bookings?.filter((b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS') ?? []
  const past = bookings?.filter((b) => ['COMPLETED', 'RATED', 'CANCELLED'].includes(b.status)) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Provider dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage incoming requests and your availability.
          </p>
        </div>
        {profile && (
          <Button
            variant={profile.available ? 'outline' : 'success'}
            loading={availabilityMutation.isPending}
            onClick={() => availabilityMutation.mutate(!profile.available)}
          >
            {profile.available ? 'Go unavailable' : 'Go available'}
          </Button>
        )}
      </div>

      {profile && profile.verificationStatus !== 'VERIFIED' && (
        <Card className="flex items-center gap-3 border-primary/40 bg-primary/10 p-4">
          <ShieldAlert className="size-5 shrink-0 text-[#9c6a17]" aria-hidden />
          <p className="text-sm">
            {profile.verificationStatus === 'PENDING'
              ? 'Your profile is pending admin verification. You will appear in search once verified.'
              : 'Your verification was rejected. Please update your profile and contact support.'}
          </p>
        </Card>
      )}

      {profile && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-muted-foreground">Rating</span>
            <span className="flex items-center gap-2 text-lg font-semibold">
              {profile.rating.toFixed(1)} <Stars rating={profile.rating} size={14} />
            </span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-muted-foreground">Completed jobs</span>
            <span className="flex items-center gap-2 text-lg font-semibold">
              <BriefcaseBusiness className="size-4 text-muted-foreground" aria-hidden />
              {profile.completedJobs}
            </span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-muted-foreground">Hourly rate</span>
            <span className="flex items-center gap-2 text-lg font-semibold">
              <IndianRupee className="size-4 text-muted-foreground" aria-hidden />
              {profile.hourlyRate}/hr
            </span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className="flex items-center gap-2">
              {profile.verificationStatus === 'VERIFIED' ? (
                <Badge tone="success">
                  <ShieldCheck className="size-3" aria-hidden /> Verified
                </Badge>
              ) : (
                <Badge tone="amber">{profile.verificationStatus === 'PENDING' ? 'Pending' : 'Rejected'}</Badge>
              )}
              <Badge tone={profile.available ? 'success' : 'neutral'}>
                {profile.available ? 'Available' : 'Unavailable'}
              </Badge>
            </span>
          </Card>
        </div>
      )}

      {bookingsQuery.isPending && <LoadingState label="Loading bookings…" />}
      {bookingsQuery.isError && (
        <ErrorState
          message={(bookingsQuery.error as Error).message}
          onRetry={() => bookingsQuery.refetch()}
        />
      )}

      {bookings && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="font-semibold">New requests {requested.length > 0 && <Badge tone="amber">{requested.length}</Badge>}</h2>
            {requested.length === 0 ? (
              <EmptyState title="No new requests" description="New booking requests will show up here." />
            ) : (
              requested.map((b) => <BookingRow key={b.id} b={b} />)
            )}
          </section>

          {active.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-semibold">Active jobs</h2>
              {active.map((b) => (
                <BookingRow key={b.id} b={b} />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-semibold">History</h2>
              {past.map((b) => (
                <BookingRow key={b.id} b={b} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}
