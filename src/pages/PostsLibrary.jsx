import { useState } from "react";

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

        {/* SEARCH */}
        <div className="glass-effect rounded-3xl p-6 mb-8">
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full bg-black/30 rounded-2xl px-4 py-3 text-white"
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
          />
        </div>

        {/* TABS */}
        <div className="flex space-x-8 border-b border-gray-700 mb-8">
          {[{ label: "Drafts", key: "drafts" }, { label: "Scheduled", key: "scheduled" }, { label: "Published", key: "published" }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 ${
                activeTab === tab.key ? "tab-active" : "text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* POSTS */}
        <div className={view === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => <PostCard key={index} {...post} />)
          ) : (
            <p className="text-gray-400">No posts found.</p>
          )}
        </div>

      </main>
    </div>
  );
}

function PostCard({ title, status, createdAt, platform, views, likes, comments }) {
  const statusColor =
    status === "Draft"
      ? "status-draft"
      : status === "Scheduled"
      ? "status-scheduled"
      : "status-published";

  const platformIcon =
    platform === "twitter"
      ? "fa-x-twitter"
      : platform === "linkedin"
      ? "fa-linkedin"
      : "fa-medium";

  return (
    <div className="post-card glass-effect rounded-3xl p-6 border border-gray-700/50">
      <div className="flex justify-between mb-4">
        <span className={`${statusColor} px-3 py-1 rounded-xl text-sm`}>{status}</span>
        <div className="space-x-2">
          <button><i className="fa-solid fa-edit"></i></button>
          <button><i className="fa-solid fa-copy"></i></button>
          <button><i className="fa-solid fa-trash"></i></button>
        </div>
      </div>

      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">Sample content preview for this post...</p>
      <p className="text-gray-500 text-xs mt-2">Created at: {createdAt}</p>

      <div className="flex items-center justify-between mt-4 text-gray-300 text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <i className={`fa-brands ${platformIcon}`}></i>
            <span>{platform}</span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="fa-solid fa-eye"></i>
            <span>{views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="fa-solid fa-heart"></i>
            <span>{likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="fa-solid fa-comment"></i>
            <span>{comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
