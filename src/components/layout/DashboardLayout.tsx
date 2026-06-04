// src/components/layout/DashboardLayout.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--void)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--cyan)', borderTopColor: 'transparent' }} />
          <p className="text-sm font-display tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            Carregando...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--void)' }}>
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        {/* Topbar */}
        {title && (
          <div className="sticky top-0 z-30 px-8 py-4 border-b flex items-center justify-between"
            style={{ background: 'rgba(8,11,16,0.85)', borderColor: 'var(--border)', backdropFilter: 'blur(12px)' }}>
            <h1 className="font-display font-bold text-lg tracking-wide text-text">{title}</h1>
          </div>
        )}
        <div className="p-8">
          {children}
        </div>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border2)', fontFamily: 'DM Sans' },
          success: { iconTheme: { primary: 'var(--neon)', secondary: 'var(--void)' } },
          error: { iconTheme: { primary: 'var(--hot)', secondary: 'var(--void)' } },
        }}
      />
    </div>
  )
}
