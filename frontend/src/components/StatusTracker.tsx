import { Check, Loader2, XCircle } from 'lucide-react'
import type { BookingStatus } from '@/types'
import { cn } from '@/components/ui'

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'COMPLETED', label: 'Completed' },
]

function stepIndex(status: BookingStatus): number {
  if (status === 'RATED') return 3
  const i = STEPS.findIndex((s) => s.key === status)
  return i
}

export function StatusTracker({ status }: { status: BookingStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-destructive">
        <XCircle className="size-5" aria-hidden />
        <span className="text-sm font-medium">This booking was cancelled.</span>
      </div>
    )
  }

  const current = stepIndex(status)

  return (
    <ol className="flex items-start" aria-label="Booking progress">
      {STEPS.map((step, i) => {
        const isDone = i < current || ((status === 'COMPLETED' || status === 'RATED') && i <= current)
        const isCurrent = i === current && !isDone
        return (
          <li key={step.key} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              {/* left connector */}
              <span
                className={cn(
                  'h-0.5 flex-1 rounded transition-colors duration-700',
                  i === 0 ? 'invisible' : i <= current ? 'bg-success' : 'bg-border',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500',
                  isDone
                    ? 'border-success bg-success text-success-foreground'
                    : isCurrent
                      ? 'border-primary bg-primary/15 text-[#9c6a17] animate-pulse'
                      : 'border-border bg-card text-muted-foreground',
                )}
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden />
                ) : isCurrent ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <span className="text-xs font-semibold">{i + 1}</span>
                )}
              </span>
              {/* right connector */}
              <span
                className={cn(
                  'h-0.5 flex-1 rounded transition-colors duration-700',
                  i === STEPS.length - 1 ? 'invisible' : i < current ? 'bg-success' : 'bg-border',
                )}
                aria-hidden
              />
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                isDone ? 'text-success' : isCurrent ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
