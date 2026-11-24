import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import ApiSection from '../components/ApiSection'
import ProductCard from '../components/ProductCard'
import { apiRequest, ApiError } from '../api/client'
import type { PaginatedProducts } from '../types/api'
import './CatalogPage.css'

const FILTER_NAMES = ['search', 'category', 'platform', 'region', 'min_price', 'max_price', 'sort'] as const
const API_QUERY_NAMES = [...FILTER_NAMES, 'page', 'per_page'] as const

interface CatalogResult {
  requestId: string
  response?: PaginatedProducts
  error?: string
}

function validatePrices(params: URLSearchParams) {
  const minimum = params.get('min_price')?.trim() ?? ''
  const maximum = params.get('max_price')?.trim() ?? ''

  if (minimum && (!Number.isFinite(Number(minimum)) || Number(minimum) < 0)) {
    return 'Minimum price must be a number greater than or equal to zero.'
  }
  if (maximum && (!Number.isFinite(Number(maximum)) || Number(maximum) < 0)) {
    return 'Maximum price must be a number greater than or equal to zero.'
  }
  if (minimum && maximum && Number(maximum) < Number(minimum)) {
    return 'Maximum price must be greater than or equal to minimum price.'
  }

  return null
}

function getApiQuery(searchParams: URLSearchParams) {
  const query = new URLSearchParams()
  for (const name of API_QUERY_NAMES) {
    const value = searchParams.get(name)?.trim()
    if (value) query.set(name, value)
  }
  return query.toString()
}

function getErrorMessage(reason: unknown) {
  if (!(reason instanceof ApiError)) {
    return reason instanceof Error ? reason.message : 'Could not load the catalog. Please try again.'
  }

  const fieldErrors = Object.values(reason.errors ?? {}).flat().join(' ')
  return fieldErrors ? `${reason.message} ${fieldErrors}` : reason.message
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [result, setResult] = useState<CatalogResult | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const query = getApiQuery(searchParams)
  const requestId = `${query}:${retryKey}`
  const priceValidationError = validatePrices(searchParams)
  const validationError = formError ?? priceValidationError
  const activeFilterCount = ['category', 'platform', 'region', 'min_price', 'max_price']
    .filter((name) => Boolean(searchParams.get(name)?.trim())).length

  useEffect(() => {
    if (validationError) return

    let active = true
    const endpoint = query ? `/products?${query}` : '/products'

    apiRequest<PaginatedProducts>(endpoint)
      .then((response) => {
        if (active) setResult({ requestId, response })
      })
      .catch((reason: unknown) => {
        if (active) setResult({ requestId, error: getErrorMessage(reason) })
      })

    return () => { active = false }
  }, [query, requestId, validationError])

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextParams = new URLSearchParams()

    for (const name of FILTER_NAMES) {
      const value = String(formData.get(name) ?? '').trim()
      if (value) nextParams.set(name, value)
    }

    const priceError = validatePrices(nextParams)
    if (priceError) {
      setFormError(priceError)
      return
    }

    setFormError(null)
    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  function clearFilters() {
    setFormError(null)
    setSearchParams(new URLSearchParams())
  }

  function goToPage(page: number) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(page))
    setSearchParams(nextParams)
  }

  const isLoading = !validationError && result?.requestId !== requestId
  const response = result?.requestId === requestId ? result.response : undefined
  const requestError = result?.requestId === requestId ? result.error : undefined
  const resultStatus = validationError ? 'error'
    : isLoading ? 'loading'
      : requestError ? 'error'
        : response?.data.length ? 'ready' : 'empty'
  const [filtersOpen, setFiltersOpen] = useState(true)

  return (
    <div className="catalog-page page-content">
      <header className="catalog-heading">
        <h1>Game catalog</h1>
        <p>Find your next game from active seller offers.</p>
      </header>

      <form
        key={searchParams.toString()}
        className="catalog-layout"
        onSubmit={applyFilters}
      >
        <input type="hidden" name="search" value={searchParams.get('search') ?? ''} />
        <aside className="catalog-sidebar">
          <details
            className="catalog-filters card"
            open={filtersOpen}
            onToggle={(event) => setFiltersOpen(event.currentTarget.open)}
          >
            <summary className="catalog-filter-summary">
              <span>Filters</span>
              {activeFilterCount > 0 && <span className="catalog-filter-count">{activeFilterCount} active</span>}
            </summary>
            <div className="catalog-filter-controls">
              <div className="catalog-filter-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="catalog-category">Category</label>
                  <select className="form-select" id="catalog-category" name="category" defaultValue={searchParams.get('category') ?? ''}>
                    <option value="">All categories</option>
                    <option value="action">Action</option>
                    <option value="rpg">RPG</option>
                    <option value="adventure">Adventure</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="catalog-platform">Platform</label>
                  <select className="form-select" id="catalog-platform" name="platform" defaultValue={searchParams.get('platform') ?? ''}>
                    <option value="">All platforms</option>
                    <option value="steam">Steam</option>
                    <option value="playstation">PlayStation</option>
                    <option value="xbox">Xbox</option>
                    <option value="nintendo">Nintendo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="catalog-region">Region</label>
                  <select className="form-select" id="catalog-region" name="region" defaultValue={searchParams.get('region') ?? ''}>
                    <option value="">All regions</option>
                    <option value="GLOBAL">Global</option>
                    <option value="EU">Europe</option>
                    <option value="NA">North America</option>
                  </select>
                </div>
                <div className="catalog-price-range">
                  <div className="form-group">
                    <label className="form-label" htmlFor="catalog-min-price">Minimum price (EUR)</label>
                    <input className="form-input" id="catalog-min-price" name="min_price" type="number" min="0" step="any" defaultValue={searchParams.get('min_price') ?? ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="catalog-max-price">Maximum price (EUR)</label>
                    <input className="form-input" id="catalog-max-price" name="max_price" type="number" min="0" step="any" defaultValue={searchParams.get('max_price') ?? ''} />
                  </div>
                </div>
              </div>
              {validationError && <p className="catalog-form-error" role="alert">{validationError}</p>}
              <div className="catalog-filter-actions">
                <button className="button button-primary" type="submit">Apply filters</button>
                <button className="button button-outline" type="button" onClick={clearFilters}>Clear filters</button>
              </div>
            </div>
          </details>
        </aside>

        <div className="catalog-results">
          <div className="catalog-toolbar">
            <div className="form-group">
              <label className="form-label" htmlFor="catalog-sort">Sort by</label>
              <select
                className="form-select"
                id="catalog-sort"
                name="sort"
                defaultValue={searchParams.get('sort') || 'title'}
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
              >
                <option value="title">Title</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {validationError ? (
            <div className="error-state catalog-query-error" role="alert">{validationError}</div>
          ) : (
            <ApiSection
              title="Catalog results"
              status={resultStatus === 'ready' ? 'ready' : resultStatus}
              errorMessage={requestError}
              emptyMessage="No products match these filters. Try changing or clearing your filters."
              onRetry={() => setRetryKey((key) => key + 1)}
            >
              {response && (
                <>
                  <div className="catalog-result-count" aria-live="polite">{response.meta.total} products</div>
                  <div className="product-grid">
                    {response.data.flatMap((product) => product.offers?.length
                      ? product.offers.map((offer) => <ProductCard key={`offer-${offer.id}`} product={product} offer={offer} />)
                      : [<ProductCard key={`product-${product.id}`} product={product} />])}
                  </div>
                  <nav className="catalog-pagination" aria-label="Catalog pages">
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
            </ApiSection>
          )}
        </div>
      </form>
    </div>
  )
}
