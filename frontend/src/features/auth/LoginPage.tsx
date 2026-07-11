import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthStore, homeForRole } from '@/store/auth'
import { Button, Card, Field, Input } from '@/components/ui'
import { Hammer } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})
type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const login = useMutation({
    mutationFn: (values: FormValues) => api.login(values),
    onSuccess: (result) => {
      setSession(result.user, result.providerProfile)
      navigate(homeForRole(result.user.role), { replace: true })
    },
  })

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary">
            <Hammer className="size-6 text-primary-foreground" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Log in to your account to continue.
          </p>
        </div>

        <Card className="p-6">
          <form
            onSubmit={handleSubmit((v) => login.mutate(v))}
            className="flex flex-col gap-4"
            noValidate
          >
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            </Field>
            <div className="-mt-2 flex justify-end">
              <Link to="/forgot-password" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
                Forgot password?
              </Link>
            </div>
            {login.isError && (
              <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {(login.error as Error).message}
              </div>
            )}
            <Button type="submit" loading={login.isPending}>
              Log in
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
