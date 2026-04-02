import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';

// Helper function to calculate engagement display
const calculateEngagementDisplay = (stats) => {
  // For now, return a simple count. In the future, this could aggregate engagement from all posts
  const totalPosts = (stats.draft || 0) + (stats.scheduled || 0) + (stats.published || 0);
  return totalPosts > 0 ? totalPosts.toString() : '0';
};

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    drafts: 0,
    scheduled: 0,
    published: 0,
    engagement: '0'
  });

  // Check if user is authenticated (has JWT token)
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Initialize posts from backend or localStorage
  useEffect(() => {
    if (isAuthenticated()) {
      syncWithBackend();
    } else {
      syncWithLocalStorage();
    }
  }, []);

  // Update stats when posts change
  useEffect(() => {
    updateStats();
  }, [posts]);

  const updateStats = useCallback(() => {
    const drafts = posts.filter(p => p.status === 'draft').length;
    const scheduled = posts.filter(p => p.status === 'scheduled').length;
    const published = posts.filter(p => p.status === 'posted').length;
    
    let totalEngagement = 0;
    posts.forEach(post => {
      if (post.engagement) {
        totalEngagement += (post.engagement.likes || 0) + (post.engagement.shares || 0) + (post.engagement.comments || 0);
      }
    });
    
    let engagementDisplay = '0';
    if (totalEngagement >= 1000) {
      engagementDisplay = (totalEngagement / 1000).toFixed(1) + 'k';
    } else if (totalEngagement > 0) {
      engagementDisplay = totalEngagement.toString();
    }

    setStats({
      drafts,
      scheduled,
      published,
      engagement: engagementDisplay
    });
  }, [posts]);

  const syncWithBackend = useCallback(async () => {
    try {
      setLoading(true);

      // Get posts
      const postsResponse = await apiFetch('/api/posts/');
      if (postsResponse.success) {
        // Transform backend data to frontend format
        const backendPosts = postsResponse.data.posts.map(post => ({
          id: post._id,
          content: post.content,
          platforms: post.platforms,
          status: post.status,
          scheduleDate: post.schedule_date,
          scheduleTime: post.schedule_time,
          engagement: post.engagement,
          createdAt: post.created_at,
          updatedAt: post.updated_at
        }));
        setPosts(backendPosts);
      }

      // Get stats
      const statsResponse = await apiFetch('/api/posts/stats/summary');
      if (statsResponse.success) {
        const backendStats = statsResponse.data.stats;
        setStats({
          drafts: backendStats.draft || 0,
          scheduled: backendStats.scheduled || 0,
          published: backendStats.published || 0,
          engagement: calculateEngagementDisplay(backendStats)
        });
      }
    } catch (err) {
      console.error('Error syncing posts from backend:', err);
      setError(err.message);
      // Fallback to localStorage if backend fails
      syncWithLocalStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  const syncWithLocalStorage = useCallback(() => {
    try {
      const drafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
      const scheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
      const published = JSON.parse(localStorage.getItem('autoposter_published') || '[]');

      const allPosts = [
        ...drafts.map(p => ({ ...p, status: 'draft' })),
        ...scheduled.map(p => ({ ...p, status: 'scheduled' })),
        ...published.map(p => ({ ...p, status: 'posted', engagement: p.engagement || { likes: 0, shares: 0, comments: 0 } }))
      ];

      setPosts(allPosts);
    } catch (err) {
      console.error('Error syncing posts from localStorage:', err);
      setError(err.message);
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    try {
      setLoading(true);

      if (isAuthenticated()) {
        // Use backend API
        const backendData = {
          content: postData.content,
          platforms: postData.platforms || {},
          status: postData.status || 'draft',
          schedule_date: postData.scheduleDate,
          schedule_time: postData.scheduleTime,
          engagement: postData.engagement || {}
        };

        const response = await apiFetch('/api/posts/', {
          method: 'POST',
          body: JSON.stringify(backendData)
        });

        if (response.success) {
          const newPost = {
            id: response.data._id,
            content: response.data.content,
            platforms: response.data.platforms,
            status: response.data.status,
            scheduleDate: response.data.schedule_date,
            scheduleTime: response.data.schedule_time,
            engagement: response.data.engagement,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at
          };

          setPosts(prev => [newPost, ...prev]);
          return newPost;
        }
      } else {
        // Fallback to localStorage
        const newPost = {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          ...postData
        };

        // Determine which storage bucket based on status
        if (postData.status === 'draft') {
          const drafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
          drafts.push(newPost);
          localStorage.setItem('autoposter_drafts', JSON.stringify(drafts));
        } else if (postData.status === 'scheduled') {
          const scheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
          scheduled.push(newPost);
          localStorage.setItem('autoposter_scheduled', JSON.stringify(scheduled));
        } else {
          const published = JSON.parse(localStorage.getItem('autoposter_published') || '[]');
          published.push(newPost);
          localStorage.setItem('autoposter_published', JSON.stringify(published));
        }

        setPosts(prev => [newPost, ...prev]);
        return newPost;
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (postId, postData) => {
    try {
      setLoading(true);

      if (isAuthenticated()) {
        // Use backend API
        const backendData = {};
        if (postData.content !== undefined) backendData.content = postData.content;
        if (postData.platforms !== undefined) backendData.platforms = postData.platforms;
        if (postData.status !== undefined) backendData.status = postData.status;
        if (postData.scheduleDate !== undefined) backendData.schedule_date = postData.scheduleDate;
        if (postData.scheduleTime !== undefined) backendData.schedule_time = postData.scheduleTime;
        if (postData.engagement !== undefined) backendData.engagement = postData.engagement;

        const response = await apiFetch(`/api/posts/${postId}`, {
          method: 'PUT',
          body: JSON.stringify(backendData)
        });

        if (response.success) {
          const updatedPost = {
            id: response.data._id,
            content: response.data.content,
            platforms: response.data.platforms,
            status: response.data.status,
            scheduleDate: response.data.schedule_date,
            scheduleTime: response.data.schedule_time,
            engagement: response.data.engagement,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at
          };

          setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
          return updatedPost;
        }
      } else {
        // Fallback to localStorage
        const storageKeys = ['autoposter_drafts', 'autoposter_scheduled', 'autoposter_published'];
        let updated = false;

        for (const key of storageKeys) {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          const index = items.findIndex(p => p.id === postId);
          if (index !== -1) {
            items[index] = { ...items[index], ...postData, id: postId };
            localStorage.setItem(key, JSON.stringify(items));
            updated = true;
            break;
          }
        }

        if (!updated) {
          throw new Error('Post not found');
        }

        setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...postData } : p));
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      setLoading(true);

      if (isAuthenticated()) {
        // Use backend API
        const response = await apiFetch(`/api/posts/${postId}`, {
          method: 'DELETE'
        });

        if (response.success) {
          setPosts(prev => prev.filter(p => p.id !== postId));
        }
      } else {
        // Fallback to localStorage
        const storageKeys = ['autoposter_drafts', 'autoposter_scheduled', 'autoposter_published'];

        for (const key of storageKeys) {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = items.filter(p => p.id !== postId);
          if (filtered.length !== items.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
            break;
          }
        }

        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicatePost = useCallback(async (postId) => {
    try {
      setLoading(true);

      if (isAuthenticated()) {
        // Use backend API
        const response = await apiFetch(`/api/posts/${postId}/duplicate`, {
          method: 'POST'
        });

        if (response.success) {
          const newPost = {
            id: response.data._id,
            content: response.data.content,
            platforms: response.data.platforms,
            status: response.data.status,
            scheduleDate: response.data.schedule_date,
            scheduleTime: response.data.schedule_time,
            engagement: response.data.engagement,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at
          };

          setPosts(prev => [newPost, ...prev]);
          return newPost;
        }
      } else {
        // Fallback to localStorage - duplicate the post locally
        const existingPost = posts.find(p => p.id === postId);
        if (!existingPost) {
          throw new Error('Post not found');
        }

        const duplicatedPost = {
          ...existingPost,
          id: Date.now(),
          status: 'draft',
          createdAt: new Date().toISOString(),
          scheduleDate: null,
          scheduleTime: null
        };

        const drafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
        drafts.push(duplicatedPost);
        localStorage.setItem('autoposter_drafts', JSON.stringify(drafts));

        setPosts(prev => [duplicatedPost, ...prev]);
        return duplicatedPost;
      }
    } catch (err) {
      console.error('Error duplicating post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [posts]);

  const getPostsByDateRange = useCallback((startDate, endDate) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduleDate || post.createdAt);
      return postDate >= startDate && postDate <= endDate;
    });
  }, [posts]);

  return {
    posts,
    loading,
    error,
    stats,
    createPost,
    updatePost,
    deletePost,
    duplicatePost,
    getPostsByDateRange,
    syncWithLocalStorage,
    syncWithBackend
  };
};
