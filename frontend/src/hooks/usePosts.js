import { useState, useEffect, useCallback } from 'react';

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

  // Initialize posts from localStorage
  useEffect(() => {
    syncWithLocalStorage();
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

      syncWithLocalStorage();
      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [syncWithLocalStorage]);

  const updatePost = useCallback(async (postId, postData) => {
    try {
      setLoading(true);
      
      // Find and update the post in the appropriate storage
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

      syncWithLocalStorage();
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [syncWithLocalStorage]);

  const deletePost = useCallback(async (postId) => {
    try {
      setLoading(true);
      
      const storageKeys = ['autoposter_drafts', 'autoposter_scheduled', 'autoposter_published'];

      for (const key of storageKeys) {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = items.filter(p => p.id !== postId);
        if (filtered.length !== items.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
          break;
        }
      }

      syncWithLocalStorage();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [syncWithLocalStorage]);

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
    getPostsByDateRange,
    syncWithLocalStorage
  };
};
