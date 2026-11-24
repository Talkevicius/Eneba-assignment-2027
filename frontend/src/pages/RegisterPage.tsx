import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthProvider'

interface RedirectLocation {
  pathname?: string
  search?: string
  hash?: string
}

type RegistrationField = 'name' | 'email' | 'password' | 'password_confirmation'
type FieldErrors = Partial<Record<RegistrationField, string>>

function getReturnPath(state: unknown) {
  if (typeof state !== 'object' || state === null || !('from' in state)) return '/'
  const from = state.from as RedirectLocation | null
  if (!from || typeof from.pathname !== 'string' || !from.pathname.startsWith('/') || from.pathname.startsWith('//')) return '/'
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

export default function RegisterPage() {
  const { register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const registrationInFlight = useRef(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const returnPath = getReturnPath(location.state)

  function fieldError(field: RegistrationField) {
    return clientErrors[field] ?? apiErrors[field]?.join(' ')
  }

  function validate() {
    const errors: FieldErrors = {}
    const normalizedEmail = email.trim()

    if (!name.trim()) errors.name = 'Enter your name.'
    if (!normalizedEmail) errors.email = 'Enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Enter a password.'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (!passwordConfirmation) errors.password_confirmation = 'Confirm your password.'
    else if (password !== passwordConfirmation) errors.password_confirmation = 'Passwords do not match.'

    return errors
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (registrationInFlight.current) return

    const errors = validate()
    setClientErrors(errors)
    setApiErrors({})
    setFormError(null)
    if (Object.keys(errors).length > 0) return

    registrationInFlight.current = true
    setIsSubmitting(true)

    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate(returnPath, { replace: true })
    } catch (reason) {
      if (reason instanceof ApiError) {
        setApiErrors(reason.errors ?? {})
        setFormError(reason.message)
      } else {
        setFormError(reason instanceof Error ? reason.message : 'Could not create your account. Please try again.')
      }
    } finally {
      registrationInFlight.current = false
      setIsSubmitting(false)
    }
  }

  function clearFieldError(field: RegistrationField) {
    setClientErrors((current) => ({ ...current, [field]: undefined }))
    setApiErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setFormError(null)
  }

  return (
    <section className="auth-container register-page">
      <form className="auth-card" onSubmit={submitRegistration} noValidate>
        <h1 className="auth-title">Create an account</h1>
        {formError && <p className="form-error" role="alert">{formError}</p>}

        <div className="form-group">
          <label className="form-label" htmlFor="register-name">Name</label>
          <input
            className="form-input"
            id="register-name"
            type="text"
            autoComplete="name"
            required
            maxLength={255}
            value={name}
            aria-invalid={Boolean(fieldError('name'))}
            aria-describedby={fieldError('name') ? 'register-name-error' : undefined}
            onChange={(event) => { setName(event.target.value); clearFieldError('name') }}
          />
          {fieldError('name') && <p className="form-error" id="register-name-error">{fieldError('name')}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-email">Email</label>
          <input
            className="form-input"
            id="register-email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            value={email}
            aria-invalid={Boolean(fieldError('email'))}
            aria-describedby={fieldError('email') ? 'register-email-error' : undefined}
            onChange={(event) => { setEmail(event.target.value); clearFieldError('email') }}
          />
          {fieldError('email') && <p className="form-error" id="register-email-error">{fieldError('email')}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-password">Password</label>
          <input
            className="form-input"
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            aria-invalid={Boolean(fieldError('password'))}
            aria-describedby={fieldError('password') ? 'register-password-error' : undefined}
            onChange={(event) => {
              setPassword(event.target.value)
              clearFieldError('password')
              clearFieldError('password_confirmation')
            }}
          />
          {fieldError('password') && <p className="form-error" id="register-password-error">{fieldError('password')}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-password-confirmation">Confirm password</label>
          <input
            className="form-input"
            id="register-password-confirmation"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            aria-invalid={Boolean(fieldError('password_confirmation'))}
            aria-describedby={fieldError('password_confirmation') ? 'register-password-confirmation-error' : undefined}
            onChange={(event) => { setPasswordConfirmation(event.target.value); clearFieldError('password_confirmation') }}
          />
          {fieldError('password_confirmation') && (
            <p className="form-error" id="register-password-confirmation-error">{fieldError('password_confirmation')}</p>
          )}
        </div>

        <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
        <p>Already have an account? <Link to="/login" state={location.state}>Log in</Link></p>
      </form>
    </section>
  )
}
