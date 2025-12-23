import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  HomeIcon,
  FilmIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const navLinks = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/catalog', label: 'Catalog', icon: FilmIcon },
  { to: '/community', label: 'Community', icon: UsersIcon },
]

const authNavLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/my-logs', label: 'My Logs', icon: BookOpenIcon },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-anime-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-anime-primary to-anime-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-lg">A</span>
            </div>
            <span className="font-display font-bold text-xl hidden sm:block gradient-text">
              AnimeLog
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                    isActive
                      ? 'bg-anime-dark-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-anime-dark-700'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && authNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                    isActive
                      ? 'bg-anime-dark-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-anime-dark-700'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Search & User */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-anime-dark-700 border border-anime-dark-500 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-anime-primary focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-anime-dark-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-anime-primary to-anime-secondary flex items-center justify-center">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-300">
                    {user?.username}
                  </span>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 py-2 bg-anime-dark-700 rounded-xl border border-anime-dark-500 shadow-xl z-20 animate-in">
                      <div className="px-4 py-2 border-b border-anime-dark-500">
                        <p className="font-medium text-white">{user?.username}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-anime-dark-600 hover:text-white transition-colors"
                      >
                        <ChartBarIcon className="w-5 h-5" />
                        Dashboard
                      </Link>
                      <Link
                        to="/my-logs"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-anime-dark-600 hover:text-white transition-colors"
                      >
                        <BookOpenIcon className="w-5 h-5" />
                        My Logs
                      </Link>
                      <Link
                        to={`/users/${user?.id}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-anime-dark-600 hover:text-white transition-colors"
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        Profile
                      </Link>
                      <hr className="my-2 border-anime-dark-500" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-400 hover:bg-anime-dark-600 hover:text-red-300 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-ghost text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-anime-dark-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-300" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-anime-dark-600 animate-in">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="w-full pl-10 pr-4 py-3 bg-anime-dark-700 border border-anime-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-anime-primary"
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-anime-dark-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-anime-dark-700'
                  )
                }
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}
            
            {isAuthenticated && authNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-anime-dark-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-anime-dark-700'
                  )
                }
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
