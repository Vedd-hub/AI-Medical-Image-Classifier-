import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, FileText, FlaskConical, SearchX } from 'lucide-react'
import { PageHeader, SectionTitle } from '../components/PageHeader'
import { Stepper } from '../components/Stepper'
import { ImageViewer } from '../components/ImageViewer'
import { DoctorReview } from '../components/DoctorReview'
import { ReportPreview } from '../components/ReportPreview'
import { FindingCard, HeatmapViewer, ModelCard, PredictionCard, PriorityCard, ProbabilityChart } from '../components/ResultPanels'
import { EmptyState, ErrorNotice } from '../components/Feedback'
import { useApp } from '../context/AppContext'
import { useHeatmap } from '../hooks/useHeatmap'
import { downloadReportPdf } from '../services/reportPdf'
import { formatDateTime } from '../utils/format'

export default function AnalysisResultPage() {
  const { id } = useParams()
  const { analyses, patients, reports, user, updateAnalysis, addReport, toast } = useApp()
  const a = analyses.find((x) => x.studyId === id)
  const { base, heat, failed, isPlaceholder } = useHeatmap(a)
  const [showReport, setShowReport] = useState(false)
  const [reportError, setReportError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!a || !base) {
    return <div className="card"><EmptyState icon={<SearchX className="h-6 w-6" />} title="Analysis not found" body={`No study ${id} exists in this demo session.`}
      action={<Link to="/history" className="btn btn-primary">View history</Link>} /></div>
  }
  const patient = patients.find((p) => p.id === a.patientId)
  const hasReport = reports.some((r) => r.studyId === a.studyId)

  const onSave = (patch: { clinicalNotes: string; finalInterpretation: string }, finalize: boolean) => {
    updateAnalysis(a.studyId, {
      ...patch,
      reviewStatus: finalize ? 'Reviewed' : a.reviewStatus === 'Reviewed' ? 'Reviewed' : 'Draft',
      reviewedBy: finalize ? user?.name : a.reviewedBy,
    })
    toast('success', finalize ? 'Review saved and marked as reviewed.' : 'Draft saved.')
  }

  const generate = () => {
    setReportError('')
    try {
      if (!addReport(a.studyId)) throw new Error('Study record missing')
      setShowReport(true)
      toast('success', 'Report generated.')
    } catch {
      setReportError('The report could not be generated. Please try again.')
      toast('error', 'Report generation failed.')
    }
  }

  const download = async () => {
    setBusy(true); setReportError('')
    try {
      await downloadReportPdf(a, patient, heat ?? base)
      toast('success', 'Report downloaded.')
    } catch {
      setReportError('The PDF could not be created. Please try again.')
      toast('error', 'Report download failed.')
    } finally { setBusy(false) }
  }

  const step = showReport || hasReport ? 5 : 4

  return (
    <>
      <Link to="/history" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />History</Link>
      <PageHeader title={`Study ${a.studyId}`} subtitle={`${patient?.name ?? a.patientId} · ${a.patientId} · ${a.modality} · ${formatDateTime(a.date)}`} />
      <Stepper current={step} />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-warn-700/25 bg-warn-50 px-4 py-3" role="note">
        <FlaskConical className="h-[18px] w-[18px] shrink-0 text-warn-700" aria-hidden="true" />
        <p className="text-[12px] font-bold tracking-wider text-warn-700">DEMO AI RESULT</p>
        <p className="min-w-[240px] flex-1 text-[12.5px] leading-relaxed text-[#6b4a0d]">
          This prototype uses simulated AI results for demonstration purposes. Results are not medical diagnoses and must not be used as a substitute for professional medical judgment.
        </p>
      </div>

      <div className="space-y-5">
        <PredictionCard a={a} />

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="min-w-0">
            <ImageViewer src={base} alt={`Original ${a.modality}`} caption="Original Image" />
            <p className="mt-2 text-[12px] text-muted">
              {isPlaceholder ? 'Placeholder illustration for a fictional demo record — not a real medical image.' : a.fileName}
            </p>
          </div>
          <HeatmapViewer heat={heat} failed={failed} base={base} />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <ProbabilityChart normal={a.result.probabilities.normal} abnormal={a.result.probabilities.abnormal} />
            <FindingCard a={a} />
          </div>
          <div className="space-y-5">
            <PriorityCard a={a} />
            <ModelCard a={a} />
          </div>
        </div>

        <DoctorReview key={a.studyId + a.reviewStatus} a={a} readOnly={user?.role === 'Administrator'} onSave={onSave} />

        <section className="card">
          <SectionTitle>Report</SectionTitle>
          <div className="space-y-4 p-5">
            {reportError && <ErrorNotice title="Report error">{reportError}</ErrorNotice>}
            {a.reviewStatus !== 'Reviewed' && <p className="text-[12.5px] text-muted">This study has not been marked as reviewed. A report generated now will be a draft.</p>}
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={generate}><FileText className="h-4 w-4" aria-hidden="true" />{hasReport ? 'Regenerate Report' : 'Generate Report'}</button>
              {(showReport || hasReport) && <button className="btn btn-secondary" onClick={download} disabled={busy}><Download className="h-4 w-4" aria-hidden="true" />{busy ? 'Preparing PDF…' : 'Download PDF'}</button>}
              {hasReport && !showReport && <button className="btn btn-ghost" onClick={() => setShowReport(true)}>Preview report</button>}
            </div>
            {showReport && <ReportPreview a={a} patient={patient} base={base} heat={heat} />}
          </div>
        </section>
      </div>
    </>
  )
}
