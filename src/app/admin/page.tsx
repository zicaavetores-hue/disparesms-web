// src/app/admin/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, StatusBadge, Spinner, Empty, Modal, Pagination, Input } from '@/components/ui'
import { adminApi } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { Shield, Users, MessageSquare, TrendingUp, BadgeDollarSign, Eye, Ban, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

function AdminContent() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState<any>(null)
  const [showGrant, setShowGrant] = useState<any>(null)
  const [grantForm, setGrantForm] = useState({ amount: '', reason: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/dashboard')
  }, [isAdmin, authLoading, router])

  const load = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const [s, t] = await Promise.all([
        adminApi.stats(),
        adminApi.tenants({ page, search: search || undefined }),
      ])
      setStats(s.data)
      setTenants(t.data.tenants)
      setPages(t.data.pages)
    } finally { setLoading(false) }
  }, [isAdmin, page, search])

  useEffect(() => { load() }, [load])

  const handleSetStatus = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    await adminApi.setStatus(id, status)
    toast.success(status === 'ACTIVE' ? 'Empresa reativada.' : 'Empresa suspensa.')
    load()
  }

  const handleGrant = async () => {
    if (!grantForm.amount || !grantForm.reason) return toast.error('Preencha todos os campos.')
    setSaving(true)
    try {
      await adminApi.grantCredits(showGrant.id, Number(grantForm.amount), grantForm.reason)
      toast.success(`${grantForm.amount} créditos adicionados!`)
      setShowGrant(null)
      setGrantForm({ amount: '', reason: '' })
      load()
    } finally { setSaving(false) }
  }

  const openDetail = async (id: string) => {
    const { data } = await adminApi.tenantDetail(id)
    setShowDetail(data)
  }

  if (!isAdmin) return null

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Warning banner */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.25)' }}>
        <Shield size={16} style={{ color: 'var(--plasma)' }} />
        <p className="text-sm" style={{ color: 'var(--muted2)' }}>
          Você está no <strong style={{ color: 'var(--plasma)' }}>Painel Administrativo</strong> — todas as ações aqui afetam todos os clientes da plataforma.
        </p>
      </div>

      {/* Stats gerais */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Empresas ativas" value={fmt.number(stats.tenants?.active)} sub={`${fmt.number(stats.tenants?.total)} total`} icon={<Users size={18} />} color="var(--cyan)" />
          <StatCard label="SMS enviados" value={fmt.number(stats.messages?.sent)} sub="total na plataforma" icon={<MessageSquare size={18} />} color="var(--neon)" />
          <StatCard label="Total de mensagens" value={fmt.number(stats.messages?.total)} icon={<TrendingUp size={18} />} color="var(--plasma)" />
          <StatCard label="Créditos vendidos" value={fmt.number(stats.revenue?.totalCredits)} icon={<BadgeDollarSign size={18} />} color="var(--hot)" />
        </div>
      )}

      {/* Tabela de tenants */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="section-eyebrow">
            <div className="eyebrow-line" /><span className="eyebrow-text">Empresas cadastradas</span>
          </div>
          <div className="relative">
            <input className="input-field text-sm py-2 pl-8 w-56"
              placeholder="Buscar empresa..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>

        {loading ? <div className="flex justify-center py-16"><Spinner size={28} /></div>
          : tenants.length === 0 ? (
            <Empty icon={<Users size={32} />} title="Nenhuma empresa" />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Empresa', 'Plano', 'Status', 'Créditos', 'SMS', 'Contatos', 'Campanhas', 'Criado', 'Ações'].map(h => (
                      <th key={h} className="hud-label text-left px-4 py-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id} className="table-row">
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{t.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-display" style={{ color: 'var(--plasma)' }}>{t.plan?.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3" style={{ color: 'var(--cyan)' }}>{fmt.number(t.creditsBalance)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted2)' }}>{fmt.number(t._count?.messages)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted2)' }}>{fmt.number(t._count?.contacts)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted2)' }}>{fmt.number(t._count?.campaigns)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{fmt.dateShort(t.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openDetail(t.id)} title="Ver detalhes"
                            className="p-1.5 transition-colors" style={{ color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.2)' }}>
                            <Eye size={12} />
                          </button>
                          <button onClick={() => setShowGrant(t)} title="Adicionar créditos"
                            className="p-1.5 transition-colors" style={{ color: 'var(--neon)', border: '1px solid rgba(0,255,157,0.2)' }}>
                            <BadgeDollarSign size={12} />
                          </button>
                          {t.status === 'ACTIVE'
                            ? <button onClick={() => handleSetStatus(t.id, 'SUSPENDED')} title="Suspender"
                                className="p-1.5" style={{ color: 'var(--hot)', border: '1px solid rgba(255,77,109,0.2)' }}>
                                <Ban size={12} />
                              </button>
                            : <button onClick={() => handleSetStatus(t.id, 'ACTIVE')} title="Reativar"
                                className="p-1.5" style={{ color: 'var(--neon)', border: '1px solid rgba(0,255,157,0.2)' }}>
                                <CheckCircle2 size={12} />
                              </button>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 pb-4"><Pagination page={page} pages={pages} onPage={setPage} /></div>
            </>
          )}
      </div>

      {/* Modal: Detalhes */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Detalhes da empresa" size="md">
        {showDetail && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nome', value: showDetail.name },
                { label: 'Slug', value: showDetail.slug },
                { label: 'E-mail', value: showDetail.email },
                { label: 'Plano', value: showDetail.plan?.name },
                { label: 'Créditos', value: fmt.number(showDetail.creditsBalance) },
                { label: 'Status', value: showDetail.status },
              ].map(item => (
                <div key={item.label} className="p-3" style={{ background: 'var(--card2)', border: '1px solid var(--border)' }}>
                  <p className="hud-label mb-1">{item.label}</p>
                  <p className="text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="hud-label mb-2">Usuários</p>
              {showDetail.users?.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b text-sm" style={{ borderColor: 'var(--border)' }}>
                  <span>{u.name} — {u.email}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Adicionar créditos */}
      <Modal open={!!showGrant} onClose={() => setShowGrant(null)} title={`Adicionar créditos — ${showGrant?.name}`} size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Quantidade de créditos" type="number" placeholder="1000"
            value={grantForm.amount} onChange={(e: any) => setGrantForm(f => ({ ...f, amount: e.target.value }))} />
          <Input label="Motivo" placeholder="Bônus de cortesia"
            value={grantForm.reason} onChange={(e: any) => setGrantForm(f => ({ ...f, reason: e.target.value }))} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowGrant(null)} className="btn-ghost text-sm">Cancelar</button>
            <button onClick={handleGrant} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Salvando...' : 'Adicionar créditos'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <DashboardLayout title="Painel Admin">
        <AdminContent />
      </DashboardLayout>
    </AuthProvider>
  )
}
