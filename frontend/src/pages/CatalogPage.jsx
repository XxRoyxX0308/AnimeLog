import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { animeAPI } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AnimeCard from '../components/anime/AnimeCard'
import AnimeFilters from '../components/anime/AnimeFilters'
import AnimeFormModal from '../components/anime/AnimeFormModal'
import Pagination from '../components/ui/Pagination'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'title', label: 'Title A-Z' }
]

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [genres, setGenres] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [showAddModal, setShowAddModal] = useState(false)

  // Get filter values from URL
  const search = searchParams.get('search') || ''
  const genre = searchParams.get('genre') || ''
  const status = searchParams.get('status') || ''
  const season = searchParams.get('season') || ''
  const year = searchParams.get('year') || ''
  const sort = searchParams.get('sort') || 'popular'
  const page = parseInt(searchParams.get('page') || '1')

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await animeAPI.getGenres()
        setGenres(res.data.genres || [])
      } catch (error) {
        console.error('Failed to fetch genres:', error)
      }
    }
    fetchGenres()
  }, [])

  // Fetch anime list
  const fetchAnime = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 24,
        ...(search && { search }),
        ...(genre && { genre }),
        ...(status && { status }),
        ...(season && { season }),
        ...(year && { year }),
        sort_by: sort === 'popular' ? 'rating' : sort === 'newest' ? 'newest' : sort === 'rating' ? 'rating' : 'title'
      }
      const res = await animeAPI.getList(params)
      setAnime(res.data.anime || [])
      setPagination({
        page: res.data.pagination?.page || res.data.page || 1,
        pages: res.data.pagination?.pages || res.data.pages || 1,
        total: res.data.pagination?.total || res.data.total || 0
      })
    } catch (error) {
      console.error('Failed to fetch anime:', error)
    } finally {
      setLoading(false)
    }
  }, [search, genre, status, season, year, sort, page])

  useEffect(() => {
    fetchAnime()
  }, [fetchAnime])

  // Update search params
  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    if (key !== 'page') {
      newParams.delete('page') // Reset to page 1 when filters change
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const handleDeleteAnime = async (animeId) => {
    if (!confirm('Are you sure you want to delete this anime? This will also delete all associated reviews and watchlist entries.')) {
      return
    }
    try {
      await animeAPI.delete(animeId)
      toast.success('Anime deleted successfully')
      fetchAnime() // Refresh the list
    } catch (error) {
      toast.error('Failed to delete anime')
      console.error('Delete anime error:', error)
    }
  }

  const hasActiveFilters = genre || status || season || year

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            Anime Catalog
          </h1>
          <p className="text-gray-400">
            Explore our collection of {pagination.total.toLocaleString()} anime titles
          </p>
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParams('search', e.target.value)}
              placeholder="Search anime by title..."
              className="input pl-12"
            />
            {search && (
              <button
                onClick={() => updateParams('search', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => updateParams('sort', e.target.value)}
              className="input w-auto pr-10 appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundSize: '1.5em 1.5em'
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} relative`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span className="hidden sm:inline ml-2">Filters</span>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-anime-primary rounded-full" />
              )}
            </button>

            {/* View Mode */}
            <div className="hidden sm:flex items-center bg-anime-dark-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-anime-dark-500 text-white' : 'text-gray-400'}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-anime-dark-500 text-white' : 'text-gray-400'}`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Add Anime Button */}
            {isAuthenticated && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add Anime</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <AnimeFilters
            genres={genres}
            selectedGenre={genre}
            selectedStatus={status}
            selectedSeason={season}
            selectedYear={year}
            onGenreChange={(v) => updateParams('genre', v)}
            onStatusChange={(v) => updateParams('status', v)}
            onSeasonChange={(v) => updateParams('season', v)}
            onYearChange={(v) => updateParams('year', v)}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-400">Active filters:</span>
            {genre && (
              <button
                onClick={() => updateParams('genre', '')}
                className="badge badge-primary flex items-center gap-1"
              >
                {genre}
                <XMarkIcon className="w-3 h-3" />
              </button>
            )}
            {status && (
              <button
                onClick={() => updateParams('status', '')}
                className="badge badge-secondary flex items-center gap-1"
              >
                {status}
                <XMarkIcon className="w-3 h-3" />
              </button>
            )}
            {season && (
              <button
                onClick={() => updateParams('season', '')}
                className="badge badge-accent flex items-center gap-1"
              >
                {season}
                <XMarkIcon className="w-3 h-3" />
              </button>
            )}
            {year && (
              <button
                onClick={() => updateParams('year', '')}
                className="badge badge-primary flex items-center gap-1"
              >
                {year}
                <XMarkIcon className="w-3 h-3" />
              </button>
            )}
            <button onClick={clearFilters} className="text-sm text-anime-accent hover:underline">
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : anime.length > 0 ? (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
                  : 'space-y-4'
              }
            >
              {anime.map((item) => (
                <AnimeCard 
                  key={item.id} 
                  anime={item} 
                  view={viewMode} 
                  onDelete={isAuthenticated ? handleDeleteAnime : undefined}
                />
              ))}
            </div>

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
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-anime-dark-700 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No anime found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Anime Modal */}
      <AnimeFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchAnime}
      />
    </div>
  )
}
