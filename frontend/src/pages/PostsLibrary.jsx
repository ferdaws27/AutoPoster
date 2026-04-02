import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";

export default function PostsLibrary() {
  const navigate = useNavigate();
  const { posts, deletePost, updatePost, duplicatePost } = usePosts();
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    platform: "",
    date: "",
    performance: "",
    sort: "newest",
  });

  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filteredPosts = posts
    .filter((post) => {
      // Filter by tab
      if (activeTab === "drafts" && post.status !== "draft") return false;
      if (activeTab === "scheduled" && post.status !== "scheduled") return false;
      if (activeTab === "published" && post.status !== "posted") return false;

      // Search filter
      const searchTerm = search.toLowerCase();
      const title = (post.idea || post.content || "").toLowerCase();
      if (searchTerm && !title.includes(searchTerm)) return false;

      // Platform filter
      if (filters.platform && post.platforms) {
        const hasPlatform = Object.keys(post.platforms).some(p => 
          p.toLowerCase().includes(filters.platform.toLowerCase()) && post.platforms[p]
        );
        if (!hasPlatform) return false;
      }

      // Date filter
      if (filters.date) {
        const postDate = new Date(post.createdAt || post.scheduleDate);
        const today = new Date();
        const diffDays = (today - postDate) / (1000 * 60 * 60 * 24);

        if (filters.date === "today" && diffDays > 1) return false;
        if (filters.date === "week" && diffDays > 7) return false;
        if (filters.date === "month" && diffDays > 30) return false;
        if (filters.date === "quarter" && diffDays > 90) return false;
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
    // Navigate to create post page with post data for editing
    navigate("/dashboard/CreatePostPage", { state: { editPost: post } });
  };

  const handleDuplicatePost = async (post) => {
    try {
      await duplicatePost(post.id);
      showToastMessage("Post duplicated successfully");
    } catch (error) {
      console.error('Failed to duplicate post:', error);
      showToastMessage("Failed to duplicate post");
    }
  };

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
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
              />
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
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <PostCard
                key={post.id || index}
                post={post}
                isSelected={selectedPosts.has(post.id)}
                toggleSelect={() => toggleSelectPost(post.id)}
                onEdit={() => handleEditPost(post)}
                onDuplicate={() => handleDuplicatePost(post)}
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

        {/* Pagination */}
        <Pagination total={45} current={1} />

        {/* Bulk Actions Bar */}
        {selectedPosts.size > 0 && (
          <BulkActions
            selectedCount={selectedPosts.size}
            handleEdit={() => showToastMessage("Edit action")}
            handleDuplicate={() => showToastMessage("Duplicate action")}
            handleDelete={handleDelete}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && <DeleteModal cancel={cancelDelete} confirm={confirmDelete} />}

        {/* Toast */}
        {showToast && <Toast message={toastMessage} />}
      </main>
    </div>
  );
}

// ------------------- COMPONENTS -------------------

function PostCard({ post, isSelected, toggleSelect, onEdit, onDuplicate }) {
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
                platform === 'Twitter' ? 'fa-x-twitter' :
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
            onClick={(e) => { e.stopPropagation(); toggleSelect(); }}
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

function Pagination({ total, current }) {
  return (
    <div id="pagination-section" className="flex items-center justify-between mt-12">
      <div className="text-gray-400 text-sm">Showing 1-6 of {total} posts</div>
      <div className="flex items-center space-x-2">
        <button className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={`w-10 h-10 rounded-xl ${
              page === current ? "bg-cyan-400/20 text-cyan-400" : "bg-black/30 text-gray-400 hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}
        <span className="text-gray-400">...</span>
        <button className="w-10 h-10 rounded-xl bg-black/30 text-gray-400 hover:text-white transition-colors">45</button>
        <button className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black/80 p-6 rounded-3xl text-white w-96">
        <h2 className="text-xl font-bold mb-4">Are you sure you want to delete?</h2>
        <div className="flex justify-end space-x-4">
          <button className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600" onClick={cancel}>
            Cancel
          </button>
          <button className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600" onClick={confirm}>
            Delete
          </button>
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
