// src/lib/utils.ts
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
dayjs.locale('pt-br')

export const fmt = {
  date: (d: string | Date) => dayjs(d).format('DD/MM/YYYY HH:mm'),
  dateShort: (d: string | Date) => dayjs(d).format('DD/MM/YY'),
  relative: (d: string | Date) => dayjs(d).fromNow(),
  number: (n: number) => n?.toLocaleString('pt-BR'),
  percent: (n: number, total: number) =>
    total > 0 ? ((n / total) * 100).toFixed(1) + '%' : '0%',
  currency: (n: number) =>
    n?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
}

export const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho', SCHEDULED: 'Agendada', RUNNING: 'Enviando',
  COMPLETED: 'Concluída', CANCELLED: 'Cancelada', FAILED: 'Falhou',
  DELIVERED: 'Entregue', SENT: 'Enviado', QUEUED: 'Na fila',
  UNDELIVERED: 'Não entregue', OPTED_OUT: 'Opt-out',
  ACTIVE: 'Ativo', SUSPENDED: 'Suspenso',
}

export const statusClass: Record<string, string> = {
  DRAFT: 'status-draft', SCHEDULED: 'status-scheduled', RUNNING: 'status-running',
  COMPLETED: 'status-completed', CANCELLED: 'status-cancelled',
  DELIVERED: 'status-delivered', SENT: 'status-sent',
  FAILED: 'status-failed', QUEUED: 'status-queued',
  ACTIVE: 'status-completed', SUSPENDED: 'status-failed',
}

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
