import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État de l'utilisateur
      user: null,
      session: null,
      
      // États de chargement
      loading: true,
      authLoading: false,
      magicLinkLoading: false,
      otpLoading: false,
      
      // États d'interface
      magicLinkSent: false,
      otpSent: false,
      showOTPInput: false,
      lastEmail: null,
      lastPhone: null,
      
      // Redirection
      redirectTo: null,
      
      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setAuthLoading: (authLoading) => set({ authLoading }),
      setMagicLinkLoading: (magicLinkLoading) => set({ magicLinkLoading }),
      setOtpLoading: (otpLoading) => set({ otpLoading }),
      
      // Gestion des magic links
      setMagicLinkSent: (sent, email = null) => set({ 
        magicLinkSent: sent, 
        lastEmail: email,
        showOTPInput: false 
      }),
      
      // Gestion des OTP
      setOtpSent: (sent, phone = null) => set({ 
        otpSent: sent, 
        lastPhone: phone,
        showOTPInput: true 
      }),
      
      setShowOTPInput: (show) => set({ showOTPInput: show }),
      
      // Redirection
      setRedirectTo: (path) => set({ redirectTo: path }),
      clearRedirectTo: () => set({ redirectTo: null }),
      
      // Connexion avec magic link
      signInWithMagicLink: async (email, redirectTo = null) => {
        set({ magicLinkLoading: true, magicLinkSent: false })
        
        try {
          const { data, error } = await authService.signInWithMagicLink(email, redirectTo)
          
          if (error) {
            throw new Error(authService.getAuthError(error))
          }
          
          set({ 
            magicLinkSent: true, 
            lastEmail: email,
            redirectTo: redirectTo 
          })
          
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          set({ magicLinkLoading: false })
        }
      },
      
      // Connexion avec OTP
      signInWithOTP: async (phone) => {
        set({ otpLoading: true, otpSent: false })
        
        try {
          const { data, error } = await authService.signInWithOTP(phone)
          
          if (error) {
            throw new Error(authService.getAuthError(error))
          }
          
          set({ 
            otpSent: true, 
            lastPhone: phone,
            showOTPInput: true 
          })
          
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          set({ otpLoading: false })
        }
      },
      
      // Vérification OTP
      verifyOTP: async (token) => {
        set({ otpLoading: true })
        
        try {
          const { data, error } = await authService.verifyOTP(get().lastEmail, token)
          
          if (error) {
            throw new Error(authService.getAuthError(error))
          }
          
          set({ 
            user: data.user,
            session: data.session,
            otpSent: false,
            showOTPInput: false,
            lastEmail: null,
            lastPhone: null
          })
          
          return { success: true, user: data.user }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          set({ otpLoading: false })
        }
      },
      
      // Vérification OTP SMS
      verifySMSOTP: async (token) => {
        set({ otpLoading: true })
        
        try {
          const { data, error } = await authService.verifySMSOTP(get().lastPhone, token)
          
          if (error) {
            throw new Error(authService.getAuthError(error))
          }
          
          set({ 
            user: data.user,
            session: data.session,
            otpSent: false,
            showOTPInput: false,
            lastEmail: null,
            lastPhone: null
          })
          
          return { success: true, user: data.user }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          set({ otpLoading: false })
        }
      },
      
      // Connexion classique
      signIn: async (email, password) => {
        set({ authLoading: true })
        
        try {
          const { data, error } = await authService.signIn(email, password)
          
          if (error) {
            throw new Error(authService.getAuthError(error))
          }
          
          set({ 
            user: data.user,
            session: data.session,
            magicLinkSent: false,
            otpSent: false,
            showOTPInput: false,
            lastEmail: null,
            lastPhone: null
          })
          
          return { success: true, user: data.user }
        } catch (error) {
          return { success: false, error: error.message }
        } finally {
          set({ authLoading: false })
        }
      },
      
      // Déconnexion
      logout: async () => {
        try {
          await authService.signOut()
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error)
        } finally {
          set({ 
            user: null, 
            session: null,
            magicLinkSent: false,
            otpSent: false,
            showOTPInput: false,
            lastEmail: null,
            lastPhone: null,
            redirectTo: null
          })
        }
      },
      
      // Réinitialisation des états
      resetAuthStates: () => set({
        magicLinkSent: false,
        otpSent: false,
        showOTPInput: false,
        lastEmail: null,
        lastPhone: null,
        magicLinkLoading: false,
        otpLoading: false,
        authLoading: false
      }),
      
      // Vérification de l'authentification
      isAuthenticated: () => {
        const { user, session } = get()
        return !!(user && session)
      },
      
      // Vérification si l'utilisateur peut accéder à une route
      canAccess: (requiredRole = null) => {
        const { user } = get()
        if (!user) return false
        if (!requiredRole) return true
        return user.user_metadata?.role === requiredRole
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        redirectTo: state.redirectTo
      }),
    }
  )
)