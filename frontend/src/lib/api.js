import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url} - Token: ${token ? 'present' : 'missing'}`)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Skip auth retry for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh') ||
                          originalRequest.url?.includes('/auth/me')

    // Only handle 401 if:
    // 1. It's a 401 error
    // 2. Not already retrying
    // 3. Not an auth endpoint
    // 4. Original request had an Authorization header (was meant to be authenticated)
    const hadAuthHeader = originalRequest.headers?.Authorization
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && hadAuthHeader) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      console.log('[API] Attempting refresh, refresh_token:', refreshToken ? 'present' : 'missing')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          })
          
          const { access_token } = response.data
          localStorage.setItem('access_token', access_token)
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          console.log('[API] Refresh token failed, clearing auth')
          // Refresh failed, clear tokens
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('auth-storage')
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, username, password) => api.post('/auth/register', { email, username, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
}

// Anime API
export const animeAPI = {
  getList: (params) => api.get('/anime', { params }),
  getDetail: (id) => api.get(`/anime/${id}`),
  getGenres: () => api.get('/anime/genres'),
  getSeasons: () => api.get('/anime/seasons'),
  getStats: () => api.get('/anime/stats'),
  getTrending: (limit = 10) => api.get('/anime/trending', { params: { limit } }),
  getRecent: (limit = 10) => api.get('/anime/recent', { params: { limit } }),
  create: (data) => api.post('/anime', data),
  delete: (id) => api.delete(`/anime/${id}`)
}

// Reviews API
export const reviewsAPI = {
  getList: (params) => api.get('/reviews', { params }),
  getDetail: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  like: (id) => api.post(`/reviews/${id}/like`),
  getMyReviews: (params) => api.get('/reviews/my-reviews', { params })
}

// Comments API
export const commentsAPI = {
  getForReview: (reviewId, params) => api.get(`/comments/review/${reviewId}`, { params }),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`)
}

// Watchlist API
export const watchlistAPI = {
  getList: (params) => api.get('/watchlist', { params }),
  getStats: () => api.get('/watchlist/stats'),
  getRecent: (limit = 5) => api.get('/watchlist/recent', { params: { limit } }),
  add: (data) => api.post('/watchlist', data),
  update: (id, data) => api.put(`/watchlist/${id}`, data),
  remove: (id) => api.delete(`/watchlist/${id}`),
  checkAnime: (animeId) => api.get(`/watchlist/anime/${animeId}`)
}

// Users API
export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  getReviews: (id, params) => api.get(`/users/${id}/reviews`, { params }),
  getStats: (id) => api.get(`/users/${id}/stats`),
  getDashboard: () => api.get('/users/dashboard')
}

export default api
