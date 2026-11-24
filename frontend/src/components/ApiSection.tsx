import type { ReactNode } from 'react'

interface ApiSectionProps {
  title: string
  status: 'loading' | 'error' | 'empty' | 'ready'
  errorMessage?: string
  emptyMessage: string
  onRetry: () => void
  children: ReactNode
}

export default function ApiSection({
  title,
  status,
  errorMessage,
  emptyMessage,
  onRetry,
  children,
}: ApiSectionProps) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>
      {status === 'loading' && (
        <div className="loading-state" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Loading {title.toLowerCase()}…</span>
        </div>
      )}
      {status === 'empty' && <div className="empty-state">{emptyMessage}</div>}
      {status === 'error' && (
        <div className="error-state" role="alert">
          <p>{errorMessage || `Could not load ${title.toLowerCase()}.`}</p>
          <button className="button button-secondary" type="button" onClick={onRetry}>Try again</button>
        </div>
      )}
      {status === 'ready' && children}
    </section>
  )
}
