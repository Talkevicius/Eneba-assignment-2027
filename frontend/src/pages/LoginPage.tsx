import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthProvider'

interface RedirectLocation {
  pathname?: string
  search?: string
  hash?: string
}

function getReturnPath(state: unknown) {
  if (typeof state !== 'object' || state === null || !('from' in state)) return '/'
  const from = state.from as RedirectLocation | null
  if (!from || typeof from.pathname !== 'string' || !from.pathname.startsWith('/') || from.pathname.startsWith('//')) return '/'
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

function getLoginError(reason: unknown) {
  if (reason instanceof ApiError) {
    const validationMessages = Object.values(reason.errors ?? {}).flat()
    return [reason.message, ...validationMessages].filter(Boolean).join(' ')
  }
  return reason instanceof Error ? reason.message : 'Could not log in. Please try again.'
}

export default function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const returnPath = getReturnPath(location.state)

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate(returnPath, { replace: true })
    } catch (reason) {
      setError(getLoginError(reason))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-container login-page">
      <form className="auth-card" onSubmit={submitLogin}>
        <h1 className="auth-title">Log in</h1>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email</label>
          <input
            className="form-input"
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <input
            className="form-input"
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
        <p className="login-return-note">You will return to the page you requested after logging in.</p>
        <Link to="/">Back to marketplace</Link>
      </form>
    </section>
  )
}
