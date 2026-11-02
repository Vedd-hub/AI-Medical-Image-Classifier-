import { Check, Circle, Loader2 } from 'lucide-react'
import { PROCESSING_STAGES } from '../services/aiService'

export function AnalysisProgress({ stage, stageProgress }: { stage: number; stageProgress: number }) {
  const total = PROCESSING_STAGES.length
  const overall = Math.min(100, Math.round(((stage + stageProgress) / total) * 100))
  return (
    <div className="mx-auto max-w-md py-4" role="status" aria-live="polite">
      <div className="mb-1 flex justify-between text-[12.5px] font-medium"><span className="text-navy-900">Running demo analysis</span><span className="tabular-nums text-muted">{overall}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e6eaf0]" role="progressbar" aria-valuenow={overall} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand-600 transition-[width] duration-200" style={{ width: `${overall}%` }} />
      </div>
      <ol className="mt-6 space-y-3">
        {PROCESSING_STAGES.map((label, i) => {
          const done = i < stage, active = i === stage
          return (
            <li key={label} className={`flex items-center gap-3 text-[14px] transition-colors ${done ? 'text-ink' : active ? 'font-semibold text-navy-900' : 'text-faint'}`}>
              {done ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok-50 text-ok-700"><Check className="h-3.5 w-3.5" aria-label="complete" /></span>
                : active ? <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-label="in progress" />
                : <Circle className="h-5 w-5 text-[#cfd5de]" aria-label="pending" />}
              {label}
            </li>
          )
        })}
      </ol>
      <p className="mt-6 rounded-lg bg-warn-50 px-3 py-2 text-center text-[11.5px] font-medium text-warn-700">DEMO AI MODE — simulated inference in progress</p>
    </div>
  )
}
