import type { FormEvent } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import PlaceholderPage from './pages/PlaceholderPage'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import { useCart } from './cart/CartProvider'
import AddedToCartModal from './components/AddedToCartModal'
import './App.css'

function App() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalQuantity } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const catalogSearch = location.pathname === '/store'
    ? new URLSearchParams(location.search).get('search') ?? ''
    : ''

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams(location.pathname === '/store' ? location.search : '')
    const query = String(new FormData(event.currentTarget).get('search') ?? '').trim()
    if (query) params.set('search', query)
    else params.delete('search')
    params.set('page', '1')
    navigate(`/store?${params.toString()}`)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">Eneba Marketplace</Link>
        <form
          key={`${location.pathname}${location.search}`}
          className="header-search site-header-search"
          role="search"
          onSubmit={submitSearch}
        >
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            aria-label="Search games"
            name="search"
            type="search"
            defaultValue={catalogSearch}
            placeholder="Search games"
          />
          <button className="button button-primary" type="submit">Search</button>
        </form>
        <nav aria-label="Main navigation">
          <Link className="header-cart-link" to="/cart" aria-label={`Cart, ${totalQuantity} items`}>
            Cart <span className="badge badge-accent" aria-hidden="true">{totalQuantity}</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders">Orders</Link>
              <span className="account-name">{user?.name}</span>
              <button className="text-button" type="button" onClick={() => void logout()}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
          </Route>
          <Route path="*" element={<PlaceholderPage title="Page not found" />} />
        </Routes>
      </main>
      <AddedToCartModal />
      <footer>Digital games marketplace · Demo experience</footer>
    </div>
  )
}

export default App
