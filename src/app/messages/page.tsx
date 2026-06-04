// src/app/messages/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { AuthProvider } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatusBadge, Spinner, Empty, Pagination } from '@/components/ui'
import { messagesApi } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

function MessagesContent() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await messagesApi.list({ page, limit: 25 })
      setMessages(data.messages)
      setPages(data.pages)
      setTotal(data.total)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="card p-0 overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Spinner size={28} /></div>
          : messages.length === 0 ? (
            <Empty icon={<MessageSquare size={40} />} title="Nenhuma mensagem ainda"
              description="As mensagens disparadas aparecerão aqui." />
          ) : (
            <>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className="hud-label">{fmt.number(total)} mensagens no histórico</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {['Telefone', 'Mensagem', 'Campanha', 'Provedor', 'Status', 'Data'].map(h => (
                      <th key={h} className="hud-label text-left px-4 py-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m.id} className="table-row">
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--cyan)' }}>{m.phone}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-xs" style={{ color: 'var(--muted2)' }}>{m.body}</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                        {m.campaign?.name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-display tracking-wider" style={{ color: 'var(--muted)' }}>
                          {m.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{fmt.date(m.createdAt)}</td>
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

export default function MessagesPage() {
  return (
    <AuthProvider>
      <DashboardLayout title="Histórico de Mensagens">
        <MessagesContent />
      </DashboardLayout>
    </AuthProvider>
  )
}
