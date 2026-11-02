import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-lg font-semibold text-navy-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted">The demo hit an unexpected error. Reloading will reset the session.</p>
          <button className="btn btn-primary mt-5" onClick={() => window.location.assign('/dashboard')}>Reload</button>
        </div>
      </div>
    )
  }
}
