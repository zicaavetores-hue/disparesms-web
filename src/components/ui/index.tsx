// src/components/ui/index.tsx
'use client'
import { ReactNode, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { statusLabel, statusClass, cn } from '@/lib/utils'

// ── Badge de status ──────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('badge-status text-xs', statusClass[status] || 'status-draft')}>
      {statusLabel[status] || status}
    </span>
  )
}

// ── Spinner ──────────────────────────────────────────────
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div className="inline-block animate-spin rounded-full border-2 border-t-transparent"
      style={{ width: size, height: size, borderColor: 'var(--cyan)', borderTopColor: 'transparent' }} />
  )
}

// ── Empty state ──────────────────────────────────────────
export function Empty({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && <div style={{ color: 'var(--muted)', opacity: 0.5 }}>{icon}</div>}
      <div>
        <p className="font-display font-semibold text-lg text-text">{title}</p>
        {description && <p className="text-sm mt-1" style={{ color: 'var(--muted2)' }}>{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg'
}) {
  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className={cn('card w-full animate-fade-up', widths[size])}
        style={{ background: 'var(--card2)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-lg tracking-wide">{title}</h3>
          <button onClick={onClose} className="p-1 transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Confirm dialog ───────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, description, danger = false }: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; description?: string; danger?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {description && <p className="text-sm mb-6" style={{ color: 'var(--muted2)' }}>{description}</p>}
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-ghost text-sm px-4 py-2">Cancelar</button>
        <button onClick={onConfirm}
          className={danger ? 'btn-danger' : 'btn-primary'}>
          Confirmar
        </button>
      </div>
    </Modal>
  )
}

// ── Input ────────────────────────────────────────────────
export function Input({ label, error, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="hud-label text-xs">{label}</label>}
      <input className="input-field" {...props} />
      {error && <p className="text-xs" style={{ color: 'var(--hot)' }}>{error}</p>}
    </div>
  )
}

// ── Select ───────────────────────────────────────────────
export function Select({ label, children, error, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="hud-label text-xs">{label}</label>}
      <select className="input-field" style={{ cursor: 'pointer' }} {...props}>
        {children}
      </select>
      {error && <p className="text-xs" style={{ color: 'var(--hot)' }}>{error}</p>}
    </div>
  )
}

// ── Textarea ─────────────────────────────────────────────
export function Textarea({ label, error, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="hud-label text-xs">{label}</label>}
      <textarea className="input-field resize-none" rows={4} {...props} />
      {error && <p className="text-xs" style={{ color: 'var(--hot)' }}>{error}</p>}
    </div>
  )
}

// ── Pagination ───────────────────────────────────────────
export function Pagination({ page, pages, onPage }: {
  page: number; pages: number; onPage: (p: number) => void
}) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center gap-2 mt-6 justify-end">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1}
        className="p-1.5 border transition-colors disabled:opacity-30"
        style={{ borderColor: 'var(--border2)', color: 'var(--muted2)' }}>
        <ChevronLeft size={14} />
      </button>
      <span className="text-sm font-display tracking-wider" style={{ color: 'var(--muted2)' }}>
        {page} / {pages}
      </span>
      <button onClick={() => onPage(page + 1)} disabled={page >= pages}
        className="p-1.5 border transition-colors disabled:opacity-30"
        style={{ borderColor: 'var(--border2)', color: 'var(--muted2)' }}>
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, color = 'var(--cyan)' }: {
  label: string; value: string | number; sub?: string; icon?: ReactNode; color?: string
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <p className="hud-label">{label}</p>
        {icon && <span style={{ color, opacity: 0.6 }}>{icon}</span>}
      </div>
      <p className="font-display font-bold text-3xl tracking-tight" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}
