import { Link } from 'react-router-dom'
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-anime-dark-900 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-anime-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-anime-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center">
        {/* 404 Number */}
        <h1 className="text-8xl md:text-9xl font-display font-bold gradient-text mb-4">
          404
        </h1>
        
        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Oops! The page you're looking for seems to have wandered off into another dimension. 
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn btn-primary">
            <HomeIcon className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <Link to="/catalog" className="btn btn-secondary">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            Browse Catalog
          </Link>
        </div>

        {/* Anime Reference */}
        <p className="mt-12 text-sm text-gray-600 italic">
          "Even the strongest get lost sometimes." — Every anime protagonist ever
        </p>
      </div>
    </div>
  )
}
