// src/app/register/page.tsx
'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from 'react-hot-toast'
import { Zap, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', companyName: '', companyEmail: '', phone: '', password: '',
  })

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Senha mínima de 8 caracteres.')
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      localStorage.setItem('dsms_token', data.accessToken)
      localStorage.setItem('dsms_user', JSON.stringify(data.user))
      localStorage.setItem('dsms_tenant', JSON.stringify(data.tenant))
      toast.success('Conta criada! 200 SMS grátis liberados 🎉')
      setTimeout(() => router.push('/dashboard'), 800)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  const perks = ['200 SMS grátis ao cadastrar', 'Sem cartão de crédito', 'Configure em 5 minutos', 'Cancele quando quiser']

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--void)' }}>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(123,47,255,0.08) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center animate-fade-up">
        {/* Left: pitch */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 flex items-center justify-center"
              style={{ background: 'var(--cyan)', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
              <Zap size={16} color="#000" fill="#000" />
            </div>
            <span className="font-display font-bold text-xl tracking-widest">
              DISPARE<span style={{ color: 'var(--cyan)' }}>SMS</span>
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl leading-tight mb-4" style={{ letterSpacing: '-1px' }}>
            Comece a<br />
            <span style={{ color: 'var(--cyan)', textShadow: '0 0 30px rgba(0,229,255,0.4)' }}>disparar SMS</span><br />
            agora mesmo.
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--muted2)' }}>
            Plataforma completa de SMS para empresas. Marketing, transacional e recuperação de vendas em um só lugar.
          </p>
          <div className="flex flex-col gap-3">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-2.5">
                <CheckCircle2 size={16} style={{ color: 'var(--neon)', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: 'var(--muted2)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="card p-8" style={{ background: 'var(--card)' }}>
          <div className="section-eyebrow justify-center mb-6">
            <div className="eyebrow-line" /><span className="eyebrow-text">Criar conta grátis</span><div className="eyebrow-line" />
          </div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Seu nome</label>
              <input className="input-field" placeholder="João Silva" value={form.name} onChange={set('name')} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Nome da empresa</label>
              <input className="input-field" placeholder="Minha Empresa Ltda" value={form.companyName} onChange={set('companyName')} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="hud-label">E-mail corporativo</label>
              <input type="email" className="input-field" placeholder="contato@empresa.com.br" value={form.companyEmail} onChange={set('companyEmail')} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="hud-label">WhatsApp (opcional)</label>
              <input className="input-field" placeholder="(44) 9 9999-9999" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Senha (mín. 8 caracteres)</label>
              <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={8} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center mt-2 py-3 text-sm disabled:opacity-60">
              {loading ? 'Criando conta...' : 'Criar conta — grátis'}
            </button>
          </form>
          <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: 'var(--cyan)' }}>Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
      <Toaster position="bottom-right" toastOptions={{
        style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border2)' }
      }} />
    </AuthProvider>
  )
}
