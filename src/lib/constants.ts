// Constantes de configuración
export const AUTH_CONFIG = {
  DEFAULT_CURRENCY: 'EUR',
  DEFAULT_HOURLY_RATE: 50.00,
  REDIRECT_ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    RESET_PASSWORD: '/reset-password'
  },
  ERROR_CODES: {
    PROFILE_NOT_FOUND: 'PGRST116',
    INVALID_CREDENTIALS: 'Invalid login credentials',
    USER_ALREADY_REGISTERED: 'User already registered',
    PASSWORD_TOO_SHORT: 'Password should be at least 6 characters'
  }
} as const

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MEETING_LIMITS: {
    MAX_ATTENDEES: 100,
    MAX_DURATION_MINUTES: 1440, // 24 hours
    MAX_HOURLY_RATE: 10000,
    MIN_ATTENDEES: 1,
    MIN_DURATION_MINUTES: 1,
    MIN_HOURLY_RATE: 0
  }
} as const
