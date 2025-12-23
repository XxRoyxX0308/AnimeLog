import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { animeAPI, reviewsAPI } from '../lib/api'
import AnimeCard from '../components/anime/AnimeCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { 
  SparklesIcon, 
  FireIcon, 
  ClockIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const [trendingAnime, setTrendingAnime] = useState([])
  const [recentAnime, setRecentAnime] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, recentRes, reviewsRes] = await Promise.all([
          animeAPI.getTrending(8),
          animeAPI.getRecent(6),
          reviewsAPI.getList({ limit: 4, sort: 'newest' })
        ])
        setTrendingAnime(trendingRes.data.anime || [])
        setRecentAnime(recentRes.data.anime || [])
        setRecentReviews(reviewsRes.data.reviews || [])
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-anime-primary/10 via-anime-dark-900 to-anime-secondary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-anime-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-anime-secondary/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
              <span className="gradient-text">Track Your</span>
              <br />
              <span className="text-white">Anime Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Discover, track, and share your anime experience with a passionate community. 
              Create your watchlist, write reviews, and connect with fellow enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Link>
                  <Link to="/catalog" className="btn btn-secondary text-lg px-8 py-3">
                    Browse Catalog
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Start Tracking Free
                  </Link>
                  <Link to="/catalog" className="btn btn-secondary text-lg px-8 py-3">
                    Explore Anime
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 bg-anime-dark-800/50 border-y border-anime-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Anime Titles', value: '10,000+', icon: PlayCircleIcon },
              { label: 'Active Users', value: '50,000+', icon: SparklesIcon },
              { label: 'Reviews Written', value: '100,000+', icon: StarIcon },
              { label: 'Episodes Logged', value: '5M+', icon: ClockIcon },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-anime-primary" />
                <div className="text-2xl md:text-3xl font-display font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Anime */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FireIcon className="w-8 h-8 text-anime-primary" />
              <h2 className="section-title">Trending Now</h2>
            </div>
            <Link to="/catalog?sort=popular" className="link flex items-center gap-1 group">
              View All
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {trendingAnime.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Additions */}
      <section className="py-16 bg-anime-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-anime-accent" />
              <h2 className="section-title">Recently Added</h2>
            </div>
            <Link to="/catalog?sort=newest" className="link flex items-center gap-1 group">
              View All
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {recentAnime.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} compact />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <StarIcon className="w-8 h-8 text-anime-secondary" />
              <h2 className="section-title">Community Reviews</h2>
            </div>
            <Link to="/community" className="link flex items-center gap-1 group">
              View All
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : recentReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentReviews.map((review) => (
                <Link
                  key={review.id}
                  to={`/reviews/${review.id}`}
                  className="card card-hover p-6"
                >
                  <div className="flex gap-4">
                    <img
                      src={review.anime?.cover_image || '/placeholder-anime.jpg'}
                      alt={review.anime?.title}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate mb-1">
                        {review.anime?.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">
                          by {review.user?.username}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {review.content}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No reviews yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-anime-primary/20 to-anime-secondary/20" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to Start Your Anime Journey?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of anime enthusiasts tracking their favorite shows and sharing reviews.
            </p>
            <Link to="/register" className="btn btn-primary text-lg px-10 py-4">
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
