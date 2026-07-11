import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore } from '@/store/auth'
import { Card, StatusBadge, LoadingState, ErrorState, EmptyState } from '@/components/ui'
import { CalendarDays, MapPin, ChevronRight } from 'lucide-react'

export function MyBookingsPage() {
  const user = useAuthStore((s) => s.user)!

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['bookings', user.id],
    queryFn: () => api.getMyBookings(user.id, 'CUSTOMER'),
    refetchInterval: 5000,
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every request live — statuses update automatically.
        </p>
      </div>

      {isPending && <LoadingState label="Loading bookings…" />}
      {isError && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {data && data.length === 0 && (
        <EmptyState
          title="No bookings yet"
          description="Browse service categories and book your first verified professional."
          action={
            <Link
              to="/browse"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse services
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.map((b) => (
            <li key={b.id}>
              <Link to={`/bookings/${b.id}`} className="group block">
                <Card className="flex items-center gap-4 p-4 transition-colors group-hover:border-primary">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{b.categoryName}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">with {b.providerName}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {new Date(b.scheduledAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
