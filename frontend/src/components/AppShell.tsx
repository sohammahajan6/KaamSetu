import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore, homeForRole } from '@/store/auth'
import { Button } from '@/components/ui'
import { Hammer, LogOut } from 'lucide-react'

const navByRole: Record<string, { to: string; label: string }[]> = {
  CUSTOMER: [
    { to: '/browse', label: 'Browse' },
    { to: '/bookings', label: 'My Bookings' },
  ],
  PROVIDER: [
    { to: '/provider/dashboard', label: 'Dashboard' },
    { to: '/provider/profile', label: 'My Profile' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/providers', label: 'Verification' },
    { to: '/admin/categories', label: 'Categories' },
  ],
}

import { useEffect } from 'react'
import { api } from '@/api'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function AppShell() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const links = user ? (navByRole[user.role] ?? []) : []

  useEffect(() => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        return registration.pushManager.getSubscription()
          .then(async subscription => {
            if (subscription) return; // already subscribed
            
            const response = await Notification.requestPermission();
            if (response !== 'granted') return;
            
            const publicVapidKey = 'BB4_knAkpKyYcQKqAiGQNV7J92zUwptTYSeAsHsmrjn_kI17kFzKEz6pW1SJ639Miw7cJk7DMs1mBOSoRJ2JzCE';
            const newSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
            
            const p256dh = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(newSubscription.getKey('p256dh')!))));
            const auth = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(newSubscription.getKey('auth')!))));
            
            await api.subscribeToPush({
              endpoint: newSubscription.endpoint,
              p256dh,
              auth
            });
          });
      }).catch(err => console.error('Service Worker Error', err));
  }, [user]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link
              to={homeForRole(user?.role)}
              className="flex items-center gap-2 font-semibold text-foreground"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-primary">
                <Hammer className="size-4 text-primary-foreground" aria-hidden />
              </span>
              KaamSetu
            </Link>
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground md:inline">
                {user.name} · {user.role.toLowerCase()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut className="size-4" aria-hidden />
                Log out
              </Button>
            </div>
          )}
        </div>
        {/* mobile nav */}
        {links.length > 0 && (
          <nav className="flex gap-1 border-t border-border px-4 py-2 sm:hidden" aria-label="Main mobile">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
