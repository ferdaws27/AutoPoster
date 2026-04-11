import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UpcomingPosts from "../components/UpcomingPosts";
import useDashboardStore from "../store/useDashboardStore";
import { usePosts } from "../hooks/usePosts";

/* ================= COLORS ================= */
const COLORS = {
  cyan: { bg: "bg-cyan-400/20", text: "text-cyan-400" },
  violet: { bg: "bg-violet-400/20", text: "text-violet-400" },
  green: { bg: "bg-green-400/20", text: "text-green-400" },
};

/* ================= DASHBOARD ================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    content,
    user,
    showCreateModal,
    platforms,
    aiOptions,
    aiSuggestion,
    aiIdeas,

    setContent,
    setUser,
    setLoading,
    setShowCreateModal,
    setPlatforms,
    setAiOptions,
    setAiSuggestion,
    setAiIdeas,
    loadUserFromStorage,
    refreshAIIdeas,
    importPosts,
    createDraft,
    createScheduled,
  } = useDashboardStore();

  const {
    posts,
    stats,
    loading,
    error,
    syncWithBackend
  } = usePosts();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Add a manual refresh handler
  const handleManualRefresh = async () => {
    console.log('🔄 Manually refreshing posts...');
    await syncWithBackend();
  };

  if (error) {
    return (
      <div className="gradient-bg min-h-screen text-white m-0 p-0">
        <main className="flex-1 m-0 px-8 py-8 w-full">
          <div className="glass-effect rounded-3xl p-8 border border-red-400/30 mb-8">
            <div className="flex items-start space-x-4">
              <div className="text-red-400 text-2xl">⚠️</div>
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Posts</h3>
                <p className="text-gray-300 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-xl gradient-accent text-white hover:opacity-90 transition-opacity"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const normalizedPosts = (posts || []).map((p) => ({
    ...p,
    scheduleDate: p.scheduleDate || p.schedule_date || null,
    scheduleTime: p.scheduleTime || p.schedule_time || null,
  }));

  // Show all posts (scheduled, draft, and posted) sorted by date
  const allPosts = normalizedPosts.sort((a, b) => {
    const dateA = a.scheduleDate ? new Date(`${a.scheduleDate} ${a.scheduleTime || '00:00'}`) : new Date(a.createdAt || 0);
    const dateB = b.scheduleDate ? new Date(`${b.scheduleDate} ${b.scheduleTime || '00:00'}`) : new Date(b.createdAt || 0);
    return dateA - dateB;
  });

  // Filter and sort upcoming posts - only show scheduled and future posts
  const scheduledPosts = allPosts.filter(post => {
    if (post.status !== 'scheduled') return false;
    if (!post.scheduleDate || !post.scheduleTime) return false;
    
    const postDateTime = new Date(`${post.scheduleDate} ${post.scheduleTime}`);
    const now = new Date();
    return postDateTime > now; // Only show future posts
  }).sort((a, b) => {
    const dateA = new Date(`${a.scheduleDate} ${a.scheduleTime}`);
    const dateB = new Date(`${b.scheduleDate} ${b.scheduleTime}`);
    return dateA - dateB; // Sort by earliest first
  });

  const totalPosts = normalizedPosts.length;
  const scheduledCount = stats.scheduled || 0;
  const draftCount = stats.drafts || 0;
  const publishedCount = stats.published || 0;

  const nextPostTime = scheduledPosts
    .filter((p) => p.scheduleDate && p.scheduleTime)
    .sort((a, b) => {
      const dateA = new Date(`${a.scheduleDate} ${a.scheduleTime}`);
      const dateB = new Date(`${b.scheduleDate} ${b.scheduleTime}`);
      return dateA - dateB;
    })[0];

  const nextPost = nextPostTime
    ? new Date(`${nextPostTime.scheduleDate} ${nextPostTime.scheduleTime}`).toLocaleString()
    : "No scheduled post";

  const totalViews = normalizedPosts.reduce(
    (sum, p) => sum + (p.engagement?.views || 0),
    0
  );

  const totalEngagement = normalizedPosts.reduce(
    (sum, p) =>
      sum +
      (p.engagement?.likes || 0) +
      (p.engagement?.shares || 0) +
      (p.engagement?.comments || 0),
    0
  );

  const avgRating = normalizedPosts.length
    ? (
        normalizedPosts.reduce((sum, p) => sum + (p.rating || 0), 0) /
        normalizedPosts.length
      ).toFixed(1)
    : "4.2";

  const handleImport = () => {
    document.getElementById("import-file").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json.posts)) {
          importPosts(json.posts);
          setAiSuggestion("Import réussi !");
        }
      } catch (error) {
        console.error("Import error:", error);
        setAiSuggestion("Erreur lors de l'import. Vérifiez le format JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const data = { posts: normalizedPosts };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autoposter-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkPublished = (id) => {
    console.log("Post published:", id);
  };

  const handleScheduleNew = () => {
    navigate("/dashboard/scheduling");
  };

  const handleRefreshAIIdeas = () => {
    refreshAIIdeas();
  };

  const handleGenerateMoreIdeas = () => {
    refreshAIIdeas();
  };

  const handleUseAIdea = (idea) => {
    setContent(idea.title);
    setShowCreateModal(true);
    setAiSuggestion(`Idée appliquée : ${idea.title}`);
  };

  const handleAIOptimize = () => {
    if (!content.trim()) {
      setAiSuggestion("Please enter content first to optimize.");
      return;
    }

    const optimized = content
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 280);

    setContent(`✅ Optimized: ${optimized}`);
    setAiSuggestion("Contenu optimisé automatiquement ! Vous pouvez modifier puis enregistrer.");
  };

  return (
    <div className="gradient-bg min-h-screen text-white m-0 p-0">
      <main className="flex-1 m-0 px-8 py-8 w-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Good morning, {user?.full_name || "Flen"}</h2>
            <p className="text-gray-400">Let's create something amazing today</p>
          </div>
          <div className="flex items-center space-x-4">
            <Status />
            <IconButton icon="fa-bell" />
          </div>
        </header>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Total Posts Card */}
          <div className="glass-effect rounded-3xl p-6 card-hover glow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <i className="fa-solid fa-file-lines text-cyan-400 text-xl"></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{loading ? "..." : totalPosts}</div>
                <div className="text-sm text-gray-400">This week</div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Total Posts</h3>
              <div className="flex items-center text-sm">
                <i className="fa-solid fa-arrow-up text-green-400 mr-1"></i>
                <span className="text-green-400">+18%</span>
                <span className="text-gray-400 ml-1">vs last week</span>
              </div>
            </div>
          </div>

          {/* Average Engagement Card */}
          <div className="glass-effect rounded-3xl p-6 card-hover glow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center">
                <i className="fa-solid fa-heart text-violet-400 text-xl"></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{loading ? "..." : `${Math.min(100, (scheduledCount + publishedCount) * 4)}%`}</div>
                <div className="text-sm text-gray-400">Avg rate</div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Engagement</h3>
              <div className="flex items-center text-sm">
                <i className="fa-solid fa-arrow-up text-green-400 mr-1"></i>
                <span className="text-green-400">+2.1%</span>
                <span className="text-gray-400 ml-1">vs last week</span>
              </div>
            </div>
          </div>

          {/* Next Scheduled Post Card */}
          <div className="glass-effect rounded-3xl p-6 card-hover glow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-400/20 flex items-center justify-center">
                <i className="fa-solid fa-clock text-green-400 text-xl"></i>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{loading ? "..." : nextPostTime ? new Date(`${nextPostTime.scheduleDate} ${nextPostTime.scheduleTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "No post"}</div>
                <div className="text-sm text-gray-400">{nextPostTime ? "Today" : "Scheduled"}</div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Next Post</h3>
              <div className="flex items-center text-sm">
                <div className="flex space-x-1 mr-2">
                  <i className="fa-brands fa-x-twitter text-white text-xs"></i>
                  <i className="fa-brands fa-linkedin text-blue-400 text-xs"></i>
                </div>
                <span className="text-gray-400">2 platforms</span>
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-8">
          <UpcomingPosts posts={scheduledPosts} onPublish={handleMarkPublished} onScheduleNew={handleScheduleNew} />
          <AIIdeas ideas={aiIdeas} onRefresh={handleRefreshAIIdeas} onUseIdea={handleUseAIdea} onGenerateMore={handleGenerateMoreIdeas} navigate={navigate} />
        </section>

        <section className="mt-8">
          <RecentActivity
            stats={{
              postsPublished: publishedCount,
              totalViews,
              totalEngagement,
              avgRating,
            }}
            posts={normalizedPosts}
            navigate={navigate}
          />
        </section>

        <div id="quick-actions-bar" className="mt-8">
          <div className="glass-effect rounded-3xl p-6 glow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Quick Actions
                </h3>
                <p className="text-gray-400 text-sm">
                  Streamline your content workflow
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleImport}
                  className="flex items-center px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white transition-all"
                >
                  <i className="fa-solid fa-upload mr-2"></i>
                  Import Content
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white transition-all"
                >
                  <i className="fa-solid fa-download mr-2"></i>
                  Export Data
                </button>

                <button
                  onClick={handleAIOptimize}
                  className="flex items-center px-4 py-2 rounded-xl gradient-accent text-white hover:opacity-90 transition-opacity"
                >
                  <i className="fa-solid fa-magic-wand-sparkles mr-2"></i>
                  AI Optimize
                </button>

                <input
                  id="import-file"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {aiSuggestion && (
                <div className="mt-3 text-sm text-cyan-200 whitespace-pre-line">{aiSuggestion}</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => navigate("/dashboard/CreatePostPage")}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl gradient-accent pulse-glow z-50 flex items-center justify-center hover:scale-110 transition-transform"
        title="Create New Post"
      >
        <i className="fa-solid fa-plus text-xl"></i>
      </button>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-effect rounded-3xl p-8 max-w-4xl w-full relative">
            <div className="flex justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Create New Post</h3>
                <p className="text-gray-400">Write once, post everywhere</p>
              </div>
              <button onClick={() => setShowCreateModal(false)}>
                <i className="fa-solid fa-xmark text-xl text-gray-400 hover:text-white"></i>
              </button>
            </div>

            <Section title="Select Platforms">
              <Platform
                label="Twitter/X"
                icon="fa-twitter"
                checked={platforms.twitter}
                onClick={() => setPlatforms({ ...platforms, twitter: !platforms.twitter })}
              />
              <Platform
                label="LinkedIn"
                icon="fa-linkedin-in"
                blue
                checked={platforms.linkedin}
                onClick={() => setPlatforms({ ...platforms, linkedin: !platforms.linkedin })}
              />
              <Platform
                label="Medium"
                icon="fa-medium"
                checked={platforms.medium}
                onClick={() => setPlatforms({ ...platforms, medium: !platforms.medium })}
              />
            </Section>

            <Section title="Your Content Idea">
              <textarea
                className="w-full min-h-32 p-4 rounded-2xl bg-gray-800/60 border border-gray-600 focus:border-cyan-400 outline-none"
                placeholder="Share your thoughts, insights, or ideas..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Section>

            <AIOptions aiOptions={aiOptions} setAiOptions={setAiOptions} />

            <div className="flex gap-4 mt-6">
              <button
                className="flex-1 p-4 rounded-2xl border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving || !content.trim()}
                onClick={async () => {
                  if (!content.trim()) return;
                  
                  try {
                    setIsSaving(true);
                    await createDraft(content, Object.keys(platforms).filter((p) => platforms[p]));
                    
                    // Refresh posts from backend
                    setTimeout(() => syncWithBackend(), 500);
                    
                    setContent("");
                    setShowCreateModal(false);
                  } catch (err) {
                    console.error('Error creating draft:', err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </button>

              <button
                className="flex-1 p-4 rounded-2xl gradient-accent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving || !content.trim()}
                onClick={async () => {
                  if (!content.trim()) return;
                  
                  try {
                    setIsSaving(true);
                    await createScheduled(content, Object.keys(platforms).filter((p) => platforms[p]));
                    
                    // Refresh posts from backend
                    setTimeout(() => syncWithBackend(), 500);
                    
                    setContent("");
                    setShowCreateModal(false);
                  } catch (err) {
                    console.error('Error scheduling post:', err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Generate & Preview'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const Brand = () => (
  <div className="flex items-center mb-12">
    <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center mr-4">
      <i className="fa-solid fa-pen-nib"></i>
    </div>
    <div>
      <h1 className="text-xl font-bold">
        Auto<span className="gradient-accent bg-clip-text text-transparent">Poster</span>
      </h1>
      <p className="text-sm text-gray-400">AI Content Hub</p>
    </div>
  </div>
);

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center p-4 rounded-2xl cursor-pointer ${active ? "bg-cyan-400/10" : ""}`}>
    <i className={`fa-solid ${icon} w-6 text-cyan-400`}></i>
    <span className="ml-4">{label}</span>
  </div>
);

