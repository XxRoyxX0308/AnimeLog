import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Support both old and new prop formats
  const page = currentPage
  const pages = totalPages

  if (pages <= 1) return null

  const hasPrev = page > 1
  const hasNext = page < pages

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisible = 5
    
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(pages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            hasPrev 
              ? 'text-gray-300 hover:bg-anime-dark-700' 
              : 'text-gray-600 cursor-not-allowed'
          )}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={clsx(
              'w-10 h-10 rounded-lg font-medium transition-colors',
              pageNum === page
                ? 'bg-anime-primary text-white'
                : 'text-gray-400 hover:bg-anime-dark-700 hover:text-white'
            )}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            hasNext 
              ? 'text-gray-300 hover:bg-anime-dark-700' 
              : 'text-gray-600 cursor-not-allowed'
          )}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
