import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore } from '@/store/auth'
import {
  Card,
  Button,
  Textarea,
  Field,
  StatusBadge,
  LoadingState,
  ErrorState,
} from '@/components/ui'
import { StatusTracker } from '@/components/StatusTracker'
import { ChatWidget } from './ChatWidget'
import type { Booking } from '@/types'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  StickyNote,
  Star,
  CreditCard,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { cn } from '@/components/ui'

/** Load Razorpay checkout script once. */
let razorpayLoaded = false
function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (razorpayLoaded || (window as any).Razorpay) {
      razorpayLoaded = true
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => { razorpayLoaded = true; resolve() }
    s.onerror = () => reject(new Error('Failed to load payment gateway'))
    document.body.appendChild(s)
  })
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)!
  const qc = useQueryClient()
  const sseRef = useRef<EventSource | null>(null)
  const [localStatus, setLocalStatus] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const { data: booking, isPending, isError, error, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.getBookingById(id!),
    refetchInterval: localStatus ? false : 4000,
  })

  // ---- SSE live stream -------------------------------------------------------
  useEffect(() => {
    if (!id || !user) return
    const token = localStorage.getItem('hyperlocal-jwt')
    if (!token) return

    const es = new EventSource(`/api/bookings/${id}/stream?token=${token}`)
    sseRef.current = es

    es.addEventListener('booking', (e: MessageEvent) => {
      try {
        const updated: Booking = JSON.parse(e.data)
        qc.setQueryData(['booking', id], updated)
        setLocalStatus(updated.status)
      } catch { /* ignore parse errors */ }
    })

    es.onerror = () => {
      // SSE connection lost — fall back to polling
      es.close()
      sseRef.current = null
    }

    return () => {
      es.close()
      sseRef.current = null
    }
  }, [id, user?.id])

  // ---- Actions ---------------------------------------------------------------
  const cancelMutation = useMutation({
    mutationFn: () => api.updateBookingStatus(id!, 'CANCELLED'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['bookings', user.id] })
    },
  })

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const reviewMutation = useMutation({
    mutationFn: () => api.createReview(user.id, { bookingId: id!, rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] })
      qc.invalidateQueries({ queryKey: ['bookings', user.id] })
    },
  })

  const handlePayment = async () => {
    if (!booking) return
    setPaying(true)
    try {
      await loadRazorpay()
      const order = await api.createPaymentOrder(booking.id)
      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: 'INR',
        name: 'KaamSetu',
        description: `${booking.categoryName} — ${booking.providerName}`,
        order_id: order.razorpayOrderId,
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            await api.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            setPaid(true)
            qc.invalidateQueries({ queryKey: ['booking', id] })
          } catch (e: any) {
            alert(e.message || 'Payment verification failed')
          }
        },
        modal: { ondismiss: () => setPaying(false) },
        theme: { color: '#e8a33d' },
      })
      rzp.open()
    } catch (e: any) {
      alert(e.message || 'Could not start payment')
    } finally {
      setPaying(false)
    }
  }

  const displayStatus = localStatus ?? booking?.status ?? 'REQUESTED'

  if (isPending) return <LoadingState label="Loading booking…" />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
  if (!booking) return null

  const isCustomer = booking.customerId === user.id

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to={isCustomer ? '/bookings' : '/provider/dashboard'}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to {isCustomer ? 'bookings' : 'dashboard'}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{booking.categoryName}</h1>
          <StatusBadge status={displayStatus as any} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {isCustomer
            ? `Booking with ${booking.providerName}`
            : `Booking for ${booking.customerName}`}
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Live status
        </h2>
        <StatusTracker status={displayStatus as any} />
        {sseRef.current && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Live updates connected
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Details
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
            Price: <span className="font-semibold">₹{booking.price}</span>
          </p>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Actions
          </h2>

          {/* CUSTOMER: Cancel while REQUESTED */}
          {isCustomer && displayStatus === 'REQUESTED' && (
            <>
              <p className="text-sm text-muted-foreground">
                Waiting for {booking.providerName} to accept. You can cancel while the request is pending.
              </p>
              <Button
                variant="destructive"
                loading={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                Cancel booking
              </Button>
            </>
          )}

          {/* CUSTOMER: Pay when IN_PROGRESS (if unpaid) */}
          {isCustomer && displayStatus === 'IN_PROGRESS' && !booking.paymentReceived && (
            <>
              <p className="text-sm text-muted-foreground">
                The provider has started the job. Please complete your payment securely.
              </p>
              <Button
                className="w-full"
                size="lg"
                loading={paying}
                onClick={handlePayment}
                disabled={paid}
              >
                {paid ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    Paid
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" />
                    Pay ₹{booking.price}
                  </>
                )}
              </Button>
            </>
          )}

          {/* CUSTOMER: In progress info (only when already paid) */}
          {isCustomer && displayStatus === 'IN_PROGRESS' && booking.paymentReceived && (
            <p className="text-sm text-muted-foreground">
              {booking.providerName} is working on the job right now. Payment received ✓
            </p>
          )}

          {/* CUSTOMER: REVIEW when COMPLETED */}
          {isCustomer && displayStatus === 'COMPLETED' && (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                reviewMutation.mutate()
              }}
            >
              <p className="text-sm text-muted-foreground">
                Rate your experience with {booking.providerName}.
              </p>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={rating === i}
                    aria-label={`${i} star${i > 1 ? 's' : ''}`}
                    onClick={() => setRating(i)}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        'size-6 transition-colors',
                        i <= rating ? 'fill-primary text-primary' : 'text-border',
                      )}
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
              <Field label="Comment" htmlFor="review-comment">
                <Textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How did it go?"
                  required
                />
              </Field>
              {reviewMutation.isError && (
                <p role="alert" className="text-sm text-destructive">
                  {(reviewMutation.error as Error).message}
                </p>
              )}
              <Button type="submit" loading={reviewMutation.isPending}>
                Submit review
              </Button>
            </form>
          )}

          {displayStatus === 'RATED' && (
            <p className="text-sm text-muted-foreground">
              {isCustomer
                ? "You've rated this job. Thanks for the feedback!"
                : 'Job finished and rated by the customer.'}
            </p>
          )}

          {displayStatus === 'CANCELLED' && (
            <p className="text-sm text-muted-foreground">This booking was cancelled.</p>
          )}

          {/* Provider sees status info too */}
          {!isCustomer && !['CANCELLED', 'RATED'].includes(displayStatus) && (
            <p className="text-sm text-muted-foreground">
              {displayStatus === 'REQUESTED' && `${booking.customerName} requested this job.`}
              {displayStatus === 'ACCEPTED' && 'Waiting for the customer to complete payment.'}
              {displayStatus === 'IN_PROGRESS' && 'Job is in progress.'}
              {displayStatus === 'COMPLETED' && 'Marked complete. Awaiting customer rating.'}
            </p>
          )}
        </Card>
      </div>

      <ChatWidget 
        bookingId={booking.id} 
        disabled={['COMPLETED', 'CANCELLED', 'RATED'].includes(displayStatus)} 
      />
    </div>
  )
}