const StatCard = ({ icon, color, value, label }) => {
  const c = COLORS[color];
  return (
    <div className="glass-effect rounded-3xl p-6 glow-card">
      <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mb-4`}>
        <i className={`fa-solid ${icon} ${c.text}`}></i>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="glass-effect rounded-3xl p-6 glow-card">
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="font-semibold mb-3">{title}</h4>
    <div className="flex gap-4 flex-wrap">{children}</div>
  </div>
);

const Platform = ({ label, icon, blue, checked, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center p-3 rounded-xl border cursor-pointer ${
      checked ? "border-cyan-400" : "border-gray-600"
    }`}
  >
    <i className={`fa-brands ${icon} ${blue ? "text-blue-400" : "text-white"} mr-3`}></i>
    {label}
  </div>
);

const ActionButton = ({ icon, label, primary }) => (
  <button className={`px-4 py-2 rounded-xl ${
    primary ? "gradient-accent" : "bg-gray-800/50 border border-gray-600"
  }`}>
    <i className={`fa-solid ${icon} mr-2`}></i>
    {label}
  </button>
);

const Status = () => (
  <div className="glass-effect rounded-2xl px-4 py-2 flex items-center space-x-2">
    <div className="w-2 h-2 rounded-full bg-green-400"></div>
    <span className="text-sm">All systems operational</span>
  </div>
);

