import { logger, sanitizeErrorMessage } from '@/lib/logger';

// Standardized error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  NETWORK = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  statusCode: number;
  context?: Record<string, unknown>;
  originalError?: unknown;
}

// Error handler class
export class ErrorHandler {
  static createError(
    type: ErrorType, 
    message: string, 
    statusCode: number = 500,
    context?: Record<string, unknown>,
    originalError?: unknown
  ): AppError {
    return {
      type,
      message,
      statusCode,
      context,
      originalError
    };
  }

  static handleError(error: unknown, context?: Record<string, unknown>): AppError {
    // Handle known error types
    if (this.isAppError(error)) {
      return error;
    }

    // Handle Supabase errors
    if (this.isSupabaseError(error)) {
      return this.handleSupabaseError(error, context);
    }

    // Handle fetch/network errors
    if (this.isNetworkError(error)) {
      return this.createError(
        ErrorType.NETWORK,
        'Error de conexión. Verifica tu conexión a internet.',
        503,
        context,
        error
      );
    }

    // Handle validation errors
    if (this.isValidationError(error)) {
      return this.createError(
        ErrorType.VALIDATION,
        error.message || 'Datos inválidos',
        400,
        context,
        error
      );
    }

    // Handle generic errors
    if (error instanceof Error) {
      logger.error('Unhandled error', { 
        message: error.message, 
        stack: error.stack, 
        context 
      });
      
      return this.createError(
        ErrorType.UNKNOWN,
        sanitizeErrorMessage(error, 'Ha ocurrido un error inesperado'),
        500,
        context,
        error
      );
    }

    // Fallback for unknown error types
    logger.error('Unknown error type', { error, context });
    return this.createError(
      ErrorType.UNKNOWN,
      'Ha ocurrido un error inesperado',
      500,
      context,
      error
    );
  }

  private static isAppError(error: unknown): error is AppError {
    return typeof error === 'object' && 
           error !== null && 
           'type' in error && 
           'message' in error && 
           'statusCode' in error;
  }

  private static isSupabaseError(error: unknown): error is { message: string; code?: string } {
    return typeof error === 'object' && 
           error !== null && 
           'message' in error &&
           typeof (error as any).message === 'string';
  }

  private static isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && 
           (error.message.includes('fetch') || 
            error.message.includes('network') ||
            error.message.includes('Failed to fetch'));
  }

  private static isValidationError(error: unknown): error is Error {
    return error instanceof Error && 
           (error.name === 'ValidationError' || 
            error.message.includes('validation') ||
            error.message.includes('invalid'));
  }

  private static handleSupabaseError(
    error: { message: string; code?: string }, 
    context?: Record<string, unknown>
  ): AppError {
    const { message, code } = error;

    // Authentication errors
    if (code === 'PGRST301' || message.includes('JWT') || message.includes('auth')) {
      return this.createError(
        ErrorType.AUTHENTICATION,
        'Sesión expirada. Por favor, inicia sesión nuevamente.',
        401,
        context,
        error
      );
    }

    // Authorization errors
    if (code === 'PGRST116' || message.includes('permission') || message.includes('policy')) {
      return this.createError(
        ErrorType.AUTHORIZATION,
        'No tienes permisos para realizar esta acción.',
        403,
        context,
        error
      );
    }

    // Not found errors
    if (code === 'PGRST106' || message.includes('not found')) {
      return this.createError(
        ErrorType.NOT_FOUND,
        'El recurso solicitado no fue encontrado.',
        404,
        context,
        error
      );
    }

    // Database constraint errors
    if (message.includes('constraint') || message.includes('duplicate')) {
      return this.createError(
        ErrorType.DATABASE,
        'Los datos enviados no cumplen con las restricciones de la base de datos.',
        400,
        context,
        error
      );
    }

    // Generic database error
    return this.createError(
      ErrorType.DATABASE,
      'Error en la base de datos. Intenta de nuevo más tarde.',
      500,
      context,
      error
    );
  }

  static logError(error: AppError, userId?: string): void {
    logger.error('Application error', {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      userId,
      context: error.context,
      originalError: error.originalError instanceof Error ? {
        name: error.originalError.name,
        message: error.originalError.message,
        stack: error.originalError.stack
      } : error.originalError
    });
  }

  static getDisplayMessage(error: AppError): string {
    // Return user-friendly messages based on error type
    switch (error.type) {
      case ErrorType.VALIDATION:
        return error.message; // Validation messages are usually safe to display
      case ErrorType.AUTHENTICATION:
        return 'Necesitas iniciar sesión para continuar.';
      case ErrorType.AUTHORIZATION:
        return 'No tienes permisos para realizar esta acción.';
      case ErrorType.NOT_FOUND:
        return 'El contenido que buscas no fue encontrado.';
      case ErrorType.RATE_LIMIT:
        return 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.';
      case ErrorType.NETWORK:
        return 'Error de conexión. Verifica tu conexión a internet.';
      case ErrorType.DATABASE:
        return 'Error temporal del servidor. Intenta de nuevo más tarde.';
      default:
        return 'Ha ocurrido un error inesperado. Intenta de nuevo más tarde.';
    }
  }
}

// Hook for error handling in React components
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: Record<string, unknown>) => {
    const appError = ErrorHandler.handleError(error, context);
    ErrorHandler.logError(appError);
    return appError;
  };

  return { handleError };
};
