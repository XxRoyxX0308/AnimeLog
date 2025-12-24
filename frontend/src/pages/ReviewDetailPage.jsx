import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { reviewsAPI, commentsAPI } from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export default function ReviewDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [review, setReview] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true)
      try {
        const res = await reviewsAPI.getDetail(id)
        setReview(res.data.review)
        setLiked(res.data.review.user_liked || false)
        setLikesCount(res.data.review.likes_count || 0)
      } catch (error) {
        console.error('Failed to fetch review:', error)
        toast.error('Review not found')
        navigate('/community')
      } finally {
        setLoading(false)
      }
    }
    fetchReview()
  }, [id, navigate])

  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true)
      try {
        const res = await commentsAPI.getForReview(id, { limit: 50 })
        setComments(res.data.comments || [])
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      } finally {
        setCommentsLoading(false)
      }
    }
    if (id) fetchComments()
  }, [id])

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like reviews')
      navigate('/login')
      return
    }
    try {
      await reviewsAPI.like(id)
      setLiked(!liked)
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1))
    } catch (error) {
      toast.error('Failed to like review')
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setSubmitting(true)
    try {
      const res = await commentsAPI.create({
        review_id: id,
        content: newComment.trim()
      })
      setComments((prev) => [...prev, res.data.comment])
      setNewComment('')
      toast.success('Comment posted!')
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await commentsAPI.delete(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like comments')
      navigate('/login')
      return
    }
    try {
      const res = await commentsAPI.like(commentId)
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes_count: res.data.likes_count } : c
        )
      )
    } catch (error) {
      toast.error('Failed to like comment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!review) {
    return null
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        {/* Review Card */}
        <article className="card mb-8">
          {/* Header with Anime Info */}
          <div className="p-6 border-b border-anime-dark-600">
            <div className="flex gap-4">
              <Link to={`/anime/${review.anime?.id}`} className="flex-shrink-0">
                <img
                  src={review.anime?.cover_image || '/placeholder-anime.jpg'}
                  alt={review.anime?.title}
                  className="w-20 h-28 object-cover rounded-lg hover:ring-2 hover:ring-anime-primary transition-all"
                />
              </Link>
              <div>
                <Link
                  to={`/anime/${review.anime?.id}`}
                  className="text-xl font-semibold text-white hover:text-anime-primary transition-colors"
                >
                  {review.anime?.title}
                </Link>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      i < review.rating ? (
                        <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <StarIcon key={i} className="w-5 h-5 text-gray-600" />
                      )
                    ))}
                  </div>
                  <span className="text-gray-400">
                    by{' '}
                    <Link
                      to={`/users/${review.user?.id}`}
                      className="text-anime-accent hover:underline"
                    >
                      {review.user?.username}
                    </Link>
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="p-6">
            {review.title && (
              <h2 className="text-lg font-semibold text-white mb-4">{review.title}</h2>
            )}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {review.content}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-anime-dark-600 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  liked
                    ? 'bg-anime-primary/20 text-anime-primary'
                    : 'bg-anime-dark-700 text-gray-400 hover:text-white'
                }`}
              >
                {liked ? (
                  <HeartIconSolid className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span>{likesCount}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-400">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>{comments.length}</span>
              </div>
            </div>

            {/* Edit/Delete if owner */}
            {user?.id === review.user?.id && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/anime/${review.anime?.id}`}
                  className="btn btn-ghost text-sm"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </Link>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <section className="card">
          <div className="p-4 border-b border-anime-dark-600">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-anime-accent" />
              Comments ({comments.length})
            </h3>
          </div>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="p-4 border-b border-anime-dark-600">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-anime-primary to-anime-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="input resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="btn btn-primary"
                    >
                      {submitting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-4 border-b border-anime-dark-600 text-center">
              <p className="text-gray-400">
                <Link to="/login" className="text-anime-accent hover:underline">
                  Sign in
                </Link>{' '}
                to join the conversation
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="divide-y divide-anime-dark-600">
            {commentsLoading ? (
              <div className="p-8">
                <LoadingSpinner />
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 hover:bg-anime-dark-700/30 transition-colors">
                  <div className="flex gap-3">
                    <Link to={`/users/${comment.user?.id}`} className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-anime-primary to-anime-secondary flex items-center justify-center">
                        {comment.user?.avatar_url ? (
                          <img
                            src={comment.user.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium text-sm">
                            {comment.user?.username?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/users/${comment.user?.id}`}
                            className="font-medium text-white hover:text-anime-primary"
                          >
                            {comment.user?.username}
                          </Link>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {isAuthenticated && user?.id === comment.user?.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-anime-error transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300 mt-1">{comment.content}</p>
                      {/* Like button */}
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex items-center gap-1 text-gray-500 hover:text-anime-primary transition-colors text-sm"
                        >
                          <HeartIcon className="w-4 h-4" />
                          <span>{comment.likes_count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
