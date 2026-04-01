import React, { createContext, useContext, useEffect } from 'react';
import usePostsStore from '../store/postsStore';

// Create context
const PostsContext = createContext();

// Provider component
export const PostsProvider = ({ children }) => {
  const {
    loadPosts,
    syncPosts,
    lastSync
  } = usePostsStore();

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Auto-sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      syncPosts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [syncPosts]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key?.includes('posts-storage')) {
        loadPosts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadPosts]);

  const value = {
    // Pass all store methods and state
    ...usePostsStore()
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};

// Custom hook to use the posts context
export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

export default PostsProvider;
