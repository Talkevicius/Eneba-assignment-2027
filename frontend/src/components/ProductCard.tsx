import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartProvider'
import type { Product, ProductOffer } from '../types/api'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
  offer?: ProductOffer
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

export default function ProductCard({ product, offer }: ProductCardProps) {
  const { addOffer } = useCart()
  const discount = offer?.original_price && Number(offer.original_price) > Number(offer.price)
    ? Math.round(((Number(offer.original_price) - Number(offer.price)) / Number(offer.original_price)) * 100)
    : null

  function addToCart() {
    if (!offer) return
    addOffer(product.slug, offer.id)
  }

  return (
    <article className="product-card">
      <div className="product-card-visual">
        <Link className="product-card-image-link" to={`/products/${product.slug}`} aria-label={`View offers for ${product.title}`}>
          <div className="product-card-image">
            <img src={product.image_url} alt={product.title} loading="lazy" />
            {discount !== null && <span className="product-discount">-{discount}%</span>}
          </div>
        </Link>
        <div className="product-card-actions">
          <button className="button button-primary" type="button" onClick={addToCart} disabled={!offer}>
            Add to Cart
          </button>
          <Link className="button button-outline" to={`/products/${product.slug}`}>View Offers</Link>
        </div>
      </div>

      <div className="product-card-content">
        <h3 className="product-card-title"><Link to={`/products/${product.slug}`}>{product.title}</Link></h3>
        {product.category && <span className="product-card-meta">{product.category.name}</span>}
        {offer ? (
          <>
            <span className="product-card-meta">{offer.platform.name} · {offer.region.name}</span>
            <span className="product-card-meta">Seller: {offer.seller.name}</span>
            <div className="product-card-price" aria-label="Offer price">
              <span className="product-price-current">{formatPrice(offer.price, offer.currency)}</span>
              {discount !== null && offer.original_price && (
                <span className="product-price-original">{formatPrice(offer.original_price, offer.currency)}</span>
              )}
            </div>
          </>
        ) : (
          <p className="product-card-no-offers">No active offers currently available.</p>
        )}
        {product.sales_count !== undefined && (
          <span className="product-card-meta">{product.sales_count} sold</span>
        )}
      </div>
    </article>
  )
}
