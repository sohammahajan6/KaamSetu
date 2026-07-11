import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import {
  Card,
  Button,
  Badge,
  LoadingState,
  ErrorState,
  EmptyState,
  Stars,
} from '@/components/ui'
import { ShieldCheck, ShieldX, MapPin } from 'lucide-react'

export function AdminProvidersPage() {
  const qc = useQueryClient()

  const pendingQuery = useQuery({
    queryKey: ['admin', 'pendingProviders'],
    queryFn: () => api.getPendingProviders(),
  })
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const verifyMutation = useMutation({
    mutationFn: ({ providerId, approve }: { providerId: string; approve: boolean }) =>
      api.verifyProvider(providerId, approve),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pendingProviders'] })
      qc.invalidateQueries({ queryKey: ['providers'] })
    },
  })

  const categoryName = (id: string) =>
    categoriesQuery.data?.find((c) => c.id === id)?.name ?? '—'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Provider verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review new provider applications before they appear in customer search.
        </p>
      </div>

      {pendingQuery.isPending && <LoadingState label="Loading applications…" />}
      {pendingQuery.isError && (
        <ErrorState
          message={(pendingQuery.error as Error).message}
          onRetry={() => pendingQuery.refetch()}
        />
      )}

      {pendingQuery.data && pendingQuery.data.length === 0 && (
        <EmptyState
          title="Queue is clear"
          description="No providers are waiting for verification right now."
        />
      )}

      {pendingQuery.data && pendingQuery.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {pendingQuery.data.map((p) => (
            <li key={p.id}>
              <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{p.name}</span>
                    <Badge tone="amber">Pending</Badge>
                    <Badge tone="neutral">{categoryName(p.categoryId)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground text-pretty">{p.bio}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden />
                      {p.areaLabel}
                    </span>
                    <span>{p.yearsExperience} yrs experience</span>
                    <span>₹{p.hourlyRate}/hr</span>
                    <span className="inline-flex items-center gap-1">
                      <Stars rating={p.rating} size={12} /> ({p.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    loading={verifyMutation.isPending && verifyMutation.variables?.providerId === p.id && verifyMutation.variables.approve}
                    onClick={() => verifyMutation.mutate({ providerId: p.id, approve: true })}
                  >
                    <ShieldCheck className="size-4" aria-hidden />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    loading={verifyMutation.isPending && verifyMutation.variables?.providerId === p.id && !verifyMutation.variables.approve}
                    onClick={() => verifyMutation.mutate({ providerId: p.id, approve: false })}
                  >
                    <ShieldX className="size-4" aria-hidden />
                    Reject
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
