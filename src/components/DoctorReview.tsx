import { useState } from 'react'
import { BadgeCheck, Bot, Stethoscope } from 'lucide-react'
import type { Analysis } from '../types'
import { ErrorNotice } from './Feedback'
import { StatusBadge } from './Badges'

export function DoctorReview({ a, readOnly, onSave }: {
  a: Analysis
  readOnly?: boolean
  onSave: (patch: { clinicalNotes: string; finalInterpretation: string }, finalize: boolean) => void
}) {
  const [notes, setNotes] = useState(a.clinicalNotes)
  const [final, setFinal] = useState(a.finalInterpretation)
  const [error, setError] = useState('')
  const reviewed = a.reviewStatus === 'Reviewed'

  const save = (finalize: boolean) => {
    if (finalize && !final.trim()) return setError("Enter the doctor's final interpretation before marking as reviewed.")
    setError('')
    onSave({ clinicalNotes: notes, finalInterpretation: final }, finalize)
  }

  return (
    <section className="card overflow-hidden border-l-4 !border-l-navy-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-900"><Stethoscope className="h-4 w-4" aria-hidden="true" />Doctor Review</h2>
        <StatusBadge status={a.reviewStatus} />
      </div>

      <div className="grid gap-px bg-line md:grid-cols-2">
        <div className="bg-[#fafbfc] p-5">
          <p className="flex items-center gap-1.5 text-[11.5px] font-bold tracking-wider text-muted"><Bot className="h-3.5 w-3.5" aria-hidden="true" />AI PREDICTION <span className="font-medium normal-case tracking-normal text-faint">{a.result.mode === 'real' ? '(model output)' : '(simulated)'}</span></p>
          <p className="mt-2 text-[15px] font-semibold text-ink">{a.result.prediction}</p>
          <p className="text-[12.5px] text-muted">Confidence {a.result.confidence.toFixed(1)}% · decision-support only</p>
        </div>
        <div className="bg-white p-5">
          <p className="flex items-center gap-1.5 text-[11.5px] font-bold tracking-wider text-navy-900"><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />DOCTOR'S FINAL INTERPRETATION</p>
          <p className="mt-2 text-[15px] font-semibold text-ink">{a.finalInterpretation ? (reviewed ? 'Recorded' : 'Draft saved') : 'Pending'}</p>
          <p className="text-[12.5px] text-muted">{a.reviewedBy ? `Reviewed by ${a.reviewedBy}` : 'Awaiting healthcare professional review'}</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {error && <ErrorNotice title={error} />}
        <div>
          <label className="label" htmlFor="notes">Clinical Notes</label>
          <textarea id="notes" rows={5} className="input" placeholder="Relevant history, observations, correlation with the AI output…" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readOnly} />
        </div>
        <div>
          <label className="label" htmlFor="final">Final Interpretation <span className="font-normal text-faint">(by the healthcare professional)</span></label>
          <textarea id="final" rows={5} className="input" placeholder="Your final interpretation of the study…" value={final} onChange={(e) => setFinal(e.target.value)} disabled={readOnly} />
        </div>
        {readOnly ? (
          <p className="text-[12.5px] text-muted">Read-only: the Administrator role cannot record clinical interpretations.</p>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <button className="btn btn-secondary" onClick={() => save(false)}>Save Draft</button>
            <button className="btn btn-primary" onClick={() => save(true)} disabled={reviewed && notes === a.clinicalNotes && final === a.finalInterpretation}>
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />{reviewed ? 'Update Review' : 'Mark as Reviewed'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
