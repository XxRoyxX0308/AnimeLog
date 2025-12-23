import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { watchlistAPI, reviewsAPI } from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatusBadge from '../components/ui/StatusBadge'
import Pagination from '../components/ui/Pagination'
import WatchlistModal from '../components/watchlist/WatchlistModal'
import ReviewModal from '../components/reviews/ReviewModal'
import {
  BookOpenIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

const STATUS_TABS = [
  { value: '', label: 'All', color: 'bg-anime-dark-600' },
  { value: 'watching', label: 'Watching', color: 'bg-anime-accent' },
  { value: 'completed', label: 'Completed', color: 'bg-anime-success' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-anime-warning' },
  { value: 'dropped', label: 'Dropped', color: 'bg-anime-error' },
  { value: 'plan_to_watch', label: 'Plan to Watch', color: 'bg-gray-500' }
]

export default function MyLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState(null)

  const tab = searchParams.get('tab') || 'list'
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true)
      try {
        const res = await watchlistAPI.getList({
          page,
          limit: 20,
          ...(status && { status }),
          ...(search && { search })
        })
        setWatchlist(res.data.watchlist || [])
        setPagination({
          page: res.data.page || 1,
          pages: res.data.pages || 1,
          total: res.data.total || 0
        })
      } catch (error) {
        console.error('Failed to fetch watchlist:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWatchlist()
  }, [status, search, page])

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

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry)
    setSelectedAnime(entry.anime)
    setShowEditModal(true)
  }

  const handleWriteReview = (entry) => {
    setSelectedAnime(entry.anime)
    setShowReviewModal(true)
  }

  const handleSaveEntry = (updatedEntry) => {
    if (updatedEntry) {
      setWatchlist((prev) =>
        prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
      )
    } else {
      // Entry was deleted
      setWatchlist((prev) => prev.filter((e) => e.id !== selectedEntry.id))
    }
    setShowEditModal(false)
    setSelectedEntry(null)
  }

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Remove this anime from your list?')) return
    try {
      await watchlistAPI.remove(entryId)
      setWatchlist((prev) => prev.filter((e) => e.id !== entryId))
      toast.success('Removed from watchlist')
    } catch (error) {
      toast.error('Failed to remove entry')
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text mb-2">
              My Anime Logs
            </h1>
            <p className="text-gray-400">
              Track and manage your anime watching journey
            </p>
          </div>
          <Link to="/catalog" className="btn btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Anime
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateParams('status', tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                status === tab.value
                  ? `${tab.color} text-white`
                  : 'bg-anime-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateParams('search', e.target.value)}
            placeholder="Search your anime list..."
            className="input pl-12"
          />
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            {pagination.total > 0 ? (
              <>
                {pagination.total} anime in your list
                {status && ` (${status.replace('_', ' ')})`}
              </>
            ) : (
              'No anime in your list'
            )}
          </p>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : watchlist.length > 0 ? (
          <div className="space-y-4">
            {watchlist.map((entry) => (
              <div
                key={entry.id}
                className="card p-4 flex items-center gap-4 hover:border-anime-dark-500 transition-colors"
              >
                {/* Cover */}
                <Link to={`/anime/${entry.anime?.id}`} className="flex-shrink-0">
                  <img
                    src={entry.anime?.cover_image || '/placeholder-anime.jpg'}
                    alt={entry.anime?.title}
                    className="w-16 h-24 object-cover rounded-lg hover:ring-2 hover:ring-anime-primary transition-all"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/anime/${entry.anime?.id}`}
                    className="font-semibold text-white hover:text-anime-primary transition-colors block truncate"
                  >
                    {entry.anime?.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <StatusBadge status={entry.status} />
                    <span className="text-sm text-gray-400">
                      Ep. {entry.episodes_watched} / {entry.anime?.episodes || '?'}
                    </span>
                    {entry.score && (
                      <div className="flex items-center gap-1">
                        <StarIconSolid className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white">{entry.score}</span>
                      </div>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{entry.notes}</p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="hidden sm:block w-32">
                  <div className="h-2 bg-anime-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-anime-primary rounded-full transition-all"
                      style={{
                        width: `${
                          entry.anime?.episodes
                            ? (entry.episodes_watched / entry.anime.episodes) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {entry.anime?.episodes
                      ? `${Math.round((entry.episodes_watched / entry.anime.episodes) * 100)}%`
                      : '0%'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditEntry(entry)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-anime-dark-600 transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleWriteReview(entry)}
                    className="p-2 rounded-lg text-gray-400 hover:text-anime-secondary hover:bg-anime-dark-600 transition-colors"
                    title="Write Review"
                  >
                    <StarIcon className="w-5 h-5" />
                  </button>
                  <Link
                    to={`/anime/${entry.anime?.id}`}
                    className="p-2 rounded-lg text-gray-400 hover:text-anime-accent hover:bg-anime-dark-600 transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-anime-error hover:bg-anime-dark-600 transition-colors"
                    title="Remove"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <BookOpenIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {search ? 'No matching anime found' : 'Your list is empty'}
            </h3>
            <p className="text-gray-400 mb-6">
              {search
                ? 'Try a different search term'
                : 'Start tracking your anime by adding some to your list!'}
            </p>
            <Link to="/catalog" className="btn btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
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

      {/* Modals */}
      {showEditModal && selectedAnime && (
        <WatchlistModal
          anime={selectedAnime}
          entry={selectedEntry}
          onClose={() => {
            setShowEditModal(false)
            setSelectedEntry(null)
          }}
          onSave={handleSaveEntry}
        />
      )}
      {showReviewModal && selectedAnime && (
        <ReviewModal
          anime={selectedAnime}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedAnime(null)
          }}
          onSave={() => {
            setShowReviewModal(false)
            setSelectedAnime(null)
            toast.success('Review saved!')
          }}
        />
      )}
    </div>
  )
}
