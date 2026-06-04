// src/app/contacts/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { AuthProvider } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatusBadge, Spinner, Empty, Modal, Confirm, Pagination, Input } from '@/components/ui'
import { contactsApi } from '@/lib/api'
import { fmt } from '@/lib/utils'
import {
  UserPlus, Upload, Search, Trash2, Users, List, X, CheckCircle2,
  AlertCircle, FolderOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'

function ContactsContent() {
  const [contacts, setContacts] = useState<any[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'contacts' | 'lists'>('contacts')

  // Modals
  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showCreateList, setShowCreateList] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Forms
  const [createForm, setCreateForm] = useState({ phone: '', name: '', email: '', tags: '' })
  const [listForm, setListForm] = useState({ name: '', description: '' })
  const [importResult, setImportResult] = useState<any>(null)
  const [importing, setImporting] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await contactsApi.list({ page, limit: 20, search: search || undefined })
      setContacts(data.contacts)
      setPages(data.pages)
      setTotal(data.total)
    } finally { setLoading(false) }
  }, [page, search])

  const loadLists = useCallback(async () => {
    const { data } = await contactsApi.lists()
    setLists(data)
  }, [])

  useEffect(() => { load(); loadLists() }, [load, loadLists])

  const handleCreate = async () => {
    if (!createForm.phone) return toast.error('Telefone obrigatório.')
    setSaving(true)
    try {
      await contactsApi.create({
        ...createForm,
        tags: createForm.tags ? createForm.tags.split(',').map(t => t.trim()) : [],
      })
      toast.success('Contato criado!')
      setShowCreate(false)
      setCreateForm({ phone: '', name: '', email: '', tags: '' })
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao criar contato.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    await contactsApi.remove(id)
    toast.success('Contato removido.')
    setConfirmDelete(null)
    load()
  }

  const handleCreateList = async () => {
    if (!listForm.name) return toast.error('Nome obrigatório.')
    setSaving(true)
    try {
      await contactsApi.createList(listForm)
      toast.success('Lista criada!')
      setShowCreateList(false)
      setListForm({ name: '', description: '' })
      loadLists()
    } finally { setSaving(false) }
  }

  // Dropzone para CSV
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file) return
      setImporting(true)
      setImportResult(null)
      try {
        const { data } = await contactsApi.importCsv(file)
        setImportResult(data)
        toast.success(`${data.imported} contatos importados!`)
        load()
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Erro na importação.')
      } finally { setImporting(false) }
    },
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {[
            { key: 'contacts', icon: Users, label: `Contatos (${fmt.number(total)})` },
            { key: 'lists', icon: FolderOpen, label: `Listas (${lists.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-display tracking-wider transition-all duration-200"
              style={{ background: tab === t.key ? 'var(--cyan)' : 'transparent', color: tab === t.key ? 'var(--void)' : 'var(--muted2)' }}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {tab === 'contacts' && <>
            <button onClick={() => setShowImport(true)} className="btn-ghost text-sm gap-2">
              <Upload size={14} />Importar CSV
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary text-sm gap-2">
              <UserPlus size={14} />Novo contato
            </button>
          </>}
          {tab === 'lists' && (
            <button onClick={() => setShowCreateList(true)} className="btn-primary text-sm gap-2">
              <List size={14} />Nova lista
            </button>
          )}
        </div>
      </div>

      {/* Tab: Contatos */}
      {tab === 'contacts' && (
        <div className="card p-0 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
              <input
                className="input-field pl-9 py-2 text-sm"
                placeholder="Buscar por nome, telefone ou e-mail..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>
          {loading ? <div className="flex justify-center py-16"><Spinner size={28} /></div>
            : contacts.length === 0 ? (
              <Empty icon={<Users size={40} />} title="Nenhum contato"
                description="Crie manualmente ou importe um CSV."
                action={<button onClick={() => setShowCreate(true)} className="btn-primary text-sm">Criar contato</button>}
              />
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      {['Nome', 'Telefone', 'E-mail', 'Tags', 'Status', 'Criado', ''].map(h => (
                        <th key={h} className="hud-label text-left px-4 py-3 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map(c => (
                      <tr key={c.id} className="table-row">
                        <td className="px-4 py-3 font-medium">{c.name || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--cyan)' }}>{c.phone}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted2)' }}>{c.email || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(c.tags || []).map((t: string) => (
                              <span key={t} className="text-xs px-2 py-0.5" style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--cyan)' }}>{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.optedOut ? 'OPTED_OUT' : 'DELIVERED'} />
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{fmt.dateShort(c.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setConfirmDelete(c.id)} className="btn-danger p-1.5">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 pb-4">
                  <Pagination page={page} pages={pages} onPage={setPage} />
                </div>
              </>
            )}
        </div>
      )}

      {/* Tab: Listas */}
      {tab === 'lists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.length === 0 ? (
            <div className="col-span-3">
              <Empty icon={<FolderOpen size={40} />} title="Nenhuma lista"
                description="Organize seus contatos em listas para facilitar o disparo."
                action={<button onClick={() => setShowCreateList(true)} className="btn-primary text-sm">Criar lista</button>}
              />
            </div>
          ) : lists.map(l => (
            <div key={l.id} className="card p-5 hover:border-glow transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <FolderOpen size={20} style={{ color: 'var(--cyan)' }} />
                <span className="text-xs font-display tracking-wider" style={{ color: 'var(--muted)' }}>
                  {fmt.number(l.count || 0)} contatos
                </span>
              </div>
              <h3 className="font-display font-semibold text-base mb-1">{l.name}</h3>
              {l.description && <p className="text-xs" style={{ color: 'var(--muted2)' }}>{l.description}</p>}
              <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>{fmt.date(l.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Criar contato */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo contato" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Telefone *" placeholder="+5544999999999" value={createForm.phone}
            onChange={(e: any) => setCreateForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Nome" placeholder="João Silva" value={createForm.name}
            onChange={(e: any) => setCreateForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="E-mail" type="email" placeholder="joao@email.com" value={createForm.email}
            onChange={(e: any) => setCreateForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Tags (separadas por vírgula)" placeholder="vip, cliente, maringá" value={createForm.tags}
            onChange={(e: any) => setCreateForm(f => ({ ...f, tags: e.target.value }))} />
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancelar</button>
            <button onClick={handleCreate} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Salvando...' : 'Criar contato'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Importar CSV */}
      <Modal open={showImport} onClose={() => { setShowImport(false); setImportResult(null) }} title="Importar contatos via CSV" size="md">
        {!importResult ? (
          <>
            <div {...getRootProps()} className="border-2 border-dashed rounded p-10 text-center cursor-pointer transition-all duration-200"
              style={{ borderColor: isDragActive ? 'var(--cyan)' : 'var(--border2)', background: isDragActive ? 'rgba(0,229,255,0.04)' : 'transparent' }}>
              <input {...getInputProps()} />
              {importing ? <Spinner size={32} /> : <>
                <Upload size={32} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} />
                <p className="font-display text-sm mb-1">{isDragActive ? 'Solte aqui!' : 'Arraste o CSV ou clique para selecionar'}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Tamanho máximo: 10MB</p>
              </>}
            </div>
            <div className="mt-4 p-3 text-xs" style={{ background: 'var(--card2)', color: 'var(--muted2)' }}>
              <p className="font-display mb-1" style={{ color: 'var(--cyan)' }}>Formato esperado do CSV:</p>
              <code>nome,telefone,email,tags</code><br />
              <code>João,44999999999,joao@email.com,"vip,cliente"</code>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4" style={{ background: 'rgba(0,255,157,0.06)', border: '1px solid rgba(0,255,157,0.2)' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--neon)' }} />
              <div>
                <p className="font-display font-semibold" style={{ color: 'var(--neon)' }}>Importação concluída</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted2)' }}>
                  {importResult.imported} importados · {importResult.skipped} ignorados
                </p>
              </div>
            </div>
            {importResult.errors?.length > 0 && (
              <div className="text-xs max-h-32 overflow-y-auto p-3" style={{ background: 'rgba(255,77,109,0.06)', color: 'var(--hot)' }}>
                {importResult.errors.slice(0, 5).map((e: string, i: number) => <p key={i}>{e}</p>)}
              </div>
            )}
            <button onClick={() => { setShowImport(false); setImportResult(null) }} className="btn-primary text-sm self-end">Fechar</button>
          </div>
        )}
      </Modal>

      {/* Modal: Criar lista */}
      <Modal open={showCreateList} onClose={() => setShowCreateList(false)} title="Nova lista de contatos" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Nome da lista *" placeholder="Clientes VIP" value={listForm.name}
            onChange={(e: any) => setListForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Descrição (opcional)" placeholder="Lista de clientes premium" value={listForm.description}
            onChange={(e: any) => setListForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setShowCreateList(false)} className="btn-ghost text-sm">Cancelar</button>
            <button onClick={handleCreateList} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Criando...' : 'Criar lista'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <Confirm open={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Remover contato" description="Esta ação não pode ser desfeita." danger />
    </div>
  )
}

export default function ContactsPage() {
  return (
    <AuthProvider>
      <DashboardLayout title="Contatos">
        <ContactsContent />
      </DashboardLayout>
    </AuthProvider>
  )
}
