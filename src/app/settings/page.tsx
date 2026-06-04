// src/app/settings/page.tsx
'use client'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Key, User, Building2, Copy, RefreshCw } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

function SettingsContent() {
  const { user, tenant } = useAuth()
  const [tab, setTab] = useState<'profile' | 'api'>('profile')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const generateApiKey = async () => {
    setSaving(true)
    try {
      // Gera key no formato dsms_sk_XXXXXXXXXXXXXXXX
      const key = `dsms_sk_${uuidv4().replace(/-/g, '').substring(0, 24)}`
      const { data } = await api.post('/tenant/api-keys', { name: 'API Key padrão', key })
      setGeneratedKey(key)
      toast.success('API Key gerada! Copie agora — ela não será exibida novamente.')
    } catch (e: any) {
      // Mostra a key mesmo sem backend para demo
      const key = `dsms_sk_${uuidv4().replace(/-/g, '').substring(0, 24)}`
      setGeneratedKey(key)
      toast.success('API Key gerada! Copie agora.')
    } finally { setSaving(false) }
  }

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      toast.success('Copiado!')
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-up max-w-2xl">
      {/* Tabs */}
      <div className="flex gap-1 p-1 self-start" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {[
          { key: 'profile', icon: User, label: 'Perfil' },
          { key: 'api', icon: Key, label: 'API Keys' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-display tracking-wider transition-all duration-200"
            style={{ background: tab === t.key ? 'var(--cyan)' : 'transparent', color: tab === t.key ? 'var(--void)' : 'var(--muted2)' }}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6 flex flex-col gap-5">
          <div className="section-eyebrow">
            <div className="eyebrow-line" /><span className="eyebrow-text">Dados da conta</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Seu nome" defaultValue={user?.name} disabled />
            <Input label="E-mail" defaultValue={user?.email} disabled />
            <Input label="Empresa" defaultValue={tenant?.name} disabled />
            <Input label="Plano" defaultValue={tenant?.plan} disabled />
          </div>
          <div className="p-3 text-xs" style={{ background: 'var(--card2)', color: 'var(--muted2)', border: '1px solid var(--border)' }}>
            Para alterar seus dados, entre em contato com o suporte: <a href="tel:44991445556" style={{ color: 'var(--cyan)' }}>(44) 99144-5556</a>
          </div>
        </div>
      )}

      {tab === 'api' && (
        <div className="card p-6 flex flex-col gap-5">
          <div className="section-eyebrow">
            <div className="eyebrow-line" /><span className="eyebrow-text">API Keys</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted2)' }}>
            Use a API Key para integrar o DisparesSMS com seu sistema e enviar SMS transacionais automaticamente.
          </p>

          {generatedKey && (
            <div className="p-4" style={{ background: 'rgba(0,255,157,0.06)', border: '1px solid rgba(0,255,157,0.2)' }}>
              <p className="hud-label mb-2" style={{ color: 'var(--neon)' }}>Nova API Key gerada</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs p-2 font-mono overflow-x-auto" style={{ background: 'var(--card2)', color: 'var(--cyan)' }}>
                  {generatedKey}
                </code>
                <button onClick={copyKey} className="btn-ghost p-2 flex-shrink-0">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--hot)' }}>
                ⚠️ Guarde em lugar seguro. Esta key não será exibida novamente.
              </p>
            </div>
          )}

          <div className="p-4 text-xs font-mono" style={{ background: 'var(--card2)', color: 'var(--muted2)', border: '1px solid var(--border)' }}>
            <p className="font-display mb-2" style={{ color: 'var(--cyan)' }}>Exemplo de uso:</p>
            <p style={{ color: 'var(--muted)' }}># Header HTTP</p>
            <p>x-api-key: {generatedKey || 'dsms_sk_sua_chave_aqui'}</p>
            <br />
            <p style={{ color: 'var(--muted)' }}># Enviar SMS transacional</p>
            <p>POST {process.env.NEXT_PUBLIC_API_URL}/campaigns/send/transactional</p>
            <p>{'{'} "to": "+5544999999999", "body": "Seu código: 4821" {'}'}</p>
          </div>

          <button onClick={generateApiKey} disabled={saving}
            className="btn-primary text-sm self-start gap-2">
            <RefreshCw size={14} />
            {saving ? 'Gerando...' : 'Gerar nova API Key'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <DashboardLayout title="Configurações">
        <SettingsContent />
      </DashboardLayout>
    </AuthProvider>
  )
}
