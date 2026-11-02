import { useState, type FormEvent } from 'react'
import { Modal, ErrorNotice } from './Feedback'
import { useApp } from '../context/AppContext'
import type { Patient } from '../types'

export function AddPatientModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (p: Patient) => void }) {
  const { patients, addPatient, toast } = useApp()
  const nextId = () => `PT-${Math.max(1041, ...patients.map((p) => Number(p.id.replace('PT-', '')) || 0)) + 1}`
  const [form, setForm] = useState({ id: '', name: '', age: '', gender: 'Male', contact: '', notes: '' })
  const [error, setError] = useState('')
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const id = (form.id.trim() || nextId()).toUpperCase()
    const age = Number(form.age)
    if (!form.name.trim()) return setError('Patient name is required.')
    if (!Number.isFinite(age) || age < 0 || age > 120 || form.age === '') return setError('Enter a valid age between 0 and 120.')
    if (patients.some((p) => p.id === id)) return setError(`Patient ID ${id} already exists.`)
    const p = addPatient({ id, name: form.name.trim(), age, gender: form.gender as Patient['gender'], contact: form.contact.trim(), notes: form.notes.trim() })
    toast('success', `Patient ${p.id} created.`)
    setForm({ id: '', name: '', age: '', gender: 'Male', contact: '', notes: '' })
    setError('')
    onClose()
    onCreated?.(p)
  }

  return (
    <Modal open={open} onClose={onClose} title="Add patient" width={560}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <p className="rounded-lg bg-warn-50 px-3 py-2 text-[12px] font-medium text-warn-700">Demo data only — do not enter real patient information.</p>
        {error && <ErrorNotice title="Cannot create patient">{error}</ErrorNotice>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="ap-id">Patient ID</label><input id="ap-id" className="input" placeholder={nextId()} value={form.id} onChange={set('id')} /></div>
          <div><label className="label" htmlFor="ap-name">Name</label><input id="ap-name" className="input" value={form.name} onChange={set('name')} required /></div>
          <div><label className="label" htmlFor="ap-age">Age</label><input id="ap-age" type="number" min={0} max={120} className="input" value={form.age} onChange={set('age')} /></div>
          <div><label className="label" htmlFor="ap-gender">Gender</label>
            <select id="ap-gender" className="input" value={form.gender} onChange={set('gender')}><option>Male</option><option>Female</option><option>Other</option></select></div>
        </div>
        <div><label className="label" htmlFor="ap-contact">Contact</label><input id="ap-contact" className="input" value={form.contact} onChange={set('contact')} /></div>
        <div><label className="label" htmlFor="ap-notes">Notes</label><textarea id="ap-notes" rows={3} className="input" value={form.notes} onChange={set('notes')} /></div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create Patient</button>
        </div>
      </form>
    </Modal>
  )
}
