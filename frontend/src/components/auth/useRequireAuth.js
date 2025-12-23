import { useAuthStore } from '../../store/authStore'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

/**
 * Hook to require authentication for write actions
 * Returns a function that checks auth and redirects if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue')
      navigate('/login', { state: { from: location.pathname } })
      return false
    }
    if (callback) callback()
    return true
  }

  return { requireAuth, isAuthenticated }
}
