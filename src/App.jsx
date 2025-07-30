import React, { useEffect, useState, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { authService } from './services/supabase'

// Pages avec lazy loading pour améliorer les performances
const Login = React.lazy(() => import('./pages/Login'))
const Register = React.lazy(() => import('./pages/Register'))
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Subjects = React.lazy(() => import('./pages/Subjects'))
const Flashcards = React.lazy(() => import('./pages/Flashcards'))
const Quiz = React.lazy(() => import('./pages/Quiz'))
const Summary = React.lazy(() => import('./pages/Summary'))
const Profile = React.lazy(() => import('./pages/Profile'))
const DocumentUpload = React.lazy(() => import('./pages/DocumentUpload'))

// Components
const Layout = React.lazy(() => import('./components/Layout'))
const LoadingSpinner = React.lazy(() => import('./components/LoadingSpinner'))

// Composant de fallback pour le lazy loading
const PageFallback = () => (
  <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p className="text-secondary-400">Chargement...</p>
    </div>
  </div>
)

function App() {
  const { 
    user, 
    session,
    setUser, 
    setSession,
    loading, 
    setLoading,
    isAuthenticated 
  } = useAuthStore()
  const { isDark } = useThemeStore()
  const [error, setError] = useState(null)
  const [demoMode, setDemoMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Vérifier le mode démo
    const isDemoMode = localStorage.getItem('demoMode') === 'true'
    setDemoMode(isDemoMode)
  }, [])

  useEffect(() => {
    // Appliquer le thème
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    // Vérifier la session utilisateur au démarrage
    const checkUser = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Si en mode démo, ne pas vérifier Supabase
        if (demoMode) {
          setLoading(false)
          setIsInitialized(true)
          return
        }

        // Vérifier si Supabase est configuré
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Mode démo : Supabase non configuré')
          setDemoMode(true)
          setLoading(false)
          setIsInitialized(true)
          return
        }

        // Récupérer la session actuelle
        const { session, error } = await authService.getSession()
        
        if (error) {
          console.error('Erreur Supabase:', error)
          setError('Erreur de connexion à la base de données')
        } else if (session) {
          setUser(session.user)
          setSession(session)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error)
        setError('Erreur de connexion')
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    checkUser()

    // Écouter les changements d'authentification (seulement si pas en mode démo)
    if (!demoMode) {
      const { data: { subscription } } = authService.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email)
          
          switch (event) {
            case 'SIGNED_IN':
              setUser(session?.user || null)
              setSession(session)
              setLoading(false)
              break
            case 'SIGNED_OUT':
              setUser(null)
              setSession(null)
              setLoading(false)
              break
            case 'TOKEN_REFRESHED':
              setSession(session)
              break
            case 'USER_UPDATED':
              setUser(session?.user || null)
              break
            default:
              break
          }
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [setUser, setSession, setLoading, demoMode])

  // Afficher l'erreur si elle existe
  if (error) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Erreur de connexion</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mr-2"
            >
              Recharger la page
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('demoMode', 'true')
                window.location.reload()
              }} 
              className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg"
            >
              Mode démo
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-400">Chargement de l'application...</p>
        </div>
      </div>
    )
  }

  // Vérifier si l'utilisateur est connecté ou en mode démo
  const isUserAuthenticated = isAuthenticated() || demoMode

  return (
    <div className="min-h-screen bg-secondary-900">
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Routes publiques */}
          <Route 
            path="/login" 
            element={isUserAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isUserAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />
          
          {/* Routes protégées */}
          <Route 
            path="/" 
            element={isUserAuthenticated ? <Layout /> : <Navigate to="/login" replace />} 
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="summary" element={<Summary />} />
            <Route path="profile" element={<Profile />} />
            <Route path="upload" element={<DocumentUpload />} />
          </Route>
          
          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App