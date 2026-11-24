import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ApiError, apiData } from '../api/client'
import { useCart, type CartItem } from '../cart/CartProvider'
import type { CheckoutRequest, CheckoutResponse, Product, ProductOffer } from '../types/api'
import './CheckoutPage.css'

type ProductLookup =
  | { kind: 'ready'; product: Product }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string }

interface LookupState {
  requestId: string
  bySlug: Record<string, ProductLookup>
}

interface CheckoutFailure {
  message: string
  requiresLogin: boolean
}

function formatPrice(amount: string | number, currency: string) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return `${amount} ${currency}`

  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)
  } catch {
    return `${amount} ${currency}`
  }
}

function findOffer(lookup: ProductLookup | undefined, item: CartItem): ProductOffer | undefined {
  if (lookup?.kind !== 'ready') return undefined
  return lookup.product.offers?.find((offer) => offer.id === item.offerId)
}

function getFailure(reason: unknown): CheckoutFailure {
  if (reason instanceof ApiError) {
    const validationMessages = Object.values(reason.errors ?? {}).flat()
    return {
      message: [reason.message, ...validationMessages].filter(Boolean).join(' '),
      requiresLogin: reason.status === 401,
    }
  }

  return {
    message: reason instanceof Error ? reason.message : 'Checkout could not be completed. Please try again.',
    requiresLogin: false,
  }
}

