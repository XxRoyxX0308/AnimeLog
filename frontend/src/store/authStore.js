import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      // Called when store rehydrates from localStorage
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      // Check auth on app load
      checkAuth: async () => {
        // If already authenticated with a user, just stop loading
        const currentState = get()
        if (currentState.isAuthenticated && currentState.user) {
          set({ isLoading: false })
          return
        }

        const token = localStorage.getItem('access_token')
        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null })
          return
        }

        try {
          const response = await authAPI.getMe()
          set({ 
            user: response.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          // Only clear tokens if we get a 401 and it's not a network error
          if (error.response?.status === 401) {
            console.log('[Auth] checkAuth failed with 401, clearing tokens')
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            set({ user: null, isAuthenticated: false, isLoading: false })
          } else {
            // Network error - keep existing state but stop loading
            set({ isLoading: false })
          }
        }
      },

      // Login
      login: async (email, password) => {
        try {
          const response = await authAPI.login(email, password)
          const { user, access_token, refresh_token } = response.data
          
          console.log('Login successful, storing tokens...')
          console.log('Access token received:', access_token ? 'yes' : 'no')
          
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          
          // Verify tokens were stored
          console.log('Token stored:', localStorage.getItem('access_token') ? 'yes' : 'no')
          
          set({ user, isAuthenticated: true, isLoading: false })
          toast.success(`Welcome back, ${user.username}!`)
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.error || 'Login failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      // Register
      register: async (email, username, password) => {
        try {
          const response = await authAPI.register(email, username, password)
          const { user, access_token, refresh_token } = response.data
          
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          
          set({ user, isAuthenticated: true, isLoading: false })
          toast.success('Welcome to AnimeLog!')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.error || 'Registration failed'
          const details = error.response?.data?.details
          toast.error(message)
          return { success: false, error: message, details }
        }
      },

      // Logout
      logout: () => {
        console.log('[Auth] logout() called')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
        toast.success('Logged out successfully')
      },

      // Update user
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      // Update profile
      updateProfile: async (data) => {
        try {
          const response = await authAPI.updateProfile(data)
          set({ user: response.data.user })
          toast.success('Profile updated successfully')
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.error || 'Failed to update profile'
          toast.error(message)
          return { success: false, error: message }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state, error) => {
        // Check if we have tokens - if so, we're logged in regardless of persisted state
        const hasToken = !!localStorage.getItem('access_token')
        if (hasToken && state) {
          // Keep the token-based auth state
          console.log('[Auth] Rehydrating with token present')
        } else if (!hasToken && state) {
          // No token but persisted says authenticated - clear it
          state.user = null
          state.isAuthenticated = false
        }
        state?.setHasHydrated(true)
      }
    }
  )
)
