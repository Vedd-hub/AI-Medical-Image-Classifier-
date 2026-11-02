import { Link, useNavigate } from 'react-router-dom'
import { ScanLine, Activity, Siren, ClipboardCheck, Plus, ShieldAlert } from 'lucide-react'
import { PageHeader, SectionTitle, StatCard } from '../components/PageHeader'
import { ActivityChart, ModalityChart, ResultDonut } from '../components/DashboardCharts'
import { RecentAnalysesTable } from '../components/AnalysesTable'
import { PriorityBadge } from '../components/Badges'
import { DemoBadge, EmptyState, Skeleton, TableSkeleton } from '../components/Feedback'
import { useApp } from '../context/AppContext'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { priorityCases, stats } from '../data/dashboardStats'
import { greeting } from '../utils/format'

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <Skeleton className="mb-2 h-8 w-72" /><Skeleton className="mb-8 h-4 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[118px]" />)}</div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3"><Skeleton className="h-80 lg:col-span-2" /><Skeleton className="h-80" /></div>
      <div className="card mt-6"><TableSkeleton /></div>
    </div>
  )
}

export default function Dashboard() {
  const { user, analyses } = useApp()
  const nav = useNavigate()
  const loading = useSimulatedLoad(600)
  if (loading) return <DashboardSkeleton />

  const lastName = (user?.name ?? '').split(' ').slice(-1)[0]
  const who = user?.role === 'Administrator' ? user.name : `Dr. ${lastName}`
  const recent = analyses.slice(0, 6)

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${who}`}
        subtitle="Here's today's imaging workflow overview."
        actions={<>
          <DemoBadge />
          <button className="btn btn-primary" onClick={() => nav('/analysis')}><Plus className="h-4 w-4" aria-hidden="true" />New Analysis</button>
        </>}
      />

      <p className="-mt-3 mb-5 text-[12px] text-faint">Figures below are fictional demo data, not real hospital statistics.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Scans" value={stats.totalScans} hint="Demo data" icon={<ScanLine className="h-4 w-4" />} />
        <StatCard label="Today's Analyses" value={stats.todayAnalyses} hint="Demo data" icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Priority Reviews" value={stats.priorityReviews} hint="AI-suggested, awaiting human review" icon={<Siren className="h-4 w-4" />} tone="alert" />
        <StatCard label="Pending Reviews" value={stats.pendingReviews} hint="Awaiting doctor interpretation" icon={<ClipboardCheck className="h-4 w-4" />} tone="warn" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <SectionTitle aside={<span className="text-xs text-faint">Last 7 days</span>}>Analysis Activity</SectionTitle>
          <div className="p-5"><ActivityChart /></div>
        </section>
        <section className="card">
          <SectionTitle>Result Distribution</SectionTitle>
          <div className="p-5"><ResultDonut /></div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <SectionTitle aside={<span className="text-xs text-faint">Suggestions only</span>}>AI Priority Screening</SectionTitle>
          <div className="divide-y divide-line">
            {priorityCases.map((c) => (
              <div key={c.studyId} className="flex flex-wrap items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={c.level} />
                    <span className="text-[13px] font-semibold text-navy-900">{c.level === 'Routine' ? 'Routine Review' : `${c.level} Review Suggested`}</span>
                    <span className="text-xs text-faint">{c.patientId} · {c.studyId}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-muted"><span className="font-medium text-ink">Reason:</span> {c.reason}</p>
                  <p className="text-[13px] text-muted"><span className="font-medium text-ink">Action:</span> {c.action}</p>
                </div>
                <Link className="btn btn-secondary btn-sm" to={`/analysis/${c.studyId}`}>Open study</Link>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 border-t border-line bg-[#fafbfc] px-5 py-3 text-[12px] text-muted">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            AI-assisted prioritization suggestion — not an emergency diagnosis.
          </div>
        </section>
        <section className="card">
          <SectionTitle>Modality Distribution</SectionTitle>
          <div className="p-5"><ModalityChart /></div>
        </section>
      </div>

      <section className="card mt-6 overflow-hidden">
        <SectionTitle aside={<Link to="/history" className="text-xs font-medium text-brand-600 hover:underline">View all history</Link>}>Recent Analyses</SectionTitle>
        {recent.length === 0
          ? <EmptyState icon={<ScanLine className="h-6 w-6" />} title="No analyses found" body="Once medical images are analyzed, your analysis history will appear here." action={<Link to="/analysis" className="btn btn-primary">Start Analysis</Link>} />
          : <RecentAnalysesTable rows={recent} />}
      </section>
    </>
  )
}
