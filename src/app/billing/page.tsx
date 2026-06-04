// src/app/billing/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { AuthProvider } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Spinner, Empty, Pagination } from '@/components/ui'
import { billingApi } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { CreditCard, Zap, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import toast from 'react-hot-toast'

function BillingContent() {
  const [balance, setBalance] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)
  const [pixData, setPixData] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bal, pkgs, txs] = await Promise.all([
        billingApi.balance(), billingApi.packages(), billingApi.transactions({ page }),
      ])
      setBalance(bal.data)
      setPackages(pkgs.data)
      setTransactions(txs.data.transactions)
      setPages(txs.data.pages)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleBuy = async (packageId: string) => {
    setBuying(packageId)
    try {
      const { data } = await billingApi.buy(packageId)
      if (data.pixCode) {
        setPixData(data)
      } else {
        toast.success(data.description || 'Créditos adicionados!')
        load()
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao processar pagamento.')
    } finally { setBuying(null) }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Saldo */}
      {balance && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-5 col-span-1">
            <div className="section-eyebrow mb-3">
              <div className="eyebrow-line" /><span className="eyebrow-text">Saldo atual</span>
            </div>
            <p className="font-display font-bold text-5xl tracking-tight mb-1" style={{ color: 'var(--cyan)', textShadow: '0 0 30px rgba(0,229,255,0.3)' }}>
              {fmt.number(balance.creditsBalance)}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted2)' }}>créditos disponíveis</p>
          </div>
          <div className="card p-5">
            <p className="hud-label mb-3">Plano atual</p>
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--plasma)' }}>{balance.plan?.name}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>
              {balance.plan?.smsLimit > 0 ? `${fmt.number(balance.plan.smsLimit)} SMS/mês` : 'Volume ilimitado'}
            </p>
          </div>
          <div className="card p-5">
            <p className="hud-label mb-3">Enviados este mês</p>
            <p className="font-display font-bold text-2xl">{fmt.number(balance.smsSentMonth)}</p>
            {balance.plan?.smsLimit > 0 && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border2)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min((balance.smsSentMonth / balance.plan.smsLimit) * 100, 100)}%`,
                    background: 'var(--cyan)',
                  }} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {fmt.percent(balance.smsSentMonth, balance.plan.smsLimit)} do plano
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PIX gerado */}
      {pixData && (
        <div className="card p-6" style={{ borderColor: 'rgba(0,255,157,0.3)' }}>
          <div className="section-eyebrow mb-4">
            <div className="eyebrow-line" /><span className="eyebrow-text" style={{ color: 'var(--neon)' }}>Pague via Pix</span>
          </div>
          <div className="grid grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--muted2)' }}>
                Valor: <strong style={{ color: 'var(--text)' }}>{fmt.currency(pixData.value)}</strong> →
                <strong style={{ color: 'var(--neon)' }}> {fmt.number(pixData.credits)} créditos</strong>
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
                Os créditos serão liberados automaticamente após a confirmação do pagamento.
              </p>
              <div className="p-3 font-mono text-xs break-all" style={{ background: 'var(--card2)', color: 'var(--muted2)', border: '1px solid var(--border)' }}>
                {pixData.pixCode || 'Código PIX indisponível'}
              </div>
            </div>
            {pixData.pixQrCode && (
              <img src={`data:image/png;base64,${pixData.pixQrCode}`} alt="QR Code Pix"
                className="w-40 h-40 mx-auto" style={{ imageRendering: 'pixelated' }} />
            )}
          </div>
          <button onClick={() => setPixData(null)} className="btn-ghost text-xs mt-4">Fechar</button>
        </div>
      )}

      {/* Pacotes */}
      <div>
        <div className="section-eyebrow mb-4">
          <div className="eyebrow-line" /><span className="eyebrow-text">Comprar créditos</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="card p-5 hover:border-glow transition-all duration-200 flex flex-col">
              <p className="hud-label mb-2">{pkg.label}</p>
              <p className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--cyan)' }}>
                {fmt.number(pkg.credits)}
              </p>
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>créditos SMS</p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted2)' }}>
                {fmt.currency(pkg.pricePerSms)} por SMS
              </p>
              <p className="font-display font-bold text-xl mt-auto mb-3">{fmt.currency(pkg.price)}</p>
              <button
                onClick={() => handleBuy(pkg.id)}
                disabled={buying === pkg.id}
                className="btn-primary w-full justify-center text-xs py-2.5 disabled:opacity-60">
                {buying === pkg.id ? 'Processando...' : 'Comprar via Pix'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="section-eyebrow">
            <div className="eyebrow-line" /><span className="eyebrow-text">Histórico de transações</span>
          </div>
        </div>
        {loading ? <div className="flex justify-center py-10"><Spinner /></div>
          : transactions.length === 0 ? (
            <Empty icon={<CreditCard size={32} />} title="Sem transações" description="Suas compras de crédito aparecerão aqui." />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Tipo', 'Descrição', 'Créditos', 'Saldo', 'Data'].map(h => (
                      <th key={h} className="hud-label text-left px-4 py-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} className="table-row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {t.amount > 0
                            ? <ArrowUpRight size={14} style={{ color: 'var(--neon)' }} />
                            : <ArrowDownRight size={14} style={{ color: 'var(--hot)' }} />}
                          <span className="text-xs font-display" style={{ color: t.amount > 0 ? 'var(--neon)' : 'var(--hot)' }}>
                            {t.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted2)' }}>{t.description}</td>
                      <td className="px-4 py-3 font-display font-semibold"
                        style={{ color: t.amount > 0 ? 'var(--neon)' : 'var(--hot)' }}>
                        {t.amount > 0 ? '+' : ''}{fmt.number(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted2)' }}>{fmt.number(t.balance)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{fmt.date(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 pb-4"><Pagination page={page} pages={pages} onPage={setPage} /></div>
            </>
          )}
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <AuthProvider>
      <DashboardLayout title="Créditos & Planos">
        <BillingContent />
      </DashboardLayout>
    </AuthProvider>
  )
}
