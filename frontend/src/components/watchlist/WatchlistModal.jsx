import { useState, useEffect } from 'react'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { watchlistAPI } from '../../lib/api'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_OPTIONS = [
  { value: 'watching', label: 'Watching', color: 'bg-anime-accent' },
  { value: 'completed', label: 'Completed', color: 'bg-anime-success' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-anime-warning' },
  { value: 'dropped', label: 'Dropped', color: 'bg-anime-error' },
  { value: 'plan_to_watch', label: 'Plan to Watch', color: 'bg-gray-500' }
]

export default function WatchlistModal({ anime, entry = null, onClose, onSave }) {
  const [status, setStatus] = useState(entry?.status || 'watching')
  const [episodesWatched, setEpisodesWatched] = useState(entry?.episodes_watched || 0)
  const [score, setScore] = useState(entry?.score || '')
  const [startDate, setStartDate] = useState(entry?.start_date || '')
  const [endDate, setEndDate] = useState(entry?.end_date || '')
  const [notes, setNotes] = useState(entry?.notes || '')
  const [rewatching, setRewatching] = useState(entry?.rewatching || false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isEditing = !!entry
  const maxEpisodes = anime?.episodes || 999

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Auto-set dates and episodes based on status
  useEffect(() => {
    if (status === 'completed' && anime?.episodes) {
      setEpisodesWatched(anime.episodes)
      if (!endDate) {
        setEndDate(new Date().toISOString().split('T')[0])
      }
    }
    if (status === 'watching' && !startDate && !isEditing) {
      setStartDate(new Date().toISOString().split('T')[0])
    }
  }, [status, anime?.episodes, endDate, startDate, isEditing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        anime_id: anime.id,
        status,
        episodes_watched: episodesWatched,
        score: score ? parseInt(score) : null,
        start_date: startDate || null,
        end_date: endDate || null,
        notes: notes.trim() || null,
        rewatching
      }

      let response
      if (isEditing) {
        response = await watchlistAPI.update(entry.id, data)
      } else {
        response = await watchlistAPI.add(data)
      }

      onSave(response.data.entry)
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Remove this anime from your list?')) return
    setDeleting(true)
    try {
      await watchlistAPI.remove(entry.id)
      onSave(null)
    } catch (error) {
      toast.error('Failed to remove entry')
    } finally {
      setDeleting(false)
    }
  }

  const incrementEpisodes = () => {
    if (episodesWatched < maxEpisodes) {
      setEpisodesWatched(episodesWatched + 1)
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
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-anime-dark-800 rounded-2xl border border-anime-dark-600 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-anime-dark-600 bg-anime-dark-800">
          <div className="flex items-center gap-3">
            <img
              src={anime?.cover_image || '/placeholder-anime.jpg'}
              alt={anime?.title}
              className="w-10 h-14 object-cover rounded-lg"
            />
            <div>
              <h2 className="font-semibold text-white text-sm">
                {isEditing ? 'Edit List Entry' : 'Add to List'}
              </h2>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{anime?.title}</p>
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
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    status === s.value
                      ? `${s.color} text-white`
                      : 'bg-anime-dark-700 text-gray-400 hover:text-white'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Episodes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Episodes Watched
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEpisodesWatched(Math.max(0, episodesWatched - 1))}
                className="btn btn-secondary w-10 h-10 p-0"
              >
                −
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={episodesWatched}
                  onChange={(e) => setEpisodesWatched(Math.min(maxEpisodes, Math.max(0, parseInt(e.target.value) || 0)))}
                  min={0}
                  max={maxEpisodes}
                  className="input text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  / {anime?.episodes || '?'}
                </span>
              </div>
              <button
                type="button"
                onClick={incrementEpisodes}
                className="btn btn-secondary w-10 h-10 p-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Score
            </label>
            <select
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="input"
            >
              <option value="">Select a score</option>
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {s} - {getScoreLabel(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes..."
              rows={2}
              className="input resize-none"
            />
          </div>

          {/* Rewatching */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rewatching}
              onChange={(e) => setRewatching(e.target.checked)}
              className="w-5 h-5 rounded bg-anime-dark-700 border-anime-dark-500 text-anime-primary focus:ring-anime-primary"
            />
            <span className="text-gray-300">I'm rewatching this</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-anime-dark-600">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-ghost text-anime-error hover:bg-anime-error/10"
                disabled={deleting}
              >
                {deleting ? <LoadingSpinner size="sm" /> : <TrashIcon className="w-5 h-5 mr-1" />}
                Remove
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
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
                {loading ? <LoadingSpinner size="sm" /> : isEditing ? 'Update' : 'Add to List'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function getScoreLabel(score) {
  const labels = {
    10: 'Masterpiece',
    9: 'Great',
    8: 'Very Good',
    7: 'Good',
    6: 'Fine',
    5: 'Average',
    4: 'Bad',
    3: 'Very Bad',
    2: 'Horrible',
    1: 'Appalling'
  }
  return labels[score] || ''
}
