import { useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, Stars, cn } from '@/components/ui'
import { ProviderMap } from './ProviderMap'
import { MapPin, ArrowLeft, BadgeCheck, Navigation, LocateFixed } from 'lucide-react'

export function CategoryProvidersPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const qc = useQueryClient()
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const locatingRef = useRef(false)

  const categories = useQuery({ queryKey: ['categories'], queryFn: () => api.getCategories() })
  const category = categories.data?.find((c) => c.id === categoryId)

  const providers = useQuery({
    queryKey: ['providers', categoryId, sortBy, onlyAvailable, userLocation?.lat, userLocation?.lng],
    queryFn: () =>
      api.getProviders({
        categoryId,
        sortBy,
        onlyAvailable,
        nearLat: userLocation?.lat,
        nearLng: userLocation?.lng,
      }),
  })

  function locateMe() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }
    if (locatingRef.current) return
    locatingRef.current = true
    setLocating(true)
    setLocationError(null)

    // Show error only after 10s of no position (GPS can be slow indoors)
    const timer = setTimeout(() => {
      if (locatingRef.current) {
        setLocating(false)
        locatingRef.current = false
        setLocationError("Couldn't get your location. Click Pune center instead.")
      }
    }, 10000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserLocation({ lat, lng })
        setSortBy('distance')
        setLocating(false)
        setLocationError(null)
        locatingRef.current = false
        qc.refetchQueries({ queryKey: ['providers', categoryId] })
      },
      (err) => {
        // PERMISSION_DENIED is immediate — show right away
        if (err.code === err.PERMISSION_DENIED) {
          clearTimeout(timer)
          setLocating(false)
          locatingRef.current = false
          setLocationError('Location access denied. Please allow location in your browser settings.')
        }
        // Other errors (POSITION_UNAVAILABLE, TIMEOUT) are ignored
        // The manual timer handles showing a generic message after 10s
      },
      { enableHighAccuracy: false, timeout: Infinity, maximumAge: 300000 },
    )
  }

  const clearLocation = () => {
    setUserLocation(null)
    setLocationError(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/services/${categoryId}`}
            className="flex size-8 items-center justify-center rounded-md border border-border bg-card hover:bg-muted"
            aria-label="Back to service details"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{category?.name ?? 'Providers'}</h1>
            <p className="text-sm text-muted-foreground">
              {providers.data?.length ?? 0} providers
              {userLocation ? ' near you' : ' in Pune'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userLocation ? (
            <Button variant="outline" size="sm" onClick={clearLocation}>
              <MapPin className="size-3.5" aria-hidden />
              Pune center
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              loading={locating}
              onClick={locateMe}
              className="gap-1.5"
            >
              <Navigation className="size-3.5" aria-hidden />
              Use my location
            </Button>
          )}
          <div className="flex rounded-md border border-border bg-card p-0.5" role="group" aria-label="Sort providers">
            {(['distance', 'rating'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                aria-pressed={sortBy === s}
                className={cn(
                  'rounded px-3 py-1 text-sm font-medium capitalize transition-colors',
                  sortBy === s ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            variant={onlyAvailable ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setOnlyAvailable((v) => !v)}
            aria-pressed={onlyAvailable}
          >
            Available now
          </Button>
        </div>
      </div>

      {locationError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <span>{locationError}</span>
          <button onClick={() => setLocationError(null)} className="ml-auto font-medium underline underline-offset-2">
            Dismiss
          </button>
        </div>
      )}

      {userLocation && (
        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm text-foreground">
          <LocateFixed className="size-4 text-primary" aria-hidden />
          Showing providers sorted by distance from your location
        </div>
      )}

      {providers.isPending && <LoadingState label="Finding providers…" />}
      {providers.isError && (
        <ErrorState message={(providers.error as Error).message} onRetry={() => providers.refetch()} />
      )}

      {providers.data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* list */}
          <div className="flex flex-col gap-3">
            {providers.data.length === 0 && (
              <EmptyState
                title="No providers found"
                description="Try turning off the availability filter or check back later."
              />
            )}
            {providers.data.map((p) => {
              const dist = userLocation
                ? haversineKm(userLocation.lat, userLocation.lng, p.lat, p.lng)
                : null
              return (
                <Link key={p.id} to={`/providers/${p.id}`} className="group">
                  <Card className="flex flex-col gap-2 p-4 transition-colors group-hover:border-primary">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="flex items-center gap-1.5 font-semibold">
                          {p.name}
                          {p.verificationStatus === 'VERIFIED' && (
                            <BadgeCheck className="size-4 text-success" aria-label="Verified" />
                          )}
                        </h2>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="size-3.5" aria-hidden />
                          {p.areaLabel} · {p.yearsExperience} yrs experience
                          {dist !== null && (
                            <span className="text-xs text-muted-foreground">
                              · {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`} away
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge tone={p.available ? 'success' : 'neutral'}>
                        {p.available ? 'Available' : 'Busy'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Stars rating={p.rating} size={14} />
                        <span className="text-muted-foreground">
                          {p.rating || 'New'} ({p.reviewCount})
                        </span>
                      </span>
                      <span className="text-sm font-semibold">₹{p.hourlyRate}/hr</span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* map */}
          <div className="h-80 overflow-hidden rounded-lg border border-border lg:sticky lg:top-20 lg:h-[calc(100vh-10rem)]">
            <ProviderMap providers={providers.data} userLocation={userLocation} />
          </div>
        </div>
      )}
    </div>
  )
}

/** Haversine distance in km */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
