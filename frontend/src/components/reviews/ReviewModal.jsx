import { useState, useEffect } from 'react'
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { reviewsAPI } from '../../lib/api'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ReviewModal({ anime, review = null, onClose, onSave }) {
  const [rating, setRating] = useState(review?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState(review?.title || '')
  const [content, setContent] = useState(review?.content || '')
  const [spoiler, setSpoiler] = useState(review?.spoiler || false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const isEditing = !!review

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const validate = () => {
    const newErrors = {}
    if (rating === 0) newErrors.rating = 'Please select a rating'
    if (!content.trim()) newErrors.content = 'Please write your review'
    if (content.trim().length < 50) newErrors.content = 'Review must be at least 50 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const data = {
        anime_id: anime.id,
        rating,
        title: title.trim() || null,
        content: content.trim(),
        spoiler
      }

      let response
      if (isEditing) {
        response = await reviewsAPI.update(review.id, data)
      } else {
        response = await reviewsAPI.create(data)
      }

      onSave(response.data.review)
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save review'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-anime-dark-800 rounded-2xl border border-anime-dark-600 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 border-b border-anime-dark-600 bg-anime-dark-800">
          <div className="flex items-center gap-4">
            <img
              src={anime.cover_image || '/placeholder-anime.jpg'}
              alt={anime.title}
              className="w-12 h-16 object-cover rounded-lg"
            />
            <div>
              <h2 className="font-semibold text-white">
                {isEditing ? 'Edit Review' : 'Write a Review'}
              </h2>
              <p className="text-sm text-gray-400 truncate max-w-xs">{anime.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-anime-dark-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Rating <span className="text-anime-error">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating || rating)
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    {filled ? (
                      <StarIconSolid className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-8 h-8 text-gray-600" />
                    )}
                  </button>
                )
              })}
              <span className="ml-2 text-lg font-medium text-white">
                {rating > 0 ? `${rating}/5` : ''}
              </span>
            </div>
            {errors.rating && (
              <p className="text-anime-error text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Title (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Review Title <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your review a catchy title..."
              maxLength={100}
              className="input"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Review <span className="text-anime-error">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this anime... What did you like or dislike? Would you recommend it?"
              rows={6}
              className={clsx('input resize-none', errors.content && 'border-anime-error')}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.content ? (
                <p className="text-anime-error text-sm">{errors.content}</p>
              ) : (
                <p className="text-gray-500 text-xs">Minimum 50 characters</p>
              )}
              <span className={`text-xs ${content.length < 50 ? 'text-gray-500' : 'text-anime-success'}`}>
                {content.length} characters
              </span>
            </div>
          </div>

          {/* Spoiler Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={spoiler}
                onChange={(e) => setSpoiler(e.target.checked)}
                className="w-5 h-5 rounded bg-anime-dark-700 border-anime-dark-500 text-anime-primary focus:ring-anime-primary"
              />
              <div>
                <span className="text-gray-300">Contains spoilers</span>
                <p className="text-xs text-gray-500">Mark this if your review reveals important plot points</p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-anime-dark-600">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : isEditing ? (
                'Update Review'
              ) : (
                'Post Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}