import { create } from 'zustand'
import { reviewsAPI } from '../lib/api'
import toast from 'react-hot-toast'

export const useReviewStore = create((set, get) => ({
  // State
  reviews: [],
  currentReview: null,
  myReviews: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },

  // Actions
  fetchReviews: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await reviewsAPI.getList(params)
      const { reviews, pagination } = response.data
      
      set({
        reviews,
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
        error: error.response?.data?.error || 'Failed to fetch reviews',
        isLoading: false 
      })
    }
  },

  fetchReviewDetail: async (id) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await reviewsAPI.getDetail(id)
      set({ currentReview: response.data.review, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Review not found',
        isLoading: false 
      })
    }
  },

  fetchMyReviews: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await reviewsAPI.getMyReviews(params)
      set({ myReviews: response.data.reviews, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch reviews',
        isLoading: false 
      })
    }
  },

  createReview: async (data) => {
    try {
      const response = await reviewsAPI.create(data)
      if (response.data.success) {
        toast.success('Review created successfully!')
        return { success: true, review: response.data.review }
      }
      return { success: false }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create review'
      const details = error.response?.data?.details
      toast.error(message)
      return { success: false, error: message, details }
    }
  },

  updateReview: async (id, data) => {
    try {
      const response = await reviewsAPI.update(id, data)
      if (response.data.success) {
        toast.success('Review updated successfully!')
        // Update in local state
        set({
          myReviews: get().myReviews.map(r => 
            r.id === id ? response.data.review : r
          )
        })
        return { success: true, review: response.data.review }
      }
      return { success: false }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update review'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  deleteReview: async (id) => {
    try {
      await reviewsAPI.delete(id)
      toast.success('Review deleted')
      set({ myReviews: get().myReviews.filter(r => r.id !== id) })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete review'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  likeReview: async (id) => {
    try {
      const response = await reviewsAPI.like(id)
      // Update likes in local state
      set({
        reviews: get().reviews.map(r => 
          r.id === id ? { ...r, likes_count: response.data.likes_count } : r
        )
      })
      return { success: true }
    } catch (error) {
      toast.error('Please log in to like reviews')
      return { success: false }
    }
  },

  clearCurrentReview: () => {
    set({ currentReview: null })
  }
}))
