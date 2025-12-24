import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { reviewsAPI } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import ReviewCard from '../components/reviews/ReviewCard'
import Pagination from '../components/ui/Pagination'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: ClockIcon },
  { value: 'popular', label: 'Most Popular', icon: FireIcon },
  { value: 'highest', label: 'Highest Rated', icon: SparklesIcon }
]

export default function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const sort = searchParams.get('sort') || 'newest'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const res = await reviewsAPI.getList({
          page,
          limit: 12,
          sort,
          ...(search && { search })
        })
        setReviews(res.data.reviews || [])
        setPagination({
          page: res.data.pagination?.page || res.data.page || 1,
          pages: res.data.pagination?.pages || res.data.pages || 1,
          total: res.data.pagination?.total || res.data.total || 0
        })
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [sort, search, page])

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    if (key !== 'page') {
      newParams.delete('page')
    }
    setSearchParams(newParams)
  }

  const handleLike = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like reviews')
      navigate('/login')
      return
    }
    try {
      await reviewsAPI.like(reviewId)
      // Update the local review state to reflect the like
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                user_liked: !r.user_liked,
                likes_count: r.user_liked ? r.likes_count - 1 : r.likes_count + 1
              }
            : r
        )
      )
    } catch (error) {
      toast.error('Failed to like review')
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-anime-secondary" />
            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
              Community Reviews
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover what the community thinks about their favorite anime. 
            Read reviews, share your thoughts, and join the conversation.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParams('search', e.target.value)}
              placeholder="Search reviews by anime title or content..."
              className="input pl-12"
            />
          </div>

          {/* Sort Tabs */}
          <div className="flex items-center bg-anime-dark-700 rounded-lg p-1">
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => updateParams('sort', option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    sort === option.value
                      ? 'bg-anime-primary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            {pagination.total > 0 ? (
              <>Showing {reviews.length} of {pagination.total.toLocaleString()} reviews</>
            ) : (
              'No reviews found'
            )}
          </p>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} showAnime expanded onLike={handleLike} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No reviews found</h3>
            <p className="text-gray-400 mb-6">
              {search 
                ? 'Try adjusting your search terms'
                : 'Be the first to share your thoughts on an anime!'
              }
            </p>
            <Link to="/catalog" className="btn btn-primary">
              Browse Anime to Review
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(p) => updateParams('page', p.toString())}
            />
          </div>
        )}
      </div>
    </div>
  )
}
