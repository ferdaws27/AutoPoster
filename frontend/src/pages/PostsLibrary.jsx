import { useState, useEffect } from "react";

export default function PostsLibrary() {
  const [activeTab, setActiveTab] = useState("drafts");
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

  const postsData = [
    {
      title: "Building a SaaS Product",
      status: "Draft",
      platform: "twitter",
      createdAt: "2026-02-05",
      engagement: "high",
      views: 120,
      likes: 45,
      comments: 10,
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/4f8a2b3c1d-e9f6d7c8b9a0.png",
    },
    {
      title: "AI Content Revolution",
      status: "Draft",
      platform: "linkedin",
      createdAt: "2026-02-06",
      engagement: "medium",
      views: 80,
      likes: 30,
      comments: 5,
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/7e9d6c5b4a-3f2e1d0c9b8a.png",
    },
    {
      title: "Remote Work Productivity",
      status: "Draft",
      platform: "medium",
      createdAt: "2026-02-07",
      engagement: "low",
      views: 50,
      likes: 15,
      comments: 3,
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/9c8b7a6d5e-4f3e2d1c0b9a.png",
    },
    {
      title: "Social Media Automation",
      status: "Scheduled",
      platform: "twitter",
      createdAt: "2026-02-04",
      engagement: "high",
      views: 200,
      likes: 90,
      comments: 20,
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/placeholder1.png",
    },
    {
      title: "How I Raised $2M",
      status: "Published",
      platform: "linkedin",
      createdAt: "2026-01-20",
      engagement: "medium",
      views: 150,
      likes: 60,
      comments: 15,
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/placeholder2.png",
    },
    {
      title: "Maximizing Team Efficiency",
      status: "Published",
      platform: "medium",
      createdAt: "2026-01-25",
      engagement: "low",
      views: 70,
      likes: 20,
      comments: 5,
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/placeholder3.png",
    },
    {
      title: "AI in Daily Life",
      status: "Scheduled",
      platform: "twitter",
      createdAt: "2026-02-03",
      engagement: "high",
      views: 180,
      likes: 80,
      comments: 18,
      img: "https://storage.googleapis.com/uxpilot-auth.appspot.com/placeholder4.png",
    },
  ];

  const filteredPosts = postsData
    .filter((post) => {
      if (activeTab === "drafts" && post.status !== "Draft") return false;
      if (activeTab === "scheduled" && post.status !== "Scheduled") return false;
      if (activeTab === "published" && post.status !== "Published") return false;

      const title = post.title.toLowerCase();
      const content = "Sample content preview for this post...".toLowerCase();
      if (!title.includes(search) && !content.includes(search)) return false;

      if (filters.platform && post.platform !== filters.platform) return false;
      if (filters.performance && post.engagement !== filters.performance) return false;

      const today = new Date();
      const postDate = new Date(post.createdAt);
      const diffDays = (today - postDate) / (1000 * 60 * 60 * 24);

      if (filters.date === "today" && diffDays > 0) return false;
      if (filters.date === "week" && diffDays > 7) return false;
      if (filters.date === "month" && diffDays > 30) return false;
      if (filters.date === "quarter" && diffDays > 90) return false;

      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (filters.sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (filters.sort === "engagement") {
        const map = { high: 3, medium: 2, low: 1 };
        return map[b.engagement] - map[a.engagement];
      }
      if (filters.sort === "alphabetical") return a.title.localeCompare(b.title);
      return 0;
    });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSelectPost = (title) => {
    const newSet = new Set(selectedPosts);
    if (newSet.has(title)) newSet.delete(title);
    else newSet.add(title);
    setSelectedPosts(newSet);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    showToastMessage("Post deleted successfully");
    setSelectedPosts(new Set());
  };

  const cancelDelete = () => setShowDeleteModal(false);

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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

            <button className="px-6 py-3 gradient-accent rounded-2xl">
              <i className="fa-solid fa-plus mr-2"></i>Create Post
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
                key={index}
                {...post}
                isSelected={selectedPosts.has(post.title)}
                toggleSelect={() => toggleSelectPost(post.title)}
              />
            ))
          ) : (
            <p className="text-gray-400">No posts found.</p>
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

function PostCard({ title, status, createdAt, platform, views, likes, comments, img, isSelected, toggleSelect }) {
  const statusColor =
    status === "Draft"
      ? "status-draft"
      : status === "Scheduled"
      ? "status-scheduled"
      : "status-published";

  const platformIcon =
    platform === "twitter" ? "fa-x-twitter" : platform === "linkedin" ? "fa-linkedin" : "fa-medium";

  return (
    <div
      className={`post-card glass-effect rounded-3xl p-6 border border-gray-700/50 hover:border-cyan-400/30 animate-fade-in ${
        isSelected ? "border-cyan-400" : ""
      }`}
      onClick={toggleSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`${statusColor} px-3 py-1 rounded-xl text-sm font-medium`}>{status}</span>
          <div className="flex items-center space-x-1">
            <i className={`fa-brands ${platformIcon} text-sm`}></i>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors">
            <i className="fa-solid fa-edit text-xs"></i>
          </button>
          <button className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-gray-400 hover:text-violet-400 transition-colors">
            <i className="fa-solid fa-copy text-xs"></i>
          </button>
          <button className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
            <i className="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <img className="w-full h-40 rounded-2xl object-cover mb-3" src={img} alt={title} />
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-400 text-sm line-clamp-3">Sample content preview for this post...</p>
      </div>

      <div className="flex items-center justify-between text-gray-400 text-sm">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-calendar mr-1"></i>
          Created {createdAt}
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center">
            <i className="fa-solid fa-eye mr-1"></i>
            {views}
          </span>
          <span className="flex items-center">
            <i className="fa-solid fa-heart mr-1"></i>
            {likes}
          </span>
          <span className="flex items-center">
            <i className="fa-solid fa-comment mr-1"></i>
            {comments}
          </span>
        </div>
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
