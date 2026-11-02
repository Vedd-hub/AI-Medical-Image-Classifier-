import { useState } from 'react'
import { Menu, FlaskConical } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Modal } from './Feedback'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user } = useApp()
  const [info, setInfo] = useState(false)
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
      <button className="btn btn-secondary btn-sm !px-2 lg:hidden" onClick={onMenu} aria-label="Open navigation menu">
        <Menu className="h-4 w-4" />
      </button>
      <button
        onClick={() => setInfo(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-warn-700/25 bg-warn-50 px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-warn-700 transition-colors hover:bg-[#f7ebcd]"
        aria-label="Demo environment information"
      >
        <FlaskConical className="h-3 w-3" aria-hidden="true" />DEMO ENVIRONMENT
      </button>
      <div className="ml-auto hidden text-right sm:block">
        <p className="text-[12.5px] font-semibold leading-tight text-ink">{user?.name}</p>
        <p className="text-[11px] text-muted">{user?.role}</p>
      </div>
      <Modal open={info} onClose={() => setInfo(false)} title="Demo environment" width={440}>
        <p className="text-sm leading-relaxed text-muted">
          This environment contains fictional patient records and simulated AI results. Do not enter real patient data.
        </p>
        <div className="mt-5 flex justify-end"><button className="btn btn-primary" onClick={() => setInfo(false)}>Understood</button></div>
      </Modal>
    </header>
  )
}
