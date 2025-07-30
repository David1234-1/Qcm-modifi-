import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, EyeOff, BookOpen, Mail, Lock, Smartphone, 
  ArrowLeft, CheckCircle, AlertCircle, Loader2,
  MessageSquare, Send, Key
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authMethod, setAuthMethod] = useState('magic-link') // 'magic-link', 'otp', 'password'
  const [inputType, setInputType] = useState('email') // 'email', 'phone'
  
  const navigate = useNavigate()
  const location = useLocation()
  
  const {
    user,
    loading,
    magicLinkLoading,
    otpLoading,
    authLoading,
    magicLinkSent,
    otpSent,
    showOTPInput,
    lastEmail,
    lastPhone,
    signInWithMagicLink,
    signInWithOTP,
    verifyOTP,
    verifySMSOTP,
    signIn,
    resetAuthStates
  } = useAuthStore()

  // Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from || '/dashboard'
      navigate(redirectTo, { replace: true })
    }
  }, [user, navigate, location])

  // Réinitialisation des états au montage
  useEffect(() => {
    resetAuthStates()
  }, [resetAuthStates])

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault()
    
    if (!email && !phone) {
      toast.error('Veuillez entrer votre email ou numéro de téléphone')
      return
    }

    const redirectTo = location.state?.from || '/dashboard'
    const result = await signInWithMagicLink(email || phone, redirectTo)
    
    if (result.success) {
      toast.success('Lien magique envoyé ! Vérifiez votre boîte mail.')
    } else {
      toast.error(result.error)
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    
    if (!phone) {
      toast.error('Veuillez entrer votre numéro de téléphone')
      return
    }

    const result = await signInWithOTP(phone)
    
    if (result.success) {
      toast.success('Code OTP envoyé par SMS !')
    } else {
      toast.error(result.error)
    }
  }

  const handleOTPVerification = async (e) => {
    e.preventDefault()
    
    if (!otpToken) {
      toast.error('Veuillez entrer le code OTP')
      return
    }

    const result = lastEmail 
      ? await verifyOTP(otpToken)
      : await verifySMSOTP(otpToken)
    
    if (result.success) {
      toast.success('Connexion réussie !')
      const redirectTo = location.state?.from || '/dashboard'
      navigate(redirectTo, { replace: true })
    } else {
      toast.error(result.error)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const result = await signIn(email, password)
    
    if (result.success) {
      toast.success('Connexion réussie !')
      const redirectTo = location.state?.from || '/dashboard'
      navigate(redirectTo, { replace: true })
    } else {
      toast.error(result.error)
    }
  }

  const handleDemoMode = () => {
    localStorage.setItem('demoMode', 'true')
    navigate('/dashboard')
  }

  const resendMagicLink = async () => {
    const redirectTo = location.state?.from || '/dashboard'
    const result = await signInWithMagicLink(lastEmail, redirectTo)
    
    if (result.success) {
      toast.success('Nouveau lien magique envoyé !')
    } else {
      toast.error(result.error)
    }
  }

  const resendOTP = async () => {
    const result = await signInWithOTP(lastPhone)
    
    if (result.success) {
      toast.success('Nouveau code OTP envoyé !')
    } else {
      toast.error(result.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-secondary-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StudyHub</h1>
          <p className="text-secondary-400">Votre assistant d'étude intelligent</p>
        </motion.div>

        {/* Méthodes d'authentification */}
        {!magicLinkSent && !otpSent && !showOTPInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary-800 rounded-xl p-6 shadow-xl"
          >
            {/* Sélecteur de méthode */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setAuthMethod('magic-link')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  authMethod === 'magic-link'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Magic Link
              </button>
              <button
                onClick={() => setAuthMethod('otp')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  authMethod === 'otp'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                }`}
              >
                <Smartphone className="w-4 h-4 inline mr-2" />
                SMS
              </button>
              <button
                onClick={() => setAuthMethod('password')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  authMethod === 'password'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Mot de passe
              </button>
            </div>

            {/* Formulaire Magic Link */}
            {authMethod === 'magic-link' && (
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={magicLinkLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {magicLinkLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer le lien magique
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Formulaire OTP */}
            {authMethod === 'otp' && (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {otpLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Envoyer le code SMS
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Formulaire mot de passe */}
            {authMethod === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full pl-10 pr-12 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {authLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>
            )}

            {/* Mode démo */}
            <div className="mt-6 pt-6 border-t border-secondary-700">
              <button
                onClick={handleDemoMode}
                className="w-full bg-secondary-700 hover:bg-secondary-600 text-secondary-300 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Essayer en mode démo
              </button>
            </div>

            {/* Lien d'inscription */}
            <div className="mt-4 text-center">
              <p className="text-secondary-400">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium">
                  S'inscrire
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Confirmation Magic Link */}
        <AnimatePresence>
          {magicLinkSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-secondary-800 rounded-xl p-6 shadow-xl text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Lien magique envoyé !</h2>
              <p className="text-secondary-400 mb-4">
                Nous avons envoyé un lien de connexion à <strong>{lastEmail}</strong>
              </p>
              <p className="text-sm text-secondary-500 mb-6">
                Cliquez sur le lien dans votre email pour vous connecter automatiquement.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={resendMagicLink}
                  disabled={magicLinkLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {magicLinkLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Renvoyer le lien
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    resetAuthStates()
                    setEmail('')
                  }}
                  className="w-full bg-secondary-700 hover:bg-secondary-600 text-secondary-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation OTP */}
        <AnimatePresence>
          {otpSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-secondary-800 rounded-xl p-6 shadow-xl text-center"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Code SMS envoyé !</h2>
              <p className="text-secondary-400 mb-4">
                Nous avons envoyé un code à <strong>{lastPhone}</strong>
              </p>
              
              <form onSubmit={handleOTPVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Code OTP
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      type="text"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {otpLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Vérifier le code'
                  )}
                </button>
              </form>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={resendOTP}
                  disabled={otpLoading}
                  className="w-full bg-secondary-700 hover:bg-secondary-600 text-secondary-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  Renvoyer le code
                </button>
                
                <button
                  onClick={() => {
                    resetAuthStates()
                    setPhone('')
                    setOtpToken('')
                  }}
                  className="w-full bg-secondary-600 hover:bg-secondary-500 text-secondary-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Login