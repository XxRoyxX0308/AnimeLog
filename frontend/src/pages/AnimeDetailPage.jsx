import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { animeAPI, reviewsAPI, watchlistAPI } from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatusBadge from '../components/ui/StatusBadge'
import ReviewCard from '../components/reviews/ReviewCard'
import ReviewModal from '../components/reviews/ReviewModal'
import WatchlistModal from '../components/watchlist/WatchlistModal'
import {
  StarIcon,
  PlayIcon,
  CalendarIcon,
  ClockIcon,
  TvIcon,
  PlusIcon,
  PencilIcon,
  BookmarkIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export default function AnimeDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuthStore()
  const [anime, setAnime] = useState(null)
  const [reviews, setReviews] = useState([])
  const [userEntry, setUserEntry] = useState(null)
  const [userReview, setUserReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showWatchlistModal, setShowWatchlistModal] = useState(false)

  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true)
      try {
        const animeRes = await animeAPI.getDetail(id)
        setAnime(animeRes.data.anime)
        
        // Fetch user's watchlist entry if authenticated
        if (isAuthenticated) {
          try {
            const entryRes = await watchlistAPI.checkAnime(id)
            setUserEntry(entryRes.data.entry)
          } catch (error) {
            // No entry exists
            setUserEntry(null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch anime:', error)
        toast.error('Failed to load anime details')
      } finally {
        setLoading(false)
      }
    }
    fetchAnimeData()
  }, [id, isAuthenticated])

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true)
      try {
        const reviewsRes = await reviewsAPI.getList({ anime_id: id, limit: 10 })
        setReviews(reviewsRes.data.reviews || [])
        
        // Find user's review if authenticated
        if (isAuthenticated) {
          const myReviewsRes = await reviewsAPI.getMyReviews({ anime_id: id })
          const myReview = myReviewsRes.data.reviews?.[0]
          setUserReview(myReview || null)
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [id, isAuthenticated])

  const handleWatchlistUpdate = (entry) => {
    setUserEntry(entry)
    setShowWatchlistModal(false)
    toast.success(entry ? 'Watchlist updated!' : 'Removed from watchlist')
  }

  const handleReviewSaved = (review) => {
    setUserReview(review)
    setShowReviewModal(false)
    // Refresh reviews
    setReviews((prev) => {
      const exists = prev.find((r) => r.id === review.id)
      if (exists) {
        return prev.map((r) => (r.id === review.id ? review : r))
      }
      return [review, ...prev]
    })
    toast.success('Review saved!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Anime not found</h2>
          <Link to="/catalog" className="btn btn-primary">
            Back to Catalog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${anime.banner_image || anime.cover_image})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-anime-dark-900 via-anime-dark-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-anime-dark-900/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <img
              src={anime.cover_image || '/placeholder-anime.jpg'}
              alt={anime.title}
              className="w-40 md:w-56 rounded-xl shadow-2xl ring-2 ring-anime-dark-600"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <h1 className="text-2xl md:text-4xl font-display font-bold text-white mb-2">
              {anime.title}
            </h1>
            {anime.title_japanese && (
              <p className="text-gray-400 mb-4">{anime.title_japanese}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {anime.rating && (
                <div className="flex items-center gap-1">
                  <StarIconSolid className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">{anime.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-400">
                <TvIcon className="w-4 h-4" />
                <span>{anime.type || 'TV'}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <PlayIcon className="w-4 h-4" />
                <span>{anime.episodes || '?'} episodes</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span>{anime.duration || '24 min'}</span>
              </div>
              {anime.aired_from && (
                <div className="flex items-center gap-1 text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(anime.aired_from).getFullYear()}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres?.map((genre) => (
                <Link
                  key={genre}
                  to={`/catalog?genre=${genre}`}
                  className="badge badge-primary hover:bg-anime-primary/30"
                >
                  {genre}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowWatchlistModal(true)}
                    className={`btn ${userEntry ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {userEntry ? (
                      <>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit List Entry
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add to List
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="btn btn-secondary"
                  >
                    <StarIcon className="w-4 h-4 mr-2" />
                    Write Review
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  <BookmarkIcon className="w-4 h-4 mr-2" />
                  Login to Track
                </Link>
              )}
            </div>

            {/* User Entry Status */}
            {userEntry && (
              <div className="mt-4 p-4 bg-anime-dark-700/50 rounded-lg inline-block">
                <div className="flex items-center gap-4">
                  <StatusBadge status={userEntry.status} />
                  <span className="text-gray-400">
                    Progress: {userEntry.episodes_watched} / {anime.episodes || '?'}
                  </span>
                  {userEntry.score && (
                    <div className="flex items-center gap-1">
                      <StarIconSolid className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">{userEntry.score}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {anime.synopsis || 'No synopsis available.'}
              </p>
            </div>

            {/* Reviews */}
            <div className="card">
              <div className="flex items-center justify-between p-6 border-b border-anime-dark-600">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-anime-secondary" />
                  <h2 className="text-xl font-semibold text-white">Reviews</h2>
                  <span className="text-sm text-gray-500">({reviews.length})</span>
                </div>
              </div>
              <div className="divide-y divide-anime-dark-600">
                {reviewsLoading ? (
                  <div className="p-8">
                    <LoadingSpinner />
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <StarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No reviews yet. Be the first!</p>
                    {isAuthenticated && (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="btn btn-primary"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Information */}
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">Information</h3>
              <dl className="space-y-3 text-sm">
                {anime.studio && (
                  <div>
                    <dt className="text-gray-500">Studio</dt>
                    <dd className="text-white">{anime.studio}</dd>
                  </div>
                )}
                {anime.source && (
                  <div>
                    <dt className="text-gray-500">Source</dt>
                    <dd className="text-white">{anime.source}</dd>
                  </div>
                )}
                {anime.status && (
                  <div>
                    <dt className="text-gray-500">Status</dt>
                    <dd className="text-white capitalize">{anime.status}</dd>
                  </div>
                )}
                {anime.season && (
                  <div>
                    <dt className="text-gray-500">Season</dt>
                    <dd className="text-white capitalize">{anime.season}</dd>
                  </div>
                )}
                {anime.aired_from && (
                  <div>
                    <dt className="text-gray-500">Aired</dt>
                    <dd className="text-white">
                      {new Date(anime.aired_from).toLocaleDateString()}
                      {anime.aired_to && ` - ${new Date(anime.aired_to).toLocaleDateString()}`}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Stats */}
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">Statistics</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 flex items-center gap-2">
                    <HeartIcon className="w-4 h-4" />
                    Favorites
                  </dt>
                  <dd className="text-white">{anime.favorites?.toLocaleString() || 0}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 flex items-center gap-2">
                    <StarIcon className="w-4 h-4" />
                    Reviews
                  </dt>
                  <dd className="text-white">{anime.review_count?.toLocaleString() || 0}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showWatchlistModal && (
        <WatchlistModal
          anime={anime}
          entry={userEntry}
          onClose={() => setShowWatchlistModal(false)}
          onSave={handleWatchlistUpdate}
        />
      )}
      {showReviewModal && (
        <ReviewModal
          anime={anime}
          review={null}
          onClose={() => setShowReviewModal(false)}
          onSave={handleReviewSaved}
        />
      )}
    </div>
  )
}
