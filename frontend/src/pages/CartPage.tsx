import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, apiData } from '../api/client'
import { useCart, type CartItem } from '../cart/CartProvider'
import type { Product, ProductOffer } from '../types/api'
import './CartPage.css'

type ProductLookup =
  | { kind: 'ready'; product: Product }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string }

interface CartLookupState {
  requestId: string
  bySlug: Record<string, ProductLookup>
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

function currentOffer(lookup: ProductLookup | undefined, item: CartItem): ProductOffer | undefined {
  if (lookup?.kind !== 'ready') return undefined
  return lookup.product.offers?.find((offer) => offer.id === item.offerId)
}

function CartQuantityControls({ item, title, canIncrease, onDecrease, onIncrease }: {
  item: CartItem
  title: string
  canIncrease: boolean
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="cart-quantity" aria-label={`Quantity: ${item.quantity}`}>
      <button
        className="button button-secondary"
        type="button"
        aria-label={`Decrease ${title} quantity`}
        disabled={item.quantity <= 1}
        onClick={onDecrease}
      >−</button>
      <span>{item.quantity}</span>
      <button
        className="button button-secondary"
        type="button"
        aria-label={`Increase ${title} quantity`}
        disabled={!canIncrease}
        onClick={onIncrease}
      >+</button>
    </div>
  )
}

function CartItemRow({ item, lookup, offer, onDecrease, onIncrease, onRemove }: {
  item: CartItem
  lookup: ProductLookup | undefined
  offer: ProductOffer | undefined
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
}) {
  const isUnavailable = lookup?.kind === 'not-found' || (lookup?.kind === 'ready' && !offer)

  if (lookup?.kind === 'error') {
    return (
      <article className="cart-item card cart-item-error">
        <div>
          <h2>Could not refresh item details</h2>
          <p>{lookup.message}</p>
          <p className="cart-item-reference">Product reference: {item.productSlug}</p>
        </div>
        <div className="cart-item-actions">
          <CartQuantityControls item={item} title={item.productSlug} canIncrease onDecrease={onDecrease} onIncrease={onIncrease} />
          <button className="cart-remove-button" type="button" onClick={onRemove}>Remove</button>
        </div>
      </article>
    )
  }

  if (lookup?.kind === 'not-found') {
    return (
      <article className="cart-item card cart-item-unavailable">
        <div className="cart-item-details">
          <h2>Product is no longer available</h2>
          <p className="cart-item-reference">Product reference: {item.productSlug}</p>
          <p className="cart-warning" role="status">This product could not be found. Remove it from your cart.</p>
        </div>
        <div className="cart-item-actions">
          <CartQuantityControls item={item} title={item.productSlug} canIncrease={false} onDecrease={onDecrease} onIncrease={onIncrease} />
          <button className="cart-remove-button" type="button" onClick={onRemove}>Remove</button>
        </div>
      </article>
    )
  }

  if (lookup?.kind !== 'ready') {
    return (
      <article className="cart-item card cart-item-pending" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <p>Refreshing current offer for {item.productSlug}…</p>
        <div className="cart-item-actions">
          <CartQuantityControls item={item} title={item.productSlug} canIncrease onDecrease={onDecrease} onIncrease={onIncrease} />
          <button className="cart-remove-button" type="button" onClick={onRemove}>Remove</button>
        </div>
      </article>
    )
  }

  const product = lookup.product
  return (
    <article className={`cart-item card${isUnavailable ? ' cart-item-unavailable' : ''}`}>
      <img className="cart-item-image" src={product.image_url} alt={product.title} />
      <div className="cart-item-details">
        <h2><Link to={`/products/${product.slug}`}>{product.title}</Link></h2>
        {offer ? (
          <>
            <p className="cart-item-meta">{offer.seller.name}</p>
            <p className="cart-item-meta">{offer.platform.name} · {offer.region.name} ({offer.region.code})</p>
            <p className="cart-item-price">{formatPrice(Number(offer.price), offer.currency)} each</p>
          </>
        ) : (
          <p className="cart-warning" role="status">This offer is no longer active or available. Remove it or select another offer.</p>
        )}
      </div>
      <div className="cart-item-actions">
        <CartQuantityControls item={item} title={product.title} canIncrease={!isUnavailable} onDecrease={onDecrease} onIncrease={onIncrease} />
        <button className="cart-remove-button" type="button" onClick={onRemove}>Remove</button>
      </div>
    </article>
  )
}

export default function CartPage() {
  const { items, totalQuantity, setQuantity, removeOffer, clearCart } = useCart()
  const [refreshKey, setRefreshKey] = useState(0)
  const [lookupState, setLookupState] = useState<CartLookupState | null>(null)
  const productSlugs = [...new Set(items.map((item) => item.productSlug))].sort()
  const slugKey = JSON.stringify(productSlugs)
  const requestId = `${slugKey}:${refreshKey}`

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
        const message = reason instanceof Error ? reason.message : 'Could not load current product details.'
        return [slug, { kind: 'error', message }]
      }
    })

    Promise.all(lookups).then((entries) => {
      if (active) setLookupState({ requestId, bySlug: Object.fromEntries(entries) })
    })

    return () => { active = false }
  }, [slugKey, requestId])

  if (items.length === 0) {
    return (
      <div className="cart-page page-content">
        <header className="cart-heading"><h1>Your cart</h1></header>
        <section className="empty-state card">
          <h2>Your cart is empty</h2>
          <p>Browse the catalog and add a seller offer to get started.</p>
          <Link className="button button-primary" to="/store">Browse the store</Link>
        </section>
      </div>
    )
  }

  const lookupIsCurrent = lookupState?.requestId === requestId
  const lookups = lookupIsCurrent ? lookupState.bySlug : {}
  const hasTemporaryErrors = Object.values(lookups).some((lookup) => lookup.kind === 'error')
  const hasUnavailableItems = items.some((item) => {
    const lookup = lookups[item.productSlug]
    return lookup?.kind === 'not-found' || (lookup?.kind === 'ready' && !currentOffer(lookup, item))
  })
  const currencyTotals = new Map<string, number>()

  for (const item of items) {
    const offer = currentOffer(lookups[item.productSlug], item)
    const unitPrice = offer ? Number(offer.price) : Number.NaN
    if (offer && Number.isFinite(unitPrice)) {
      currencyTotals.set(offer.currency, (currencyTotals.get(offer.currency) ?? 0) + unitPrice * item.quantity)
    }
  }

  function getLookup(item: CartItem) {
    return lookups[item.productSlug]
  }

  return (
    <div className="cart-page page-content">
      <header className="cart-heading">
        <div><h1>Your cart</h1><p>{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}</p></div>
        <button className="button button-outline" type="button" onClick={clearCart}>Clear cart</button>
      </header>

      {hasTemporaryErrors && (
        <div className="error-state cart-refresh-error" role="alert">
          <p>Some current offer details could not be loaded. Those items remain saved in your cart.</p>
          <button className="button button-secondary" type="button" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button>
        </div>
      )}

      <div className="cart-layout">
        <section className="cart-items" aria-label="Cart items">
          {items.map((item) => {
            const lookup = getLookup(item)
            const offer = currentOffer(lookup, item)
            return (
              <CartItemRow
                key={item.offerId}
                item={item}
                lookup={lookup}
                offer={offer}
                onDecrease={() => setQuantity(item.offerId, item.quantity - 1)}
                onIncrease={() => setQuantity(item.offerId, item.quantity + 1)}
                onRemove={() => removeOffer(item.offerId)}
              />
            )
          })}
        </section>

        <aside className="cart-summary card">
          <h2>Order summary</h2>
          {currencyTotals.size === 0 ? (
            <p className="cart-summary-message">Current totals will appear when active offer details are available.</p>
          ) : (
            <>
              {[...currencyTotals.entries()].map(([currency, subtotal]) => (
                <div className="cart-total-group" key={currency}>
                  <div><span>Subtotal{currencyTotals.size > 1 ? ` (${currency})` : ''}</span><strong>{formatPrice(subtotal, currency)}</strong></div>
                  <div className="cart-total"><span>Total{currencyTotals.size > 1 ? ` (${currency})` : ''}</span><strong>{formatPrice(subtotal, currency)}</strong></div>
                </div>
              ))}
              {hasUnavailableItems && <p className="cart-summary-message">Unavailable offers are excluded from these totals.</p>}
              {hasTemporaryErrors && <p className="cart-summary-message">Totals exclude items whose current offer details could not be loaded.</p>}
              <p className="cart-summary-message">Offer availability is validated again during checkout.</p>
            </>
          )}
          <Link className="button button-primary cart-checkout-link" to="/checkout">Proceed to Checkout</Link>
          <Link className="button button-outline cart-continue-link" to="/store">Continue shopping</Link>
        </aside>
      </div>
    </div>
  )
}
