import { useState , useEffect } from "react";
import { data, useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";

export default function PostsLibrary() {
  const navigate = useNavigate();
  const { posts, deletePost, updatePost, duplicatePost } = usePosts();
  console.log('PostsLibrary posts:', posts);
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    platform: "",
    date: "",
    performance: "",
    sort: "newest",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Edit and delete states like SchedulingPage
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState({
    content: '',
    platforms: { Twitter: false, LinkedIn: false, Medium: false },
    date: '',
    time: '',
    selectedImage: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });
  const [showErrorToast, setShowErrorToast] = useState(false);

  const filteredPosts = posts
    .filter((post) => {
      // Filter by tab
      if (activeTab === "drafts" && post.status !== "draft") return false;
      if (activeTab === "scheduled" && post.status !== "scheduled") return false;
      if (activeTab === "published" && post.status !== "posted") return false;

      // Enhanced search filter
      const searchTerm = search.toLowerCase().trim();
      if (searchTerm) {
        const title = (post.idea || post.content || "").toLowerCase();
        const content = (post.content || "").toLowerCase();
        const platforms = post.platforms ? Object.keys(post.platforms).join(" ").toLowerCase() : "";
        const status = post.status.toLowerCase();
        const category = (post.category || "").toLowerCase();
        
        // Search in multiple fields
        const matchesTitle = title.includes(searchTerm);
        const matchesContent = content.includes(searchTerm);
        const matchesPlatforms = platforms.includes(searchTerm);
        const matchesStatus = status.includes(searchTerm);
        const matchesCategory = category.includes(searchTerm);
        
        if (!matchesTitle && !matchesContent && !matchesPlatforms && !matchesStatus && !matchesCategory) {
          return false;
        }
      }

      // Enhanced platform filter
      if (filters.platform && post.platforms) {
        const hasPlatform = Object.keys(post.platforms).some(p => 
          p.toLowerCase().includes(filters.platform.toLowerCase()) && post.platforms[p]
        );
        if (!hasPlatform) return false;
      }

      // Enhanced date filter
      if (filters.date) {
        const postDate = new Date(post.createdAt || post.scheduleDate || post.date);
        const today = new Date();
        const diffDays = (today - postDate) / (1000 * 60 * 60 * 24);

        if (filters.date === "today" && diffDays > 1) return false;
        if (filters.date === "week" && diffDays > 7) return false;
        if (filters.date === "month" && diffDays > 30) return false;
        if (filters.date === "quarter" && diffDays > 90) return false;
      }

      // NEW: Performance filter implementation
      if (filters.performance) {
        const engagement = (post.engagement?.likes || 0) + (post.engagement?.shares || 0) + (post.engagement?.comments || 0);
        const views = post.engagement?.views || 0;
        
        switch (filters.performance) {
          case "high":
            if (engagement < 100 || views < 1000) return false;
            break;
          case "medium":
            if (engagement < 20 || engagement >= 100 || views < 200 || views >= 1000) return false;
            break;
          case "low":
            if (engagement >= 20 || views >= 200) return false;
            break;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "newest") {
        return new Date(b.createdAt || b.scheduleDate) - new Date(a.createdAt || a.scheduleDate);
      }
      if (filters.sort === "oldest") {
        return new Date(a.createdAt || a.scheduleDate) - new Date(b.createdAt || b.scheduleDate);
      }
      if (filters.sort === "engagement") {
        const aEngagement = (a.engagement?.likes || 0) + (a.engagement?.shares || 0) + (a.engagement?.comments || 0);
        const bEngagement = (b.engagement?.likes || 0) + (b.engagement?.shares || 0) + (b.engagement?.comments || 0);
        return bEngagement - aEngagement;
      }
      if (filters.sort === "alphabetical") {
        return (a.idea || a.content || "").localeCompare(b.idea || b.content || "");
      }
      return 0;
    });

  const generateSearchSuggestions = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    
    // Generate suggestions based on existing posts
    const suggestions = new Set();
    const term = searchTerm.toLowerCase();
    
    posts.forEach(post => {
      const title = (post.idea || post.content || "").toLowerCase();
      const content = (post.content || "").toLowerCase();
      
      // Extract words that match the search term
      const titleWords = title.split(' ').filter(word => word.includes(term));
      const contentWords = content.split(' ').filter(word => word.includes(term));
      
      titleWords.forEach(word => {
        if (word.length > 2 && suggestions.size < 5) {
          suggestions.add(word);
        }
      });
      
      contentWords.forEach(word => {
        if (word.length > 2 && suggestions.size < 5) {
          suggestions.add(word);
        }
      });
    });
    
    setSearchSuggestions(Array.from(suggestions).slice(0, 5));
  };

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSelectPost = (postId) => {
    const newSet = new Set(selectedPosts);
    if (newSet.has(postId)) newSet.delete(postId);
    else newSet.add(postId);
    setSelectedPosts(newSet);
  };

  const handleDelete = () => {
    if (selectedPosts.size === 0) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected posts
      const deletePromises = Array.from(selectedPosts).map(postId => deletePost(postId));
      await Promise.all(deletePromises);
      
      setShowDeleteModal(false);
      showToastMessage(`${selectedPosts.size} post(s) deleted successfully`);
      setSelectedPosts(new Set());
    } catch (error) {
      console.error('Failed to delete posts:', error);
      showToastMessage("Failed to delete posts. Please try again.");
    }
  };

  const cancelDelete = () => setShowDeleteModal(false);

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEditPost = (post) => {
    // Handle edit like SchedulingPage - open modal instead of navigation
    setSelectedPost(post);
    
    // Format date for HTML5 input (YYYY-MM-DD)
    const formattedDate = post.scheduleDate ? 
      new Date(post.scheduleDate).toISOString().split('T')[0] : '';
    
    setEditingPost({
      content: post.idea || post.content || '',
      platforms: post.platforms || { Twitter: false, LinkedIn: false, Medium: false },
      date: formattedDate,
      time: post.scheduleTime || '',
      selectedImage: post.selectedImages || 0
    });
    setShowEditModal(true);
  };

  // Handle save edited post (like SchedulingPage)
  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    
    // Validate form
    if (!editingPost.content.trim()) {
      setErrorMessage({ title: 'Validation Error', description: 'Please enter post content' });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const selectedPlatformsList = Object.keys(editingPost.platforms).filter(p => editingPost.platforms[p]);
    if (selectedPlatformsList.length === 0) {
      setErrorMessage({ title: 'Validation Error', description: 'Please select at least one platform' });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving edited post:', {
        postId: selectedPost.id,
        editingPost
      });

      // Update post using the hook
      await updatePost(selectedPost.id, {
        idea: editingPost.content,
        content: editingPost.content,
        platforms: editingPost.platforms,
        selectedImages: editingPost.selectedImage,
        scheduleDate: editingPost.date,
        scheduleTime: editingPost.time
      });

      // Update UI
      setShowEditModal(false);
      setSelectedPost(null);
      setEditingPost({
        content: '',
        platforms: { Twitter: false, LinkedIn: false, Medium: false },
        date: '',
        time: '',
        selectedImage: 0
      });
      setSuccessMessage({ title: 'Post updated successfully', description: 'Your changes have been saved' });
      setShowSuccessToast(true);
      
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to update post:', error);
      const errorMessage = error?.message || 'Failed to update post. Please try again.';
      setErrorMessage({ title: 'Update Failed', description: errorMessage });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete post (like SchedulingPage)
  const handleDeletePost = async () => {
    if (!selectedPost) return;

    setIsDeleting(true);
    try {
      await deletePost(selectedPost.id);
      setShowDeleteModal(false);
      setSelectedPost(null);
      setSuccessMessage({ title: 'Post deleted successfully', description: 'Your post has been deleted' });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to delete post:', error);
      setErrorMessage({ title: 'Delete Failed', description: 'Failed to delete post. Please try again.' });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicatePost = async (post) => {
    try {
      await duplicatePost(post.id);
      setSuccessMessage({ title: 'Post duplicated successfully', description: 'Your post has been duplicated' });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Failed to duplicate post:', error);
      setErrorMessage({ title: 'Duplicate Failed', description: 'Failed to duplicate post. Please try again.' });
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const API_BASE_URL = "http://localhost:5000/api";
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Removed unused fetchPosts function as posts are handled by usePosts hook



  return (
    <div className="gradient-bg min-h-screen text-white">
      <main className="ml-0 p-8">
        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Posts Library</h1>
            <p className="text-gray-400">Manage all your content</p>
          </div>

          <div className="flex space-x-4">
            <div className="flex bg-black/30 rounded-2xl p-1">
              <button
                onClick={() => setView("grid")}
                className={`px-4 py-2 rounded-xl ${
                  view === "grid" ? "bg-cyan-400/20 text-cyan-400" : "text-gray-400"
                }`}
              >
                <i className="fa-solid fa-th-large mr-2"></i>Grid
              </button>

              <button
                onClick={() => setView("list")}
                className={`px-4 py-2 rounded-xl ${
                  view === "list" ? "bg-cyan-400/20 text-cyan-400" : "text-gray-400"
                }`}
              >
                <i className="fa-solid fa-list mr-2"></i>List
              </button>
            </div>

            <button
              className="px-6 py-3 gradient-accent rounded-2xl"
              onClick={() => navigate("/dashboard/CreatePostPage")}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Create Post
            </button>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div id="filters-section" className="glass-effect rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                className="w-full bg-black/30 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-500 border border-gray-600 focus:border-cyan-400 transition-colors"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  setSearch(value);
                  generateSearchSuggestions(value);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* Search suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 rounded-2xl border border-gray-600 max-h-48 overflow-y-auto z-50">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-cyan-400/20 cursor-pointer text-white text-sm"
                      onClick={() => {
                        setSearch(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {["platform", "date", "performance", "sort"].map((key) => (
                <FilterSelect key={key} type={key} handleFilterChange={handleFilterChange} />
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex space-x-8 border-b border-gray-700 mb-8">
          {[
            { label: "All Posts", key: "all" },
            { label: "Drafts", key: "drafts" },
            { label: "Scheduled", key: "scheduled" },
            { label: "Published", key: "published" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 ${activeTab === tab.key ? "tab-active" : "text-gray-400"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* POSTS */}
        <div className={view === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          {paginatedPosts.length > 0 ? (
            paginatedPosts.map((post, index) => (
              <PostCard
                key={post.id || index}
                post={post}
                isSelected={selectedPosts.has(post.id)}
                toggleSelect={() => toggleSelectPost(post.id)}
                onEdit={() => handleEditPost(post)}
                onDuplicate={() => handleDuplicatePost(post)}
                onDelete={() => {
                  setSelectedPost(post);
                  setShowDeleteModal(true);
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <i className="fa-solid fa-inbox text-4xl text-gray-600 mb-4"></i>
              <p className="text-gray-400 text-lg">No posts found matching your criteria.</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters or create a new post.</p>
            </div>
          )}
        </div>

        {/* Dynamic Pagination */}
        <Pagination 
          total={filteredPosts.length} 
          current={currentPage} 
          postsPerPage={postsPerPage}
          onPageChange={handlePageChange}
        />

        {/* Bulk Actions Bar */}
        {selectedPosts.size > 0 && (
          <BulkActions
            selectedCount={selectedPosts.size}
            handleEdit={() => showToastMessage("Edit action")}
            handleDuplicate={() => showToastMessage("Duplicate action")}
            handleDelete={handleDelete}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="card-bg rounded-3xl p-8 border border-gray-700 glow-border w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Edit Post</h2>
                  <p className="text-gray-400 text-sm">Modify your content and scheduling preferences</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {/* Content Section */}
                <div className="relative">
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    <i className="fa-solid fa-file-text mr-2"></i>Content
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full h-40 bg-gray-800/50 border border-gray-600 rounded-2xl p-6 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="Write your post content here..."
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    />
                    <div className="absolute bottom-4 right-4">
                      <span className="text-gray-500 text-sm">
                        {editingPost.content.length} characters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platforms Section */}
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    <i className="fa-solid fa-share-nodes mr-2"></i>Publish To
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'Twitter', icon: 'fa-twitter', color: 'text-white' },
                      { name: 'LinkedIn', icon: 'fa-linkedin', color: 'text-blue-400' },
                      { name: 'Medium', icon: 'fa-medium', color: 'text-green-400' }
                    ].map(platform => (
                      <label
                        key={platform.name}
                        className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                          editingPost.platforms[platform.name]
                            ? 'bg-cyan-400/10 border-cyan-400/50'
                            : 'bg-gray-800/30 border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editingPost.platforms[platform.name] || false}
                          onChange={(e) => setEditingPost({
                            ...editingPost,
                            platforms: {
                              ...editingPost.platforms,
                              [platform.name]: e.target.checked
                            }
                          })}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center space-y-2">
                          <i className={`fa-brands ${platform.icon} text-2xl ${platform.color}`}></i>
                          <span className="text-sm font-medium text-white">{platform.name}</span>
                          {editingPost.platforms[platform.name] && (
                            <div className="absolute top-2 right-2">
                              <i className="fa-solid fa-check-circle text-cyan-400 text-xs"></i>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Scheduling Section */}
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    <i className="fa-solid fa-clock mr-2"></i>Schedule (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-2xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        value={editingPost.date}
                        onChange={(e) => setEditingPost({...editingPost, date: e.target.value})}
                      />
                      <i className="fa-solid fa-calendar absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                    <div className="relative">
                      <input
                        type="time"
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-2xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        value={editingPost.time}
                        onChange={(e) => setEditingPost({...editingPost, time: e.target.value})}
                      />
                      <i className="fa-solid fa-clock absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                  </div>
                  {editingPost.date && editingPost.time && (
                    <div className="mt-3 p-3 bg-green-400/10 border border-green-400/30 rounded-xl">
                      <p className="text-green-400 text-sm">
                        <i className="fa-solid fa-check-circle mr-2"></i>
                        Scheduled for {new Date(editingPost.date).toLocaleDateString()} at {editingPost.time}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Image Suggestions */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-300 font-medium">AI Image Suggestions</label>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                      Generate New
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map(index => (
                      <div 
                        key={index}
                        onClick={() => setEditingPost(prev => ({ ...prev, selectedImage: index }))}
                        className={`relative group cursor-pointer ${
                          editingPost.selectedImage === index ? 'ring-2 ring-cyan-400' : ''
                        }`}
                      >
                        <img 
                          className="w-full h-24 rounded-xl object-cover" 
                          src={`https://picsum.photos/200/150?random=${index + 300}`}
                          alt={`Image suggestion ${index + 1}`}
                        />
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {editingPost.selectedImage === index && (
                            <i className="fa-solid fa-check text-white text-xl"></i>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    <i className="fa-solid fa-info-circle mr-2"></i>
                    Changes will be saved immediately
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      className="px-6 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all flex items-center space-x-2"
                      onClick={() => setShowEditModal(false)}
                      disabled={isSaving}
                    >
                      <i className="fa-solid fa-times"></i>
                      <span>Cancel</span>
                    </button>
                    <button 
                      className="px-6 py-3 rounded-xl gradient-accent text-white hover:shadow-lg hover:shadow-cyan-400/25 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-save"></i>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && <DeleteModal cancel={cancelDelete} confirm={handleDeletePost} />}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl animate-fade-in-out z-50">
            <div className="text-center">
              <div className="font-semibold">{successMessage.title}</div>
              <div className="text-sm">{successMessage.description}</div>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {showErrorToast && (
          <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl animate-fade-in-out z-50">
            <div className="text-center">
              <div className="font-semibold">{errorMessage.title}</div>
              <div className="text-sm">{errorMessage.description}</div>
            </div>
          </div>
        )}

        {/* Toast */}
        {showToast && <Toast message={toastMessage} />}
      </main>
    </div>
  );
}

// ------------------- COMPONENTS -------------------

function PostCard({ post, isSelected, toggleSelect, onEdit, onDuplicate, onDelete }) {
  const statusColor =
    post.status === "draft"
      ? "status-draft"
      : post.status === "scheduled"
      ? "status-scheduled"
      : "status-published";

  const statusLabel =
    post.status === "draft"
      ? "Draft"
      : post.status === "scheduled"
      ? "Scheduled"
      : "Published";

  // Get active platforms
  const activePlatforms = post.platforms ? Object.keys(post.platforms).filter(p => post.platforms[p]) : [];

  // Calculate engagement
  const engagement = (post.engagement?.likes || 0) + (post.engagement?.shares || 0) + (post.engagement?.comments || 0);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Handle delete with modal
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`post-card glass-effect rounded-3xl p-6 border border-gray-700/50 hover:border-cyan-400/30 animate-fade-in cursor-pointer ${
        isSelected ? "border-cyan-400 ring-2 ring-cyan-400/20" : ""
      }`}
      onClick={toggleSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`${statusColor} px-3 py-1 rounded-xl text-sm font-medium`}>{statusLabel}</span>
          <div className="flex items-center space-x-1">
            {activePlatforms.map(platform => (
              <i key={platform} className={`fa-brands ${
                platform === 'Twitter' ? 'fa-twitter' :
                platform === 'LinkedIn' ? 'fa-linkedin' :
                'fa-medium'
              } text-sm text-gray-400`}></i>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <i className="fa-solid fa-edit text-xs"></i>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-gray-400 hover:text-violet-400 transition-colors"
          >
            <i className="fa-solid fa-copy text-xs"></i>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(e); }}
            className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
          >
            <i className="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 flex items-center justify-center mb-3">
          <i className="fa-solid fa-image text-2xl text-gray-400"></i>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
          {post.idea || post.content || "Untitled Post"}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3">
          {post.content ? post.content.substring(0, 120) + "..." : "No content preview available"}
        </p>
      </div>

      <div className="flex items-center justify-between text-gray-400 text-sm">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-calendar mr-1"></i>
          {post.scheduleDate && post.scheduleTime
            ? `Scheduled: ${formatDate(post.scheduleDate)} ${post.scheduleTime}`
            : `Created: ${formatDate(post.createdAt)}`
          }
        </div>
        {post.status === 'posted' && (
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center">
              <i className="fa-solid fa-eye mr-1"></i>
              {post.engagement?.views || 0}
            </span>
            <span className="flex items-center">
              <i className="fa-solid fa-heart mr-1"></i>
              {engagement}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ type, handleFilterChange }) {
  const optionsMap = {
    platform: [
      { label: "All Platforms", value: "" },
      { label: "Twitter", value: "twitter" },
      { label: "LinkedIn", value: "linkedin" },
      { label: "Medium", value: "medium" },
    ],
    date: [
      { label: "All Time", value: "" },
      { label: "Today", value: "today" },
      { label: "This Week", value: "week" },
      { label: "This Month", value: "month" },
      { label: "Last 3 Months", value: "quarter" },
    ],
    performance: [
      { label: "All Performance", value: "" },
      { label: "High Engagement", value: "high" },
      { label: "Medium Engagement", value: "medium" },
      { label: "Low Engagement", value: "low" },
    ],
    sort: [
      { label: "Newest First", value: "newest" },
      { label: "Oldest First", value: "oldest" },
      { label: "Best Engagement", value: "engagement" },
      { label: "Alphabetical", value: "alphabetical" },
    ],
  };

  return (
    <div className="relative">
      <select
        className="bg-black/30 rounded-2xl px-4 py-3 text-white border border-gray-600 appearance-none pr-10"
        onChange={(e) => handleFilterChange(type, e.target.value)}
        defaultValue={type === "sort" ? "newest" : ""}
      >
        {optionsMap[type].map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <i className="fa-solid fa-chevron-down text-gray-400"></i>
      </div>
    </div>
  );
}

function Pagination({ total, current, postsPerPage, onPageChange }) {
  const totalPages = Math.ceil(total / postsPerPage);
  const startItem = (current - 1) * postsPerPage + 1;
  const endItem = Math.min(current * postsPerPage, total);

  return (
    <div id="pagination-section" className="flex items-center justify-between mt-12">
      <div className="text-gray-400 text-sm">
        Showing {startItem}-{endItem} of {total} posts
      </div>
      <div className="flex items-center space-x-2">
        <button 
          className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        
        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          const isActive = page === current;
          const isEllipsis = page === '...';
          
          if (isEllipsis) {
            return <span key={index} className="text-gray-400">...</span>;
          }
          
          return (
            <button
              key={page}
              className={`w-10 h-10 rounded-xl ${
                isActive ? "bg-cyan-400/20 text-cyan-400" : "bg-black/30 text-gray-400 hover:text-white"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}
        
        <button 
          className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          onClick={() => onPageChange(current + 1)}
          disabled={current === totalPages}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

function BulkActions({ selectedCount, handleEdit, handleDuplicate, handleDelete }) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 glass-effect rounded-3xl p-4 border border-cyan-400/30 z-40">
      <div className="flex items-center space-x-4">
        <span className="text-white font-medium">{selectedCount} Selected</span>
        <button className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition-colors" onClick={handleEdit}>
          Edit
        </button>
        <button className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 transition-colors" onClick={handleDuplicate}>
          Duplicate
        </button>
        <button className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition-colors" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ cancel, confirm }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="glass-effect rounded-3xl p-8 max-w-md w-full border border-red-400/30">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-400/20 flex items-center justify-center">
            <i className="fa-solid fa-exclamation-triangle text-red-400 text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Delete Post</h3>
          <p className="text-gray-400 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
          <div className="flex space-x-4">
            <button 
              onClick={cancel}
              className="flex-1 p-3 rounded-2xl border border-gray-600 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirm}
              className="flex-1 p-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-black px-6 py-3 rounded-xl animate-fade-in-out z-50">
      {message}
    </div>
  );
}