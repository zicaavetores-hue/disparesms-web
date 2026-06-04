// src/lib/api.ts
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export const api = axios.create({ baseURL: API_URL })

// Injeta token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dsms_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redireciona para login se 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('dsms_token')
      localStorage.removeItem('dsms_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ───────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// ── Dashboard ──────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/messages/dashboard'),
}

// ── Contacts ───────────────────────────────────
export const contactsApi = {
  list: (params?: any) => api.get('/contacts', { params }),
  create: (data: any) => api.post('/contacts', data),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data),
  remove: (id: string) => api.delete(`/contacts/${id}`),
  importCsv: (file: File, listId?: string) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/contacts/import/csv${listId ? `?listId=${listId}` : ''}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  lists: () => api.get('/contacts/lists/all'),
  createList: (data: any) => api.post('/contacts/lists', data),
  listContacts: (listId: string, params?: any) =>
    api.get(`/contacts/lists/${listId}`, { params }),
  addToList: (listId: string, contactIds: string[]) =>
    api.post(`/contacts/lists/${listId}/members`, { contactIds }),
}

// ── Campaigns ──────────────────────────────────
export const campaignsApi = {
  list: (params?: any) => api.get('/campaigns', { params }),
  get: (id: string) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post('/campaigns', data),
  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
  launch: (id: string) => api.post(`/campaigns/${id}/launch`),
  cancel: (id: string) => api.post(`/campaigns/${id}/cancel`),
  stats: (id: string) => api.get(`/campaigns/${id}/stats`),
  sendTransactional: (to: string, body: string) =>
    api.post('/campaigns/send/transactional', { to, body }),
}

// ── Messages ───────────────────────────────────
export const messagesApi = {
  list: (params?: any) => api.get('/messages', { params }),
}

// ── Billing ────────────────────────────────────
export const billingApi = {
  balance: () => api.get('/billing/balance'),
  packages: () => api.get('/billing/packages'),
  plans: () => api.get('/billing/plans'),
  transactions: (params?: any) => api.get('/billing/transactions', { params }),
  buy: (packageId: string) => api.post('/billing/buy', { packageId }),
}

// ── Admin ──────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  tenants: (params?: any) => api.get('/admin/tenants', { params }),
  tenantDetail: (id: string) => api.get(`/admin/tenants/${id}`),
  setStatus: (id: string, status: string) =>
    api.put(`/admin/tenants/${id}/status`, { status }),
  grantCredits: (id: string, amount: number, reason: string) =>
    api.post(`/admin/tenants/${id}/credits`, { amount, reason }),
}
