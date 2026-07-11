import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore } from '@/store/auth'
import { Card, Button, StatusBadge, LoadingState, ErrorState } from '@/components/ui'
import { StatusTracker } from '@/components/StatusTracker'
import { ArrowLeft, CalendarDays, MapPin, StickyNote, Phone } from 'lucide-react'
import type { BookingStatus } from '@/types'
import { ChatWidget } from '../booking/ChatWidget'

export function ProviderBookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)!
  const qc = useQueryClient()

  const { data: booking, isPending, isError, error, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.getBookingById(id!),
    refetchInterval: 4000,
  })

  const statusMutation = useMutation({
    mutationFn: (status: BookingStatus) => api.updateBookingStatus(id!, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['bookings', user.id, 'provider'] })
    },
  })

  if (isPending) return <LoadingState label="Loading booking…" />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
  if (!booking) return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/provider/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{booking.categoryName}</h1>
          <StatusBadge status={booking.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Booking #{booking.id} for {booking.customerName}
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Job progress
        </h2>
        <StatusTracker status={booking.status} />
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Job details
          </h2>
          <p className="flex items-center gap-2 text-sm">
            <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
            {new Date(booking.scheduledAt).toLocaleString(undefined, {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-muted-foreground" aria-hidden />
            {booking.address}
          </p>
          {booking.notes && (
            <p className="flex items-start gap-2 text-sm">
              <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              {booking.notes}
            </p>
          )}
          <p className="mt-auto border-t border-border pt-3 text-sm">
            Payout estimate: <span className="font-semibold">₹{booking.price}</span>
          </p>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Update status
          </h2>

          {booking.status === 'REQUESTED' && (
            <>
              <p className="text-sm text-muted-foreground">
                {booking.customerName} requested this job. Accept it to get started, or decline.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="success"
                  className="flex-1"
                  loading={statusMutation.isPending}
                  onClick={() => statusMutation.mutate('ACCEPTED')}
                >
                  Accept job
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  loading={statusMutation.isPending}
                  onClick={() => statusMutation.mutate('CANCELLED')}
                >
                  Decline
                </Button>
              </div>
            </>
          )}

          {booking.status === 'ACCEPTED' && (
            <>
              <p className="text-sm text-muted-foreground">
                When you arrive and begin the work, mark the job as started so the customer can
                track it live.
              </p>
              <Button
                loading={statusMutation.isPending}
                onClick={() => statusMutation.mutate('IN_PROGRESS')}
              >
                Start job
              </Button>
            </>
          )}

          {booking.status === 'IN_PROGRESS' && (
            <>
              <p className="text-sm text-muted-foreground">
                {booking.paymentReceived
                  ? 'The customer has paid. Once the work is finished, mark the job complete.'
                  : 'Waiting for the customer to complete payment before you can mark this job as done.'}
              </p>
              <Button
                variant="success"
                loading={statusMutation.isPending}
                onClick={() => statusMutation.mutate('COMPLETED')}
                disabled={!booking.paymentReceived}
              >
                Mark complete
              </Button>
            </>
          )}

          {(booking.status === 'COMPLETED' || booking.status === 'RATED') && (
            <p className="text-sm text-muted-foreground">
              Job finished{booking.status === 'RATED' ? ' and rated by the customer.' : '. Awaiting customer rating.'}
            </p>
          )}

          {booking.status === 'CANCELLED' && (
            <p className="text-sm text-muted-foreground">This booking was cancelled.</p>
          )}

          {statusMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {(statusMutation.error as Error).message}
            </p>
          )}

          <p className="mt-auto flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
            <Phone className="size-4" aria-hidden />
            Contact the customer through the app after accepting.
          </p>
        </Card>
      </div>

      <ChatWidget 
        bookingId={booking.id} 
        disabled={['COMPLETED', 'CANCELLED', 'RATED'].includes(booking.status)} 
      />
    </div>
  )
}
