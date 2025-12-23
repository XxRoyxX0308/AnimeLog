import { Link } from 'react-router-dom'
import { StarIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export default function ReviewCard({ review, showAnime = false, expanded = false, onLike }) {
  const timeAgo = formatTimeAgo(review.created_at)
  const author = review.author || review.user

  return (
    <article className={clsx('card animate-in', expanded ? 'p-6' : 'p-4')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          <Link to={`/users/${author?.id}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-anime-primary to-anime-secondary flex items-center justify-center hover:scale-105 transition-transform">
              {author?.avatar_url ? (
                <img 
                  src={author.avatar_url} 
                  alt="" 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <span className="text-white font-medium">
                  {author?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </Link>
          
          <div>
            <Link 
              to={`/users/${author?.id}`}
              className="font-medium text-white hover:text-anime-primary transition-colors"
            >
              {author?.username || 'Anonymous'}
            </Link>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-anime-dark-700 rounded-lg">
          <StarIconSolid className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-white">{review.rating}</span>
          <span className="text-gray-500">/5</span>
        </div>
      </div>

      {/* Anime Info (if showing) */}
      {showAnime && review.anime && (
        <Link 
          to={`/anime/${review.anime.id}`}
          className="mt-4 flex items-center gap-3 p-3 bg-anime-dark-700 rounded-lg hover:bg-anime-dark-600 transition-colors group"
        >
          <img 
            src={review.anime.cover_image || '/placeholder-anime.jpg'}
            alt=""
            className="w-12 h-16 rounded object-cover"
          />
          <div>
            <p className="font-medium text-gray-300 group-hover:text-anime-primary transition-colors">
              {review.anime.title}
            </p>
          </div>
        </Link>
      )}

      {/* Review Content */}
      <div className="mt-4">
        {review.title && (
          <Link to={`/reviews/${review.id}`}>
            <h3 className="text-lg font-semibold text-white hover:text-anime-primary transition-colors">
              {review.title}
            </h3>
          </Link>
        )}
        <p className={clsx('mt-2 text-gray-400', !expanded && 'line-clamp-4')}>
          {review.content}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-anime-dark-600 flex items-center gap-4">
        <button 
          onClick={() => onLike?.(review.id)}
          className="flex items-center gap-2 text-gray-400 hover:text-anime-primary transition-colors group"
        >
          {review.user_liked ? (
            <HeartIconSolid className="w-5 h-5 text-anime-primary" />
          ) : (
            <HeartIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
          )}
          <span className="text-sm">{review.likes_count || 0}</span>
        </button>

        <Link 
          to={`/reviews/${review.id}`}
          className="flex items-center gap-2 text-gray-400 hover:text-anime-accent transition-colors"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span className="text-sm">{review.comments_count || 0} comments</span>
        </Link>

        {!expanded && (
          <Link 
            to={`/reviews/${review.id}`}
            className="ml-auto text-sm text-anime-accent hover:text-anime-primary transition-colors"
          >
            Read more →
          </Link>
        )}
      </div>
    </article>
  )
}
