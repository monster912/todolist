import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Sun, Moon, Globe, House, Tag, Settings } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import { useAuthStore } from '@/stores/authStore'
import i18n from '@/i18n'
import type { ApiError } from '@/types/api.types'
import type { Theme, Locale } from '@/types/user.types'

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'auth.errors.passwordTooShort'
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'auth.errors.passwordRequiresAlphanumeric'
  return null
}

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token, user, setAuth, clearAuth } = useAuthStore()

  const [name, setName] = useState(user?.name ?? '')
  const [nameError, setNameError] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; form?: string }>({})
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [themeUpdating, setThemeUpdating] = useState(false)
  const [localeUpdating, setLocaleUpdating] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const currentTheme = user?.theme ?? 'light'
  const currentLocale = user?.locale ?? 'ko'

  const applyUserUpdate = (updated: { id: string; email: string; name: string; theme: Theme; locale: Locale }) => {
    setAuth(token!, { id: updated.id, email: updated.email, name: updated.name, theme: updated.theme, locale: updated.locale })
  }

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setNameError(t('auth.errors.nameRequired')); return }
    if (name.length > 50) { setNameError(t('auth.errors.nameTooLong')); return }
    setNameError('')
    setNameSaving(true)
    try {
      const res = await authApi.updateMe({ name: name.trim() })
      applyUserUpdate(res.data)
    } catch (err) {
      setNameError(t(`errors.${(err as ApiError).code}`, t('errors.unknown')))
    } finally {
      setNameSaving(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof passwordErrors = {}
    if (!currentPassword) next.current = t('auth.errors.currentPasswordRequired')
    if (!newPassword) next.new = t('auth.errors.passwordRequired')
    else { const err = validatePassword(newPassword); if (err) next.new = t(err) }
    setPasswordErrors(next)
    if (Object.keys(next).length > 0) return

    setPasswordSaving(true)
    try {
      await authApi.updateMe({ current_password: currentPassword, new_password: newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setPasswordErrors({})
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.code === 'INVALID_CREDENTIALS') {
        setPasswordErrors({ current: t('auth.errors.invalidCredentials') })
      } else {
        setPasswordErrors({ form: t(`errors.${apiErr.code}`, t('errors.unknown')) })
      }
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleThemeChange = async (theme: Theme) => {
    setThemeUpdating(true)
    try {
      const res = await userApi.updateSettings({ theme })
      applyUserUpdate(res.data)
      document.documentElement.setAttribute('data-theme', theme)
    } catch {
      // silent
    } finally {
      setThemeUpdating(false)
    }
  }

  const handleLocaleChange = async (locale: Locale) => {
    setLocaleUpdating(true)
    try {
      const res = await userApi.updateSettings({ locale })
      applyUserUpdate(res.data)
      await i18n.changeLanguage(locale)
    } catch {
      // silent
    } finally {
      setLocaleUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError(t('auth.errors.passwordRequired')); return }
    setDeleteLoading(true)
    try {
      await authApi.deleteMe({ password: deletePassword })
      clearAuth()
      navigate('/login', { replace: true })
    } catch (err) {
      const apiErr = err as ApiError
      setDeleteError(
        apiErr.code === 'INVALID_CREDENTIALS'
          ? t('auth.errors.invalidCredentials')
          : t(`errors.${apiErr.code}`, t('errors.unknown'))
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletePassword('')
    setDeleteError('')
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: 'var(--spacing-5)',
    padding: 'var(--spacing-5)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-surface)',
  }
  const sectionLabel: React.CSSProperties = {
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 'var(--spacing-4)',
  }

  return (
    <div style={{ paddingBottom: 'var(--bottom-nav-height)' }}>
      <div className="page-title-bar">
        <button className="btn btn-ghost" type="button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className="page-title">{t('settings.title')}</h1>
      </div>

      <div className="page-content" style={{ maxWidth: 520 }}>

        {/* 외관 섹션 */}
        <section style={sectionStyle}>
          <p style={sectionLabel}>{t('settings.appearanceSection')}</p>

          <div style={{ marginBottom: 'var(--spacing-5)' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
              {t('settings.theme')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
              {(['light', 'dark'] as Theme[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`btn ${currentTheme === theme ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, gap: 'var(--spacing-2)' }}
                  onClick={() => handleThemeChange(theme)}
                  disabled={themeUpdating || currentTheme === theme}
                >
                  {theme === 'light' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                  {t(`settings.theme${theme === 'light' ? 'Light' : 'Dark'}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
              {t('settings.locale')}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
              {(['ko', 'en'] as Locale[]).map((locale) => (
                <button
                  key={locale}
                  type="button"
                  className={`btn ${currentLocale === locale ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, gap: 'var(--spacing-2)' }}
                  onClick={() => handleLocaleChange(locale)}
                  disabled={localeUpdating || currentLocale === locale}
                >
                  <Globe size={16} strokeWidth={1.5} />
                  {locale === 'ko' ? t('settings.localeKo') : t('settings.localeEn')}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 계정 정보 섹션 */}
        <section style={sectionStyle}>
          <p style={sectionLabel}>{t('settings.profileSection')}</p>

          {/* 이름 수정 */}
          <form onSubmit={handleSaveName} style={{ marginBottom: 'var(--spacing-5)' }}>
            <Input
              id="settings-name"
              label={t('settings.name')}
              placeholder={t('settings.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
            />
            <div style={{ marginTop: 'var(--spacing-3)' }}>
              <Button type="submit" variant="secondary" loading={nameSaving}>
                {t('settings.saveProfile')}
              </Button>
            </div>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--spacing-4) 0' }} />

          {/* 비밀번호 변경 */}
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
            {t('settings.securitySection')}
          </p>
          <form onSubmit={handleChangePassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <Input
              id="current-pw"
              type="password"
              label={t('settings.currentPassword')}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={passwordErrors.current}
              autoComplete="current-password"
            />
            <Input
              id="new-pw"
              type="password"
              label={t('settings.newPassword')}
              placeholder={t('auth.newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordErrors.new}
              autoComplete="new-password"
            />
            {passwordErrors.form && (
              <p style={{ fontSize: 'var(--text-sm)', color: '#F4212E' }}>{passwordErrors.form}</p>
            )}
            <div>
              <Button type="submit" variant="secondary" loading={passwordSaving}>
                {t('settings.savePassword')}
              </Button>
            </div>
          </form>
        </section>

        {/* 위험 구역 */}
        <section style={{ ...sectionStyle, borderColor: 'rgba(244,33,46,0.3)' }}>
          <p style={{ ...sectionLabel, color: '#F4212E' }}>{t('settings.dangerSection')}</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
            {t('settings.deleteAccountDescription')}
          </p>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            {t('settings.deleteAccount')}
          </Button>
        </section>
      </div>

      {/* 모바일 하단 네비 */}
      <nav className="bottom-nav">
        <Link to="/" className="bottom-nav-item">
          <House size={22} strokeWidth={1.5} />
          <span>{t('nav.dashboard')}</span>
        </Link>
        <Link to="/categories" className="bottom-nav-item">
          <Tag size={22} strokeWidth={1.5} />
          <span>{t('nav.categories')}</span>
        </Link>
        <Link to="/settings" className="bottom-nav-item active">
          <Settings size={22} strokeWidth={1.5} />
          <span>{t('nav.settings')}</span>
        </Link>
      </nav>

      {/* 회원 탈퇴 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title={t('settings.deleteAccountConfirm')}
      >
        <p className="modal-desc" style={{ marginBottom: 'var(--spacing-4)' }}>
          {t('settings.deleteAccountDescription')}
        </p>
        <Input
          id="delete-pw"
          type="password"
          label={t('settings.passwordForDelete')}
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          error={deleteError}
          autoComplete="current-password"
        />
        <div className="modal-actions">
          <Button variant="secondary" onClick={closeDeleteModal}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount} loading={deleteLoading}>
            {t('settings.deleteAccount')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
