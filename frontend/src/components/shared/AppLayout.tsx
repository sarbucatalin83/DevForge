import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const NAV_LINKS = [
  { to: '/quiz', label: 'Quiz' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/progress', label: 'Progress' },
  { to: '/coverage', label: 'Coverage' },
]

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 h-14">
          <div className="flex items-center gap-1">
            <span className="mr-4 font-semibold text-sm tracking-tight">DevLearn</span>
            <nav className="flex gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
