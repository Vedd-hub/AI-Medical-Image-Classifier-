import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, ScanSearch, FileText, History, Cpu, Settings, LogOut, X } from 'lucide-react'
import { Logo } from './Logo'
import { useApp } from '../context/AppContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/analysis', label: 'Image Analysis', icon: ScanSearch },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/history', label: 'History', icon: History },
  { to: '/model', label: 'Model Information', icon: Cpu },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout, toast } = useApp()
  const navigate = useNavigate()
  const initials = (user?.name ?? 'U').replace('Dr. ', '').split(' ').map((p) => p[0]).slice(0, 2).join('')

  const handleLogout = () => {
    logout(); toast('info', 'Signed out of the demo session.'); navigate('/login')
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-navy-950/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo to="/dashboard" />
          <button className="btn btn-ghost btn-sm lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-4 w-4" /></button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13.5px] font-medium transition-colors ${isActive ? 'bg-brand-50 text-navy-900' : 'text-muted hover:bg-canvas hover:text-ink'}`}
            >
              {({ isActive }) => (<>
                <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-brand-600' : ''}`} aria-hidden="true" />{label}
              </>)}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white" aria-hidden="true">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-[11.5px] text-muted">{user?.role}</p>
            </div>
          </div>
          <button className="btn btn-ghost mt-1 w-full !justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />Logout
          </button>
        </div>
      </aside>
    </>
  )
}
