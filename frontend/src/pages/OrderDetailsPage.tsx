import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, apiData } from '../api/client'
import type { OrderDetails } from '../types/api'
import './OrderDetailsPage.css'

interface OrderRequestState {
  requestId: string
  order?: OrderDetails
  notFound?: boolean
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

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [retryKey, setRetryKey] = useState(0)
  const [result, setResult] = useState<OrderRequestState | null>(null)
  const requestId = `${id ?? ''}:${retryKey}`

  useEffect(() => {
    if (!id) return

    let active = true
    apiData<OrderDetails>(`/orders/${encodeURIComponent(id)}`)
      .then((order) => {
        if (active) setResult({ requestId, order })
      })
      .catch((reason: unknown) => {
        if (!active) return
        if (reason instanceof ApiError && reason.status === 404) {
          setResult({ requestId, notFound: true })
          return
        }
        setResult({
          requestId,
          error: reason instanceof Error ? reason.message : 'Could not load this order. Please try again.',
        })
      })

    return () => { active = false }
  }, [id, requestId])

  const order = result?.requestId === requestId ? result.order : undefined
  const notFound = result?.requestId === requestId && result.notFound
  const error = result?.requestId === requestId ? result.error : undefined
  const isLoading = !order && !notFound && !error

  if (notFound) {
    return (
      <div className="order-details-page page-content">
        <section className="error-state order-details-message" role="alert">
          <h1>Order not found</h1>
          <p>This order is unavailable or does not exist.</p>
          <Link className="button button-secondary" to="/orders">Back to your orders</Link>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="order-details-page page-content">
        <section className="error-state order-details-message" role="alert">
          <h1>Could not load order</h1>
          <p>{error}</p>
          <button className="button button-secondary" type="button" onClick={() => setRetryKey((key) => key + 1)}>Try again</button>
          <Link to="/orders">Back to your orders</Link>
        </section>
      </div>
    )
  }

  if (isLoading || !order) {
    return (
      <div className="order-details-page page-content">
        <div className="loading-state" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Loading order…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="order-details-page page-content">
      <Link className="order-details-back" to="/orders">← Back to your orders</Link>
      <header className="order-details-heading">
        <div><h1>Order #{order.id}</h1><p>{formatDate(order.created_at)}</p></div>
        <span className="badge">{order.payment_status}</span>
      </header>

      <section className="order-details-summary card" aria-label="Order summary">
        <span>Total</span>
        <strong>{formatPrice(order.total, order.currency)}</strong>
      </section>

      <section className="order-details-items" aria-labelledby="order-items-title">
        <h2 id="order-items-title">Purchased items</h2>
        {order.items.length === 0 ? (
          <div className="empty-state">This order has no item details.</div>
        ) : (
          order.items.map((item) => (
            <article className="order-detail-item card" key={item.id}>
              <div className="order-detail-copy">
                <h3>{item.product_title}</h3>
                <p>Seller: {item.seller_name}</p>
                <p>Quantity: 1</p>
                <p>Unit price: {formatPrice(item.unit_price, item.currency)}</p>
              </div>
              {order.payment_status === 'successful' && (
                <div className="order-detail-key">
                  <span>Delivered digital key</span>
                  <code>{item.digital_key ?? 'No key is attached to this item.'}</code>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  )
}
