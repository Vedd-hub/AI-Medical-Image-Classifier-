import { AlertTriangle, Cpu, Flag, Loader2 } from 'lucide-react'
import type { Analysis } from '../types'
import { PriorityBadge } from './Badges'
import { SectionTitle } from './PageHeader'
import { ImageViewer } from './ImageViewer'
import { MODEL_INFO } from '../data/constants'
import type { AnalysisResult } from '../types'

export function PredictionCard({ a }: { a: Analysis }) {
  const abnormal = a.result.probabilities.abnormal > a.result.probabilities.normal
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-[#fafbfc] px-5 py-2.5">
        <p className="text-[11.5px] font-bold tracking-wider text-muted">AI PREDICTION</p>
        <span className="text-[11px] font-medium text-faint">{a.result.mode === 'real' ? 'Trained model output · decision support only' : 'Simulated prototype output'}</span>
      </div>
      <div className="grid gap-6 p-5 sm:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <p className="text-[12px] text-muted">Result</p>
          <p className={`mt-1 text-2xl font-semibold tracking-tight ${abnormal ? 'text-alert-700' : 'text-ok-700'}`}>{a.result.prediction}</p>
        </div>
        <div>
          <p className="text-[12px] text-muted">Confidence</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-navy-900">{a.result.confidence.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[12px] text-muted">Priority suggestion</p>
          <div className="mt-2"><PriorityBadge priority={a.result.priority} /></div>
        </div>
      </div>
    </section>
  )
}

export function ProbabilityChart({ result }: { result: AnalysisResult }) {
  const real = result.mode === 'real'
  const rows = result.classProbabilities
    ? result.classProbabilities.map((r) => ({ label: r.label, v: r.value, c: /^(normal|no tumour)/i.test(r.label) ? 'bg-ok-700' : 'bg-alert-700' }))
    : [
        { label: 'Normal', v: result.probabilities.normal, c: 'bg-ok-700' },
        { label: 'Abnormal', v: result.probabilities.abnormal, c: 'bg-alert-700' },
      ]
  return (
    <section className="card">
      <SectionTitle aside={<span className="text-[11px] text-faint">{real ? 'Model output' : 'Simulated'}</span>}>Probability distribution</SectionTitle>
      <div className="space-y-4 p-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex justify-between text-[13px]"><span className="font-medium text-ink">{r.label}</span><span className="tabular-nums text-muted">{r.v.toFixed(1)}%</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#eaedf2]" role="progressbar" aria-label={`${r.label} probability`} aria-valuenow={r.v} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-full rounded-full ${r.c} transition-[width] duration-700`} style={{ width: `${r.v}%` }} />
            </div>
          </div>
        ))}
        <p className="text-[11.5px] leading-relaxed text-faint">{real ? 'Model-estimated class probabilities. They are not clinical certainty and say nothing about how the model performs on images unlike its training data.' : 'Simulated prototype output. These values do not represent real clinical model performance.'}</p>
      </div>
    </section>
  )
}

export function HeatmapViewer({ heat, failed, base, real = false }: { heat?: string; failed: boolean; base: string; real?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col">
      {heat ? (
        <ImageViewer src={heat} alt={real ? 'Grad-CAM attention map overlaid on the medical image' : 'Simulated attention map overlaid on the medical image'}
          caption={<span className="flex items-center gap-2">AI Attention Map {real ? <span className="rounded bg-sky-400/90 px-1.5 py-px text-[9.5px] font-bold text-black">GRAD-CAM</span> : <span className="rounded bg-amber-400/90 px-1.5 py-px text-[9.5px] font-bold text-black">SIMULATED</span>}</span>}
          footer={real ? 'Grad-CAM Explainability Visualization' : 'Simulated Explainability Visualization'} />
      ) : failed ? (
        <ImageViewer src={base} alt="Original image (attention map unavailable)" caption="AI Attention Map unavailable" footer={real ? 'The attention map could not be generated for this study.' : 'The simulated overlay could not be generated.'} />
      ) : (
        <div className="flex aspect-[4/4.6] items-center justify-center rounded-xl border border-line bg-[#0b0d10] text-white/60" role="status"><Loader2 className="h-6 w-6 animate-spin" aria-label="Generating attention map" /></div>
      )}
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        {real ? 'Highlighted (warm) regions show where the model focused for its top prediction. This indicates model attention, not the location of a confirmed finding.' : 'Highlighted regions represent simulated areas of model attention for demonstration purposes.'}
      </p>
    </div>
  )
}

export function FindingCard({ a }: { a: Analysis }) {
  return (
    <section className="card">
      <SectionTitle>AI-Assisted Finding</SectionTitle>
      <div className="space-y-4 p-5">
        <p className="text-[14px] leading-relaxed text-ink">{a.result.explanation}</p>
        <div role="note" className="flex items-start gap-2.5 rounded-lg border border-warn-700/25 bg-warn-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" aria-hidden="true" />
          <p className="text-[12.5px] leading-relaxed text-[#6b4a0d]"><strong>Important:</strong> {a.result.mode === 'real' ? 'This is an AI-generated screening aid and is not a medical diagnosis. It must be reviewed by a qualified clinician.' : 'This is a simulated AI output and is not a medical diagnosis.'}</p>
        </div>
      </div>
    </section>
  )
}

export function PriorityCard({ a }: { a: Analysis }) {
  const p = a.result.priority
  const title = p === 'Routine' ? 'Routine Review' : p === 'Priority' ? 'Priority Review' : 'Urgent Review'
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2 text-[11.5px] font-bold tracking-wider text-muted"><Flag className="h-3.5 w-3.5" aria-hidden="true" />AI PRIORITY SUGGESTION</div>
      <div className="mt-3 flex items-center gap-3"><p className="text-xl font-semibold text-navy-900">{title}</p><PriorityBadge priority={p} /></div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">This is an AI-assisted workflow suggestion and does not represent an emergency diagnosis.</p>
    </section>
  )
}

export function ModelCard({ a }: { a: Analysis }) {
  const rows: [string, string][] = [
    ['Model', MODEL_INFO.name], ['Architecture', MODEL_INFO.architecture], ['Version', a.result.modelVersion],
    ['Inference Mode', a.result.mode === 'demo' ? MODEL_INFO.mode : 'Real inference'], ['Explainability', a.result.mode === 'demo' ? MODEL_INFO.explainability : 'Grad-CAM'], ['Dataset', a.result.mode === 'demo' ? MODEL_INFO.dataset : 'See model repository'],
  ]
  return (
    <section className="card">
      <SectionTitle aside={<Cpu className="h-4 w-4 text-faint" aria-hidden="true" />}>Model information</SectionTitle>
      <dl className="divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-5 py-2.5 text-[13px]"><dt className="text-muted">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>
        ))}
      </dl>
    </section>
  )
}
