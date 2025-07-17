// Utility for safe logging in production
export const logger = {
  error: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, context);
    }
    // In production, send to monitoring service (e.g., Sentry)
    // logToMonitoringService(message, context);
  },
  
  warn: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, context);
    }
  },
  
  info: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(message, context);
    }
  }
};

// Helper for sanitizing error messages for users
export const sanitizeErrorMessage = (error: unknown, fallback: string = 'Ha ocurrido un error inesperado'): string => {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : fallback;
  }
  
  // In production, return generic messages for security
  if (error instanceof Error) {
    // Only show specific messages for known safe errors
    const safeErrors = [
      'Invalid login credentials',
      'User already registered',
      'Password should be at least 6 characters'
    ];
    
    if (safeErrors.some(safe => error.message.includes(safe))) {
      return error.message;
    }
  }
  
  return fallback;
};
