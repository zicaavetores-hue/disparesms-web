// src/app/campaigns/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { AuthProvider } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatusBadge, Spinner, Empty, Modal, Confirm, Pagination, Input, Select, Textarea } from '@/components/ui'
import { campaignsApi, contactsApi } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { Megaphone, Plus, Rocket, BarChart2, XCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

function CampaignsContent() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [showStats, setShowStats] = useState<any>(null)
  const [confirmLaunch, setConfirmLaunch] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)

  const [form, setForm] = useState({
    name: '', messageBody: '', type: 'MARKETING', scheduledAt: '', listIds: [] as string[],
  })
  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await campaignsApi.list({ page, limit: 10 })
      setCampaigns(data.campaigns)
      setPages(data.pages)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => {
    load()
    contactsApi.lists().then(r => setLists(r.data))
  }, [load])

  const handleCreate = async () => {
    if (!form.name || !form.messageBody) return toast.error('Nome e mensagem são obrigatórios.')
    setSaving(true)
    try {
      await campaignsApi.create(form)
      toast.success('Campanha criada!')
      setShowCreate(false)
      setForm({ name: '', messageBody: '', type: 'MARKETING', scheduledAt: '', listIds: [] })
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao criar campanha.')
    } finally { setSaving(false) }
  }

  const handleLaunch = async (id: string) => {
    try {
      await campaignsApi.launch(id)
      toast.success('Campanha disparada!')
      setConfirmLaunch(null)
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao disparar.')
    }
  }

  const handleCancel = async (id: string) => {
    await campaignsApi.cancel(id)
    toast.success('Campanha cancelada.')
    setConfirmCancel(null)
    load()
  }

  const openStats = async (id: string) => {
    setStatsLoading(true)
    try {
      const { data } = await campaignsApi.stats(id)
      setShowStats(data)
    } finally { setStatsLoading(false) }
  }

  const toggleList = (id: string) => {
    setForm(f => ({
      ...f,
      listIds: f.listIds.includes(id) ? f.listIds.filter(i => i !== id) : [...f.listIds, id],
    }))
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm gap-2">
          <Plus size={14} />Nova campanha
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Spinner size={28} /></div>
          : campaigns.length === 0 ? (
            <Empty icon={<Megaphone size={40} />} title="Nenhuma campanha ainda"
              description="Crie sua primeira campanha e dispare para seus contatos."
              action={<button onClick={() => setShowCreate(true)} className="btn-primary text-sm">Criar campanha</button>}
            />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Campanha', 'Tipo', 'Status', 'Total', 'Entregues', 'Taxa', 'Data', 'Ações'].map(h => (
                      <th key={h} className="hud-label text-left px-4 py-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => {
                    const rate = c.totalMessages > 0
                      ? ((c.deliveredCount / c.totalMessages) * 100).toFixed(0) + '%'
                      : '—'
                    return (
                      <tr key={c.id} className="table-row">
                        <td className="px-4 py-3">
                          <p className="font-medium text-text">{c.name}</p>
                          {c.scheduledAt && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--plasma)' }}>
                              ⏰ {fmt.date(c.scheduledAt)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-display tracking-wider" style={{ color: 'var(--muted2)' }}>
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3" style={{ color: 'var(--muted2)' }}>{fmt.number(c.totalMessages)}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--neon)' }}>{fmt.number(c.deliveredCount)}</td>
                        <td className="px-4 py-3" style={{ color: rate !== '—' ? 'var(--cyan)' : 'var(--muted)' }}>{rate}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{fmt.dateShort(c.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {['DRAFT', 'SCHEDULED'].includes(c.status) && (
                              <button onClick={() => setConfirmLaunch(c.id)}
                                className="flex items-center gap-1 px-2 py-1 text-xs transition-all duration-200"
                                style={{ color: 'var(--neon)', border: '1px solid rgba(0,255,157,0.25)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,157,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Rocket size={11} />Disparar
                              </button>
                            )}
                            <button onClick={() => openStats(c.id)}
                              className="p-1.5 transition-colors"
                              style={{ color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.2)' }}>
                              <BarChart2 size={13} />
                            </button>
                            {['DRAFT', 'SCHEDULED'].includes(c.status) && (
                              <button onClick={() => setConfirmCancel(c.id)}
                                className="p-1.5 transition-colors"
                                style={{ color: 'var(--hot)', border: '1px solid rgba(255,77,109,0.2)' }}>
                                <XCircle size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="px-4 pb-4"><Pagination page={page} pages={pages} onPage={setPage} /></div>
            </>
          )}
      </div>

      {/* Modal: Criar campanha */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova campanha" size="lg">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <Input label="Nome da campanha *" placeholder="Promoção Junho" value={form.name} onChange={set('name')} />
            <Select label="Tipo" value={form.type} onChange={set('type')}>
              <option value="MARKETING">Marketing</option>
              <option value="TRANSACTIONAL">Transacional</option>
              <option value="RECOVERY">Recuperação de vendas</option>
            </Select>
            <Input label="Agendar para (opcional)" type="datetime-local" value={form.scheduledAt} onChange={set('scheduledAt')} />
            <div className="flex flex-col gap-1.5">
              <label className="hud-label">Listas de contatos</label>
              {lists.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Nenhuma lista criada ainda.</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {lists.map((l: any) => (
                    <label key={l.id} className="flex items-center gap-2.5 p-2 cursor-pointer hover:bg-white/5 transition-colors">
                      <input type="checkbox" checked={form.listIds.includes(l.id)} onChange={() => toggleList(l.id)}
                        className="w-3.5 h-3.5 accent-cyan-400" />
                      <span className="text-sm">{l.name}</span>
                      <span className="text-xs ml-auto" style={{ color: 'var(--muted)' }}>{fmt.number(l.count)} contatos</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Textarea label="Mensagem *" placeholder="Olá {{nome}}! Promoção especial: 20% OFF. Use: PROMO20 👉 link.com/promo"
              value={form.messageBody} onChange={set('messageBody')} rows={6} />
            <div className="p-3 text-xs" style={{ background: 'var(--card2)', color: 'var(--muted2)' }}>
              <p className="font-display mb-1.5" style={{ color: 'var(--cyan)' }}>Variáveis disponíveis:</p>
              {['{{nome}}', '{{telefone}}', '{{email}}'].map(v => (
                <code key={v} className="block py-0.5">{v}</code>
              ))}
              <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                Serão substituídas pelos dados de cada contato.
              </p>
            </div>
            {form.messageBody && (
              <div className="text-xs" style={{ color: 'var(--muted2)' }}>
                Caracteres: {form.messageBody.length} / 160
                {form.messageBody.length > 160 && <span style={{ color: 'var(--hot)' }}> (2 SMS)</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancelar</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Criando...' : 'Criar campanha'}
          </button>
        </div>
      </Modal>

      {/* Modal: Stats */}
      <Modal open={!!showStats} onClose={() => setShowStats(null)} title="Relatório da campanha" size="md">
        {statsLoading ? <div className="flex justify-center py-8"><Spinner /></div>
          : showStats && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total', value: fmt.number(showStats.stats?.total), color: 'var(--text)' },
                  { label: 'Enviados', value: fmt.number(showStats.stats?.sent), color: 'var(--cyan)' },
                  { label: 'Entregues', value: fmt.number(showStats.stats?.delivered), color: 'var(--neon)' },
                  { label: 'Falharam', value: fmt.number(showStats.stats?.failed), color: 'var(--hot)' },
                  { label: 'Taxa de entrega', value: showStats.stats?.deliveryRate, color: 'var(--neon)' },
                  { label: 'Na fila', value: fmt.number(showStats.stats?.queued), color: 'var(--plasma)' },
                ].map(s => (
                  <div key={s.label} className="p-3" style={{ background: 'var(--card2)', border: '1px solid var(--border)' }}>
                    <p className="hud-label mb-1">{s.label}</p>
                    <p className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <StatusBadge status={showStats.campaign?.status} />
            </div>
          )}
      </Modal>

      <Confirm open={!!confirmLaunch} onClose={() => setConfirmLaunch(null)}
        onConfirm={() => confirmLaunch && handleLaunch(confirmLaunch)}
        title="Disparar campanha agora?"
        description="Os SMS serão enviados imediatamente para todos os contatos das listas selecionadas. Os créditos serão debitados conforme o envio." />

      <Confirm open={!!confirmCancel} onClose={() => setConfirmCancel(null)}
        onConfirm={() => confirmCancel && handleCancel(confirmCancel)}
        title="Cancelar campanha?" description="A campanha voltará para rascunho." danger />
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <AuthProvider>
      <DashboardLayout title="Campanhas">
        <CampaignsContent />
      </DashboardLayout>
    </AuthProvider>
  )
}
