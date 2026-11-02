import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye, FileText } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/Badges'
import { EmptyState, Modal, TableSkeleton } from '../components/Feedback'
import { ReportPreview } from '../components/ReportPreview'
import { useApp } from '../context/AppContext'
import { useHeatmap } from '../hooks/useHeatmap'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { downloadReportPdf } from '../services/reportPdf'
import { formatDateTime, hashString } from '../utils/format'
import { phantomImage } from '../services/phantom'
import { generateDemoHeatmap } from '../services/heatmap'

function ReportModal({ studyId, onClose }: { studyId: string | null; onClose: () => void }) {
  const { analyses, patients } = useApp()
  const a = analyses.find((x) => x.studyId === studyId)
  const { base, heat } = useHeatmap(a)
  return (
    <Modal open={!!studyId && !!a} onClose={onClose} title={`Report · ${studyId}`} width={780}>
      {a && base && <ReportPreview a={a} patient={patients.find((p) => p.id === a.patientId)} base={base} heat={heat} />}
    </Modal>
  )
}

export default function Reports() {
  const { reports, analyses, patients, toast } = useApp()
  const loading = useSimulatedLoad(450)
  const [view, setView] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const download = async (studyId: string, reportId: string) => {
    const a = analyses.find((x) => x.studyId === studyId)
    if (!a) return toast('error', 'Study record not found.')
    setBusy(reportId)
    try {
      const base = a.imageUrl ?? phantomImage(a.studyId)
      const heat = a.result.heatmapUrl ?? await generateDemoHeatmap(base, hashString(a.studyId), a.result.probabilities.abnormal > a.result.probabilities.normal)
      await downloadReportPdf(a, patients.find((p) => p.id === a.patientId), heat)
      toast('success', 'Report downloaded.')
    } catch {
      toast('error', 'Report download failed.')
    } finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader title="Reports" subtitle="Generated reports for reviewed and draft studies." />
      <div className="card overflow-hidden">
        {loading ? <TableSkeleton rows={5} cols={7} /> : reports.length === 0 ? (
          <EmptyState icon={<FileText className="h-6 w-6" />} title="No reports generated" body="Reports appear here once you generate them from an analysis result."
            action={<Link to="/analysis" className="btn btn-primary">Start Analysis</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead><tr>{['Report ID', 'Patient', 'Study', 'Generated', 'Reviewed By', 'Status', 'Actions'].map((h) => <th key={h} className="th" scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {reports.map((r) => {
                  const p = patients.find((x) => x.id === r.patientId)
                  return (
                    <tr key={r.id} className="tr-hover">
                      <td className="td font-medium text-navy-900">{r.id}</td>
                      <td className="td">{p?.name ?? r.patientId} <span className="text-faint">· {r.patientId}</span></td>
                      <td className="td"><Link className="text-brand-600 hover:underline" to={`/analysis/${r.studyId}`}>{r.studyId}</Link></td>
                      <td className="td text-muted">{formatDateTime(r.generatedAt)}</td>
                      <td className="td">{r.reviewedBy}</td>
                      <td className="td"><StatusBadge status={r.status} /></td>
                      <td className="td">
                        <div className="flex gap-2">
                          <button className="btn btn-secondary btn-sm" onClick={() => setView(r.studyId)}><Eye className="h-3.5 w-3.5" aria-hidden="true" />View Report</button>
                          <button className="btn btn-secondary btn-sm" disabled={busy === r.id} onClick={() => download(r.studyId, r.id)}><Download className="h-3.5 w-3.5" aria-hidden="true" />{busy === r.id ? 'Preparing…' : 'Download PDF'}</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ReportModal studyId={view} onClose={() => setView(null)} />
    </>
  )
}
