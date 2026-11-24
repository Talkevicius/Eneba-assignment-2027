import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, apiData } from '../api/client'
import { useCart } from '../cart/CartProvider'
import type { Product, ProductOffer } from '../types/api'
import './ProductDetailsPage.css'

interface ProductRequestState {
  requestId: string
  product?: Product
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

function getDiscount(offer: ProductOffer) {
  if (offer.original_price === null) return null
  const original = Number(offer.original_price)
  const current = Number(offer.price)
  if (!Number.isFinite(original) || !Number.isFinite(current) || original <= current || original <= 0) return null
  return Math.round(((original - current) / original) * 100)
}

function OfferOption({ offer, selected, onSelect }: {
  offer: ProductOffer
  selected: boolean
  onSelect: () => void
}) {
  const discount = getDiscount(offer)

  return (
    <button
      className={`offer-option card${selected ? ' offer-option-selected' : ''}`}
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="offer-option-details">
        <span className="offer-seller-name">{offer.seller.name}</span>
        {offer.seller.rating !== null && <span className="offer-meta">Seller rating {offer.seller.rating}</span>}
        <span className="offer-meta">{offer.platform.name} · {offer.region.name} ({offer.region.code})</span>
      </span>
      <span className="offer-option-pricing">
        <span className="offer-current-price">{formatPrice(offer.price, offer.currency)}</span>
        {offer.original_price !== null && (
          <span className="offer-original-price">{formatPrice(offer.original_price, offer.currency)}</span>
        )}
        {discount !== null && <span className="product-discount">-{discount}%</span>}
      </span>
    </button>
  )
}

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [retryKey, setRetryKey] = useState(0)
  const [result, setResult] = useState<ProductRequestState | null>(null)
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null)
  const { addOffer } = useCart()
  const requestId = `${slug ?? ''}:${retryKey}`

  useEffect(() => {
    if (!slug) return

    let active = true
    apiData<Product>(`/products/${encodeURIComponent(slug)}`)
      .then((product) => {
        if (active) setResult({ requestId, product })
      })
      .catch((reason: unknown) => {
        if (!active) return
        if (reason instanceof ApiError && reason.status === 404) {
          setResult({ requestId, notFound: true })
        } else {
          setResult({
            requestId,
            error: reason instanceof Error ? reason.message : 'Could not load this product. Please try again.',
          })
        }
      })

    return () => { active = false }
  }, [slug, requestId])

  const product = result?.requestId === requestId ? result.product : undefined
  const requestError = result?.requestId === requestId ? result.error : undefined
  const notFound = result?.requestId === requestId && result.notFound
  const offers = product?.offers ?? []
  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) ?? offers[0] ?? null
  const canAddToCart = selectedOffer !== null && offers.some((offer) => offer.id === selectedOffer.id)
  const isLoading = !product && !requestError && !notFound

  if (notFound) {
    return (
      <div className="product-details-page">
        <section className="error-state product-details-message" role="alert">
          <h1>Product not found</h1>
          <p>This product could not be found.</p>
          <Link className="button button-secondary" to="/store">Back to store</Link>
        </section>
      </div>
    )
  }

  if (requestError) {
    return (
      <div className="product-details-page">
        <section className="error-state product-details-message" role="alert">
          <h1>Could not load product</h1>
          <p>{requestError}</p>
          <button className="button button-secondary" type="button" onClick={() => setRetryKey((key) => key + 1)}>
            Try again
          </button>
        </section>
      </div>
    )
  }

  if (isLoading || !product) {
    return (
      <div className="product-details-page">
        <div className="loading-state" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Loading product…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="product-details-page">
      <Link className="product-back-link" to="/store">← Back to store</Link>
      <section className="product-overview card">
        <div className="product-detail-image">
          <img src={product.image_url} alt={product.title} />
        </div>
        <div className="product-detail-copy">
          <p className="product-category-label">{product.category.name}</p>
          <h1>{product.title}</h1>
          {product.description && <p className="product-description">{product.description}</p>}
          <dl className="product-metadata">
            {product.developer && (
              <div><dt>Developer</dt><dd>{product.developer}</dd></div>
            )}
            {product.publisher && (
              <div><dt>Publisher</dt><dd>{product.publisher}</dd></div>
            )}
            {product.release_date && (
              <div><dt>Release date</dt><dd>{product.release_date}</dd></div>
            )}
          </dl>
        </div>
      </section>

      <section className="section product-offers-section">
        <div className="section-header">
          <h2 className="section-title">Seller offers</h2>
        </div>
        {offers.length === 0 ? (
          <div className="empty-state">There are no active offers for this product right now.</div>
        ) : (
          <>
            <div className="offer-list" role="group" aria-label="Select a seller offer">
              {offers.map((offer) => (
                <OfferOption
                  key={offer.id}
                  offer={offer}
                  selected={selectedOffer?.id === offer.id}
                  onSelect={() => setSelectedOfferId(offer.id)}
                />
              ))}
            </div>
            <div className="product-cart-action">
              <button
                className="button button-primary"
                type="button"
                disabled={!canAddToCart}
                onClick={() => {
                  if (!product || !selectedOffer || !offers.some((offer) => offer.id === selectedOffer.id)) return
                  addOffer(product.slug, selectedOffer.id)
                }}
              >
                Add to Cart
              </button>
              <p>Select an offer to add this game to your cart.</p>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
