import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';

// Helper function to calculate engagement display
const calculateEngagementDisplay = (stats) => {
  // For now, return a simple count. In the future, this could aggregate engagement from all posts
  const totalPosts = (stats.draft || 0) + (stats.scheduled || 0) + (stats.published || 0);
  return totalPosts > 0 ? totalPosts.toString() : '0';
};

// Helper to ensure user is authenticated
const ensureAuthenticated = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Auto login as guest if no token exists
    try {
      console.log('No token found, attempting guest login...');
      const loginResponse = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'guest@autoposter.tn',
          password: 'guest'
        })
      });
      
      const data = await loginResponse.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        console.log('✅ Guest login successful');
        return data.access_token;
      }
    } catch (err) {
      console.warn('Guest login failed:', err);
    }
  }
  
  return token;
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

  // Initialize posts from backend for authenticated user
  useEffect(() => {
    const initPosts = async () => {
      try {
        const token = await ensureAuthenticated();
        if (token) {
          // ✅ Always fetch from backend for authenticated users
          // Backend automatically filters posts by user_id from JWT
          syncWithBackend();
        } else {
          console.warn('No authentication token available');
          setError('Authentication required. Please log in.');
          setPosts([]);
        }
      } catch (err) {
        console.error('Init error:', err);
        setPosts([]);
      }
    };

    initPosts();
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
      setError(null);

      // 🔒 Get authenticated user's posts from backend
      // Backend filters by user_id from JWT token
      let postsResponse;
      try {
        postsResponse = await apiFetch('/api/posts/getPosts');
        if (postsResponse.success) {
          // Transform backend data to frontend format
          const backendPosts = postsResponse.data.posts.map(post => ({
            id: post._id,
            idea: post.content,
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
          console.log(`✅ Loaded ${backendPosts.length} posts for authenticated user`);
        }
      } catch (err) {
        console.error('Error fetching posts from backend:', err);
        // 🔐 No fallback to localStorage for authenticated users
        // Only authenticated users' data should be displayed
        setPosts([]);
        setError(`Failed to load posts: ${err.message}`);
        setLoading(false);
        return;
      }

      // Get stats
      try {
        const statsResponse = await apiFetch('/api/posts/stats/summary');
        if (statsResponse.success) {
          const backendStats = statsResponse.data;
          setStats({
            drafts: backendStats.draft || 0,
            scheduled: backendStats.scheduled || 0,
            published: backendStats.published || 0,
            engagement: calculateEngagementDisplay(backendStats)
          });
        }
      } catch (err) {
        console.warn('Could not fetch stats:', err);
        // Stats failed but posts are loaded - calculate stats from posts
        updateStats();
      }
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
      setError(null);

      // For authenticated users, create posts via backend only
      if (isAuthenticated()) {
        const backendData = {
          content: postData.content || postData.idea,
          platforms: postData.platforms || {},
          status: postData.status || 'draft',
          schedule_date: postData.scheduleDate,
          schedule_time: postData.scheduleTime,
          engagement: postData.engagement || {}
        };

        try {
          const response = await apiFetch('/api/posts/', {
            method: 'POST',
            body: JSON.stringify(backendData)
          });

          if (response.success && response.data) {
            const newPost = {
              id: response.data._id,
              idea: response.data.content,
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
            console.log('✅ Post created successfully on backend:', newPost.id);
            return newPost;
          } else {
            const errorMsg = response.error || 'Failed to create post';
            throw new Error(errorMsg);
          }
        } catch (apiErr) {
          const errorMessage = apiErr.message || 'Failed to create post. Please check your authentication.';
          console.error('❌ Backend post creation failed:', errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        // Not authenticated
        const errorMessage = 'Authentication required to create posts. Please log in.';
        console.error('❌ ' + errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
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
      setError(null);

      const backendData = {};
      if (postData.content !== undefined) backendData.content = postData.content;
      if (postData.idea !== undefined) backendData.content = postData.idea;
      if (postData.platforms !== undefined) backendData.platforms = postData.platforms;
      if (postData.status !== undefined) backendData.status = postData.status;
      if (postData.scheduleDate !== undefined) backendData.schedule_date = postData.scheduleDate;
      if (postData.scheduleTime !== undefined) backendData.schedule_time = postData.scheduleTime;
      if (postData.engagement !== undefined) backendData.engagement = postData.engagement;

      console.log('Updating post:', { postId, backendData });

      let updateSucceeded = false;
      let updatedPost = null;

      // Try backend first if authenticated
      if (isAuthenticated()) {
        try {
          const response = await apiFetch(`/api/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(backendData)
          });

          if (response.success && response.data) {
            updatedPost = {
              id: response.data._id,
              idea: response.data.content,
              content: response.data.content,
              platforms: response.data.platforms,
              status: response.data.status,
              scheduleDate: response.data.schedule_date,
              scheduleTime: response.data.schedule_time,
              engagement: response.data.engagement,
              createdAt: response.data.created_at,
              updatedAt: response.data.updated_at
            };
            updateSucceeded = true;
            console.log('Backend update successful:', updatedPost);
          }
        } catch (backendError) {
          console.warn('Backend update failed:', backendError.message);
          // Will try localStorage as fallback
        }
      }

      // Fallback to localStorage if backend failed or not authenticated
      if (!updateSucceeded) {
        const storageKeys = ['autoposter_drafts', 'autoposter_scheduled', 'autoposter_published'];
        let found = false;

        for (const key of storageKeys) {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          const index = items.findIndex(p => p.id === postId);
          if (index !== -1) {
            items[index] = {
              ...items[index],
              ...postData,
              id: postId,
              idea: postData.content || postData.idea || items[index].idea
            };
            localStorage.setItem(key, JSON.stringify(items));
            updatedPost = items[index];
            updateSucceeded = true;
            found = true;
            console.log('localStorage update successful:', updatedPost);
            break;
          }
        }

        // If not in localStorage, check if post exists in current state
        if (!found) {
          const existingPost = posts.find(p => p.id === postId);
          if (existingPost) {
            // Update in memory only (post was loaded from backend or memory)
            updatedPost = {
              ...existingPost,
              ...postData,
              id: postId,
              content: postData.content || postData.idea || existingPost.content,
              idea: postData.content || postData.idea || existingPost.idea
            };
            updateSucceeded = true;
            console.log('State-only update successful:', updatedPost);
          }
        }
      }

      // Update state if we succeeded
      if (updateSucceeded && updatedPost) {
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        return updatedPost;
      }

      throw new Error('Post not found');
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [posts]);

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
