import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore } from '@/store/auth'
import { Button, Card, ErrorState, Field, Input, LoadingState, Textarea } from '@/components/ui'
import { AddressInput } from '@/components/AddressInput'
import { MapPin, MapPinned, Home, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  date: z.string().min(1, 'Pick a date'),
  time: z.string().min(1, 'Pick a time'),
  area: z.string().min(3, 'Select your area/locality'),
  flat: z.string().min(1, 'Enter flat / house number'),
  street: z.string().min(3, 'Enter street / road name'),
  landmark: z.string().optional(),
  notes: z.string().max(500),
})
type FormValues = z.infer<typeof schema>

export function BookingFormPage() {
  const { providerId } = useParams<{ providerId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [selectedLat, setSelectedLat] = useState<number | undefined>()
  const [selectedLng, setSelectedLng] = useState<number | undefined>()
  const [areaTouched, setAreaTouched] = useState(false)
  const [editAddress, setEditAddress] = useState(false)

  // Fetch saved address from the API (per-user, database-backed)
  const savedAddressQuery = useQuery({
    queryKey: ['saved-address'],
    queryFn: () => api.getSavedAddress(),
  })

  const saveAddressMutation = useMutation({
    mutationFn: (address: import('@/types').SavedAddress) => api.saveAddress(address),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-address'] }),
  })

  const provider = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => api.getProviderById(providerId!),
    enabled: !!providerId,
  })

  const saved = savedAddressQuery.data

  const defaults = saved
    ? { date: '', time: '', area: saved.area, flat: saved.flat, street: saved.street, landmark: saved.landmark, notes: '' }
    : { date: '', time: '', area: '', flat: '', street: '', landmark: '', notes: '' }

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: defaults,
    resetOptions: {
      keepDirtyValues: true,
    },
  })

  const createBooking = useMutation({
    mutationFn: (values: FormValues) => {
      const parts = [values.flat, values.street]
      if (values.landmark) parts.push(`near ${values.landmark}`)
      parts.push(values.area)
      const fullAddress = parts.join(', ')
      return api.createBooking(user!.id, {
        providerId: providerId!,
        scheduledAt: new Date(`${values.date}T${values.time}`).toISOString(),
        address: fullAddress,
        notes: values.notes ?? '',
      })
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      navigate(`/bookings/${booking.id}`)
    },
  })

  const onSubmit = (values: FormValues) => {
    const isUsingValidSavedArea = saved && values.area === saved.area
    if (!isUsingValidSavedArea && !areaTouched) {
      setError('area', { message: 'Select your area from the suggestions' })
      return
    }
    // Save address to the database for future bookings
    saveAddressMutation.mutate({
      area: values.area,
      flat: values.flat,
      building: '',
      street: values.street,
      landmark: values.landmark ?? '',
      lat: selectedLat,
      lng: selectedLng,
    })
    createBooking.mutate(values)
  }

  if (provider.isPending) return <LoadingState label="Loading…" />
  if (provider.isError)
    return <ErrorState message={(provider.error as Error).message} onRetry={() => provider.refetch()} />

  const p = provider.data
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-semibold">Book {p.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {p.areaLabel}, Pune · ₹{p.hourlyRate}/hr · {p.rating > 0 ? `${p.rating} ★` : 'New'}
      </p>

      <Card className="mt-4 p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" htmlFor="date" error={errors.date?.message}>
              <Input id="date" type="date" min={today} {...register('date')} />
            </Field>
            <Field label="Time" htmlFor="time" error={errors.time?.message}>
              <Input id="time" type="time" {...register('time')} />
            </Field>
          </div>

          {/* Address section */}
          {saved && !editAddress ? (
            /* Saved address — show summary card */
            <div className="rounded-lg border border-border bg-success/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-success/10">
                    <Home className="size-4 text-success" aria-hidden />
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      Saved address
                      <CheckCircle2 className="size-3.5 text-success" aria-hidden />
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      {saved.flat}, {saved.building}, {saved.street}
                      {saved.landmark ? `, near ${saved.landmark}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{saved.area}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditAddress(true)}
                  className="shrink-0 text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            /* New address — show area picker + details form */
            <>
              <Field label="Your area / locality" htmlFor="area" error={errors.area?.message}>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-2.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="flex-1">
                    <AddressInput
                      id="area"
                      value={saved?.area ?? ''}
                      placeholder="e.g. Kothrud, Baner, Hadapsar"
                      shortMode={true}
                      onChange={(val, lat, lng) => {
                        setValue('area', val, { shouldValidate: true })
                        clearErrors('area')
                        if (lat && lng) {
                          setSelectedLat(lat)
                          setSelectedLng(lng)
                          setAreaTouched(true)
                        } else {
                          setAreaTouched(false)
                        }
                      }}
                      onBlur={() => {
                        if (!areaTouched) {
                          setError('area', { message: 'Select your area from the suggestions' })
                        }
                      }}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Start typing your locality and pick from the suggestions
                    </p>
                  </div>
                </div>
              </Field>

              {areaTouched && (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <MapPinned className="size-3.5" aria-hidden />
                    Address details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Flat / House no." htmlFor="flat" error={errors.flat?.message}>
                      <Input id="flat" placeholder="e.g. B-402" {...register('flat')} />
                    </Field>
                    <Field label="Street / Road" htmlFor="street" error={errors.street?.message}>
                      <Input id="street" placeholder="e.g. MG Road, Karve Nagar" {...register('street')} />
                    </Field>
                  </div>
                  <Field label="Landmark (optional)" htmlFor="landmark" error={errors.landmark?.message}>
                    <Input id="landmark" placeholder="e.g. Near D-mart, Opposite park" {...register('landmark')} />
                  </Field>
                </div>
              )}
            </>
          )}

          <Field label="Notes for the provider (optional)" htmlFor="notes" error={errors.notes?.message}>
            <Textarea id="notes" placeholder="Describe the problem or job…" {...register('notes')} />
          </Field>

          {createBooking.isError && (
            <p role="alert" className="text-sm text-destructive">
              {(createBooking.error as Error).message}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Estimated cost</p>
              <p className="text-lg font-semibold">₹{p.hourlyRate}</p>
            </div>
            <Button type="submit" size="lg" loading={createBooking.isPending}>
              Request booking
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
