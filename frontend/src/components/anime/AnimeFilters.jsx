import { XMarkIcon } from '@heroicons/react/24/outline'

const ANIME_STATUSES = ['Ongoing', 'Completed', 'Upcoming']
const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall']

// Generate years from current year down to 1990
const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => 
  (new Date().getFullYear() - i).toString()
)

export default function AnimeFilters({
  genres = [],
  selectedGenre,
  selectedStatus,
  selectedSeason,
  selectedYear,
  onGenreChange,
  onStatusChange,
  onSeasonChange,
  onYearChange,
  onClear,
  hasActiveFilters
}) {
  return (
    <div className="p-4 mb-6 bg-anime-dark-800 rounded-xl border border-anime-dark-600">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Genre
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="input text-sm"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="input text-sm"
          >
            <option value="">All Statuses</option>
            {ANIME_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Season
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="input text-sm"
          >
            <option value="">All Seasons</option>
            {SEASONS.map((season) => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="input text-sm"
          >
            <option value="">All Years</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-anime-dark-600 flex justify-end">
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-anime-primary hover:text-anime-accent transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
