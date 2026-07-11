import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { Button, Card, Field, Input } from '@/components/ui'
import { Hammer, CheckCircle2, AlertCircle } from 'lucide-react'

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const PASSWORD_HINT = 'Must be at least 8 characters with uppercase, lowercase, and a number.'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)

  const mutation = useMutation({
    mutationFn: () => api.resetPassword(token!, password),
    onSuccess: () => setDone(true),
  })

  const passwordError =
    password && !PASSWORD_RULES.test(password) ? PASSWORD_HINT : undefined
  const confirmError =
    confirm && confirm !== password ? 'Passwords do not match.' : undefined

  // No token in URL — show error early
  if (!token) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-lg bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" aria-hidden />
          </span>
          <h1 className="mt-4 text-xl font-semibold">Invalid reset link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is missing or malformed. Request a new one.
          </p>
          <p className="mt-6">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-foreground underline underline-offset-2"
            >
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (done) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-lg bg-success/10">
            <CheckCircle2 className="size-6 text-success" aria-hidden />
          </span>
          <h1 className="mt-4 text-xl font-semibold">Password reset successful</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been updated. You can now log in with your new password.
          </p>
          <p className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Log in
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
          <h1 className="text-xl font-semibold">Set new password</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Enter your new password below.
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
            <Field label="New password" htmlFor="password" error={passwordError}>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            <Field label="Confirm password" htmlFor="confirm-password" error={confirmError}>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              disabled={!PASSWORD_RULES.test(password) || password !== confirm}
            >
              Reset password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
