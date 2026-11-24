import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, apiRequest } from '../api/client'
import type { PaginatedOrders } from '../types/api'
import './OrderHistoryPage.css'

interface OrderListState {
  requestId: string
  response?: PaginatedOrders
  error?: string
}

function formatPrice(amount: string, currency: string) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return `${amount} ${currency}`

  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)
  } catch {
    return `${amount} ${currency}`
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function getErrorMessage(reason: unknown) {
  if (reason instanceof ApiError) return reason.message
  return reason instanceof Error ? reason.message : 'Could not load your orders. Please try again.'
}

export default function OrderHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [retryKey, setRetryKey] = useState(0)
  const [result, setResult] = useState<OrderListState | null>(null)
  const rawPage = Number(searchParams.get('page') ?? 1)
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const requestId = `${page}:${retryKey}`

  useEffect(() => {
    let active = true

    apiRequest<PaginatedOrders>(`/orders?page=${page}`)
      .then((response) => {
        if (active) setResult({ requestId, response })
      })
      .catch((reason: unknown) => {
        if (active) setResult({ requestId, error: getErrorMessage(reason) })
      })

    return () => { active = false }
  }, [page, requestId])

  function goToPage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextPage <= 1) nextParams.delete('page')
    else nextParams.set('page', String(nextPage))
    setSearchParams(nextParams)
  }

  const response = result?.requestId === requestId ? result.response : undefined
  const error = result?.requestId === requestId ? result.error : undefined
  const isLoading = !response && !error

  return (
    <div className="order-history-page page-content">
      <header className="order-history-heading">
        <div><h1>Your orders</h1><p>Review your past purchases and open an order for its delivery details.</p></div>
      </header>

      {isLoading && (
        <div className="loading-state" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <p>Loading your orders…</p>
        </div>
      )}

      {error && (
        <div className="error-state" role="alert">
          <p>{error}</p>
          <button className="button button-secondary" type="button" onClick={() => setRetryKey((key) => key + 1)}>Try again</button>
        </div>
      )}

      {response && response.data.length === 0 && (
        <section className="empty-state card">
          <h2>No orders yet</h2>
          <p>Your completed purchases will appear here.</p>
          <Link className="button button-primary" to="/store">Browse the store</Link>
        </section>
      )}

      {response && response.data.length > 0 && (
        <>
          <p className="order-history-count" aria-live="polite">{response.meta.total} {response.meta.total === 1 ? 'order' : 'orders'}</p>
          <div className="data-table-wrapper card">
            <table className="data-table">
              <thead>
                <tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Payment status</th><th scope="col">Total</th></tr>
              </thead>
              <tbody>
                {response.data.map((order) => (
                  <tr key={order.id}>
                    <td><Link className="order-history-link" to={`/orders/${order.id}`}>Order #{order.id}</Link></td>
                    <td>{formatDate(order.created_at)}</td>
                    <td><span className="badge">{order.payment_status}</span></td>
                    <td>{formatPrice(order.total, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="order-history-pagination" aria-label="Order history pages">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => goToPage(response.meta.current_page - 1)}
              disabled={!response.links.prev}
            >Previous</button>
            <span>Page {response.meta.current_page} of {Math.max(1, Math.ceil(response.meta.total / response.meta.per_page))}</span>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => goToPage(response.meta.current_page + 1)}
              disabled={!response.links.next}
            >Next</button>
          </nav>
        </>
      )}
    </div>
  )
}
