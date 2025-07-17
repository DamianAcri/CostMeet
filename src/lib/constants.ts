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

// Constantes para análisis de reuniones
export const MEETING_ANALYSIS = {
  RULES: {
    LARGE_MEETING_THRESHOLD: 8,
    LONG_MEETING_THRESHOLD: 60,
    EXCESSIVE_DURATION_THRESHOLD: 90,
    MIN_DESCRIPTION_LENGTH: 10,
    FREQUENT_MEETING_THRESHOLD: 3,
    ANALYSIS_PERIOD_DAYS: 7,
  },
  RULE_TYPES: {
    LARGE_LONG_MEETINGS: 'large-long-meetings',
    NO_AGENDA: 'no-agenda',
    NO_OWNER: 'no-owner',
    EXCESSIVE_DURATION: 'excessive-duration',
    TOO_FREQUENT: 'too-frequent'
  }
} as const

// Constantes para datos de demo profesionales
export const DEMO_DATA = {
  PROFESSIONAL_MEETING_TITLES: [
    'Weekly Team Sync',
    'Q4 Planning Session',
    'Product Review',
    'Sprint Retrospective',
    'Client Status Update',
    'Architecture Review',
    'Budget Planning',
    'Marketing Campaign Review',
    'Performance Review',
    'Stakeholder Update',
    'Technical Discussion',
    'Project Kickoff',
    'Strategic Planning',
    'Team Building Session',
    'Code Review Meeting'
  ],
  PROFESSIONAL_DESCRIPTIONS: [
    'Revisión de objetivos y progreso del equipo',
    'Planificación estratégica para el próximo trimestre',
    'Análisis de funcionalidades y roadmap',
    'Evaluación de procesos y mejoras',
    'Actualización del estado del proyecto',
    'Discusión de decisiones técnicas',
    'Revisión de presupuesto y recursos',
    'Análisis de métricas y resultados',
    'Evaluación de rendimiento del equipo',
    'Comunicación con stakeholders clave'
  ],
  REALISTIC_ATTENDEE_COUNTS: [3, 4, 5, 6, 7, 8, 9, 10, 12, 15],
  REALISTIC_DURATIONS: [30, 45, 60, 90, 120],
  REALISTIC_HOURLY_RATES: [45, 55, 65, 75, 85, 95, 105, 115, 125, 135]
} as const
