import { Check } from 'lucide-react'

const STEPS = ['Patient', 'Upload', 'Analyze', 'Review', 'Report']

/** current is 1-based. */
export function Stepper({ current }: { current: number }) {
  return (
    <ol className="card mb-6 flex items-center gap-1 overflow-x-auto p-3 sm:p-4" aria-label="Analysis workflow">
      {STEPS.map((s, i) => {
        const n = i + 1, done = n < current, active = n === current
        return (
          <li key={s} className="flex flex-1 items-center gap-2 last:flex-none" aria-current={active ? 'step' : undefined}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${done ? 'bg-ok-700 text-white' : active ? 'bg-navy-900 text-white' : 'bg-[#eef1f5] text-faint'}`}>
              {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}
            </span>
            <span className={`hidden text-[13px] font-medium sm:inline ${active ? 'text-navy-900' : done ? 'text-ink' : 'text-faint'}`}>{s}</span>
            {n < STEPS.length && <span className={`mx-1 h-px min-w-3 flex-1 ${done ? 'bg-ok-700/40' : 'bg-line'}`} aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
