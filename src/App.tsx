import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { ToastViewport } from './components/Feedback'
import Landing from './pages/Landing'
import Login from './pages/Login'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Patients = lazy(() => import('./pages/Patients'))
const PatientProfile = lazy(() => import('./pages/PatientProfile'))
const Analysis = lazy(() => import('./pages/Analysis'))
const AnalysisResultPage = lazy(() => import('./pages/AnalysisResult'))
const Reports = lazy(() => import('./pages/Reports'))
const HistoryPage = lazy(() => import('./pages/History'))
const ModelInfo = lazy(() => import('./pages/ModelInfo'))
const SettingsPage = lazy(() => import('./pages/Settings'))

export default function App() {
  return (
    <>
      <Suspense fallback={<div className="p-8 text-sm text-muted" role="status">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientProfile />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/analysis/:id" element={<AnalysisResultPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/model" element={<ModelInfo />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastViewport />
    </>
  )
}
