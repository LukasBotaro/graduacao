import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { RecentActivityItem } from "./types"

const DEFAULT_DEPARTMENTS = ['Engenharia', 'Marketing', 'Vendas', 'RH', 'Design']
const DEFAULT_LEAVE_TYPES = ['Férias', 'Doença', 'Pessoal', 'Paternidade']
const DEFAULT_DOCUMENT_TYPES = ['Contrato', 'Avaliação de Desempenho', 'Reconhecimento de Política', 'ID']

function readList(key: string, fallback: string[]): string[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function writeList(key: string, values: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(values))
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(values) }))
  } catch {}
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pushRecentActivity(activity: Omit<RecentActivityItem, 'id' | 'time'> & { id?: string; time?: string }) {
  try {
    const id = activity.id ?? `act-${Date.now()}`
    const time = activity.time ?? 'agora'
    const entry: RecentActivityItem = { ...activity, id, time } as RecentActivityItem
    const raw = localStorage.getItem('nh_activity')
    const list: RecentActivityItem[] = raw ? JSON.parse(raw) : []
    list.unshift(entry)
    const trimmed = list.slice(0, 100)
    localStorage.setItem('nh_activity', JSON.stringify(trimmed))
    // Notify listeners
    window.dispatchEvent(new StorageEvent('storage', { key: 'nh_activity', newValue: JSON.stringify(trimmed) }))
  } catch {
    // ignore
  }
}

// Funções para gerenciar tipos dinâmicos
export function getDepartments(): string[] {
  return readList('nh_departments', DEFAULT_DEPARTMENTS)
}

export function setDepartments(departments: string[]) {
  writeList('nh_departments', departments)
}

export function getLeaveTypes(): string[] {
  return readList('nh_leave_types', DEFAULT_LEAVE_TYPES)
}

export function setLeaveTypes(types: string[]) {
  writeList('nh_leave_types', types)
}

export function getDocumentTypes(): string[] {
  return readList('nh_document_types', DEFAULT_DOCUMENT_TYPES)
}

export function setDocumentTypes(types: string[]) {
  writeList('nh_document_types', types)
}

// Função para formatar moeda
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'number' ? value : parseCurrency(value)
  if (!isFinite(num)) return ''
  if (num === 0 && typeof value === 'string' && value.trim() === '') return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

// Função para converter string formatada em número
export function parseCurrency(value: string | number): number {
  if (typeof value === 'number') return value
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits) / 100
}
