import { create } from 'zustand'
import { watchlistAPI } from '../lib/api'
import toast from 'react-hot-toast'

const STATUS_LABELS = {
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
  plan_to_watch: 'Plan to Watch'
}

export const useWatchlistStore = create((set, get) => ({
  // State
  watchlist: [],
  stats: null,
  recentLogs: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  filter: {
    status: '',
    sortBy: 'updated'
  },

  // Helpers
  getStatusLabel: (status) => STATUS_LABELS[status] || status,

  // Actions
  setFilter: (newFilter) => {
    set({ filter: { ...get().filter, ...newFilter } })
  },

  fetchWatchlist: async (page = 1) => {
    set({ isLoading: true, error: null })
    const { filter } = get()
    
    try {
      const response = await watchlistAPI.getList({
        page,
        status: filter.status,
        sort_by: filter.sortBy
      })
      
      const { watchlist, pagination } = response.data
      set({
        watchlist,
        pagination: {
          page: pagination.page,
          pages: pagination.pages,
          total: pagination.total,
          hasNext: pagination.has_next,
          hasPrev: pagination.has_prev
        },
        isLoading: false
      })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch watchlist',
        isLoading: false 
      })
    }
  },

  fetchStats: async () => {
    try {
      const response = await watchlistAPI.getStats()
      set({ stats: response.data.stats })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  },

  fetchRecentLogs: async (limit = 5) => {
    try {
      const response = await watchlistAPI.getRecent(limit)
      set({ recentLogs: response.data.watchlist })
    } catch (error) {
      console.error('Failed to fetch recent logs:', error)
    }
  },

  addToWatchlist: async (data) => {
    try {
      const response = await watchlistAPI.add(data)
      toast.success('Added to watchlist!')
      return { success: true, entry: response.data.watchlist_entry }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add to watchlist'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  updateEntry: async (id, data) => {
    try {
      const response = await watchlistAPI.update(id, data)
      toast.success('Watchlist updated!')
      
      // Update in local state
      set({
        watchlist: get().watchlist.map(w => 
          w.id === id ? response.data.watchlist_entry : w
        )
      })
      
      return { success: true, entry: response.data.watchlist_entry }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  removeFromWatchlist: async (id) => {
    try {
      await watchlistAPI.remove(id)
      toast.success('Removed from watchlist')
      set({ watchlist: get().watchlist.filter(w => w.id !== id) })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to remove'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  checkAnimeStatus: async (animeId) => {
    try {
      const response = await watchlistAPI.checkAnime(animeId)
      return response.data
    } catch (error) {
      return { in_watchlist: false }
    }
  }
}))
