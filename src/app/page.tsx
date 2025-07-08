'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AUTH_CONFIG } from '@/lib/constants'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push(AUTH_CONFIG.REDIRECT_ROUTES.DASHBOARD)
      } else {
        router.push(AUTH_CONFIG.REDIRECT_ROUTES.LOGIN)
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            CostMeet
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Cargando...
          </p>
        </div>
      </div>
    )
  }

  return null
}
