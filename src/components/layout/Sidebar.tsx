// src/components/layout/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import {
  LayoutDashboard, Users, Megaphone, MessageSquare,
  CreditCard, Settings, LogOut, Shield, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/contacts', icon: Users, label: 'Contatos' },
  { href: '/campaigns', icon: Megaphone, label: 'Campanhas' },
  { href: '/messages', icon: MessageSquare, label: 'Mensagens' },
  { href: '/billing', icon: CreditCard, label: 'Créditos' },
  { href: '/settings', icon: Settings, label: 'Configurações' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, tenant, logout, isAdmin } = useAuth()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 flex flex-col border-r z-40"
      style={{ background: 'var(--deep)', borderColor: 'var(--border2)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-7 h-7 flex items-center justify-center"
          style={{ background: 'var(--cyan)', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
          <Zap size={14} color="#000" fill="#000" />
        </div>
        <span className="font-display font-bold text-base tracking-widest text-text">
          DISPARE<span style={{ color: 'var(--cyan)' }}>SMS</span>
        </span>
      </div>

      {/* Tenant info */}
      <div className="px-4 py-3 border-b mx-2 my-2 rounded" style={{ borderColor: 'var(--border)', background: 'rgba(0,229,255,0.03)' }}>
        <p className="text-xs font-display tracking-wider" style={{ color: 'var(--cyan)' }}>
          {tenant?.plan?.toUpperCase() || 'STARTER'}
        </p>
        <p className="text-sm font-medium text-text truncate mt-0.5">{tenant?.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--neon)', boxShadow: '0 0 6px var(--neon)' }} />
          <p className="text-xs" style={{ color: 'var(--muted2)' }}>
            {tenant?.creditsBalance?.toLocaleString()} créditos
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn('sidebar-link rounded', pathname.startsWith(href) && pathname !== '/' ? 'active' : '')}>
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="my-2 border-t" style={{ borderColor: 'var(--border)' }} />
            <Link href="/admin"
              className={cn('sidebar-link rounded', pathname.startsWith('/admin') ? 'active' : '')}>
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-void"
            style={{ background: 'var(--cyan)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{user?.role}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-all duration-200"
          style={{ color: 'var(--hot)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,77,109,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  )
}
