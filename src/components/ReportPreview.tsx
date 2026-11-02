import type { Analysis, Patient } from '../types'
import { DISCLAIMER_FULL } from '../data/constants'
import { formatDateTime } from '../utils/format'
import { LogoMark } from './Logo'

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="border-b border-line pb-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}
const KV = ({ k, v }: { k: string; v: string }) => (
  <div className="flex gap-4 py-1 text-[13px]"><dt className="w-40 shrink-0 text-muted">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>
)

export function ReportPreview({ a, patient, base, heat }: { a: Analysis; patient?: Patient; base: string; heat?: string }) {
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-white" aria-label="Report preview">
      <header className="flex items-center justify-between bg-navy-900 px-6 py-5 text-white">
        <div className="flex items-center gap-3"><LogoMark size={30} /><div><p className="text-base font-bold tracking-wide">MEDVISION AI</p><p className="text-[12px] text-white/70">AI-Assisted Medical Image Analysis Report</p></div></div>
        <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-bold tracking-wider text-black">DEMO MODE</span>
      </header>
      <div className="px-6 pb-6">
        <Sec title="Patient"><dl><KV k="Patient ID" v={a.patientId} /><KV k="Name" v={patient?.name ?? '—'} /><KV k="Age" v={patient ? String(patient.age) : '—'} /><KV k="Gender" v={patient?.gender ?? '—'} /></dl></Sec>
        <Sec title="Examination"><dl><KV k="Study ID" v={a.studyId} /><KV k="Modality" v={a.modality} /><KV k="Date / time" v={formatDateTime(a.date)} /></dl></Sec>
        <Sec title="Image & explainability">
          <div className="grid grid-cols-2 gap-3">
            <figure><img src={base} alt="Original medical image" className="aspect-square w-full rounded-lg bg-black object-contain" /><figcaption className="mt-1 text-[11.5px] text-muted">Original image</figcaption></figure>
            <figure>{heat ? <img src={heat} alt={a.result.mode === 'real' ? 'Grad-CAM attention map' : 'Simulated attention map'} className="aspect-square w-full rounded-lg bg-black object-contain" /> : <div className="skeleton aspect-square w-full" />}<figcaption className="mt-1 text-[11.5px] text-muted">{a.result.mode === 'real' ? 'Grad-CAM attention map' : 'Simulated explainability visualization'}</figcaption></figure>
          </div>
        </Sec>
        <Sec title={a.result.mode === 'real' ? 'AI Analysis' : 'AI Analysis (simulated)'}>
          <dl><KV k="AI Prediction" v={a.result.prediction} /><KV k="Confidence" v={`${a.result.confidence.toFixed(1)}%`} /><KV k="Normal probability" v={`${a.result.probabilities.normal.toFixed(1)}%`} /><KV k="Abnormal probability" v={`${a.result.probabilities.abnormal.toFixed(1)}%`} /><KV k="Priority suggestion" v={a.result.priority} /></dl>
        </Sec>
        <Sec title="Doctor's Review">
          <p className="text-[12px] font-semibold text-muted">Clinical notes</p>
          <p className="mb-3 whitespace-pre-wrap text-[13px] text-ink">{a.clinicalNotes || <span className="text-faint">No clinical notes recorded.</span>}</p>
          <p className="text-[12px] font-semibold text-muted">Doctor's final interpretation</p>
          <p className="whitespace-pre-wrap text-[13px] text-ink">{a.finalInterpretation || <span className="text-faint">Pending — not yet entered.</span>}</p>
          <dl className="mt-3"><KV k="Status" v={a.reviewStatus} /><KV k="Reviewed by" v={a.reviewedBy ?? 'Awaiting review'} /></dl>
        </Sec>
        <Sec title="Model"><dl><KV k="Model version" v={a.result.modelVersion} /><KV k="Inference mode" v={a.result.mode === 'demo' ? 'Simulation (Demo AI Mode)' : 'Real inference (trained model)'} /></dl></Sec>
        <Sec title="Disclaimer"><p className="rounded-lg bg-warn-50 p-3 text-[12px] leading-relaxed text-[#6b4a0d]">{DISCLAIMER_FULL}</p></Sec>
      </div>
    </article>
  )
}
