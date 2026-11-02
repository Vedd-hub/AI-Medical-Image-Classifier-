import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, FlaskConical } from 'lucide-react'
import { Logo } from '../components/Logo'
import { ErrorNotice } from '../components/Feedback'
import { useApp } from '../context/AppContext'
import type { Role } from '../types'
import { ROLE_CAPABILITIES } from '../data/constants'

const ROLES: Role[] = ['Doctor', 'Radiologist', 'Administrator']

export default function Login() {
  const { user, login, toast } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@medvision.ai')
  const [password, setPassword] = useState('demo-password')
  const [role, setRole] = useState<Role>('Doctor')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user && !busy) return <Navigate to="/dashboard" replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 4) return setError('Password must be at least 4 characters.')
    setBusy(true)
    setTimeout(() => {
      login(email, role)
      toast('success', `Signed in as ${role} (demo session).`)
      navigate('/dashboard')
    }, 700)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted">Access the MedVision AI demo workspace.</p>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            {error && <ErrorNotice title="Unable to sign in">{error}</ErrorNotice>}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={show ? 'text' : 'password'} className="input pr-10" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-faint hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <fieldset>
              <legend className="label">Role</legend>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <label key={r} className={`cursor-pointer rounded-[10px] border px-2 py-2 text-center text-[12.5px] font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600 ${role === r ? 'border-navy-900 bg-brand-50 text-navy-900' : 'border-[#cfd5de] text-muted hover:border-[#b9c1cd]'}`}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                    {r}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-faint">Can: {ROLE_CAPABILITIES[role].join(' · ')}</p>
            </fieldset>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={busy}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-warn-700/25 bg-warn-50 p-3.5" role="note">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" aria-hidden="true" />
            <p className="text-[12px] leading-relaxed text-[#6b4a0d]">
              <strong>Demo environment.</strong> Authentication is simulated. No real patient data should be entered.
            </p>
          </div>
          <Link to="/" className="mt-6 text-center text-[13px] text-muted hover:text-ink">← Back to home</Link>
        </div>
      </div>
      <aside className="hidden flex-col justify-center bg-navy-900 p-14 text-white lg:flex" aria-hidden="true">
        <p className="text-sm font-medium text-brand-500">AI-Assisted Medical Image Analysis</p>
        <p className="mt-4 max-w-md text-3xl font-semibold leading-snug tracking-tight">AI assists. Healthcare professionals decide.</p>
        <ol className="mt-10 max-w-md space-y-4 text-sm text-white/75">
          {['Medical image', 'AI analysis', 'Explainable result', 'Human medical review', 'Structured report'].map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/25 text-xs">{i + 1}</span>{s}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}
