import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
  console.error('Erreur globale:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesse rejetée non gérée:', event.reason)
})

// Composant de fallback en cas d'erreur
const ErrorFallback = ({ error }) => (
  <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
      <h2 className="text-xl font-semibold text-red-400 mb-2">Erreur de chargement</h2>
      <p className="text-gray-300 mb-4">
        Une erreur est survenue lors du chargement de l'application.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
      >
        Recharger la page
      </button>
    </div>
  </div>
)

// Composant principal avec gestion d'erreur
const AppWrapper = () => {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Erreur dans l\'application:', error)
      setError(error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return <ErrorFallback error={error} />
  }

  return (
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
          },
        }}
      />
    </BrowserRouter>
  )
}

// Rendu avec gestion d'erreur
const root = ReactDOM.createRoot(document.getElementById('root'))

try {
  root.render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  )
} catch (error) {
  console.error('Erreur lors du rendu:', error)
  root.render(<ErrorFallback error={error} />)
}