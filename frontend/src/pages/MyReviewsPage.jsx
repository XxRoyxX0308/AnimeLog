import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { reviewsAPI } from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Pagination from '../components/ui/Pagination'
import ReviewModal from '../components/reviews/ReviewModal'
import {
  StarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export default function MyReviewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [selectedReview, setSelectedReview] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const res = await reviewsAPI.getMyReviews({
          page,
          per_page: 10
        })
        setReviews(res.data.reviews || [])
        setPagination({
          page: res.data.pagination?.page || 1,
          pages: res.data.pagination?.pages || 1,
          total: res.data.pagination?.total || 0
        })
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
        toast.error('Failed to load your reviews')
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [page])

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

  const handleEditReview = (review) => {
    setSelectedReview(review)
    setShowEditModal(true)
  }

  const handleSaveReview = (updatedReview) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    )
    setShowEditModal(false)
    setSelectedReview(null)
    toast.success('Review updated!')
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await reviewsAPI.delete(reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      toast.success('Review deleted')
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            My Reviews
          </h1>
          <p className="text-gray-400">
            Manage and edit all your anime reviews
          </p>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            {pagination.total > 0 ? (
              <>{pagination.total} review{pagination.total !== 1 ? 's' : ''}</>
            ) : (
              'No reviews yet'
            )}
          </p>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="card p-4 hover:border-anime-dark-500 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Anime Cover */}
                  <Link to={`/anime/${review.anime?.id}`} className="flex-shrink-0">
                    <img
                      src={review.anime?.cover_image || '/placeholder-anime.jpg'}
                      alt={review.anime?.title}
                      className="w-16 h-24 object-cover rounded-lg hover:ring-2 hover:ring-anime-primary transition-all"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/anime/${review.anime?.id}`}
                          className="font-semibold text-white hover:text-anime-primary transition-colors"
                        >
                          {review.anime?.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          {/* Rating Stars */}
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              i < review.rating ? (
                                <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
                              ) : (
                                <StarIcon key={i} className="w-4 h-4 text-gray-600" />
                              )
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-anime-dark-600 transition-colors"
                          title="Edit Review"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <Link
                          to={`/reviews/${review.id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-anime-accent hover:bg-anime-dark-600 transition-colors"
                          title="View Review"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-anime-error hover:bg-anime-dark-600 transition-colors"
                          title="Delete Review"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h3 className="text-white font-medium mt-2">{review.title}</h3>
                    )}

                    {/* Review Content Preview */}
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {review.content}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        {review.comments_count || 0} comments
                      </span>
                      <span>♥ {review.likes_count || 0} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <StarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start sharing your thoughts on anime you've watched!
            </p>
            <Link to="/catalog" className="btn btn-primary">
              Browse Catalog
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

      {/* Edit Modal */}
      {showEditModal && selectedReview && (
        <ReviewModal
          anime={selectedReview.anime}
          review={selectedReview}
          onClose={() => {
            setShowEditModal(false)
            setSelectedReview(null)
          }}
          onSave={handleSaveReview}
        />
      )}
    </div>
  )
}
