import { ArrowDown, Database, Cpu } from 'lucide-react'
import { PageHeader, SectionTitle } from '../components/PageHeader'
import { DemoBadge } from '../components/Feedback'
import { MODEL_INFO } from '../data/constants'

const ARCH = ['Input Image', 'Preprocessing', 'CNN / ResNet Backbone', 'Feature Extraction', 'Classification Head', 'Probability Output', 'Explainability']
const PIPELINE = ['Dataset', 'Cleaning', 'Preprocessing', 'Train / Validation / Test', 'Model Training', 'Evaluation', 'Deployment']
const TECH = ['Python', 'PyTorch', 'OpenCV', 'Pillow', 'Grad-CAM', 'FastAPI']
const METRICS = ['Accuracy', 'Precision', 'Recall', 'Specificity', 'F1 Score', 'ROC-AUC']

function Flow({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col items-stretch gap-1">
      {items.map((s, i) => (
        <li key={s} className="flex flex-col items-center">
          <div className="w-full rounded-[10px] border border-line bg-[#fafbfc] px-4 py-2.5 text-center text-[13px] font-medium text-ink">{s}</div>
          {i < items.length - 1 && <ArrowDown className="my-0.5 h-4 w-4 text-faint" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  )
}

export default function ModelInfo() {
  const rows: [string, string][] = [
    ['Architecture', MODEL_INFO.architecture], ['Version', MODEL_INFO.version], ['Inference mode', MODEL_INFO.mode],
    ['Explainability', MODEL_INFO.explainability], ['Dataset', MODEL_INFO.dataset],
  ]
  return (
    <>
      <PageHeader title="Model Information" subtitle="Current model configuration and the planned real-model pipeline." actions={<DemoBadge />} />

      <section className="card">
        <SectionTitle>Model overview</SectionTitle>
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_1.4fr]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Cpu className="h-6 w-6" aria-hidden="true" /></div>
            <div>
              <p className="text-lg font-semibold text-navy-900">{MODEL_INFO.name}</p>
              <p className="mt-1 text-[13px] text-muted">A simulated classifier used to demonstrate the workflow. No trained model is connected.</p>
            </div>
          </div>
          <dl className="divide-y divide-line rounded-xl border border-line">
            {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-[13px]"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card"><SectionTitle>Architecture (planned)</SectionTitle><div className="p-5"><Flow items={ARCH} /></div></section>
        <section className="card">
          <SectionTitle>Dataset status</SectionTitle>
          <div className="space-y-5 p-5">
            <div className="flex items-start gap-3 rounded-xl border border-warn-700/25 bg-warn-50 p-4">
              <Database className="mt-0.5 h-5 w-5 shrink-0 text-warn-700" aria-hidden="true" />
              <div><p className="text-sm font-semibold text-warn-700">Not Connected</p><p className="mt-0.5 text-[13px] leading-relaxed text-[#6b4a0d]">The real medical imaging dataset will be integrated during the model-development phase.</p></div>
            </div>
            <div><p className="mb-2 text-[12px] font-semibold text-muted">Planned pipeline</p><Flow items={PIPELINE} /></div>
          </div>
        </section>
      </div>

      <section className="card mt-4">
        <SectionTitle>Evaluation metrics</SectionTitle>
        <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-3 lg:grid-cols-6">
          {METRICS.map((m) => (
            <div key={m} className="rounded-xl border border-dashed border-[#c5ccd6] p-4">
              <p className="text-[12px] font-medium text-muted">{m}</p>
              <p className="mt-1.5 text-[13px] font-semibold text-faint">Pending dataset</p>
            </div>
          ))}
        </div>
        <p className="border-t border-line px-5 py-3 text-[12px] text-faint">Metrics will be populated from real evaluation once a dataset and trained model exist. No clinical performance is claimed.</p>
      </section>

      <section className="card mt-4">
        <SectionTitle>Planned technology</SectionTitle>
        <div className="flex flex-wrap gap-2.5 p-5">{TECH.map((t) => <span key={t} className="rounded-lg border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium">{t}</span>)}</div>
      </section>
    </>
  )
}
