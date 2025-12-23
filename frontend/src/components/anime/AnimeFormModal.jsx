import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { animeAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const ANIME_TYPES = ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music']
const ANIME_STATUSES = ['Ongoing', 'Completed', 'Upcoming']
const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall']

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
  'Supernatural', 'Thriller', 'Mecha', 'Music', 'Psychological'
]

export default function AnimeFormModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    title_japanese: '',
    synopsis: '',
    cover_image: '',
    banner_image: '',
    type: 'TV',
    episodes: '',
    status: 'Ongoing',
    season: '',
    year: new Date().getFullYear().toString(),
    genres: [],
    studios: ''
  })

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const resetForm = () => {
    setFormData({
      title: '',
      title_japanese: '',
      synopsis: '',
      cover_image: '',
      banner_image: '',
      type: 'TV',
      episodes: '',
      status: 'Ongoing',
      season: '',
      year: new Date().getFullYear().toString(),
      genres: [],
      studios: ''
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    setLoading(true)
    try {
      const data = {
        ...formData,
        episodes: formData.episodes ? parseInt(formData.episodes) : 0,
        season: formData.season && formData.year 
          ? `${formData.season} ${formData.year}`
          : formData.season || formData.year || null
      }
      
      await animeAPI.create(data)
      toast.success('Anime added successfully!')
      resetForm()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to create anime:', error)
      toast.error(error.response?.data?.error || 'Failed to add anime')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-anime-dark-800 border border-anime-dark-600 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white">
            Add New Anime
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-anime-dark-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Title (English) *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Attack on Titan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Title (Japanese)
              </label>
              <input
                type="text"
                name="title_japanese"
                value={formData.title_japanese}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 進撃の巨人"
              />
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Synopsis
            </label>
            <textarea
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              rows={3}
              className="input resize-none"
              placeholder="Brief description of the anime..."
            />
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Banner Image URL
              </label>
              <input
                type="url"
                name="banner_image"
                value={formData.banner_image}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Type, Episodes, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input"
              >
                {ANIME_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Episodes
              </label>
              <input
                type="number"
                name="episodes"
                value={formData.episodes}
                onChange={handleChange}
                className="input"
                placeholder="12"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                {ANIME_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Season & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Season
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Season</option>
                {SEASONS.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="input"
                min="1950"
                max="2030"
              />
            </div>
          </div>

          {/* Studios */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Studios
            </label>
            <input
              type="text"
              name="studios"
              value={formData.studios}
              onChange={handleChange}
              className="input"
              placeholder="e.g., MAPPA, Wit Studio"
            />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.genres.includes(genre)
                      ? 'bg-anime-primary text-white'
                      : 'bg-anime-dark-700 text-gray-400 hover:bg-anime-dark-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-anime-dark-600">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Add Anime
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
