import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-navy-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <h2 className="text-sm font-semibold text-navy-900">{children}</h2>
      {aside}
    </div>
  )
}

export function StatCard({ label, value, hint, icon, tone = 'default' }: {
  label: string; value: string | number; hint?: string; icon: ReactNode; tone?: 'default' | 'warn' | 'alert'
}) {
  const t = { default: 'bg-brand-50 text-brand-600', warn: 'bg-warn-50 text-warn-700', alert: 'bg-alert-50 text-alert-700' }[tone]
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-[12.5px] font-medium text-muted">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t}`}>{icon}</div>
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-navy-900">{typeof value === 'number' ? value.toLocaleString('en-US') : value}</p>
      {hint && <p className="mt-2 text-[11.5px] text-faint">{hint}</p>}
    </div>
  )
}