const IconButton = ({ icon }) => (
  <button className="p-3 glass-effect rounded-2xl">
    <i className={`fa-solid ${icon} text-gray-400`}></i>
  </button>
);

const RecentActivity = ({ stats, posts, navigate }) => {
  // Calculer les métriques dynamiques basées sur les posts réels
  const calculateMetrics = (posts, period = '7days') => {
    const now = new Date();
    let periodStart;
    
    switch(period) {
      case '7days':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const filteredPosts = posts.filter(post => {
      const postDate = new Date(post.createdAt || post.scheduledAt || post.date);
      return postDate >= periodStart;
    });
    
    // Posts publiés dans la période
    const publishedPosts = filteredPosts.filter(post => post.status === 'posted' || post.status === 'Published');
    const postsPublished = publishedPosts.length;
    
    // Vues totales (simulées si non disponibles)
    const totalViews = filteredPosts.reduce((sum, post) => {
      const views = post.engagement?.views || post.views || Math.floor(Math.random() * 1000) + 100;
      return sum + views;
    }, 0);
    
    // Engagements totaux (likes + shares + comments)
    const totalEngagement = filteredPosts.reduce((sum, post) => {
      const engagement = post.engagement;
      if (engagement) {
        return sum + (engagement.likes || 0) + (engagement.shares || 0) + (engagement.comments || 0);
      }
      // Simulation si pas de données
      return sum + Math.floor(Math.random() * 50) + 10;
    }, 0);
    
    // Rating moyen
    const ratings = filteredPosts
      .filter(post => post.rating)
      .map(post => post.rating);
    const avgRating = ratings.length > 0 
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : (4.0 + Math.random() * 1.5).toFixed(1); // Simulation si pas de données
    
    // Taux de croissance (comparé à la période précédente)
    const growthRate = postsPublished > 0 ? Math.floor(Math.random() * 30) + 5 : 0;
    
    return {
      postsPublished,
      totalViews,
      totalEngagement,
      avgRating,
      growthRate,
      periodPosts: filteredPosts.length
    };
  };
  
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const metrics = calculateMetrics(posts || [], selectedPeriod);
  
  return (
    <div className="glass-effect rounded-3xl p-6 glow-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>

        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <ActivityItem
          icon="fa-paper-plane"
          value={metrics.postsPublished}
          label="Posts Published"
          color="green"
          growth={metrics.growthRate}
        />

        <ActivityItem
          icon="fa-eye"
          value={metrics.totalViews > 1000 ? `${(metrics.totalViews/1000).toFixed(1)}K` : metrics.totalViews}
          label="Total Views"
          color="cyan"
          growth={metrics.totalViews > 0 ? Math.floor(Math.random() * 25) + 5 : 0}
        />

        <ActivityItem
          icon="fa-heart"
          value={metrics.totalEngagement}
          label="Engagements"
          color="violet"
          growth={metrics.totalEngagement > 0 ? Math.floor(Math.random() * 20) + 3 : 0}
        />

        <ActivityItem
          icon="fa-star"
          value={metrics.avgRating}
          label="Avg Rating"
          color="yellow"
          growth={parseFloat(metrics.avgRating) > 4.0 ? Math.floor(Math.random() * 10) + 1 : 0}
        />
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, value, label, color, growth }) => (
  <div className="text-center p-4 rounded-2xl bg-gray-800/30">
    <div className={`w-12 h-12 rounded-2xl bg-${color}-400/20 flex items-center justify-center mx-auto mb-3`}>
      <i className={`fa-solid ${icon} text-${color}-400`}></i>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
    {growth && (
      <div className="text-xs text-green-400 mt-1">+{growth}%</div>
    )}
  </div>
);

const AIIdeas = ({ ideas = [], onRefresh, onUseIdea, onGenerateMore, navigate }) => (
  <div id="ai-ideas-section" className="glass-effect rounded-3xl p-6 glow-card">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center mr-3">
          <i className="fa-solid fa-lightbulb text-white text-sm"></i>
        </div>
        <h2 className="text-xl font-bold text-white">AI Ideas</h2>
      </div>
      <button onClick={onRefresh} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Refresh</button>
    </div>

    <div className="space-y-4 mb-6">
      {ideas.length === 0 ? (
        <p className="text-gray-400 text-sm">No AI ideas available.</p>
      ) : (
        ideas.slice(0, 3).map((idea, index) => {
          const gradients = [
            'from-cyan-400/10 to-violet-400/10 border-cyan-400/20 hover:border-cyan-400/40',
            'from-violet-400/10 to-pink-400/10 border-violet-400/20 hover:border-violet-400/40',
            'from-green-400/10 to-blue-400/10 border-green-400/20 hover:border-green-400/40'
          ];
          
          const colors = ['cyan', 'violet', 'green'];
          const color = colors[index % 3];

          return (
            <div key={idea.id || index} className={`p-4 rounded-2xl bg-gradient-to-br ${gradients[index % 3]} border transition-colors`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-lg bg-${color}-400/20 flex items-center justify-center mr-2`}>
                    <i className={`fa-solid fa-${['rocket', 'brain', 'chart-line'][index % 3]} text-${color}-400 text-xs`}></i>
                  </div>
                  <span className={`text-xs font-medium text-${color}-400 uppercase tracking-wide`}>{idea.category || 'Trending'}</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 bg-black rounded flex items-center justify-center">
                    <i className="fa-brands fa-x-twitter text-white text-xs"></i>
                  </div>
                  <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                    <i className="fa-brands fa-linkedin-in text-white text-xs"></i>
                  </div>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">{idea.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{idea.desc}</p>
              <button 
                onClick={() => navigate(`/dashboard/CreatePostPage?content=${encodeURIComponent(idea.title)}&description=${encodeURIComponent(idea.desc)}`)}
                className={`w-full p-2 rounded-xl ${index === 0 ? 'gradient-accent' : index === 1 ? 'gradient-accent-reverse' : 'bg-gradient-to-r from-green-400 to-blue-400'} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
              >
                Generate Post
              </button>
            </div>
          );
        })
      )}
    </div>

    <div className="pt-4 border-t border-gray-700/50">
      <button onClick={onGenerateMore} className="w-full p-3 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-all text-sm font-medium">
        <i className="fa-solid fa-magic-wand-sparkles mr-2"></i>
        Generate More Ideas
      </button>
    </div>
  </div>
);

const AIOptions = ({ aiOptions, setAiOptions }) => (
  <div className="mb-6">
    <h3 className="font-semibold mb-3">AI Enhancement Options</h3>
    <div className="grid grid-cols-2 gap-4">
      <label
        onClick={() => setAiOptions({ ...aiOptions, optimize: !aiOptions.optimize })}
        className={`flex items-center p-3 rounded-xl border cursor-pointer ${
          aiOptions.optimize ? "border-violet-400" : "border-gray-600"
        }`}
      >
        <i className="fa-solid fa-magic-wand-sparkles text-violet-400 mr-3"></i>
        Platform Optimization
      </label>

      <label
        onClick={() => setAiOptions({ ...aiOptions, images: !aiOptions.images })}
        className={`flex items-center p-3 rounded-xl border cursor-pointer ${
          aiOptions.images ? "border-cyan-400" : "border-gray-600"
        }`}
      >
        <i className="fa-solid fa-image text-cyan-400 mr-3"></i>
        AI Image Suggestions
      </label>
    </div>
  </div>
);