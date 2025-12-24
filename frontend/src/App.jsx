import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

// Layout
import MainLayout from './components/layout/MainLayout'

// Pages
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import AnimeDetailPage from './pages/AnimeDetailPage'
import DashboardPage from './pages/DashboardPage'
import MyLogsPage from './pages/MyLogsPage'
import MyReviewsPage from './pages/MyReviewsPage'
import CommunityPage from './pages/CommunityPage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'

// Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { isLoading, _hasHydrated, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // After hydration, just set loading to false
    // The persist middleware already restored user/isAuthenticated from localStorage
    if (_hasHydrated) {
      useAuthStore.setState({ isLoading: false })
    }
  }, [_hasHydrated])

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anime-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anime-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading AnimeLog...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="anime/:id" element={<AnimeDetailPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="reviews/:id" element={<ReviewDetailPage />} />
        <Route path="users/:id" element={<ProfilePage />} />
        
        {/* Protected Routes */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="my-logs" element={
          <ProtectedRoute>
            <MyLogsPage />
          </ProtectedRoute>
        } />
        <Route path="my-reviews" element={
          <ProtectedRoute>
            <MyReviewsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Auth Routes (outside main layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
