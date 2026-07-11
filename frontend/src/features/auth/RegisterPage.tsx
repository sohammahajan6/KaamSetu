import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore, homeForRole } from '@/store/auth'
import { Button, Card, Field, Input, Select, cn } from '@/components/ui'
import { AddressInput } from '@/components/AddressInput'
import { Hammer, User, Briefcase } from 'lucide-react'

const indianPhone = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number (e.g. 9876543210)')

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: indianPhone,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  role: z.enum(['CUSTOMER', 'PROVIDER']),
  categoryId: z.string().optional(),
  areaLabel: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})
type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [areaTouched, setAreaTouched] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CUSTOMER' },
  })
  const role = watch('role')

  const categories = useQuery({ queryKey: ['categories'], queryFn: () => api.getCategories() })

  const registerMutation = useMutation({
    mutationFn: (values: FormValues) => api.register(values),
    onSuccess: (result) => {
      setSession(result.user, result.providerProfile)
      navigate(homeForRole(result.user.role), { replace: true })
    },
  })

  const onSubmit = (values: FormValues) => {
    if (values.role === 'PROVIDER' && !areaTouched) {
      setError('areaLabel', { message: 'Select your service area from the suggestions' })
      return
    }
    registerMutation.mutate(values)
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary">
            <Hammer className="size-6 text-primary-foreground" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Book services or offer your skills. Admin accounts are provisioned separately.
          </p>
        </div>

        <Card className="p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* role selector */}
            <fieldset>
              <legend className="mb-2 text-sm font-medium">I want to</legend>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: 'CUSTOMER', label: 'Book services', icon: User },
                    { value: 'PROVIDER', label: 'Offer services', icon: Briefcase },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('role', opt.value)}
                    aria-pressed={role === opt.value}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-md border p-3 text-sm font-medium transition-colors',
                      role === opt.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted',
                    )}
                  >
                    <opt.icon className="size-5" aria-hidden />
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <Field label="Full name" htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder="Your name" {...register('name')} />
            </Field>
            <Field label="Email" htmlFor="reg-email" error={errors.email?.message}>
              <Input id="reg-email" type="email" placeholder="you@example.com" {...register('email')} />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <div className="flex items-center gap-0">
                <span className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="rounded-l-none"
                  maxLength={10}
                  {...register('phone')}
                />
              </div>
              {!errors.phone && (
                <p className="text-xs text-muted-foreground">
                  Enter a valid 10-digit mobile number
                </p>
              )}
            </Field>
            <Field label="Password" htmlFor="reg-password" error={errors.password?.message}>
              <Input id="reg-password" type="password" placeholder="At least 8 characters" {...register('password')} />
              {!errors.password && (
                <p className="text-xs text-muted-foreground">
                  Must be 8+ characters with uppercase, lowercase, and a number
                </p>
              )}
            </Field>

            {role === 'PROVIDER' && (
              <>
                <Field label="Service category" htmlFor="categoryId">
                  <Select id="categoryId" {...register('categoryId')}>
                    <option value="">Select a category</option>
                    {categories.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Your service area" htmlFor="areaLabel" error={errors.areaLabel?.message}>
                  <AddressInput
                    id="areaLabel"
                    value=""
                    placeholder="Start typing your area (e.g. Kothrud, Pune)"
                    onChange={(val, lat, lng) => {
                      setValue('areaLabel', val)
                      if (lat !== undefined) setValue('lat', lat)
                      if (lng !== undefined) setValue('lng', lng)
                      if (lat && lng && val.length > 2) {
                        setAreaTouched(true)
                        clearErrors('areaLabel')
                      } else {
                        setAreaTouched(false)
                      }
                    }}
                    onBlur={() => {
                      if (!areaTouched) {
                        setError('areaLabel', { message: 'Select your area from the suggestions' })
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is where you&apos;ll offer your services
                  </p>
                </Field>
              </>
            )}

            {registerMutation.isError && (
              <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {(registerMutation.error as Error).message}
              </div>
            )}

            <Button type="submit" loading={registerMutation.isPending}>
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
