import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/databaseService';

// Custom hook for managing posts across all pages
export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    scheduled: 0,
    drafts: 0,
    published: 0,
    total: 0,
    engagement: 0
  });

  // Load all posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if backend is available
      const isBackendAvailable = await databaseService.checkBackendHealth();
      
      if (isBackendAvailable) {
        console.log('Using Flask backend for posts');
        const allPosts = await databaseService.getAllPosts();
        setPosts(allPosts);
        
        // Update stats
        const postStats = await databaseService.getPostStats();
        setStats(postStats);
      } else {
        console.log('Backend not available, using localStorage fallback');
        // Use localStorage fallback
        const scheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
        const drafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
        const published = JSON.parse(localStorage.getItem('autoposter_published') || '[]');
        
        const allPosts = [
          ...scheduled.map(post => ({ ...post, status: 'scheduled' })),
          ...drafts.map(post => ({ ...post, status: 'draft' })),
          ...published.map(post => ({ ...post, status: 'published', engagement: post.engagement || { likes: 0, shares: 0, comments: 0 } }))
        ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        setPosts(allPosts);
        setStats({
          scheduled: scheduled.length,
          drafts: drafts.length,
          published: published.length,
          total: allPosts.length,
          engagement: databaseService.calculateTotalEngagement(published)
        });
      }
      
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError(err.message);
      
      // Fallback to localStorage
      const scheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
      const drafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
      const published = JSON.parse(localStorage.getItem('autoposter_published') || '[]');
      
      const allPosts = [
        ...scheduled.map(post => ({ ...post, status: 'scheduled' })),
        ...drafts.map(post => ({ ...post, status: 'draft' })),
        ...published.map(post => ({ ...post, status: 'published', engagement: post.engagement || { likes: 0, shares: 0, comments: 0 } }))
      ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setPosts(allPosts);
      setStats({
        scheduled: scheduled.length,
        drafts: drafts.length,
        published: published.length,
        total: allPosts.length,
        engagement: databaseService.calculateTotalEngagement(published)
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new post
  const createPost = useCallback(async (postData) => {
    try {
      const newPost = await databaseService.createPost(postData);
      setPosts(prev => [...prev, newPost]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        [postData.status === 'scheduled' ? 'scheduled' : postData.status === 'draft' ? 'drafts' : 'published']: prev[postData.status === 'scheduled' ? 'scheduled' : postData.status === 'draft' ? 'drafts' : 'published'] + 1,
        total: prev.total + 1
      }));
      
      // Also update localStorage for fallback
      updateLocalStorage(postData, 'create');
      
      return newPost;
    } catch (err) {
      console.error('Failed to create post:', err);
      throw err;
    }
  }, []);

  // Update post
  const updatePost = useCallback(async (id, updateData) => {
    try {
      const updatedPost = await databaseService.updatePost(id, updateData);
      setPosts(prev => prev.map(post => 
        post.id === id ? { ...post, ...updateData, updatedAt: new Date().toISOString() } : post
      ));
      
      // Update localStorage
      updateLocalStorage({ id, ...updateData }, 'update');
      
      return updatedPost;
    } catch (err) {
      console.error('Failed to update post:', err);
      throw err;
    }
  }, []);

  // Delete post
  const deletePost = useCallback(async (id) => {
    try {
      await databaseService.deletePost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
      
      // Update stats
      const deletedPost = posts.find(post => post.id === id);
      if (deletedPost) {
        setStats(prev => ({
          ...prev,
          [deletedPost.status === 'scheduled' ? 'scheduled' : deletedPost.status === 'draft' ? 'drafts' : 'published']: prev[deletedPost.status === 'scheduled' ? 'scheduled' : deletedPost.status === 'draft' ? 'drafts' : 'published'] - 1,
          total: prev.total - 1
        }));
      }
      
      // Update localStorage
      updateLocalStorage({ id }, 'delete');
      
    } catch (err) {
      console.error('Failed to delete post:', err);
      throw err;
    }
  }, [posts]);

  // Get posts by status
  const getPostsByStatus = useCallback((status) => {
    return posts.filter(post => post.status === status);
  }, [posts]);

  // Get posts by platform
  const getPostsByPlatform = useCallback((platform) => {
    return posts.filter(post => post.platforms && post.platforms[platform]);
  }, [posts]);

  // Get posts by date range
  const getPostsByDateRange = useCallback((startDate, endDate) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduleDate || post.createdAt);
      return postDate >= new Date(startDate) && postDate <= new Date(endDate);
    });
  }, [posts]);

  // Search posts
  const searchPosts = useCallback((query) => {
    const lowercaseQuery = query.toLowerCase();
    return posts.filter(post => 
      (post.content && post.content.toLowerCase().includes(lowercaseQuery)) ||
      (post.idea && post.idea.toLowerCase().includes(lowercaseQuery))
    );
  }, [posts]);

  // Sync with localStorage
  const syncWithLocalStorage = useCallback(async () => {
    try {
      await databaseService.syncWithLocalStorage();
      await loadPosts(); // Reload posts after sync
    } catch (err) {
      console.error('Sync failed:', err);
      throw err;
    }
  }, [loadPosts]);

  // Update localStorage helper
  const updateLocalStorage = (postData, action) => {
    try {
      if (action === 'create') {
        const storageKey = postData.status === 'scheduled' ? 'autoposter_scheduled' : 
                          postData.status === 'draft' ? 'autoposter_drafts' : 'autoposter_published';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existing.push(postData);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      } else if (action === 'update') {
        const post = posts.find(p => p.id === postData.id);
        if (post) {
          const storageKey = post.status === 'scheduled' ? 'autoposter_scheduled' : 
                            post.status === 'draft' ? 'autoposter_drafts' : 'autoposter_published';
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const updated = existing.map(p => p.id === postData.id ? { ...p, ...postData } : p);
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
      } else if (action === 'delete') {
        const post = posts.find(p => p.id === postData.id);
        if (post) {
          const storageKey = post.status === 'scheduled' ? 'autoposter_scheduled' : 
                            post.status === 'draft' ? 'autoposter_drafts' : 'autoposter_published';
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const filtered = existing.filter(p => p.id !== postData.id);
          localStorage.setItem(storageKey, JSON.stringify(filtered));
        }
      }
    } catch (err) {
      console.error('LocalStorage update failed:', err);
    }
  };

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key?.includes('autoposter_')) {
        loadPosts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadPosts]);

  return {
    posts,
    loading,
    error,
    stats,
    loadPosts,
    createPost,
    updatePost,
    deletePost,
    getPostsByStatus,
    getPostsByPlatform,
    getPostsByDateRange,
    searchPosts,
    syncWithLocalStorage
  };
};
