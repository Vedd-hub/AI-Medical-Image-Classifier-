import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Analysis, Patient, Report, Role, Toast, User } from '../types'
import { demoPatients } from '../data/demoPatients'
import { demoAnalyses } from '../data/demoAnalyses'
import { demoReports } from '../data/demoReports'

interface AppState {
  user: User | null
  patients: Patient[]
  analyses: Analysis[]
  reports: Report[]
  toasts: Toast[]
  login: (email: string, role: Role) => void
  logout: () => void
  updateUser: (patch: Partial<User>) => void
  addPatient: (p: Omit<Patient, 'lastExam' | 'studies' | 'status'>) => Patient
  addAnalysis: (a: Analysis) => void
  updateAnalysis: (studyId: string, patch: Partial<Analysis>) => void
  addReport: (studyId: string) => Report | null
  nextStudyId: () => string
  toast: (kind: Toast['kind'], message: string) => void
  dismissToast: (id: number) => void
}

const Ctx = createContext<AppState | null>(null)
const USER_KEY = 'medvision.user'

function loadUser(): User | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

const NAME_BY_ROLE: Record<Role, string> = {
  Doctor: 'Dr. Priya Sharma',
  Radiologist: 'Dr. Rahul Menon',
  Administrator: 'Neha Kulkarni',
}

let toastSeq = 1

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)
  const [patients, setPatients] = useState<Patient[]>(demoPatients)
  const [analyses, setAnalyses] = useState<Analysis[]>(demoAnalyses)
  const [reports, setReports] = useState<Report[]>(demoReports)
  const [toasts, setToasts] = useState<Toast[]>([])

  const persist = (u: User | null) => {
    try {
      if (u) sessionStorage.setItem(USER_KEY, JSON.stringify(u))
      else sessionStorage.removeItem(USER_KEY)
    } catch { /* storage unavailable */ }
  }

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback((kind: Toast['kind'], message: string) => {
    const id = toastSeq++
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => dismissToast(id), 4500)
  }, [dismissToast])

  const login = useCallback((email: string, role: Role) => {
    const u: User = { name: NAME_BY_ROLE[role], email, role }
    setUser(u); persist(u)
  }, [])
  const logout = useCallback(() => { setUser(null); persist(null) }, [])
  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }, [])

  const addPatient: AppState['addPatient'] = useCallback((p) => {
    const full: Patient = { ...p, lastExam: new Date().toISOString(), studies: 0, status: 'Active' }
    setPatients((prev) => [full, ...prev])
    return full
  }, [])

  const addAnalysis = useCallback((a: Analysis) => {
    setAnalyses((prev) => [a, ...prev])
    setPatients((prev) =>
      prev.map((p) => (p.id === a.patientId ? { ...p, studies: p.studies + 1, lastExam: a.date } : p)),
    )
  }, [])

  const updateAnalysis = useCallback((studyId: string, patch: Partial<Analysis>) => {
    setAnalyses((prev) => prev.map((a) => (a.studyId === studyId ? { ...a, ...patch } : a)))
  }, [])

  const nextStudyId = useCallback(() => {
    const max = analyses.reduce((m, a) => Math.max(m, Number(a.studyId.replace('ST-', '')) || 0), 8000)
    return `ST-${max + 1}`
  }, [analyses])

  const addReport = useCallback((studyId: string): Report | null => {
    const a = analyses.find((x) => x.studyId === studyId)
    if (!a) return null
    const existing = reports.find((r) => r.studyId === studyId)
    const status: Report['status'] = a.reviewStatus === 'Reviewed' ? 'Final' : 'Draft'
    if (existing) {
      const updated = { ...existing, status, generatedAt: new Date().toISOString(), reviewedBy: a.reviewedBy ?? existing.reviewedBy }
      setReports((prev) => prev.map((r) => (r.id === existing.id ? updated : r)))
      return updated
    }
    const maxId = reports.reduce((m, r) => Math.max(m, Number(r.id.replace('RP-', '')) || 0), 3000)
    const rep: Report = {
      id: `RP-${maxId + 1}`, studyId, patientId: a.patientId,
      generatedAt: new Date().toISOString(), reviewedBy: a.reviewedBy ?? 'Awaiting review', status,
    }
    setReports((prev) => [rep, ...prev])
    return rep
  }, [analyses, reports])

  const value = useMemo<AppState>(
    () => ({ user, patients, analyses, reports, toasts, login, logout, updateUser, addPatient, addAnalysis, updateAnalysis, addReport, nextStudyId, toast, dismissToast }),
    [user, patients, analyses, reports, toasts, login, logout, updateUser, addPatient, addAnalysis, updateAnalysis, addReport, nextStudyId, toast, dismissToast],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used within AppProvider')
  return v
}
