import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore } from '@/store/auth'
import {
  Card,
  Button,
  Field,
  Input,
  Textarea,
  Select,
  LoadingState,
  ErrorState,
  Stars,
} from '@/components/ui'

export function ProviderEditProfilePage() {
  const user = useAuthStore((s) => s.user)!
  const setProviderProfile = useAuthStore((s) => s.setProviderProfile)
  const qc = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['providerProfile', user.id],
    queryFn: () => api.getProviderByUserId(user.id),
  })
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })
  const reviewsQuery = useQuery({
    queryKey: ['reviews', profileQuery.data?.id],
    queryFn: () => api.getReviewsForProvider(profileQuery.data!.id),
    enabled: !!profileQuery.data,
  })

  const [bio, setBio] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profileQuery.data) {
      setBio(profileQuery.data.bio)
      setCategoryId(profileQuery.data.categoryId)
      setHourlyRate(String(profileQuery.data.hourlyRate))
    }
  }, [profileQuery.data])

  const saveMutation = useMutation({
    mutationFn: () =>
      api.updateProviderProfile(profileQuery.data!.id, {
        bio,
        categoryId,
        hourlyRate: Number(hourlyRate),
      }),
    onSuccess: (profile) => {
      setProviderProfile(profile)
      qc.setQueryData(['providerProfile', user.id], profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  if (profileQuery.isPending) return <LoadingState label="Loading profile…" />
  if (profileQuery.isError)
    return (
      <ErrorState
        message={(profileQuery.error as Error).message}
        onRetry={() => profileQuery.refetch()}
      />
    )

  const profile = profileQuery.data

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is what customers see when they find you in search.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
          >
            <Field label="Service category" htmlFor="pp-category">
              <Select
                id="pp-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categoriesQuery.data
                  ?.filter((c) => c.active)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Hourly rate (₹)" htmlFor="pp-rate">
              <Input
                id="pp-rate"
                type="number"
                min={50}
                max={5000}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
              />
            </Field>
            <Field label="Bio" htmlFor="pp-bio">
              <Textarea
                id="pp-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about your experience and specialities"
                required
              />
            </Field>
            {saveMutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                {(saveMutation.error as Error).message}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saveMutation.isPending}>
                Save changes
              </Button>
              {saved && <span className="text-sm text-success">Saved</span>}
            </div>
          </form>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Reviews
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Stars rating={profile.rating} />
              <span className="font-medium">{profile.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({profile.reviewCount} reviews)</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {reviewsQuery.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
            {reviewsQuery.data?.map((r) => (
              <div key={r.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.customerName}</span>
                  <Stars rating={r.rating} size={13} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{r.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
