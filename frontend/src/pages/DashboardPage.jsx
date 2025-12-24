import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usersAPI } from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatusBadge from '../components/ui/StatusBadge'
import {
  ChartBarIcon,
  BookOpenIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const statusConfig = {
  watching: { icon: PlayCircleIcon, color: 'text-anime-accent', bgColor: 'bg-anime-accent/20' },
  completed: { icon: CheckCircleIcon, color: 'text-anime-success', bgColor: 'bg-anime-success/20' },
  on_hold: { icon: PauseCircleIcon, color: 'text-anime-warning', bgColor: 'bg-anime-warning/20' },
  dropped: { icon: XCircleIcon, color: 'text-anime-error', bgColor: 'bg-anime-error/20' },
  plan_to_watch: { icon: ClockIcon, color: 'text-gray-400', bgColor: 'bg-gray-500/20' }
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [recentLogs, setRecentLogs] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [currentlyWatching, setCurrentlyWatching] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch if we're authenticated
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      
      // Double-check token exists
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }
      
      try {
        const res = await usersAPI.getDashboard()
        const data = res.data
        setStats(data.stats)
        setRecentLogs(data.recent_logs || [])
        setRecentReviews(data.recent_reviews || [])
        setCurrentlyWatching(data.currently_watching || [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.username}</span>!
          </h1>
          <p className="text-gray-400">Here's an overview of your anime journey.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = stats?.[status] || 0
            const StatusIcon = config.icon
            return (
              <Link
                key={status}
                to={`/my-logs?status=${status}`}
                className="card p-4 hover:border-anime-primary/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center mb-3`}>
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400 capitalize">
                  {status.replace('_', ' ')}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Logs */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-anime-dark-600">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-anime-primary" />
                  <h2 className="font-semibold text-white">Recent Activity</h2>
                </div>
                <Link to="/my-logs" className="text-sm text-anime-accent hover:text-anime-primary">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-anime-dark-600">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-anime-dark-700/50 transition-colors">
                      <img
                        src={log.anime?.cover_image || '/placeholder-anime.jpg'}
                        alt={log.anime?.title}
                        className="w-12 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/anime/${log.anime?.id}`}
                          className="font-medium text-white hover:text-anime-primary truncate block"
                        >
                          {log.anime?.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          <StatusBadge status={log.status} />
                          <span className="text-sm text-gray-400">
                            Ep. {log.episodes_watched} / {log.anime?.episodes || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        {new Date(log.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <BookOpenIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No anime in your list yet</p>
                    <Link to="/catalog" className="btn btn-primary">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Browse Catalog
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card p-4 text-center">
                <div className="text-3xl font-bold gradient-text">
                  {stats?.total_anime || 0}
                </div>
                <div className="text-sm text-gray-400">Total Anime</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-3xl font-bold text-anime-accent">
                  {stats?.total_episodes || 0}
                </div>
                <div className="text-sm text-gray-400">Episodes Watched</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-3xl font-bold text-anime-secondary">
                  {stats?.total_reviews || 0}
                </div>
                <div className="text-sm text-gray-400">Reviews Written</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-3xl font-bold text-anime-warning">
                  {stats?.average_rating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-gray-400">Avg. Rating</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Reviews */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-anime-dark-600">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-anime-secondary" />
                  <h2 className="font-semibold text-white">My Reviews</h2>
                </div>
                <Link to="/my-reviews" className="text-sm text-anime-accent hover:text-anime-primary">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-anime-dark-600">
                {recentReviews.length > 0 ? (
                  recentReviews.map((review) => (
                    <Link
                      key={review.id}
                      to={`/reviews/${review.id}`}
                      className="block p-4 hover:bg-anime-dark-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium truncate">
                        {review.anime?.title}
                      </p>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                        {review.content}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <StarIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No reviews yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-4">
              <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/catalog"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-anime-dark-700 transition-colors"
                >
                  <EyeIcon className="w-5 h-5 text-anime-primary" />
                  <span className="text-gray-300">Browse Catalog</span>
                </Link>
                <Link
                  to="/my-logs"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-anime-dark-700 transition-colors"
                >
                  <BookOpenIcon className="w-5 h-5 text-anime-accent" />
                  <span className="text-gray-300">View My Logs</span>
                </Link>
                <Link
                  to="/community"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-anime-dark-700 transition-colors"
                >
                  <ArrowTrendingUpIcon className="w-5 h-5 text-anime-secondary" />
                  <span className="text-gray-300">Community Reviews</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
