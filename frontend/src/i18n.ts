import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import koTranslation from '@/locales/ko/translation.json'
import enTranslation from '@/locales/en/translation.json'
import { useAuthStore } from '@/stores/authStore'

const userLocale = useAuthStore.getState().user?.locale
const browserLocale = navigator.language?.split('-')[0]
const defaultLocale = (import.meta.env.VITE_DEFAULT_LOCALE as string) || 'ko'
const supportedLocales = ['ko', 'en']

const detectedLocale =
  userLocale ??
  (supportedLocales.includes(browserLocale) ? browserLocale : defaultLocale)

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: koTranslation },
    en: { translation: enTranslation },
  },
  lng: detectedLocale,
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
})

export default i18n
