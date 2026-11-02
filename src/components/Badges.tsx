import type { Priority, ResultLabel, ReviewStatus, PatientStatus } from '../types'

const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap'

const tone = {
  ok: 'bg-ok-50 text-ok-700',
  warn: 'bg-warn-50 text-warn-700',
  alert: 'bg-alert-50 text-alert-700',
  info: 'bg-brand-50 text-brand-700',
  neutral: 'bg-[#eef1f5] text-muted',
} as const

function Badge({ t, children }: { t: keyof typeof tone; children: React.ReactNode }) {
  return (
    <span className={`${base} ${tone[t]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {children}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const t = priority === 'Urgent' ? 'alert' : priority === 'Priority' ? 'warn' : 'neutral'
  return <Badge t={t}>{priority}</Badge>
}

export function ResultBadge({ label, text }: { label: ResultLabel; text?: string }) {
  const t = label === 'Normal' ? 'ok' : label === 'Abnormal' ? 'alert' : 'warn'
  return <Badge t={t}>{text ?? (label === 'Abnormal' ? 'Abnormal Finding' : label === 'Normal' ? 'No Abnormality' : 'Needs Review')}</Badge>
}

export function StatusBadge({ status }: { status: ReviewStatus | PatientStatus | 'Final' | 'Draft' }) {
  const t =
    status === 'Reviewed' || status === 'Final' || status === 'Active' ? 'ok'
    : status === 'Pending Review' || status === 'Follow-up' ? 'warn'
    : status === 'Draft' ? 'info'
    : 'neutral'
  return <Badge t={t}>{status}</Badge>
}
