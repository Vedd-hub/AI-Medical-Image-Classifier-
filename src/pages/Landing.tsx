import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Upload, ScanSearch, Eye, UserCheck, FileText, ArrowRight, ShieldCheck, KeyRound, Users, ClipboardList,
  Bone, Brain, Activity, Waves, Focus, Fingerprint, FlaskConical,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { DISCLAIMER_FULL } from '../data/constants'
import { phantomImage } from '../services/phantom'
import { generateDemoHeatmap } from '../services/heatmap'

const STEPS = [
  { icon: Upload, title: 'Upload', body: 'Add a medical image to a patient study.' },
  { icon: ScanSearch, title: 'Analyze', body: 'Model produces a classification and probabilities.' },
  { icon: Eye, title: 'Explain', body: 'Attention maps show where the model focused.' },
  { icon: UserCheck, title: 'Review', body: 'A healthcare professional records the final interpretation.' },
  { icon: FileText, title: 'Report', body: 'Export a structured, reviewable PDF report.' },
]

const MODALITIES = [
  { icon: Bone, name: 'Chest X-Ray', ready: true },
  { icon: Brain, name: 'MRI', ready: false },
  { icon: Activity, name: 'CT', ready: false },
  { icon: Waves, name: 'Ultrasound', ready: false },
  { icon: Focus, name: 'Retinal Imaging', ready: false },
  { icon: Fingerprint, name: 'Skin Imaging', ready: false },
]

const TECH = ['React', 'FastAPI', 'PyTorch', 'OpenCV', 'PostgreSQL / SQLite', 'Explainable AI']

function HeroPreview() {
  const [heat, setHeat] = useState<string>()
  const base = phantomImage('landing-hero')
  useEffect(() => { generateDemoHeatmap(base, 7, true).then(setHeat).catch(() => setHeat(undefined)) }, [base])
  return (
    <div className="card overflow-hidden shadow-[var(--shadow-pop)]" aria-label="Product preview (demo)">
      <div className="flex items-center justify-between border-b border-line bg-[#fafbfc] px-4 py-2.5">
        <span className="text-xs font-semibold text-navy-900">Study ST-8821 · Chest X-Ray</span>
        <span className="rounded bg-warn-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-warn-700">DEMO AI RESULT</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-line">
        {[{ src: base, label: 'Original' }, { src: heat ?? base, label: 'Simulated attention map' }].map((p) => (
          <figure key={p.label} className="relative bg-black">
            <img src={p.src} alt={`${p.label} — placeholder demo image`} className="aspect-[4/4.4] w-full object-cover" />
            <figcaption className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">{p.label}</figcaption>
          </figure>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 p-4">
        <div><p className="text-[10.5px] font-medium text-muted">AI Prediction</p><p className="mt-0.5 text-[13px] font-semibold text-navy-900">Abnormal Finding</p></div>
        <div><p className="text-[10.5px] font-medium text-muted">Confidence</p><p className="mt-0.5 text-[13px] font-semibold text-navy-900">91.4%</p></div>
        <div><p className="text-[10.5px] font-medium text-muted">Next step</p><p className="mt-0.5 text-[13px] font-semibold text-brand-700">Doctor review</p></div>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-muted md:flex" aria-label="Sections">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#imaging" className="hover:text-ink">Imaging</a>
            <a href="#explainable" className="hover:text-ink">Explainability</a>
            <a href="#security" className="hover:text-ink">Workflow</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link to="/login" className="btn btn-primary">Start Analysis</Link>
          </div>
        </div>
      </header>

      <section className="border-b border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-warn-700/25 bg-warn-50 px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-warn-700">
              <FlaskConical className="h-3 w-3" aria-hidden="true" />DEMO PROTOTYPE
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-navy-900 sm:text-5xl">
              AI-Assisted Medical Image Analysis
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
              Assist healthcare professionals with intelligent image screening, explainable AI, and structured clinical review.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="btn btn-primary btn-lg">Start Analysis <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <a href="#how" className="btn btn-secondary btn-lg">Explore Platform</a>
            </div>
            <p className="mt-6 max-w-lg text-[12.5px] leading-relaxed text-faint">
              Results in this prototype are simulated and are not medical diagnoses.
            </p>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-navy-900">How it works</h2>
        <p className="mt-2 max-w-2xl text-muted">A single, auditable path from image to reviewed report.</p>
        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="card relative p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></div>
                <span className="text-xs font-semibold text-faint">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-navy-900">{title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="imaging" className="scroll-mt-20 border-y border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-navy-900">Supported imaging</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Chest X-Ray is the primary supported workflow. Other modalities are interface-ready; model support depends on the configured model.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {MODALITIES.map(({ icon: Icon, name, ready }) => (
              <div key={name} className="card flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <p className="text-[14px] font-semibold text-navy-900">{name}</p>
                  <p className={`text-[12px] ${ready ? 'text-ok-700' : 'text-faint'}`}>{ready ? 'Primary workflow' : 'Interface-ready · model pending'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="explainable" className="mx-auto grid max-w-6xl scroll-mt-20 gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div className="card p-7">
          <Eye className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-navy-900">Explainable AI</h2>
          <p className="mt-2 leading-relaxed text-muted">
            The prototype provides visual attention / heatmap information to help healthcare professionals understand model behavior. In demo mode, the overlay is a clearly labelled simulation.
          </p>
        </div>
        <div className="rounded-xl bg-navy-900 p-7 text-white">
          <UserCheck className="h-6 w-6 text-brand-500" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Human review</h2>
          <p className="mt-2 text-2xl font-semibold leading-snug">AI assists. Healthcare professionals decide.</p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Every result separates the AI Prediction from the Doctor's Final Interpretation.
          </p>
        </div>
      </section>

      <section id="security" className="scroll-mt-20 border-y border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-navy-900">Secure workflow</h2>
          <p className="mt-2 max-w-2xl text-muted">Prototype representations of the controls a production deployment would require.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: KeyRound, t: 'Authentication', d: 'Simulated sign-in flow.' },
              { icon: ShieldCheck, t: 'Role-based access', d: 'Doctor, Radiologist, Administrator.' },
              { icon: Users, t: 'Patient records', d: 'Fictional demo records.' },
              { icon: ClipboardList, t: 'Audit history', d: 'Study and review history.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="card p-5">
                <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                <h3 className="mt-3 text-[14px] font-semibold text-navy-900">{t}</h3>
                <p className="mt-1 text-[13px] text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-navy-900">Technology</h2>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {TECH.map((t) => <span key={t} className="rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-medium text-ink">{t}</span>)}
        </div>
      </section>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-xl border border-warn-700/25 bg-warn-50 p-5">
            <p className="text-[11.5px] font-bold tracking-wider text-warn-700">DISCLAIMER</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#6b4a0d]">{DISCLAIMER_FULL}</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-faint">
            <Logo />
            <span>MedVision AI · College prototype · Demo data only</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
