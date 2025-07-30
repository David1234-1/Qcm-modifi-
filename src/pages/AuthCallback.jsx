import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const AuthCallback = () => {
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser, setSession, redirectTo, clearRedirectTo } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Vérifier s'il y a une erreur
        if (error) {
          setError(errorDescription || 'Erreur d\'authentification')
          setStatus('error')
          return
        }

        // Si on a des tokens, traiter la session
        if (accessToken && refreshToken) {
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            throw new Error(sessionError.message)
          }

          if (session) {
            setUser(session.user)
            setSession(session)
            setStatus('success')
            
            // Rediriger après un court délai
            setTimeout(() => {
              const targetPath = redirectTo || '/dashboard'
              clearRedirectTo()
              navigate(targetPath, { replace: true })
            }, 1500)
          } else {
            throw new Error('Session invalide')
          }
        } else {
          // Essayer de récupérer la session actuelle
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            throw new Error(sessionError.message)
          }

          if (session) {
            setUser(session.user)
            setSession(session)
            setStatus('success')
            
            setTimeout(() => {
              const targetPath = redirectTo || '/dashboard'
              clearRedirectTo()
              navigate(targetPath, { replace: true })
            }, 1500)
          } else {
            throw new Error('Aucune session trouvée')
          }
        }
      } catch (error) {
        console.error('Erreur lors du callback d\'authentification:', error)
        setError(error.message || 'Erreur d\'authentification')
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [searchParams, setUser, setSession, redirectTo, clearRedirectTo, navigate])

  const handleRetry = () => {
    setStatus('loading')
    setError(null)
    // Recharger la page pour réessayer
    window.location.reload()
  }

  const handleGoToLogin = () => {
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-secondary-800 rounded-xl p-8 shadow-xl text-center"
        >
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Connexion en cours...
              </h2>
              <p className="text-secondary-400">
                Nous vérifions votre authentification
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Connexion réussie !
              </h2>
              <p className="text-secondary-400">
                Redirection vers votre tableau de bord...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Erreur de connexion
              </h2>
              <p className="text-secondary-400 mb-6">
                {error || 'Une erreur est survenue lors de la connexion'}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Réessayer
                </button>
                
                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-secondary-700 hover:bg-secondary-600 text-secondary-300 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Retour à la connexion
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AuthCallback