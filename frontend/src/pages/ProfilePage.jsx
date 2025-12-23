import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usersAPI } from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ReviewCard from '../components/reviews/ReviewCard'
import {
  UserCircleIcon,
  CalendarIcon,
  BookOpenIcon,
  StarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reviews')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const [profileRes, reviewsRes, statsRes] = await Promise.all([
          usersAPI.getProfile(id),
          usersAPI.getReviews(id, { limit: 10 }),
          usersAPI.getStats(id)
        ])
        setUser(profileRes.data.user)
        setReviews(reviewsRes.data.reviews || [])
        setStats(statsRes.data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">User not found</h2>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-anime-primary to-anime-secondary flex items-center justify-center flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-display font-bold text-4xl md:text-5xl">
                  {user.username?.[0]?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                {user.username}
              </h1>
              {user.bio && (
                <p className="text-gray-400 mb-4 max-w-2xl">{user.bio}</p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-anime-dark-600">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {stats?.total_anime || 0}
              </div>
              <div className="text-sm text-gray-400">Anime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-anime-accent">
                {stats?.total_episodes || 0}
              </div>
              <div className="text-sm text-gray-400">Episodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-anime-secondary">
                {stats?.total_reviews || 0}
              </div>
              <div className="text-sm text-gray-400">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-anime-warning">
                {stats?.average_rating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-400">Avg. Rating</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'reviews'
                ? 'bg-anime-primary text-white'
                : 'bg-anime-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            <StarIcon className="w-4 h-4 inline mr-2" />
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-anime-primary text-white'
                : 'bg-anime-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            <ChartBarIcon className="w-4 h-4 inline mr-2" />
            Statistics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} showAnime expanded />
              ))
            ) : (
              <div className="card p-12 text-center">
                <StarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No reviews yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">Anime Status</h3>
              <div className="space-y-3">
                {Object.entries(stats?.by_status || {}).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400 capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-white">{count}</span>
                    </div>
                    <div className="h-2 bg-anime-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-anime-primary rounded-full"
                        style={{
                          width: `${stats?.total_anime ? (count / stats.total_anime) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats?.ratings?.[rating] || 0
                  const total = stats?.total_reviews || 1
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm text-white">{rating}</span>
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-anime-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
