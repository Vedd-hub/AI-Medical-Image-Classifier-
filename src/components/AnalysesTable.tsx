import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Analysis } from '../types'
import { PriorityBadge, ResultBadge, StatusBadge } from './Badges'
import { formatDate } from '../utils/format'

/** Shared table for dashboard "Recent analyses". */
export function RecentAnalysesTable({ rows }: { rows: Analysis[] }) {
  const nav = useNavigate()
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr>
            {['Patient ID', 'Study ID', 'Modality', 'AI Result', 'Confidence', 'Priority', 'Status', 'Date', ''].map((h) => (
              <th key={h} className="th" scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.studyId} className="tr-hover cursor-pointer" onClick={() => nav(`/analysis/${a.studyId}`)}>
              <td className="td font-medium text-navy-900">{a.patientId}</td>
              <td className="td text-muted">{a.studyId}</td>
              <td className="td">{a.modality}</td>
              <td className="td"><ResultBadge label={a.resultLabel} text={a.result.prediction === 'Abnormal Finding' ? 'Abnormal Finding' : undefined} /></td>
              <td className="td tabular-nums">{a.result.confidence.toFixed(1)}%</td>
              <td className="td"><PriorityBadge priority={a.result.priority} /></td>
              <td className="td"><StatusBadge status={a.reviewStatus} /></td>
              <td className="td text-muted">{formatDate(a.date)}</td>
              <td className="td text-right">
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); nav(`/analysis/${a.studyId}`) }} aria-label={`View study ${a.studyId}`}>
                  View <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
