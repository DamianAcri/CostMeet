import DOMPurify from 'dompurify';

// Utility functions for input sanitization and validation
export const sanitizeInput = (input: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  // Client-side: use DOMPurify
  return DOMPurify.sanitize(input.trim(), { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Sanitize HTML content (for rich text)
export const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    return html; // Skip sanitization on server
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate and sanitize meeting data
export const validateMeetingData = (data: {
  title: string;
  description?: string;
  attendees_count: number;
  duration_minutes: number;
  average_hourly_rate: number;
}): { isValid: boolean; errors: string[]; sanitizedData: typeof data } => {
  const errors: string[] = [];
  
  // Sanitize strings
  const sanitizedData = {
    ...data,
    title: sanitizeInput(data.title),
    description: data.description ? sanitizeInput(data.description) : undefined
  };
  
  // Validate title
  if (!sanitizedData.title || sanitizedData.title.length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  }
  if (sanitizedData.title.length > 100) {
    errors.push('El título no puede tener más de 100 caracteres');
  }
  
  // Validate description
  if (sanitizedData.description && sanitizedData.description.length > 500) {
    errors.push('La descripción no puede tener más de 500 caracteres');
  }
  
  // Validate attendees
  if (!Number.isInteger(data.attendees_count) || data.attendees_count < 1 || data.attendees_count > 100) {
    errors.push('El número de asistentes debe ser entre 1 y 100');
  }
  
  // Validate duration
  if (!Number.isInteger(data.duration_minutes) || data.duration_minutes < 1 || data.duration_minutes > 1440) {
    errors.push('La duración debe ser entre 1 y 1440 minutos');
  }
  
  // Validate hourly rate
  if (typeof data.average_hourly_rate !== 'number' || data.average_hourly_rate < 0 || data.average_hourly_rate > 10000) {
    errors.push('La tarifa por hora debe ser entre 0 y 10,000');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
};

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (password.length > 128) {
    errors.push('La contraseña no puede tener más de 128 caracteres');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting utility (simple in-memory implementation)
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userAttempts.count >= maxAttempts) {
      return false;
    }
    
    userAttempts.count++;
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();
