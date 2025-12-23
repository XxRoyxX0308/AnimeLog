import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-anime-dark-800 border-t border-anime-dark-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-anime-primary to-anime-secondary flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">A</span>
              </div>
              <span className="font-display font-bold text-xl gradient-text">
                AnimeLog
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Track your anime journey, share reviews, and connect with the community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  Anime Catalog
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  Community Reviews
                </Link>
              </li>
              <li>
                <Link to="/catalog?status=Ongoing" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  Currently Airing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-anime-primary transition-colors text-sm">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-anime-dark-600 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} AnimeLog. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-400 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-400 text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
