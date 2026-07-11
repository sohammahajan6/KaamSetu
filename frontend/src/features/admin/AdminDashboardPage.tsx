import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import {
  Card,
  Badge,
  Button,
  LoadingState,
  ErrorState,
  EmptyState,
  Stars,
  Select,
  Field,
} from '@/components/ui'
import {
  Users,
  UserCheck,
  Briefcase,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  Star,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Search,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Shield,
} from 'lucide-react'
import type { AdminStats, AdminUserRow, AdminBookingRow, ProviderProfile } from '@/types'

// ---- Stat Card ------------------------------------------------------------
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <Card className="flex items-start gap-4 p-4">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </Card>
  )
}

// ---- Bar Chart ------------------------------------------------------------
function BarChart({
  data,
  max,
  colorKey,
  formatValue,
}: {
  data: { label: string; value: number; color?: string }[]
  max: number
  colorKey?: string
  formatValue?: (v: number) => string
}) {
  if (data.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
  return (
    <div className="flex items-end gap-3" style={{ height: 160 }}>
      {data.map((d, i) => {
        const barColor = d.color ?? (['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500'][i % 6])
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-sm font-semibold tabular-nums">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
            <div
              className={`w-full rounded-t transition-all ${barColor}`}
              style={{ height: `${(d.value / max) * 120}px`, minHeight: d.value > 0 ? 4 : 0 }}
            />
            <span className="truncate text-xs text-muted-foreground text-center leading-tight" style={{ maxWidth: 90 }} title={d.label}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ---- Status badge shortcut -------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: 'neutral' | 'amber' | 'success' | 'destructive' | 'ink'; label: string }> = {
    REQUESTED: { tone: 'amber', label: 'Requested' },
    ACCEPTED: { tone: 'ink', label: 'Accepted' },
    IN_PROGRESS: { tone: 'amber', label: 'In progress' },
    COMPLETED: { tone: 'success', label: 'Completed' },
    RATED: { tone: 'success', label: 'Rated' },
    CANCELLED: { tone: 'destructive', label: 'Cancelled' },
  }
  const m = map[status] ?? { tone: 'neutral' as const, label: status }
  return <Badge tone={m.tone}>{m.label}</Badge>
}

// ---- Main Dashboard Component --------------------------------------------
export function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.getAdminStats(),
    refetchInterval: 15000,
  })
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.getAdminUsers(),
  })
  const bookingsQuery = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => api.getAdminBookings(),
    refetchInterval: 10000,
  })
  const providersQuery = useQuery({
    queryKey: ['admin', 'allProviders'],
    queryFn: () => api.getAllProviders(),
  })
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const qc = useQueryClient()

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.changeUserRole(userId, role),
    onMutate: async ({ userId, role }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey: ['admin', 'users'] })
      // Snapshot previous value for rollback
      const previousUsers = qc.getQueryData<AdminUserRow[]>(['admin', 'users'])
      // Optimistically update the cache — UI updates INSTANTLY, no network wait
      qc.setQueryData<AdminUserRow[]>(['admin', 'users'], (old) =>
        old?.map((u) => (u.id === userId ? { ...u, role } : u)) ?? [],
      )
      return { previousUsers }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        qc.setQueryData(['admin', 'users'], context.previousUsers)
      }
    },
    onSettled: () => {
      // After settle (success or error), refetch to ensure server truth
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] })
      qc.invalidateQueries({ queryKey: ['admin', 'allProviders'] })
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // ---- table filters ----
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL')
  const [providerSearch, setProviderSearch] = useState('')
  const [providerStatusFilter, setProviderStatusFilter] = useState<string>('ALL')
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('ALL')

  // These must be above early returns so useMemo hooks run every render
  const users = usersQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const providers = providersQuery.data ?? []

  const filteredUsers = useMemo(() => {
    let list = users
    if (userRoleFilter !== 'ALL') {
      list = list.filter((u) => u.role === userRoleFilter)
    }
    if (userSearch.trim()) {
      const q = userSearch.trim().toLowerCase()
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q))
    }
    return list
  }, [users, userSearch, userRoleFilter])

  const filteredProviders = useMemo(() => {
    let list = providers
    if (providerStatusFilter !== 'ALL') {
      list = list.filter((p) => p.verificationStatus === providerStatusFilter)
    }
    if (providerSearch.trim()) {
      const q = providerSearch.trim().toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.areaLabel.toLowerCase().includes(q))
    }
    return list
  }, [providers, providerSearch, providerStatusFilter])

  const filteredBookings = useMemo(() => {
    let list = bookings
    if (bookingStatusFilter !== 'ALL') {
      list = list.filter((b) => b.status === bookingStatusFilter)
    }
    if (bookingSearch.trim()) {
      const q = bookingSearch.trim().toLowerCase()
      list = list.filter((b) => b.customerName.toLowerCase().includes(q) || b.providerName.toLowerCase().includes(q) || b.categoryName.toLowerCase().includes(q))
    }
    return list
  }, [bookings, bookingSearch, bookingStatusFilter])

  if (statsQuery.isPending) return <LoadingState label="Loading admin dashboard…" />
  if (statsQuery.isError) return <ErrorState message={(statsQuery.error as Error).message} onRetry={() => statsQuery.refetch()} />

  const stats = statsQuery.data!

  // Status label map for display
  const statusLabelMap: Record<string, string> = {
    REQUESTED: 'Requested',
    ACCEPTED: 'Accepted',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    RATED: 'Rated',
    CANCELLED: 'Cancelled',
  }
  const statusColorMap: Record<string, string> = {
    REQUESTED: 'bg-amber-500',
    ACCEPTED: 'bg-blue-500',
    IN_PROGRESS: 'bg-violet-500',
    COMPLETED: 'bg-emerald-500',
    RATED: 'bg-teal-500',
    CANCELLED: 'bg-rose-400',
  }

  // Booking status breakdown for chart
  const statusChartData = stats.bookingStatusBreakdown.map((s) => ({
    label: statusLabelMap[s.status] ?? s.status,
    value: Number(s.count),
    color: statusColorMap[s.status],
  }))
  const chartMax = Math.max(...statusChartData.map((d) => d.value), 1)
  const totalBookingsForChart = statusChartData.reduce((sum, d) => sum + d.value, 0)

  // Category revenue breakdown
  const revenueChartData = stats.categoryRevenue.map((c) => ({
    label: c.name,
    value: Number(c.revenue),
  }))
  const revMax = Math.max(...revenueChartData.map((d) => d.value), 1)
  const totalRevenueForChart = revenueChartData.reduce((sum, d) => sum + d.value, 0)

  // Active bookings (live monitor)
  const activeBookings = bookings.filter((b) =>
    ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status),
  )

  const categoryName = (id: string) =>
    categoriesQuery.data?.find((c) => c.id === id)?.name ?? '—'

  const handleDownloadCsv = async () => {
    try {
      const blob = await api.exportAdminBookings();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookings_report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download CSV', e);
      alert('Failed to download CSV report');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform overview, user management, and live booking monitor.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadCsv}>
          <svg className="mr-2 size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download CSV Report
        </Button>
      </div>

      {/* === KPI CARDS === */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard icon={<Users className="size-5 text-foreground" />} label="Total users" value={stats.totalUsers} sub={`${stats.totalCustomers} customers`} color="bg-blue-100" />
        <StatCard icon={<UserCheck className="size-5 text-foreground" />} label="Providers" value={stats.totalProviders} sub={`${stats.verifiedProviders} verified`} color="bg-green-100" />
        <StatCard icon={<Briefcase className="size-5 text-foreground" />} label="Categories" value={stats.providerCategories} color="bg-purple-100" />
        <StatCard icon={<CalendarCheck className="size-5 text-foreground" />} label="Total bookings" value={stats.totalBookings} sub={`${stats.activeBookings} active`} color="bg-orange-100" />
        <StatCard icon={<IndianRupee className="size-5 text-foreground" />} label="Revenue" value={`₹${Number(stats.totalRevenue).toLocaleString()}`} color="bg-emerald-100" />
        <StatCard icon={<Star className="size-5 text-foreground" />} label="Reviews" value={stats.totalReviews} color="bg-pink-100" />
      </div>

      {/* === SECOND ROW: Pending verification + Charts === */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending providers */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <ShieldAlert className="size-4 text-amber-500" aria-hidden />
            Pending verification
            {stats.pendingProviders > 0 && (
              <Badge tone="amber">{stats.pendingProviders}</Badge>
            )}
          </h2>
          {providers.filter((p) => p.verificationStatus === 'PENDING').length === 0 ? (
            <EmptyState title="All clear" description="No pending verifications." />
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {providers
                .filter((p) => p.verificationStatus === 'PENDING')
                .slice(0, 5)
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryName(p.categoryId)} · {p.areaLabel}
                      </p>
                    </div>
                    <Badge tone="amber">Pending</Badge>
                  </div>
                ))}
              {providers.filter((p) => p.verificationStatus === 'PENDING').length > 5 && (
                <p className="text-center text-xs text-muted-foreground">
                  +{providers.filter((p) => p.verificationStatus === 'PENDING').length - 5} more
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Booking status chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Activity className="size-4" aria-hidden />
              Bookings by status
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">{totalBookingsForChart} total</span>
          </div>
          <div className="mt-3">
            <BarChart data={statusChartData} max={chartMax} />
          </div>
        </Card>

        {/* Revenue by category */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="size-4" aria-hidden />
              Revenue by category
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">₹{totalRevenueForChart.toLocaleString()}</span>
          </div>
          <div className="mt-3">
            <BarChart data={revenueChartData} max={revMax} formatValue={(v) => `₹${(v / 1000).toFixed(1)}k`} />
          </div>
        </Card>
      </div>

      {/* === LIVE BOOKING MONITOR === */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="size-5 text-success" aria-hidden />
            Live booking monitor
            {activeBookings.length > 0 && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
            )}
            <Badge tone="amber">{activeBookings.length} active</Badge>
          </h2>
        </div>

        {bookingsQuery.isPending && <LoadingState label="Loading bookings…" />}

        {activeBookings.length === 0 ? (
          <EmptyState title="No active bookings" description="All bookings are completed or cancelled." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeBookings.slice(0, 12).map((b) => (
              <Card key={b.id} className="p-4 transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{b.categoryName}</p>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden />
                    {b.customerName}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5" aria-hidden />
                    {b.providerName}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <IndianRupee className="size-3.5" aria-hidden />
                    ₹{b.price}
                  </p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(b.scheduledAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* === USERS TABLE === */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Users className="size-5" aria-hidden />
            User management
            <Badge tone="neutral">{users.length} users</Badge>
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="text"
                placeholder="Search name, email…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-8 w-48 rounded-md border border-input bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground"
            >
              <option value="ALL">All roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PROVIDER">Provider</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {usersQuery.isPending && <LoadingState label="Loading users…" />}

        {filteredUsers.length === 0 ? (
          <EmptyState title="No users match your filters" description="Try adjusting the search or filter." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <td className="px-4 py-3 font-medium underline underline-offset-2 decoration-dotted decoration-muted-foreground/30 hover:decoration-foreground">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          u.role === 'ADMIN' ? 'ink' : u.role === 'PROVIDER' ? 'success' : 'neutral'
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <select
                          className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground"
                          value={u.role}
                          disabled={changeRoleMutation.isPending}
                          onChange={(e) => {
                            if (e.target.value !== u.role) {
                              changeRoleMutation.mutate({ userId: u.id, role: e.target.value })
                            }
                          }}
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="PROVIDER">Provider</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        {confirmDelete === u.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              loading={deleteUserMutation.isPending}
                              onClick={() => {
                                deleteUserMutation.mutate(u.id)
                                setConfirmDelete(null)
                              }}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${u.name}`}
                            onClick={() => setConfirmDelete(u.id)}
                          >
                            <Trash2 className="size-4 text-destructive" aria-hidden />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* === USER DETAIL MODAL === */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-12 sm:pt-20">
          <Card className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">User details</h2>
              <button
                onClick={() => setSelectedUserId(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <XCircle className="size-5" />
              </button>
            </div>
            {(() => {
              const u = users.find((x) => x.id === selectedUserId)
              if (!u) return <p className="text-sm text-muted-foreground">User not found.</p>
              const userBookings = bookings.filter((b) => b.customerId === u.id || b.providerName === u.name)
              const userProvider = providers.find((p) => p.userId === u.id)
              return (
                <div className="flex flex-col gap-4">
                  <Card className="bg-muted/30 p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{u.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{u.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{u.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <Badge
                          tone={u.role === 'ADMIN' ? 'ink' : u.role === 'PROVIDER' ? 'success' : 'neutral'}
                        >
                          {u.role}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">User ID</p>
                        <p className="font-mono text-xs text-muted-foreground">{u.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Joined</p>
                        <p className="font-medium">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total bookings</p>
                        <p className="font-medium">{userBookings.length}</p>
                      </div>
                    </div>
                  </Card>

                  {userProvider && (
                    <Card className="p-4">
                      <h3 className="mb-2 text-sm font-semibold">Provider profile</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="font-medium">{categoryName(userProvider.categoryId)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Area</p>
                          <p className="font-medium">{userProvider.areaLabel}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rate</p>
                          <p className="font-medium">₹{userProvider.hourlyRate}/hr</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge
                            tone={
                              userProvider.verificationStatus === 'VERIFIED'
                                ? 'success'
                                : userProvider.verificationStatus === 'PENDING'
                                  ? 'amber'
                                  : 'destructive'
                            }
                          >
                            {userProvider.verificationStatus}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <Stars rating={userProvider.rating} size={12} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Jobs</p>
                          <p className="font-medium">{userProvider.completedJobs}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  <h3 className="text-sm font-semibold">
                    Bookings ({userBookings.length})
                  </h3>
                  {userBookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No bookings yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {userBookings.slice(0, 10).map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">{b.categoryName}</p>
                            <p className="text-xs text-muted-foreground">
                              {b.customerName} → {b.providerName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">₹{b.price}</span>
                            <StatusBadge status={b.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </Card>
        </div>
      )}

      {/* === PROVIDERS TABLE === */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="size-5" aria-hidden />
            Professional management
            <Badge tone="neutral">{providers.length} providers</Badge>
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="text"
                placeholder="Search name, area…"
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                className="h-8 w-48 rounded-md border border-input bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={providerStatusFilter}
              onChange={(e) => setProviderStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground"
            >
              <option value="ALL">All status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {providersQuery.isPending && <LoadingState label="Loading providers…" />}

        {filteredProviders.length === 0 ? (
          <EmptyState title="No providers match your filters" description="Try adjusting the search or filter." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Area</th>
                  <th className="px-4 py-3 font-medium">Rate</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Jobs</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{categoryName(p.categoryId)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.areaLabel}</td>
                    <td className="px-4 py-3">₹{p.hourlyRate}</td>
                    <td className="px-4 py-3">
                      <Stars rating={p.rating} size={12} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          p.verificationStatus === 'VERIFIED'
                            ? 'success'
                            : p.verificationStatus === 'PENDING'
                              ? 'amber'
                              : 'destructive'
                        }
                      >
                        {p.verificationStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.completedJobs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* === RECENT BOOKINGS TABLE === */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarCheck className="size-5" aria-hidden />
            Recent bookings
            <Badge tone="neutral">{bookings.length} bookings</Badge>
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="text"
                placeholder="Search customer, provider…"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="h-8 w-48 rounded-md border border-input bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground"
            >
              <option value="ALL">All status</option>
              <option value="REQUESTED">Requested</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="RATED">Rated</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <EmptyState title="No bookings match your filters" description="Try adjusting the search or filter." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{b.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 font-medium">{b.categoryName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.providerName}</td>
                    <td className="px-4 py-3">₹{Number(b.price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