function CheckoutItemRow({ item, lookup, isLoading }: {
  item: CartItem
  lookup: ProductLookup | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <article className="checkout-item card" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <div><h2>Loading current item details…</h2><p>{item.productSlug} · Quantity: {item.quantity}</p></div>
      </article>
    )
  }

  if (lookup?.kind === 'error') {
    return (
      <article className="checkout-item card checkout-item-warning">
        <div><h2>Could not refresh item details</h2><p>{lookup.message}</p><p>{item.productSlug} · Quantity: {item.quantity}</p></div>
      </article>
    )
  }

  if (lookup?.kind === 'not-found') {
    return (
      <article className="checkout-item card checkout-item-warning">
        <div><h2>Product is unavailable</h2><p>{item.productSlug} · Quantity: {item.quantity}</p><p>This cart entry is preserved. Return to your cart to remove or replace it.</p></div>
      </article>
    )
  }

  if (lookup?.kind !== 'ready') return null

  const { product } = lookup
  const offer = findOffer(lookup, item)

  return (
    <article className={`checkout-item card${offer ? '' : ' checkout-item-warning'}`}>
      <img className="checkout-item-image" src={product.image_url} alt={product.title} />
      <div className="checkout-item-details">
        <h2><Link to={`/products/${product.slug}`}>{product.title}</Link></h2>
        {offer ? (
          <>
            <p>{offer.seller.name}</p>
            <p>{offer.platform.name} · {offer.region.name}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Unit price: {formatPrice(offer.price, offer.currency)}</p>
            <p className="checkout-item-subtotal">Subtotal: {formatPrice(Number(offer.price) * item.quantity, offer.currency)}</p>
          </>
        ) : (
          <p role="status">This offer is no longer active or available. Your cart entry is preserved; return to your cart to make changes.</p>
        )}
      </div>
    </article>
  )
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const location = useLocation()
  const [retryKey, setRetryKey] = useState(0)
  const [lookupState, setLookupState] = useState<LookupState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failure, setFailure] = useState<CheckoutFailure | null>(null)
  const [order, setOrder] = useState<CheckoutResponse | null>(null)
  const submissionInFlight = useRef(false)
  const productSlugs = [...new Set(items.map((item) => item.productSlug))].sort()
  const slugKey = JSON.stringify(productSlugs)
  const requestId = `${slugKey}:${retryKey}`

  useEffect(() => {
    const slugsForRequest = JSON.parse(slugKey) as string[]
    if (slugsForRequest.length === 0) return

    let active = true
    const lookups = slugsForRequest.map(async (slug): Promise<[string, ProductLookup]> => {
      try {
        const product = await apiData<Product>(`/products/${encodeURIComponent(slug)}`)
        return [slug, { kind: 'ready', product }]
      } catch (reason) {
        if (reason instanceof ApiError && reason.status === 404) return [slug, { kind: 'not-found' }]
        return [slug, {
          kind: 'error',
          message: reason instanceof Error ? reason.message : 'Could not load current product details.',
        }]
      }
    })

    Promise.all(lookups).then((entries) => {
      if (active) setLookupState({ requestId, bySlug: Object.fromEntries(entries) })
    })

    return () => { active = false }
  }, [slugKey, requestId])

  if (order) {
    return (
      <div className="checkout-page page-content">
        <section className="checkout-confirmation card" role="status">
          <h1>Order placed</h1>
          <p>Order #{order.id} · {order.payment_status}</p>
          <p>Total: {formatPrice(order.total, order.currency)}</p>
          <p>Placed: {new Date(order.created_at).toLocaleString()}</p>
          <h2>Delivered digital keys</h2>
          <ul className="checkout-delivered-keys">
            {order.items.map((item) => (
              <li key={item.id}>
                <strong>{item.product_title}</strong> · {item.seller_name} · {formatPrice(item.unit_price, item.currency)}
                <code>{item.digital_key ?? 'No key was returned for this item.'}</code>
              </li>
            ))}
          </ul>
          <Link className="button button-primary" to="/">Continue shopping</Link>
        </section>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page page-content">
        <header className="checkout-heading"><h1>Checkout</h1></header>
        <section className="empty-state card">
          <h2>Your cart is empty</h2>
          <p>Add an offer before continuing to checkout.</p>
          <Link className="button button-primary" to="/store">Browse the store</Link>
        </section>
      </div>
    )
  }

  const lookupIsCurrent = lookupState?.requestId === requestId
  const lookups = lookupIsCurrent ? lookupState.bySlug : {}
  const isLoading = !lookupIsCurrent
  const hasLookupErrors = Object.values(lookups).some((lookup) => lookup.kind === 'error')
  const hasUnavailableOffers = items.some((item) => {
    const lookup = lookups[item.productSlug]
    return lookup?.kind === 'not-found' || (lookup?.kind === 'ready' && !findOffer(lookup, item))
  })
  const currentOffers = items
    .map((item) => findOffer(lookups[item.productSlug], item))
    .filter((offer): offer is ProductOffer => offer !== undefined)
  const currencies = new Set(currentOffers.map((offer) => offer.currency))
  const currencyTotals = new Map<string, number>()
  let hasInvalidPrice = false

  for (const item of items) {
    const offer = findOffer(lookups[item.productSlug], item)
    if (!offer) continue
    const unitPrice = Number(offer.price)
    if (!Number.isFinite(unitPrice)) {
      hasInvalidPrice = true
      continue
    }
    currencyTotals.set(offer.currency, (currencyTotals.get(offer.currency) ?? 0) + unitPrice * item.quantity)
  }

  const hasMixedCurrencies = currencies.size > 1
  const canSubmit = !isLoading && !hasLookupErrors && !hasUnavailableOffers && !hasInvalidPrice &&
    !hasMixedCurrencies && currencies.size === 1 && !isSubmitting

  async function placeOrder() {
    if (!canSubmit || submissionInFlight.current) return
    submissionInFlight.current = true
    setIsSubmitting(true)
    setFailure(null)

    const request: CheckoutRequest = {
      items: items.map((item) => ({ offer_id: item.offerId, quantity: item.quantity })),
    }

    try {
      const completedOrder = await apiData<CheckoutResponse>('/checkout', {
        method: 'POST',
        body: JSON.stringify(request),
      })
      setOrder(completedOrder)
      clearCart()
    } catch (reason) {
      setFailure(getFailure(reason))
    } finally {
      submissionInFlight.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="checkout-page page-content">
      <header className="checkout-heading">
        <div><h1>Checkout</h1><p>Review your items before placing the order.</p></div>
        <Link className="button button-outline" to="/cart">Return to cart</Link>
      </header>

      {isLoading && <div className="loading-state" role="status"><span className="loading-spinner" aria-hidden="true" /><p>Loading current product and offer details…</p></div>}

      {hasLookupErrors && (
        <div className="error-state checkout-error" role="alert">
          <p>Some current item details could not be loaded. Your cart has been kept unchanged.</p>
          <button className="button button-secondary" type="button" onClick={() => setRetryKey((key) => key + 1)}>Retry loading items</button>
        </div>
      )}

      {hasUnavailableOffers && (
        <div className="checkout-warning" role="status">
          One or more offers are no longer available. Your cart is unchanged; return to it to remove or replace those offers.
        </div>
      )}

      {hasInvalidPrice && <div className="checkout-warning" role="alert">A current offer price could not be read. Retry loading before placing the order.</div>}

      <div className="checkout-layout">
        <section className="checkout-items" aria-label="Items to purchase">
          {items.map((item) => (
            <CheckoutItemRow
              key={item.offerId}
              item={item}
              lookup={lookups[item.productSlug]}
              isLoading={isLoading}
            />
          ))}
        </section>

        <aside className="checkout-summary card">
          <h2>Order summary</h2>
          {currencyTotals.size === 0 ? (
            <p>Current totals will appear when offer details are available.</p>
          ) : [...currencyTotals.entries()].map(([currency, total]) => (
            <div className="checkout-total" key={currency}>
              <span>Subtotal · {currency}</span><strong>{formatPrice(total, currency)}</strong>
              <span>Total · {currency}</span><strong>{formatPrice(total, currency)}</strong>
            </div>
          ))}

          {hasMixedCurrencies && (
            <p className="checkout-warning" role="alert">
              The backend requires one currency per order. Return to your cart and remove offers in other currencies before checkout.
            </p>
          )}

          {failure && (
            <div className="checkout-error" role="alert">
              <p>{failure.message}</p>
              {failure.requiresLogin && <Link to="/login" state={{ from: location }}>Log in to continue checkout</Link>}
            </div>
          )}

          <button className="button button-primary checkout-submit" type="button" onClick={() => void placeOrder()} disabled={!canSubmit || order !== null}>
            {isSubmitting ? 'Placing order…' : 'Place Order'}
          </button>
          <p className="checkout-payment-note">Payment is simulated. Current prices and availability are confirmed by the backend.</p>
        </aside>
      </div>
    </div>
  )
}
