'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PublicRoute } from '@/components/ProtectedRoute'
import { AUTH_CONFIG, VALIDATION_RULES } from '@/lib/constants'

type AuthMode = 'login' | 'signup' | 'reset'

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || (!password && mode !== 'reset')) {
      setError('Por favor, completa todos los campos')
      return
    }

    // Validar email
    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      setError('Por favor, introduce un email válido')
      return
    }

    // Validar password en signup/login
    if (mode !== 'reset' && password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      setError(`La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`)
      return
    }

    // Validar nombre completo en signup
    if (mode === 'signup' && fullName.trim().length < 2) {
      setError('El nombre completo debe tener al menos 2 caracteres')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else if (mode === 'signup') {
        if (!fullName) {
          setError('El nombre completo es requerido')
          return
        }
        await signUpWithEmail(email, password, fullName)
        setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
      } else if (mode === 'reset') {
        await resetPassword(email)
        setSuccess('Se ha enviado un enlace de recuperación a tu email.')
      }
    } catch (error: unknown) {
      // Type guard for authentication errors
      const authError = error as { message?: string; error_description?: string }
      const errorMessage = authError?.message || authError?.error_description || ''
      
      if (errorMessage.includes(AUTH_CONFIG.ERROR_CODES.INVALID_CREDENTIALS)) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.')
      } else if (errorMessage.includes(AUTH_CONFIG.ERROR_CODES.USER_ALREADY_REGISTERED)) {
        setError('Este email ya está registrado. Intenta iniciar sesión.')
      } else if (errorMessage.includes(AUTH_CONFIG.ERROR_CODES.PASSWORD_TOO_SHORT)) {
        setError(`La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres.`)
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Por favor, confirma tu email antes de iniciar sesión.')
      } else if (errorMessage.includes('Signup requires a valid password')) {
        setError('La contraseña no cumple con los requisitos de seguridad.')
      } else {
        setError('Error al procesar la solicitud. Inténtalo de nuevo.')
      }
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (error) {
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo.')
      console.error('Google auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setError(null)
    setSuccess(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              CostMeet
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Calcula el costo real de tus reuniones
            </p>
          </div>

          {/* Card de auth */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {mode === 'login' ? 'Iniciar Sesión' : 
                 mode === 'signup' ? 'Crear Cuenta' : 
                 'Recuperar Contraseña'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {mode === 'login' ? 'Accede a tu cuenta para continuar' :
                 mode === 'signup' ? 'Crea tu cuenta gratuita' :
                 'Te enviaremos un enlace para restablecer tu contraseña'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Form de Email/Password */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tu nombre completo"
                    required={mode === 'signup'}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {mode !== 'reset' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                    required
                    minLength={VALIDATION_RULES.PASSWORD_MIN_LENGTH}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  mode === 'login' ? 'Iniciar Sesión' :
                  mode === 'signup' ? 'Crear Cuenta' :
                  'Enviar Enlace'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              <span className="px-4 text-sm text-gray-500 dark:text-gray-400">o</span>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>

            {/* Mode switchers */}
            <div className="mt-6 text-center space-y-2">
              {mode === 'login' && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Crear cuenta
                    </button>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ¿Olvidaste tu contraseña?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Recuperar
                    </button>
                  </p>
                </>
              )}

              {mode === 'signup' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Iniciar sesión
                  </button>
                </p>
              )}

              {mode === 'reset' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¿Recordaste tu contraseña?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Iniciar sesión
                  </button>
                </p>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Al continuar, aceptas nuestros{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Términos de Servicio
                </a>{' '}
                y{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Política de Privacidad
                </a>
              </p>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🎯 <span className="font-medium">CostMeet es gratis para empezar</span>
              <br />
              Hasta 10 reuniones al mes sin costo
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}
