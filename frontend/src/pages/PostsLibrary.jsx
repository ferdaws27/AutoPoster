import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCalendar, faSearch, faTh, faList, faEye } from '@fortawesome/free-solid-svg-icons';
import { faXTwitter, faLinkedin, faMedium } from '@fortawesome/free-brands-svg-icons';
import { usePosts } from '../context/PostsProvider';

export default function PostsLibrary() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [localFilters, setLocalFilters] = useState({
    platform: "all",
    date: "",
    performance: "",
    sort: "newest",
  });

  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Use global posts store
  const { 
    posts, 
    loading, 
    error, 
    stats,
    deletePost,
    setFilters: setGlobalFilters,
    getFilteredPosts,
    getPostsByStatus
  } = usePosts();

  // Update global filters when local filters change
  useEffect(() => {
    setGlobalFilters({
      status: activeTab === 'all' ? 'all' : activeTab,
      platform: localFilters.platform === 'all' ? 'all' : localFilters.platform,
      searchQuery: search
    });
  }, [activeTab, localFilters.platform, search, setGlobalFilters]);

  // Get filtered posts based on current filters
  const filteredPosts = getFilteredPosts();

  // Handle delete post
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setToastMessage("Post deleted successfully");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Failed to delete post:', error);
      setToastMessage("Failed to delete post");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      for (const postId of selectedPosts) {
        await deletePost(postId);
      }
      setSelectedPosts(new Set());
      setShowDeleteModal(false);
      setToastMessage(`${selectedPosts.size} posts deleted successfully`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Failed to delete posts:', error);
      setToastMessage("Failed to delete posts");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Twitter': return faXTwitter;
      case 'LinkedIn': return faLinkedin;
      case 'Medium': return faMedium;
      default: return faXTwitter;
    }
  };

  // Get platform color
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Twitter': return 'text-blue-400';
      case 'LinkedIn': return 'text-violet-400';
      case 'Medium': return 'text-teal-400';
      default: return 'text-gray-400';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Calculate engagement
  const calculateEngagement = (post) => {
    if (!post.engagement) return 0;
    return (post.engagement.likes || 0) + (post.engagement.shares || 0) + (post.engagement.comments || 0);
  };

  // Get posts for current tab
  const getTabPosts = () => {
    if (activeTab === 'all') return filteredPosts;
    return getPostsByStatus(activeTab);
  };

  const tabPosts = getTabPosts();

  // Handle search
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Get platforms from posts
  const availablePlatforms = [...new Set(posts.flatMap(post => 
    post.platforms ? Object.keys(post.platforms).filter(p => post.platforms[p]) : []
  ))];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Posts Library</h1>
            <p className="text-gray-400">Manage all your content in one place</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/CreatePostPage')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
          >
            Create New Post
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/30 rounded-xl p-6 border border-cyan-400/20">
            <div className="text-cyan-400 text-sm font-medium mb-1">Total Posts</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-black/30 rounded-xl p-6 border border-violet-400/20">
            <div className="text-violet-400 text-sm font-medium mb-1">Scheduled</div>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
          </div>
          <div className="bg-black/30 rounded-xl p-6 border border-teal-400/20">
            <div className="text-teal-400 text-sm font-medium mb-1">Drafts</div>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </div>
          <div className="bg-black/30 rounded-xl p-6 border border-orange-400/20">
            <div className="text-orange-400 text-sm font-medium mb-1">Published</div>
            <div className="text-2xl font-bold">{stats.published}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-black/30 rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 bg-black/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
              </div>
            </div>

            {/* Platform Filter */}
            <select
              value={localFilters.platform}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
              className="px-4 py-2 bg-black/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            >
              <option value="all">All Platforms</option>
              {availablePlatforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex bg-black/50 rounded-lg">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-2 ${view === 'grid' ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400'}`}
              >
                <FontAwesomeIcon icon={faTh} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 ${view === 'list' ? 'bg-cyan-400/20 text-cyan-400' : 'text-gray-400'}`}
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-black/30 rounded-xl p-1">
          {['all', 'scheduled', 'drafts', 'published'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-cyan-400/20 text-cyan-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'all' && ` (${stats.total})`}
              {tab === 'scheduled' && ` (${stats.scheduled})`}
              {tab === 'drafts' && ` (${stats.drafts})`}
              {tab === 'published' && ` (${stats.published})`}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading posts...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-400/20 text-red-400 rounded-lg hover:bg-red-400/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Posts Grid/List */}
        {!loading && !error && tabPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No posts found</div>
            <button 
              onClick={() => navigate('/dashboard/CreatePostPage')}
              className="px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/30"
            >
              Create Your First Post
            </button>
          </div>
        )}

        {!loading && !error && tabPosts.length > 0 && (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {tabPosts.map(post => (
              <div key={post.id} className="bg-black/30 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-400/50 transition-colors">
                {/* Post Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    {post.platforms && Object.keys(post.platforms).filter(p => post.platforms[p]).map(platform => (
                      <FontAwesomeIcon 
                        key={platform}
                        icon={getPlatformIcon(platform)}
                        className={getPlatformColor(platform)}
                      />
                    ))}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      post.status === 'scheduled' ? 'bg-blue-400/20 text-blue-400' :
                      post.status === 'draft' ? 'bg-gray-400/20 text-gray-400' :
                      'bg-green-400/20 text-green-400'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-white">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <h3 className="text-white font-medium mb-2 line-clamp-2">
                    {post.idea || post.content || 'Untitled Post'}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {post.content || 'No content available'}
                  </p>
                </div>

                {/* Post Meta */}
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  {post.engagement && (
                    <div className="flex items-center space-x-3">
                      <span>{post.engagement.likes || 0} likes</span>
                      <span>{post.engagement.comments || 0} comments</span>
                    </div>
                  )}
                </div>

                {/* Schedule Info */}
                {post.scheduleDate && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="text-sm text-cyan-400">
                      Scheduled for {formatDate(post.scheduleDate)} at {post.scheduleTime}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-green-400/20 border border-green-400/50 text-green-400 px-6 py-3 rounded-lg">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
