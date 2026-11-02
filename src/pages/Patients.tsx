import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, UserSearch } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/Badges'
import { EmptyState, TableSkeleton } from '../components/Feedback'
import { AddPatientModal } from '../components/AddPatientModal'
import { useApp } from '../context/AppContext'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { formatDate } from '../utils/format'

export default function Patients() {
  const { patients } = useApp()
  const nav = useNavigate()
  const loading = useSimulatedLoad(450)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [add, setAdd] = useState(false)

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return patients.filter((p) =>
      (status === 'All' || p.status === status) &&
      (!s || p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s)))
  }, [patients, q, status])

  return (
    <>
      <PageHeader title="Patients" subtitle="Fictional demo records — no real patient data."
        actions={<button className="btn btn-primary" onClick={() => setAdd(true)}><Plus className="h-4 w-4" aria-hidden="true" />Add Patient</button>} />
      <div className="card overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
            <input className="input pl-9" placeholder="Search by name or patient ID" aria-label="Search patients" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input !w-auto" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['All', 'Active', 'Follow-up', 'Discharged'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <TableSkeleton rows={7} cols={6} /> : rows.length === 0 ? (
          <EmptyState icon={<UserSearch className="h-6 w-6" />} title="No patients found" body="Try a different search or filter, or add a new demo patient."
            action={<button className="btn btn-primary" onClick={() => setAdd(true)}>Add Patient</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead><tr>{['Patient ID', 'Name', 'Age', 'Gender', 'Last Examination', 'Studies', 'Status', ''].map((h) => <th key={h} className="th" scope="col">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="tr-hover cursor-pointer" onClick={() => nav(`/patients/${p.id}`)}>
                    <td className="td font-medium text-navy-900">{p.id}</td>
                    <td className="td font-medium">{p.name}</td>
                    <td className="td">{p.age}</td>
                    <td className="td">{p.gender}</td>
                    <td className="td text-muted">{p.studies ? formatDate(p.lastExam) : '—'}</td>
                    <td className="td">{p.studies}</td>
                    <td className="td"><StatusBadge status={p.status} /></td>
                    <td className="td text-right">
                      <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); nav(`/patients/${p.id}`) }} aria-label={`Open ${p.name}`}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddPatientModal open={add} onClose={() => setAdd(false)} />
    </>
  )
}
