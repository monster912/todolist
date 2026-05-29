import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api/authApi'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import i18n from '@/i18n'
import type { ApiError } from '@/types/api.types'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const next: { email?: string; password?: string } = {}
    if (!email) next.email = t('auth.errors.emailRequired')
    else if (!validateEmail(email)) next.email = t('auth.errors.invalidEmail')
    if (!password) next.password = t('auth.errors.passwordRequired')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      const { token, user } = res.data
      setAuth(token, user)
      document.documentElement.setAttribute('data-theme', user.theme)
      await i18n.changeLanguage(user.locale)
      navigate('/', { replace: true })
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.code === 'INVALID_CREDENTIALS') {
        setErrors({ form: t('auth.errors.invalidCredentials') })
      } else {
        setErrors({ form: t(`errors.${apiErr.code}`, t('errors.unknown')) })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>{t('auth.login')}</h1>
        <form onSubmit={handleSubmit} style={formStyle} noValidate>
          <Input
            id="email"
            type="email"
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            id="password"
            type="password"
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />
          {errors.form && <p style={formErrorStyle}>{errors.form}</p>}
          <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
            {t('auth.login')}
          </Button>
        </form>
        <p style={linkStyle}>
          {t('auth.noAccount')}{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)' }}>
            {t('auth.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-bg)',
  padding: 'var(--spacing-4)',
}
const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  padding: 'var(--spacing-8)',
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
}
const titleStyle: React.CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-bold)',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--spacing-6)',
  textAlign: 'center',
}
const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-4)',
}
const formErrorStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: '#F4212E',
  textAlign: 'center',
  padding: 'var(--spacing-2) 0',
}
const linkStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: 'var(--spacing-5)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
}
