import { useEffect, useRef, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle, FlaskConical, ShieldAlert } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { DISCLAIMER_SHORT } from '../data/constants'

/* ---------- Toasts ---------- */
export function ToastViewport() {
  const { toasts, dismissToast } = useApp()
  const icon = { success: CheckCircle2, error: XCircle, info: Info }
  const color = { success: 'text-ok-700', error: 'text-alert-700', info: 'text-brand-600' }
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(92vw,360px)] flex-col gap-2" aria-live="polite" role="status">
      {toasts.map((t) => {
        const Icon = icon[t.kind]
        return (
          <div key={t.id} className="slide-in pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-[var(--shadow-pop)]">
            <Icon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${color[t.kind]}`} aria-hidden="true" />
            <p className="flex-1 text-[13px] leading-snug text-ink">{t.message}</p>
            <button className="text-faint hover:text-ink" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification">
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, width = 520 }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    ref.current?.querySelector<HTMLElement>('input,textarea,select,button')?.focus()
    return () => { document.removeEventListener('keydown', onKey); prev?.focus() }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-950/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth: width }}
        className="pop-in max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-[var(--shadow-pop)] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-navy-900">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close dialog"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Empty / Error / Skeleton ---------- */
export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>
      <h3 className="text-[15px] font-semibold text-navy-900">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorNotice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-alert-700/20 bg-alert-50 p-3.5">
      <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-alert-700" aria-hidden="true" />
      <div className="text-[13px]">
        <p className="font-semibold text-alert-700">{title}</p>
        {children && <div className="mt-0.5 text-alert-700/90">{children}</div>}
      </div>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-5 flex-1" />)}
        </div>
      ))}
    </div>
  )
}

/* ---------- Demo mode messaging ---------- */
export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border border-warn-700/25 bg-warn-50 px-2 py-0.5 text-[10.5px] font-bold tracking-wider text-warn-700 ${className}`}>
      <FlaskConical className="h-3 w-3" aria-hidden="true" />DEMO MODE
    </span>
  )
}

export function DisclaimerBanner({ title = 'DEMO MODE', compact = false }: { title?: string; compact?: boolean }) {
  return (
    <div role="note" className={`flex items-start gap-3 rounded-xl border border-warn-700/25 bg-warn-50 ${compact ? 'p-3' : 'p-4'}`}>
      <ShieldAlert className="mt-0.5 h-[18px] w-[18px] shrink-0 text-warn-700" aria-hidden="true" />
      <div>
        <p className="text-[11.5px] font-bold tracking-wider text-warn-700">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#6b4a0d]">{DISCLAIMER_SHORT}</p>
      </div>
    </div>
  )
}
