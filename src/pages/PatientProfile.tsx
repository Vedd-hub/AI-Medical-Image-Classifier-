import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FilePlus2, ScanSearch, UserX } from 'lucide-react'
import { PageHeader, SectionTitle } from '../components/PageHeader'
import { ResultBadge, StatusBadge } from '../components/Badges'
import { EmptyState, DemoBadge } from '../components/Feedback'
import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/format'

export default function PatientProfile() {
  const { id } = useParams()
  const { patients, analyses } = useApp()
  const nav = useNavigate()
  const patient = patients.find((p) => p.id === id)

  if (!patient) {
    return (
      <div className="card"><EmptyState icon={<UserX className="h-6 w-6" />} title="Patient not found" body={`No demo record exists for ${id}.`}
        action={<Link to="/patients" className="btn btn-primary">Back to patients</Link>} /></div>
    )
  }
  const studies = analyses.filter((a) => a.patientId === patient.id)
  const pending = studies.filter((s) => s.reviewStatus !== 'Reviewed').length
  const info: [string, string][] = [['Patient ID', patient.id], ['Name', patient.name], ['Age', String(patient.age)], ['Gender', patient.gender], ['Contact', patient.contact || '—']]

  return (
    <>
      <Link to="/patients" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Patients</Link>
      <PageHeader title={patient.name} subtitle={`${patient.id} · ${patient.age} y · ${patient.gender}`}
        actions={<><DemoBadge /><button className="btn btn-primary" onClick={() => nav(`/analysis?patient=${patient.id}`)}><ScanSearch className="h-4 w-4" aria-hidden="true" />Start New Analysis</button></>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <SectionTitle>Patient Information</SectionTitle>
          <dl className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
            {info.map(([k, v]) => (<div key={k}><dt className="text-[11.5px] font-medium text-muted">{k}</dt><dd className="mt-0.5 text-sm font-medium text-ink">{v}</dd></div>))}
            <div className="sm:col-span-2"><dt className="text-[11.5px] font-medium text-muted">Notes</dt><dd className="mt-0.5 text-sm text-ink">{patient.notes || '—'}</dd></div>
          </dl>
        </section>
        <section className="card">
          <SectionTitle>Examination Summary</SectionTitle>
          <dl className="space-y-4 p-5">
            <div className="flex justify-between"><dt className="text-[13px] text-muted">Total studies</dt><dd className="text-sm font-semibold">{studies.length}</dd></div>
            <div className="flex justify-between"><dt className="text-[13px] text-muted">Last study</dt><dd className="text-sm font-semibold">{studies[0] ? formatDate(studies[0].date) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-[13px] text-muted">Pending reviews</dt><dd className="text-sm font-semibold">{pending}</dd></div>
          </dl>
        </section>
      </div>

      <section className="card mt-4 overflow-hidden">
        <SectionTitle>Examination History</SectionTitle>
        {studies.length === 0 ? (
          <EmptyState icon={<FilePlus2 className="h-6 w-6" />} title="No studies yet" body="Start a new analysis to add the first imaging study for this patient."
            action={<button className="btn btn-primary" onClick={() => nav(`/analysis?patient=${patient.id}`)}>Start New Analysis</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead><tr>{['Study ID', 'Modality', 'Date', 'AI Result', 'Doctor Review', 'Report'].map((h) => <th key={h} className="th" scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {studies.map((s) => (
                  <tr key={s.studyId} className="tr-hover cursor-pointer" onClick={() => nav(`/analysis/${s.studyId}`)}>
                    <td className="td font-medium text-navy-900">{s.studyId}</td>
                    <td className="td">{s.modality}</td>
                    <td className="td text-muted">{formatDate(s.date)}</td>
                    <td className="td"><ResultBadge label={s.resultLabel} /></td>
                    <td className="td"><StatusBadge status={s.reviewStatus} /></td>
                    <td className="td"><Link to={`/analysis/${s.studyId}`} onClick={(e) => e.stopPropagation()} className="text-brand-600 hover:underline">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
