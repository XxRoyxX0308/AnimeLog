import { create } from 'zustand'
import { animeAPI } from '../lib/api'

export const useAnimeStore = create((set, get) => ({
  // State
  animeList: [],
  currentAnime: null,
  trending: [],
  recent: [],
  genres: [],
  seasons: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    search: '',
    genre: '',
    status: '',
    type: '',
    season: '',
    sortBy: 'rating'
  },

  // Actions
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } })
  },

  resetFilters: () => {
    set({
      filters: {
        search: '',
        genre: '',
        status: '',
        type: '',
        season: '',
        sortBy: 'rating'
      }
    })
  },

  fetchAnimeList: async (page = 1) => {
    set({ isLoading: true, error: null })
    const { filters } = get()
    
    try {
      const response = await animeAPI.getList({
        page,
        search: filters.search,
        genre: filters.genre,
        status: filters.status,
        type: filters.type,
        season: filters.season,
        sort_by: filters.sortBy
      })
      
      const { anime, pagination } = response.data
      set({
        animeList: anime,
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
        error: error.response?.data?.error || 'Failed to fetch anime',
        isLoading: false 
      })
    }
  },

  fetchAnimeDetail: async (id) => {
    set({ isLoading: true, error: null, currentAnime: null })
    
    try {
      const response = await animeAPI.getDetail(id)
      set({ currentAnime: response.data.anime, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Anime not found',
        isLoading: false 
      })
    }
  },

  fetchTrending: async (limit = 10) => {
    try {
      const response = await animeAPI.getTrending(limit)
      set({ trending: response.data.anime })
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    }
  },

  fetchRecent: async (limit = 10) => {
    try {
      const response = await animeAPI.getRecent(limit)
      set({ recent: response.data.anime })
    } catch (error) {
      console.error('Failed to fetch recent:', error)
    }
  },

  fetchGenres: async () => {
    try {
      const response = await animeAPI.getGenres()
      set({ genres: response.data.genres })
    } catch (error) {
      console.error('Failed to fetch genres:', error)
    }
  },

  fetchSeasons: async () => {
    try {
      const response = await animeAPI.getSeasons()
      set({ seasons: response.data.seasons })
    } catch (error) {
      console.error('Failed to fetch seasons:', error)
    }
  },

  clearCurrentAnime: () => {
    set({ currentAnime: null })
  }
}))
