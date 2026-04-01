import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import databaseService from '../services/databaseService';

// Global posts store for managing posts across all pages
const usePostsStore = create(
  persist(
    (set, get) => ({
      // State
      posts: [],
      loading: false,
      error: null,
      stats: {
        scheduled: 0,
        drafts: 0,
        published: 0,
        total: 0,
        engagement: 0
      },
      filters: {
        status: 'all',
        platform: 'all',
        dateRange: null,
        searchQuery: ''
      },
      lastSync: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),

      // Load all posts
      loadPosts: async () => {
        set({ loading: true, error: null });
        
        try {
          const posts = await databaseService.getAllPosts();
          const stats = await databaseService.getPostStats();
          
          set({ 
            posts, 
            stats, 
            loading: false, 
            lastSync: new Date().toISOString() 
          });
          
          return posts;
        } catch (error) {
          console.error('Failed to load posts:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Create new post
      createPost: async (postData) => {
        try {
          const newPost = await databaseService.createPost(postData);
          
          set((state) => ({ 
            posts: [newPost, ...state.posts],
            stats: {
              ...state.stats,
              [newPost.status]: state.stats[newPost.status] + 1,
              total: state.stats.total + 1
            }
          }));
          
          return newPost;
        } catch (error) {
          console.error('Failed to create post:', error);
          set({ error: error.message });
          throw error;
        }
      },

      // Update post
      updatePost: async (id, updateData) => {
        try {
          const updatedPost = await databaseService.updatePost(id, updateData);
          
          set((state) => ({
            posts: state.posts.map(post => 
              post.id === id ? { ...post, ...updateData, updatedAt: new Date().toISOString() } : post
            )
          }));
          
          return updatedPost;
        } catch (error) {
          console.error('Failed to update post:', error);
          set({ error: error.message });
          throw error;
        }
      },

      // Delete post
      deletePost: async (id) => {
        try {
          await databaseService.deletePost(id);
          
          set((state) => {
            const deletedPost = state.posts.find(post => post.id === id);
            const newPosts = state.posts.filter(post => post.id !== id);
            
            return {
              posts: newPosts,
              stats: {
                ...state.stats,
                [deletedPost.status]: state.stats[deletedPost.status] - 1,
                total: state.stats.total - 1
              }
            };
          });
          
        } catch (error) {
          console.error('Failed to delete post:', error);
          set({ error: error.message });
          throw error;
        }
      },

      // Sync with backend
      syncPosts: async () => {
        try {
          set({ loading: true });
          await databaseService.syncWithLocalStorage();
          await get().loadPosts();
        } catch (error) {
          console.error('Sync failed:', error);
          set({ error: error.message, loading: false });
        }
      },

      // Get filtered posts
      getFilteredPosts: () => {
        const { posts, filters } = get();
        let filtered = [...posts];

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter(post => post.status === filters.status);
        }

        // Filter by platform
        if (filters.platform !== 'all') {
          filtered = filtered.filter(post => 
            post.platforms && post.platforms[filters.platform]
          );
        }

        // Filter by date range
        if (filters.dateRange) {
          const { start, end } = filters.dateRange;
          filtered = filtered.filter(post => {
            const postDate = new Date(post.scheduleDate || post.createdAt);
            return postDate >= new Date(start) && postDate <= new Date(end);
          });
        }

        // Filter by search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(post => 
            (post.idea && post.idea.toLowerCase().includes(query)) ||
            (post.content && post.content.toLowerCase().includes(query))
          );
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },

      // Get posts by status
      getPostsByStatus: (status) => {
        const { posts } = get();
        return posts.filter(post => post.status === status);
      },

      // Get posts by platform
      getPostsByPlatform: (platform) => {
        const { posts } = get();
        return posts.filter(post => post.platforms && post.platforms[platform]);
      },

      // Get posts for today
      getTodayPosts: () => {
        const { posts } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return posts.filter(post => {
          const postDate = new Date(post.scheduleDate || post.createdAt);
          postDate.setHours(0, 0, 0, 0);
          return postDate.getTime() === today.getTime();
        });
      },

      // Get posts for this week
      getWeekPosts: () => {
        const { posts } = get();
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return posts.filter(post => {
          const postDate = new Date(post.scheduleDate || post.createdAt);
          return postDate >= weekStart && postDate <= weekEnd;
        });
      },

      // Clear all posts (for testing/reset)
      clearPosts: () => set({ 
        posts: [], 
        stats: { scheduled: 0, drafts: 0, published: 0, total: 0, engagement: 0 },
        lastSync: null 
      }),

      // Reset error
      clearError: () => set({ error: null })
    }),
    {
      name: 'posts-storage',
      partialize: (state) => ({ 
        posts: state.posts.slice(0, 50), // Limit to 50 posts to prevent quota issues
        stats: state.stats,
        filters: state.filters,
        lastSync: state.lastSync
      }),
      onRehydrateStorageError: (error) => {
        console.warn('Failed to rehydrate posts store:', error);
        // Clear localStorage if quota exceeded
        if (error.name === 'QuotaExceededError') {
          localStorage.clear();
        }
      }
    }
  )
);

export default usePostsStore;
