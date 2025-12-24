import { Link } from 'react-router-dom'
import { StarIcon, TrashIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

export default function AnimeCard({ anime, className, compact = false, view = 'grid', onDelete }) {
  const rating = anime.average_rating || anime.rating || 0
  
  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(anime.id)
    }
  }
  
  // List view layout
  if (view === 'list') {
    return (
      <div className={clsx('card card-hover p-4 flex gap-4 group relative', className)}>
        <Link to={`/anime/${anime.id}`} className="flex gap-4 flex-1">
          <img
            src={anime.cover_image || '/placeholder-anime.jpg'}
            alt={anime.title}
            className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white group-hover:text-anime-primary transition-colors truncate">
              {anime.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              {rating > 0 && (
                <span className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  {rating.toFixed(1)}
                </span>
              )}
              <span>{anime.type || 'TV'}</span>
              {anime.episodes > 0 && <span>{anime.episodes} eps</span>}
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{anime.synopsis}</p>
            {anime.genres && anime.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {anime.genres.slice(0, 4).map((genre) => (
                  <span key={genre} className="badge badge-primary text-xs">{genre}</span>
                ))}
              </div>
            )}
          </div>
        </Link>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete anime"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  // Compact grid card
  if (compact) {
    return (
      <Link 
        to={`/anime/${anime.id}`}
        className={clsx('card card-hover group block', className)}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
          <img
            src={anime.cover_image || '/placeholder-anime.jpg'}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {rating > 0 && (
            <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/70 rounded text-xs backdrop-blur-sm">
              <StarIcon className="w-3 h-3 text-yellow-400" />
              <span className="text-white">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <h3 className="mt-2 text-sm font-medium text-white line-clamp-2 group-hover:text-anime-primary transition-colors">
          {anime.title}
        </h3>
      </Link>
    )
  }

  // Default grid card
  return (
    <div className={clsx('card card-hover group block relative', className)}>
      <Link to={`/anime/${anime.id}`}>
        {/* Cover Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={anime.cover_image || '/placeholder-anime.jpg'}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Rating Badge */}
          {rating > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Status Badge */}
          {anime.status && !onDelete && (
            <div className={clsx(
              'absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium',
              anime.status === 'Ongoing' && 'bg-green-500/80 text-white',
              anime.status === 'Completed' && 'bg-blue-500/80 text-white',
              anime.status === 'Upcoming' && 'bg-purple-500/80 text-white'
            )}>
              {anime.status}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-anime-dark-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-white line-clamp-2 group-hover:text-anime-primary transition-colors text-sm">
            {anime.title}
          </h3>
          
          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
            <span>{anime.type || 'TV'}</span>
            {anime.episodes > 0 && (
              <>
                <span>•</span>
                <span>{anime.episodes} eps</span>
              </>
            )}
          </div>
        </div>
      </Link>
      
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Delete anime"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
