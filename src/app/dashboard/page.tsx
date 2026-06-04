// src/app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { AuthProvider } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, StatusBadge, Spinner } from '@/components/ui'
import { dashboardApi } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MessageSquare, CheckCircle2, XCircle, CreditCard, TrendingUp, Megaphone } from 'lucide-react'
import Link from 'next/link'

function DashboardContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.stats()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20"><Spinner size={32} /></div>
  )

  const chartData = (data?.dailyVolume || []).map((d: any) => ({
    date: fmt.dateShort(d.date),
    total: Number(d.total),
    delivered: Number(d.delivered),
  }))

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="SMS este mês"
          value={fmt.number(data?.sms?.totalMonth || 0)}
          sub="total disparado"
          icon={<MessageSquare size={18} />}
          color="var(--cyan)"
        />
        <StatCard
          label="Entregues"
          value={fmt.number(data?.sms?.deliveredMonth || 0)}
          sub={`${data?.sms?.deliveryRate || '0'}% de entrega`}
          icon={<CheckCircle2 size={18} />}
          color="var(--neon)"
        />
        <StatCard
          label="Falharam"
          value={fmt.number(data?.sms?.failedMonth || 0)}
          sub="este mês"
          icon={<XCircle size={18} />}
          color="var(--hot)"
        />
        <StatCard
          label="Créditos"
          value={fmt.number(data?.credits?.balance || 0)}
          sub={`${fmt.number(data?.credits?.usedThisMonth || 0)} usados`}
          icon={<CreditCard size={18} />}
          color="var(--plasma)"
        />
      </div>

      {/* Chart */}
      <div className="card p-6">
        <div className="section-eyebrow mb-6">
          <div className="eyebrow-line" />
          <span className="eyebrow-text">Volume últimos 7 dias</span>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--neon)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--neon)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 0, fontSize: 12 }}
                labelStyle={{ color: 'var(--muted2)' }}
              />
              <Area type="monotone" dataKey="total" stroke="var(--cyan)" strokeWidth={1.5} fill="url(#gradTotal)" name="Total" />
              <Area type="monotone" dataKey="delivered" stroke="var(--neon)" strokeWidth={1.5} fill="url(#gradDelivered)" name="Entregues" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center" style={{ color: 'var(--muted)' }}>
            <p className="text-sm">Nenhum dado disponível ainda</p>
          </div>
        )}
      </div>

      {/* Recent campaigns */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="section-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Campanhas recentes</span>
          </div>
          <Link href="/campaigns" className="text-xs transition-colors" style={{ color: 'var(--cyan)' }}>
            Ver todas →
          </Link>
        </div>

        {data?.recentCampaigns?.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Campanha', 'Status', 'Total', 'Entregues', 'Data'].map(h => (
                  <th key={h} className="hud-label text-left pb-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentCampaigns.map((c: any) => (
                <tr key={c.id} className="table-row">
                  <td className="py-3 font-medium text-text">{c.name}</td>
                  <td className="py-3"><StatusBadge status={c.status} /></td>
                  <td className="py-3" style={{ color: 'var(--muted2)' }}>{fmt.number(c.totalMessages)}</td>
                  <td className="py-3" style={{ color: 'var(--neon)' }}>{fmt.number(c.deliveredCount)}</td>
                  <td className="py-3 text-xs" style={{ color: 'var(--muted)' }}>{fmt.date(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10">
            <Megaphone size={32} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} />
            <p className="text-sm" style={{ color: 'var(--muted2)' }}>Nenhuma campanha ainda</p>
            <Link href="/campaigns" className="btn-primary text-xs mt-4 inline-flex">Criar primeira campanha</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardLayout title="Dashboard">
        <DashboardContent />
      </DashboardLayout>
    </AuthProvider>
  )
}
