import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { History as HistoryIcon, Search } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge, ResultBadge, StatusBadge } from '../components/Badges'
import { EmptyState, TableSkeleton } from '../components/Feedback'
import { useApp } from '../context/AppContext'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { formatDate } from '../utils/format'

const sel = 'input !w-auto'

export default function HistoryPage() {
  const { analyses } = useApp()
  const nav = useNavigate()
  const loading = useSimulatedLoad(450)
  const [q, setQ] = useState('')
  const [result, setResult] = useState('All')
  const [modality, setModality] = useState('All')
  const [status, setStatus] = useState('All')
  const [from, setFrom] = useState('')

  const modalities = useMemo(() => ['All', ...Array.from(new Set(analyses.map((a) => a.modality)))], [analyses])
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return analyses.filter((a) =>
      (!s || a.studyId.toLowerCase().includes(s) || a.patientId.toLowerCase().includes(s)) &&
      (result === 'All' || a.resultLabel === result) &&
      (modality === 'All' || a.modality === modality) &&
      (status === 'All' || a.reviewStatus === status) &&
      (!from || a.date.slice(0, 10) >= from))
  }, [analyses, q, result, modality, status, from])

  const filtered = q || result !== 'All' || modality !== 'All' || status !== 'All' || from
  const reset = () => { setQ(''); setResult('All'); setModality('All'); setStatus('All'); setFrom('') }

  return (
    <>
      <PageHeader title="History" subtitle="All analyses in this demo environment." />
      <div className="card overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
            <input className="input pl-9" placeholder="Search study or patient ID" aria-label="Search history" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={sel} aria-label="Filter by result" value={result} onChange={(e) => setResult(e.target.value)}>{['All', 'Normal', 'Abnormal', 'Needs Review'].map((o) => <option key={o}>{o}</option>)}</select>
          <select className={sel} aria-label="Filter by modality" value={modality} onChange={(e) => setModality(e.target.value)}>{modalities.map((o) => <option key={o}>{o}</option>)}</select>
          <select className={sel} aria-label="Filter by review status" value={status} onChange={(e) => setStatus(e.target.value)}>{['All', 'Pending Review', 'Draft', 'Reviewed'].map((o) => <option key={o}>{o}</option>)}</select>
          <input type="date" className={sel} aria-label="Studies on or after date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        {loading ? <TableSkeleton rows={8} cols={8} /> : rows.length === 0 ? (
          <EmptyState icon={<HistoryIcon className="h-6 w-6" />} title="No analyses found"
            body={filtered ? 'No analyses match the current filters.' : 'Once medical images are analyzed, your analysis history will appear here.'}
            action={filtered ? <button className="btn btn-secondary" onClick={reset}>Clear filters</button> : <Link to="/analysis" className="btn btn-primary">Start Analysis</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead><tr>{['Study ID', 'Patient ID', 'Modality', 'AI Result', 'Confidence', 'Priority', 'Doctor Review', 'Date', ''].map((h) => <th key={h} className="th" scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.studyId} className="tr-hover cursor-pointer" onClick={() => nav(`/analysis/${a.studyId}`)}>
                    <td className="td font-medium text-navy-900">{a.studyId}</td>
                    <td className="td">{a.patientId}</td>
                    <td className="td">{a.modality}</td>
                    <td className="td"><ResultBadge label={a.resultLabel} /></td>
                    <td className="td tabular-nums">{a.result.confidence.toFixed(1)}%</td>
                    <td className="td"><PriorityBadge priority={a.result.priority} /></td>
                    <td className="td"><StatusBadge status={a.reviewStatus} /></td>
                    <td className="td text-muted">{formatDate(a.date)}</td>
                    <td className="td text-right"><Link to={`/analysis/${a.studyId}`} onClick={(e) => e.stopPropagation()} className="btn btn-secondary btn-sm">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
