// Database Service for Flask Backend with MongoDB
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class DatabaseService {
  constructor() {
    this.token = localStorage.getItem('autoposter_token') || null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('autoposter_token', token);
  }

  // Get headers with authentication
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Generic request method
  async request(method, endpoint, data = null) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Making ${method} request to:`, url);
      console.log('Request data:', data);
      
      const config = {
        method,
        url: url,
        headers: this.getHeaders(),
        ...(data && { data })
      };

      const response = await axios(config);
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Database ${method} ${endpoint} error:`, error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      throw error;
    }
  }

  // POST operations
  async create(collection, data) {
    return this.request('POST', `/${collection}`, data);
  }

  // GET operations
  async find(collection, query = {}) {
    return this.request('GET', `/${collection}?query=${encodeURIComponent(JSON.stringify(query))}`);
  }

  async findById(collection, id) {
    return this.request('GET', `/${collection}/${id}`);
  }

  // PUT operations
  async update(collection, id, data) {
    return this.request('PUT', `/${collection}/${id}`, data);
  }

  async updateMany(collection, query, data) {
    return this.request('PUT', `/${collection}/many`, { query, data });
  }

  // DELETE operations
  async delete(collection, id) {
    return this.request('DELETE', `/${collection}/${id}`);
  }

  async deleteMany(collection, query) {
    return this.request('DELETE', `/${collection}/many`, { query });
  }

  // Post-specific operations adapted for Flask backend
  async createPost(postData) {
    const post = {
      ...postData,
      id: postData.id || Date.now().toString(), // Ensure ID exists
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating post with data:', post);
    
    try {
      // First try backend
      const result = await this.create('posts', post);
      console.log('Post created successfully in backend:', result);
      
      // Also save to localStorage as backup
      this.saveToLocalStorage(post, postData.status);
      
      return result;
    } catch (error) {
      console.error('Backend failed, using localStorage:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Fallback to localStorage
      try {
        const localResult = this.saveToLocalStorage(post, postData.status);
        console.log('Post saved to localStorage:', localResult);
        return localResult;
      } catch (localError) {
        console.error('LocalStorage also failed:', localError);
        throw localError;
      }
    }
  }

  // Helper method to save to localStorage
  saveToLocalStorage(post, status) {
    const storageKey = status === 'scheduled' ? 'autoposter_scheduled' : 
                      status === 'draft' ? 'autoposter_drafts' : 'autoposter_published';
    
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = [...existing, post];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    return { ...post, id: post.id || Date.now().toString() };
  }

  async getAllPosts() {
    try {
      // Try Flask backend first
      return await this.find('posts');
    } catch (error) {
      // Fallback to localStorage if backend is not available
      console.log('Backend not available, using localStorage fallback');
      return this.getLocalPosts();
    }
  }

  async getPostsByStatus(status) {
    try {
      return await this.find('posts', { status });
    } catch (error) {
      const localPosts = this.getLocalPosts();
      return localPosts.filter(post => post.status === status);
    }
  }

  async getPostsByPlatform(platform) {
    try {
      return await this.find('posts', { [`platforms.${platform}`]: true });
    } catch (error) {
      const localPosts = this.getLocalPosts();
      return localPosts.filter(post => post.platforms && post.platforms[platform]);
    }
  }

  async getPostsByDateRange(startDate, endDate) {
    try {
      return await this.find('posts', {
        scheduleDate: {
          $gte: startDate,
          $lte: endDate
        }
      });
    } catch (error) {
      const localPosts = this.getLocalPosts();
      return localPosts.filter(post => {
        const postDate = new Date(post.scheduleDate || post.createdAt);
        return postDate >= new Date(startDate) && postDate <= new Date(endDate);
      });
    }
  }

  async updatePost(id, updateData) {
    try {
      return await this.update('posts', id, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      // Fallback to localStorage
      this.updateLocalStoragePost(id, updateData);
      return { id, ...updateData, updatedAt: new Date().toISOString() };
    }
  }

  async deletePost(id) {
    try {
      return await this.delete('posts', id);
    } catch (error) {
      // Fallback to localStorage
      this.deleteLocalStoragePost(id);
      return { id, deleted: true };
    }
  }

  async getPostStats() {
    try {
      const response = await this.request('GET', '/posts/stats');
      return response;
    } catch (error) {
      // Fallback to localStorage
      return this.getLocalPostStats();
    }
  }

  // LocalStorage fallback methods
  getLocalPosts() {
    const scheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
    const drafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
    const published = JSON.parse(localStorage.getItem('autoposter_published') || '[]');

    return [
      ...scheduled.map(post => ({ ...post, status: 'scheduled' })),
      ...drafts.map(post => ({ ...post, status: 'draft' })),
      ...published.map(post => ({ ...post, status: 'posted', engagement: post.engagement || { likes: 0, shares: 0, comments: 0 } }))
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  updateLocalStoragePost(id, updateData) {
    const posts = this.getLocalPosts();
    const updatedPosts = posts.map(post => 
      post.id === id ? { ...post, ...updateData, updatedAt: new Date().toISOString() } : post
    );
    
    // Update the appropriate localStorage
    const post = posts.find(p => p.id === id);
    if (post) {
      const storageKey = post.status === 'scheduled' ? 'autoposter_scheduled' : 
                        post.status === 'draft' ? 'autoposter_drafts' : 'autoposter_published';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = existing.map(p => p.id === id ? { ...p, ...updateData } : p);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  }

  deleteLocalStoragePost(id) {
    const posts = this.getLocalPosts();
    const post = posts.find(p => p.id === id);
    if (post) {
      const storageKey = post.status === 'scheduled' ? 'autoposter_scheduled' : 
                        post.status === 'draft' ? 'autoposter_drafts' : 'autoposter_published';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const filtered = existing.filter(p => p.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    }
  }

  getLocalPostStats() {
    const scheduled = JSON.parse(localStorage.getItem('autoposter_scheduled') || '[]');
    const drafts = JSON.parse(localStorage.getItem('autoposter_drafts') || '[]');
    const published = JSON.parse(localStorage.getItem('autoposter_published') || '[]');

    return {
      scheduled: scheduled.length,
      drafts: drafts.length,
      published: published.length,
      total: scheduled.length + drafts.length + published.length,
      engagement: this.calculateTotalEngagement(published)
    };
  }

  calculateTotalEngagement(posts) {
    return posts.reduce((total, post) => {
      const engagement = post.engagement || { likes: 0, shares: 0, comments: 0 };
      return total + (engagement.likes || 0) + (engagement.shares || 0) + (engagement.comments || 0);
    }, 0);
  }

  // Sync with localStorage (fallback)
  async syncWithLocalStorage() {
    try {
      const localPosts = this.getLocalPosts();
      
      // Try to sync with backend
      const results = await Promise.allSettled(
        localPosts.map(post => this.createPost(post))
      );

      console.log('Sync results:', results);
      return results;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  // Check backend availability
  async checkBackendHealth() {
    try {
      const response = await this.request('GET', '/api/health');
      return response.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Real-time subscription (using WebSocket or polling)
  subscribeToPosts(callback) {
    // In a real implementation, this would use WebSocket
    // For now, we'll use polling
    const interval = setInterval(async () => {
      try {
        const posts = await this.getAllPosts();
        callback(posts);
      } catch (error) {
        console.error('Subscription error:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;
