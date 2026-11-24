import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ApiSection from '../components/ApiSection'
import ProductCard from '../components/ProductCard'
import { apiData } from '../api/client'
import type { Banner, Product } from '../types/api'
import './HomePage.css'

interface SectionData<T> {
  items: T[]
  isLoading: boolean
  error: string | null
  retry: () => void
}

function useSectionData<T>(endpoint: string): SectionData<T> {
  const [state, setState] = useState({ items: [] as T[], isLoading: true, error: null as string | null })
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    apiData<T[]>(endpoint)
      .then((result) => {
        if (active) setState({ items: result, isLoading: false, error: null })
      })
      .catch((reason: unknown) => {
        if (!active) return
        setState({
          items: [],
          isLoading: false,
          error: reason instanceof Error ? reason.message : 'Something went wrong. Please try again.',
        })
      })

    return () => { active = false }
  }, [endpoint, retryKey])

  function retry() {
    setState((current) => ({ ...current, isLoading: true, error: null }))
    setRetryKey((key) => key + 1)
  }

  return { ...state, retry }
}

function getSectionStatus<T>(data: SectionData<T>) {
  if (data.isLoading) return 'loading' as const
  if (data.error) return 'error' as const
  if (data.items.length === 0) return 'empty' as const
  return 'ready' as const
}

function getBannerTarget(targetUrl: string | null) {
  const target = targetUrl?.trim()
  if (!target) return null

  try {
    const url = new URL(target, window.location.origin)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

    if (url.origin === window.location.origin) {
      return { to: `${url.pathname}${url.search}${url.hash}`, external: false }
    }

    return { to: url.href, external: true }
  } catch {
    return null
  }
}

function BannerContent({ banner }: { banner: Banner }) {
  return (
    <>
      <img className="home-banner-image" src={banner.image_url} alt="" />
      <div className="hero-banner-overlay">
        <h1 className="hero-banner-title">{banner.title}</h1>
        {banner.subtitle && <p className="hero-banner-subtitle">{banner.subtitle}</p>}
      </div>
    </>
  )
}

function BannerCard({ banner }: { banner: Banner }) {
  const target = getBannerTarget(banner.target_url)
  const className = `hero-banner home-banner${target ? ' home-banner-clickable' : ''}`

  if (!target) {
    return <div className={className}><BannerContent banner={banner} /></div>
  }

  if (target.external) {
    return (
      <a className={`${className} hero-banner-link`} href={target.to}>
        <BannerContent banner={banner} />
      </a>
    )
  }

  return (
    <Link className={`${className} hero-banner-link`} to={target.to}>
      <BannerContent banner={banner} />
    </Link>
  )
}

export default function HomePage() {
  const banners = useSectionData<Banner>('/home/banners')
  const bestSellers = useSectionData<Product>('/home/best-sellers')
  const deals = useSectionData<Product>('/home/deals')

  const bannerStatus = getSectionStatus(banners)
  const bestSellerStatus = getSectionStatus(bestSellers)
  const dealStatus = getSectionStatus(deals)
  const featuredBanner = banners.items[0]

  return (
    <div className="home-page page-content">
      <ApiSection
        title="Featured"
        status={bannerStatus}
        errorMessage={banners.error ?? undefined}
        emptyMessage="Featured banners are unavailable right now. Explore the store to find your next game."
        onRetry={banners.retry}
      >
        {featuredBanner && <BannerCard banner={featuredBanner} />}
      </ApiSection>

      <ApiSection
        title="Best sellers"
        status={bestSellerStatus}
        errorMessage={bestSellers.error ?? undefined}
        emptyMessage="No best sellers are available yet."
        onRetry={bestSellers.retry}
      >
        <div className="product-grid">
          {bestSellers.items.flatMap((product) => product.offers?.length
            ? product.offers.map((offer) => <ProductCard key={`offer-${offer.id}`} product={product} offer={offer} />)
            : [<ProductCard key={`product-${product.id}`} product={product} />])}
        </div>
      </ApiSection>

      <ApiSection
        title="Deals"
        status={dealStatus}
        errorMessage={deals.error ?? undefined}
        emptyMessage="There are no active deals right now."
        onRetry={deals.retry}
      >
        <div className="product-grid">
          {deals.items.flatMap((product) => product.offers?.length
            ? product.offers.map((offer) => <ProductCard key={`offer-${offer.id}`} product={product} offer={offer} />)
            : [<ProductCard key={`product-${product.id}`} product={product} />])}
        </div>
      </ApiSection>

      <div className="home-store-link">
        <Link className="button button-outline" to="/store">Browse the store</Link>
      </div>
    </div>
  )
}
