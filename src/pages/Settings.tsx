import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { PageHeader, SectionTitle } from '../components/PageHeader'
import { ErrorNotice } from '../components/Feedback'
import { useApp } from '../context/AppContext'
import { ROLE_CAPABILITIES } from '../data/constants'
import { inferenceMode } from '../services/aiService'
import type { Role } from '../types'

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="card"><SectionTitle>{title}</SectionTitle><div className="space-y-4 p-5">{children}</div></section>
)

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-navy-900' : 'bg-[#cfd5de]'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, updateUser, logout, toast } = useApp()
  const nav = useNavigate()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<Role>(user?.role ?? 'Doctor')
  const [notify, setNotify] = useState(true)
  const [theme, setTheme] = useState('Light')
  const [lang, setLang] = useState('English')
  const [pw, setPw] = useState({ cur: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  const saveProfile = () => {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return toast('error', 'Enter a name and a valid email.')
    updateUser({ name: name.trim(), email, role })
    toast('success', 'Profile updated.')
  }
  const changePw = () => {
    if (pw.next.length < 8) return setPwError('New password must be at least 8 characters.')
    if (pw.next !== pw.confirm) return setPwError('Passwords do not match.')
    setPwError(''); setPw({ cur: '', next: '', confirm: '' })
    toast('success', 'Password updated (simulated).')
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Profile, preferences and prototype configuration." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Profile">
          <div><label className="label" htmlFor="s-name">Name</label><input id="s-name" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label" htmlFor="s-role">Role</label>
            <select id="s-role" className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>{(['Doctor', 'Radiologist', 'Administrator'] as Role[]).map((r) => <option key={r}>{r}</option>)}</select>
            <p className="mt-1.5 text-[12px] text-faint">Can: {ROLE_CAPABILITIES[role].join(' · ')}</p></div>
          <div><label className="label" htmlFor="s-email">Email</label><input id="s-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={saveProfile}>Save profile</button>
        </Card>

        <Card title="Preferences">
          <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium">Notifications</p><p className="text-[12px] text-muted">Show toast messages for workflow events.</p></div><Toggle on={notify} onChange={(v) => { setNotify(v); toast('info', `Notifications ${v ? 'enabled' : 'disabled'} (simulated).`) }} label="Notifications" /></div>
          <div><label className="label" htmlFor="s-theme">Theme</label><select id="s-theme" className="input" value={theme} onChange={(e) => { setTheme(e.target.value); toast('info', 'Theme selection is a prototype preference; the dark theme is not yet implemented.') }}><option>Light</option><option>Dark (coming soon)</option></select></div>
          <div><label className="label" htmlFor="s-lang">Language</label><select id="s-lang" className="input" value={lang} onChange={(e) => setLang(e.target.value)}><option>English</option><option>हिन्दी (coming soon)</option></select></div>
        </Card>

        <Card title="Security">
          <dl className="divide-y divide-line rounded-xl border border-line text-[13px]">
            {[['Session', 'Active (demo)'], ['Signed in as', user?.email ?? ''], ['Session storage', 'Browser tab only']].map(([k, v]) => <div key={k} className="flex justify-between px-4 py-2.5"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
          <p className="text-[12px] font-semibold text-muted">Change password (simulated)</p>
          {pwError && <ErrorNotice title={pwError} />}
          <input aria-label="Current password" type="password" className="input" placeholder="Current password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} autoComplete="current-password" />
          <input aria-label="New password" type="password" className="input" placeholder="New password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          <input aria-label="Confirm new password" type="password" className="input" placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-secondary" onClick={changePw}>Update password</button>
            <button className="btn btn-ghost" onClick={() => { logout(); nav('/login') }}><LogOut className="h-4 w-4" aria-hidden="true" />Logout</button>
          </div>
        </Card>

        <Card title="Prototype configuration">
          <dl className="divide-y divide-line rounded-xl border border-line text-[13px]">
            {[['Inference Mode', inferenceMode === 'demo' ? 'Demo' : 'Real'], ['Model', 'Demo Chest X-Ray Classifier'], ['Database', 'SQLite']].map(([k, v]) => <div key={k} className="flex justify-between px-4 py-2.5"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
          <p className="text-[12px] leading-relaxed text-faint">Set <code className="rounded bg-canvas px-1">VITE_INFERENCE_MODE</code> in <code className="rounded bg-canvas px-1">.env</code> to switch inference sources. Images are processed locally in your browser and are never uploaded to third-party services.</p>
        </Card>
      </div>
    </>
  )
}
