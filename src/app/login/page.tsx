// src/app/login/page.tsx
'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Zap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from 'react-hot-toast'

function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Bem-vindo de volta!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--void)' }}>
      {/* Grid background */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 flex items-center justify-center"
            style={{ background: 'var(--cyan)', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
            <Zap size={16} color="#000" fill="#000" />
          </div>
          <span className="font-display font-bold text-xl tracking-widest">
            DISPARE<span style={{ color: 'var(--cyan)' }}>SMS</span>
          </span>
        </div>

        {/* Card */}
        <div className="card p-8" style={{ background: 'var(--card)' }}>
          <div className="section-eyebrow justify-center mb-6">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Acesso à plataforma</span>
            <div className="eyebrow-line" />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="hud-label">E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="seu@email.com.br" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Senha</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted)' }}>
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center mt-2 py-3 text-sm disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'var(--void)', borderTopColor: 'transparent' }} />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--muted)' }}>
          Não tem conta?{' '}
          <Link href="/register" className="transition-colors" style={{ color: 'var(--cyan)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Criar empresa grátis
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
      <Toaster position="bottom-right" toastOptions={{
        style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border2)' }
      }} />
    </AuthProvider>
  )
}
