import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Search, Check, CheckCircle2, XCircle, Play, ArrowLeft, Trash2, Info, Lock } from 'lucide-react'
import { PageHeader, SectionTitle } from '../components/PageHeader'
import { Stepper } from '../components/Stepper'
import { UploadZone } from '../components/UploadZone'
import { ImageViewer } from '../components/ImageViewer'
import { AnalysisProgress } from '../components/AnalysisProgress'
import { AddPatientModal } from '../components/AddPatientModal'
import { DemoBadge, EmptyState, ErrorNotice } from '../components/Feedback'
import { useApp } from '../context/AppContext'
import { MODALITIES, PENDING_NOTE } from '../data/constants'
import { inferenceMode } from '../services/aiService'
import { runInference } from '../services/aiService'
import { validateImage, type ImageValidation } from '../services/image'
import type { Analysis as AnalysisRecord, Modality, ResultLabel } from '../types'
import { formatBytes, formatDateTime } from '../utils/format'

interface Loaded { file: File; url: string; validation: ImageValidation; uploadedAt: string }

export default function Analysis() {
  const { user, patients, addAnalysis, nextStudyId, toast } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const preselect = params.get('patient')

  const [patientId, setPatientId] = useState<string | null>(patients.some((p) => p.id === preselect) ? preselect : null)
  const [step, setStep] = useState<1 | 2 | 3>(patientId ? 2 : 1)
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [patientError, setPatientError] = useState('')

  const [modality, setModality] = useState<Modality>('Chest X-Ray')
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [stage, setStage] = useState(0)
  const [stageProgress, setStageProgress] = useState(0)
  const [analysisError, setAnalysisError] = useState('')
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])

  const patient = patients.find((p) => p.id === patientId) ?? null
  const matches = useMemo(() => {
    const s = query.trim().toLowerCase()
    return patients.filter((p) => !s || p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s)).slice(0, 6)
  }, [patients, query])

  if (user?.role === 'Administrator') {
    return (
      <>
        <PageHeader title="Image Analysis" />
        <div className="card"><EmptyState icon={<Lock className="h-6 w-6" />} title="Not available for Administrator role"
          body="In this simulated role model, image analysis is performed by Doctors and Radiologists. Switch role at sign-in to try the workflow."
          action={<Link to="/history" className="btn btn-secondary">View analysis history</Link>} /></div>
      </>
    )
  }

  const goStep2 = () => {
    if (!patient) return setPatientError('Select a patient to continue.')
    setPatientError(''); setStep(2)
  }

  const handleFile = async (file: File) => {
    setUploadError(''); setUploading(true); setUploadProgress(0)
    if (loaded) URL.revokeObjectURL(loaded.url)
    setLoaded(null)
    let url = ''
    try {
      url = URL.createObjectURL(file)
      for (let i = 1; i <= 5; i++) { await new Promise((r) => setTimeout(r, 90)); if (!alive.current) return; setUploadProgress(i / 5) }
      const validation = await validateImage(file, url)
      if (!validation.ok) { URL.revokeObjectURL(url); setUploadError(validation.error ?? 'Unsupported image.'); toast('error', 'Image could not be used.'); return }
      setLoaded({ file, url, validation, uploadedAt: new Date().toISOString() })
      toast('success', `Image uploaded: ${file.name}`)
    } catch {
      if (url) URL.revokeObjectURL(url)
      setUploadError('Upload failed. Please try again with a different file.')
      toast('error', 'Upload failed.')
    } finally {
      if (alive.current) setUploading(false)
    }
  }

  const clearImage = () => { if (loaded) URL.revokeObjectURL(loaded.url); setLoaded(null); setUploadError('') }

  const run = async () => {
    if (!patient || !loaded) return
    setAnalysisError(''); setStep(3); setStage(0); setStageProgress(0)
    try {
      const result = await runInference(
        { imageUrl: loaded.url, file: loaded.file, modality },
        (s, p) => { if (alive.current) { setStage(s); setStageProgress(p) } },
      )
      if (!alive.current) return
      const label: ResultLabel = result.prediction.startsWith('Inconclusive') ? 'Needs Review' : result.probabilities.abnormal > result.probabilities.normal ? (result.confidence < 80 ? 'Needs Review' : 'Abnormal') : 'Normal'
      const rec: AnalysisRecord = {
        studyId: nextStudyId(), patientId: patient.id, modality, date: new Date().toISOString(),
        result, resultLabel: label, reviewStatus: 'Pending Review', clinicalNotes: '', finalInterpretation: '',
        imageUrl: loaded.url, fileName: loaded.file.name,
      }
      addAnalysis(rec)
      toast('success', `Analysis completed for ${rec.studyId}.`)
      nav(`/analysis/${rec.studyId}`)
    } catch (err) {
      if (!alive.current) return
      setAnalysisError(err instanceof Error ? err.message : 'The analysis could not be completed.')
      toast('error', 'Analysis failed.')
    }
  }

  const modalityPending = !MODALITIES.find((m) => m.name === modality)?.supported

  return (
    <>
      <PageHeader title="Image Analysis" subtitle={inferenceMode === 'real' ? 'Upload an image, run AI analysis, then review.' : 'Upload an image, run simulated AI analysis, then review.'} actions={inferenceMode === 'real' ? undefined : <DemoBadge />} />
      <Stepper current={step} />

      {step === 1 && (
        <section className="card">
          <SectionTitle aside={<button className="btn btn-secondary btn-sm" onClick={() => setAddOpen(true)}>Add patient</button>}>1 · Select patient</SectionTitle>
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            <div>
              <label className="label" htmlFor="pt-search">Search patients</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
                <input id="pt-search" className="input pl-9" placeholder="Name or patient ID" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <ul className="mt-3 space-y-1.5" aria-label="Matching patients">
                {matches.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => { setPatientId(p.id); setPatientError('') }} aria-pressed={p.id === patientId}
                      className={`flex w-full items-center justify-between rounded-[10px] border px-3 py-2.5 text-left transition-colors ${p.id === patientId ? 'border-navy-900 bg-brand-50' : 'border-line hover:border-[#b9c1cd] hover:bg-canvas'}`}>
                      <span><span className="block text-[13.5px] font-medium text-ink">{p.name}</span><span className="text-[12px] text-muted">{p.id} · {p.age} y · {p.gender}</span></span>
                      {p.id === patientId && <Check className="h-4 w-4 text-navy-900" aria-hidden="true" />}
                    </button>
                  </li>
                ))}
                {matches.length === 0 && <li className="rounded-lg bg-canvas px-3 py-4 text-center text-[13px] text-muted">No matching patients.</li>}
              </ul>
            </div>
            <div>
              <p className="label">Selected patient</p>
              {patient ? (
                <dl className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-[#fafbfc] p-4">
                  {([['Patient', patient.id], ['Name', patient.name], ['Age', String(patient.age)], ['Gender', patient.gender]] as const).map(([k, v]) => (
                    <div key={k}><dt className="text-[11.5px] text-muted">{k}</dt><dd className="mt-0.5 text-sm font-semibold text-ink">{v}</dd></div>
                  ))}
                </dl>
              ) : <div className="rounded-xl border border-dashed border-[#c5ccd6] p-6 text-center text-[13px] text-muted">No patient selected.</div>}
              {patientError && <div className="mt-3"><ErrorNotice title={patientError} /></div>}
              <button className="btn btn-primary mt-4" onClick={goStep2}>Continue</button>
            </div>
          </div>
        </section>
      )}

      {step === 2 && patient && (
        <div className="space-y-4">
          <section className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-[13px]"><span className="text-muted">Patient</span> <strong className="ml-1 text-navy-900">{patient.name}</strong> <span className="text-muted">· {patient.id} · {patient.age} y · {patient.gender}</span></p>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Change</button>
          </section>

          <section className="card">
            <SectionTitle>2 · Select modality</SectionTitle>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Imaging modality">
                {MODALITIES.map((m) => (
                  <button key={m.name} role="radio" aria-checked={modality === m.name} onClick={() => setModality(m.name)}
                    className={`rounded-[10px] border px-3 py-2.5 text-left transition-colors ${modality === m.name ? 'border-navy-900 bg-brand-50' : 'border-line hover:border-[#b9c1cd] hover:bg-canvas'}`}>
                    <span className="block text-[13px] font-medium text-ink">{m.name}</span>
                    <span className={`text-[11px] ${m.supported ? 'text-ok-700' : 'text-faint'}`}>{m.supported ? (inferenceMode === 'real' ? 'Model ready' : 'Primary') : 'Model pending'}</span>
                  </button>
                ))}
              </div>
              {modalityPending && (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-[12.5px] text-brand-700"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{PENDING_NOTE} {inferenceMode === 'real' ? 'Analysis is unavailable for this modality.' : 'Any output is illustrative only.'}</p>
              )}
            </div>
          </section>

          <section className="card">
            <SectionTitle>3 · Upload image</SectionTitle>
            <div className="p-5">
              {uploadError && <div className="mb-4"><ErrorNotice title="Image rejected">{uploadError}</ErrorNotice></div>}
              {!loaded && <UploadZone onFile={handleFile} busy={uploading} progress={uploadProgress} />}
              {loaded && (
                <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                  <ImageViewer src={loaded.url} alt={`Uploaded ${modality} for ${patient.name}`} caption={loaded.file.name} />
                  <div className="space-y-4">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-line p-4 text-[13px]">
                      {([
                        ['Filename', loaded.file.name], ['File size', formatBytes(loaded.file.size)], ['Modality', modality],
                        ['Dimensions', `${loaded.validation.width} × ${loaded.validation.height}`], ['Uploaded', formatDateTime(loaded.uploadedAt)],
                      ] as const).map(([k, v]) => (
                        <div key={k} className="min-w-0"><dt className="text-[11.5px] text-muted">{k}</dt><dd className="truncate font-medium text-ink" title={v}>{v}</dd></div>
                      ))}
                    </dl>
                    <div className="rounded-xl border border-line p-4">
                      <p className="mb-2 text-[12px] font-semibold text-muted">Image quality</p>
                      <ul className="space-y-1.5">
                        {loaded.validation.checks.map((c) => (
                          <li key={c.label} className="flex items-center gap-2 text-[13px]">
                            {c.pass ? <CheckCircle2 className="h-4 w-4 text-ok-700" aria-label="passed" /> : <XCircle className="h-4 w-4 text-alert-700" aria-label="failed" />}{c.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={clearImage}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Replace image</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11.5px] font-bold tracking-wider text-warn-700">{inferenceMode === 'real' ? 'AI-ASSISTED ANALYSIS' : 'DEMO AI MODE'}</p>
                <p className="mt-0.5 text-[13px] text-muted">{inferenceMode === 'real' ? 'Runs the trained model on the server. Output is a screening aid, not a diagnosis.' : 'This prototype uses simulated inference.'}</p>
              </div>
              <button className="btn btn-primary btn-lg" onClick={run} disabled={!loaded || (inferenceMode === 'real' && modalityPending)}><Play className="h-4 w-4" aria-hidden="true" />Run AI Analysis</button>
            </div>
            {!loaded && <p className="mt-3 text-[12px] text-faint">Upload a valid image to enable analysis.</p>}
          </section>
        </div>
      )}

      {step === 3 && (
        <section className="card p-6 sm:p-10">
          {analysisError ? (
            <div className="mx-auto max-w-md space-y-4">
              <ErrorNotice title="Analysis failed">{analysisError}</ErrorNotice>
              <div className="flex gap-2"><button className="btn btn-primary" onClick={run}>Retry</button><button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button></div>
            </div>
          ) : <AnalysisProgress stage={stage} stageProgress={stageProgress} />}
        </section>
      )}

      <AddPatientModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={(p) => { setPatientId(p.id); setPatientError('') }} />
    </>
  )
}
