import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { Card, LoadingState, ErrorState } from '@/components/ui'
import { CategoryIcon } from '@/components/CategoryIcon'
import { ArrowRight } from 'lucide-react'

export function BrowsePage() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">What do you need done today?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verified professionals near you, with live booking status from request to done.
        </p>
      </div>

      {isPending && <LoadingState label="Loading categories…" />}
      {isError && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data
            .filter((c) => c.active)
            .map((cat) => (
              <Link key={cat.id} to={`/services/${cat.id}`} className="group">
                <Card className="flex h-full flex-col gap-3 p-5 transition-colors group-hover:border-primary">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15">
                      <CategoryIcon icon={cat.icon} className="size-5 text-[#9c6a17]" />
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-semibold">{cat.name}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{cat.description}</p>
                  </div>
                  <p className="mt-auto text-sm font-medium">
                    From ₹{cat.basePrice}
                  </p>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}
