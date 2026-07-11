import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import {
  Card,
  Button,
  Badge,
  Field,
  Input,
  Textarea,
  Select,
  LoadingState,
  ErrorState,
} from '@/components/ui'
import { CategoryIcon, availableIcons } from '@/components/CategoryIcon'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import type { CategoryPayload, ServiceCategory } from '@/types'

const EMPTY: CategoryPayload = {
  name: '',
  description: '',
  icon: 'wrench',
  basePrice: 199,
  active: true,
  longDescription: '',
  includes: [],
  estimatedDuration: '',
  whyUs: [],
  tips: '',
}

function CategoryForm({
  initial,
  onSubmit,
  onCancel,
  pending,
  error,
}: {
  initial: CategoryPayload
  onSubmit: (payload: CategoryPayload) => void
  onCancel: () => void
  pending: boolean
  error?: string
}) {
  const [form, setForm] = useState<CategoryPayload>(initial)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="cat-name">
          <Input
            id="cat-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>
        <Field label="Base price (₹)" htmlFor="cat-price">
          <Input
            id="cat-price"
            type="number"
            min={0}
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
            required
          />
        </Field>
      </div>
      <Field label="Description" htmlFor="cat-desc">
        <Textarea
          id="cat-desc"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </Field>
      {/* Rich description fields — what customers see on the service detail page */}
      <div className="border-t border-border pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Customer-facing details
        </p>
        <div className="flex flex-col gap-4">
          <Field label="Long description" htmlFor="cat-long-desc">
            <Textarea
              id="cat-long-desc"
              value={form.longDescription}
              onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
              placeholder="Detailed description shown on the service page…"
              rows={4}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Estimated duration" htmlFor="cat-duration">
              <Input
                id="cat-duration"
                value={form.estimatedDuration}
                onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                placeholder="e.g. 1–3 hours"
              />
            </Field>
            <Field label="Tips for customers" htmlFor="cat-tips">
              <Input
                id="cat-tips"
                value={form.tips}
                onChange={(e) => setForm({ ...form, tips: e.target.value })}
                placeholder="Pro tip shown at the bottom…"
              />
            </Field>
          </div>
          <Field label="What's included (one per line)" htmlFor="cat-includes">
            <Textarea
              id="cat-includes"
              value={form.includes.join('\n')}
              onChange={(e) => setForm({ ...form, includes: e.target.value.split('\n').filter(Boolean) })}
              placeholder="Switchboard repair and replacement&#10;MCB / RCCB installation&#10;Fan and light fixture installation"
              rows={4}
            />
          </Field>
          <Field label="Why choose us (one per line)" htmlFor="cat-whyus">
            <Textarea
              id="cat-whyus"
              value={form.whyUs.join('\n')}
              onChange={(e) => setForm({ ...form, whyUs: e.target.value.split('\n').filter(Boolean) })}
              placeholder="Licensed and insured professionals&#10;Safety-certified equipment&#10;Warranty on all work"
              rows={3}
            />
          </Field>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Icon" htmlFor="cat-icon">
          <Select
            id="cat-icon"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          >
            {availableIcons.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="cat-active">
          <Select
            id="cat-active"
            value={form.active ? 'active' : 'inactive'}
            onChange={(e) => setForm({ ...form, active: e.target.value === 'active' })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          Save category
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [mode, setMode] = useState<'idle' | 'create' | 'edit'>('idle')
  const [editing, setEditing] = useState<ServiceCategory | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['categories'] })
    setMode('idle')
    setEditing(null)
  }

  const createMutation = useMutation({
    mutationFn: (payload: CategoryPayload) => api.createCategory(payload),
    onSuccess: invalidate,
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      api.updateCategory(id, payload),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Service categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the services customers can book on the platform.
          </p>
        </div>
        {mode === 'idle' && (
          <Button onClick={() => setMode('create')}>
            <Plus className="size-4" aria-hidden />
            New category
          </Button>
        )}
      </div>

      {mode !== 'idle' && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              {mode === 'create' ? 'New category' : `Edit: ${editing?.name}`}
            </h2>
            <button
              type="button"
              aria-label="Close form"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setMode('idle')
                setEditing(null)
              }}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <CategoryForm
            key={editing?.id ?? 'create'}
            initial={
              mode === 'edit' && editing
                ? {
                    name: editing.name,
                    description: editing.description,
                    icon: editing.icon,
                    basePrice: editing.basePrice,
                    active: editing.active,
                    longDescription: editing.longDescription ?? '',
                    includes: editing.includes ?? [],
                    estimatedDuration: editing.estimatedDuration ?? '',
                    whyUs: editing.whyUs ?? [],
                    tips: editing.tips ?? '',
                  }
                : EMPTY
            }
            pending={createMutation.isPending || updateMutation.isPending}
            error={
              ((createMutation.error || updateMutation.error) as Error | null)?.message
            }
            onCancel={() => {
              setMode('idle')
              setEditing(null)
            }}
            onSubmit={(payload) => {
              if (mode === 'create') createMutation.mutate(payload)
              else if (editing) updateMutation.mutate({ id: editing.id, payload })
            }}
          />
        </Card>
      )}

      {categoriesQuery.isPending && <LoadingState label="Loading categories…" />}
      {categoriesQuery.isError && (
        <ErrorState
          message={(categoriesQuery.error as Error).message}
          onRetry={() => categoriesQuery.refetch()}
        />
      )}

      {categoriesQuery.data && (
        <ul className="flex flex-col gap-3">
          {categoriesQuery.data.map((cat) => (
            <li key={cat.id}>
              <Card className="flex items-center gap-4 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <CategoryIcon icon={cat.icon} className="size-5 text-[#9c6a17]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{cat.name}</span>
                    <Badge tone={cat.active ? 'success' : 'neutral'}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
                <span className="hidden text-sm font-medium sm:block">From ₹{cat.basePrice}</span>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${cat.name}`}
                    onClick={() => {
                      setEditing(cat)
                      setMode('edit')
                    }}
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${cat.name}`}
                    loading={deleteMutation.isPending && deleteMutation.variables === cat.id}
                    onClick={() => deleteMutation.mutate(cat.id)}
                  >
                    <Trash2 className="size-4 text-destructive" aria-hidden />
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
