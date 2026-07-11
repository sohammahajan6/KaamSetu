import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { Button, Card, Field, Input } from '@/components/ui'
import { Hammer, MailCheck } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const mutation = useMutation({
    mutationFn: () => api.forgotPassword(email),
    onSuccess: () => setSent(true),
  })

  if (sent) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-lg bg-success/10">
            <MailCheck className="size-6 text-success" aria-hidden />
          </span>
          <h1 className="mt-4 text-xl font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists with that email, we've sent a password reset link.
            It expires in 1 hour.
          </p>
          <p className="mt-6">
            <Link
              to="/login"
              className="text-sm font-medium text-foreground underline underline-offset-2"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary">
            <Hammer className="size-6 text-primary-foreground" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold">Forgot password</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            className="flex flex-col gap-4"
            noValidate
          >
            <Field
              label="Email"
              htmlFor="email"
              error={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : undefined}
            >
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            {mutation.isError && (
              <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {(mutation.error as Error).message}
              </div>
            )}

            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
            >
              Send reset link
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
