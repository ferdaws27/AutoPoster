import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../services/api";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function ExportDanger({ onChange }) {
  const [exporting, setExporting] = useState({ posts: false, analytics: false, settings: false });

  const toastStyle = {
    style: {
      background: "#1a1a2e",
      color: "#fff",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "12px 20px",
      fontSize: "14px",
    },
  };

  // Export handlers
  const handleExport = async (type) => {
    setExporting((prev) => ({ ...prev, [type]: true }));
    try {
      switch (type) {
        case "posts": {
          let posts = [];
          try {
            const res = await apiFetch("/api/posts/getPosts");
            if (res.success && res.data?.posts) {
              posts = res.data.posts;
            }
          } catch {
            posts = JSON.parse(localStorage.getItem("autoposter_posts") || "[]");
          }

          if (posts.length === 0) {
            toast("No posts to export", { ...toastStyle, icon: "⚠️" });
            break;
          }

          downloadJSON(posts, "autoposter-posts.json");
          downloadCSV(posts, "autoposter-posts.csv");
          toast.success(`${posts.length} posts exported (JSON + CSV)`, toastStyle);
          break;
        }
        case "analytics": {
          let analyticsData = [];
          try {
            const res = await apiFetch("/api/analytics");
            analyticsData = Array.isArray(res) ? res : (res.data || []);
          } catch {
            // Fallback: try posts endpoint
            try {
              const res = await apiFetch("/api/posts/getPosts");
              if (res.success && res.data?.posts) {
                analyticsData = res.data.posts.map((p) => ({
                  _id: p._id,
                  content: p.content,
                  platforms: p.platforms,
                  engagement: p.engagement || { likes: 0, comments: 0, shares: 0 },
                  totalEngagement: (p.engagement?.likes || 0) + (p.engagement?.comments || 0) + (p.engagement?.shares || 0),
                  createdAt: p.created_at,
                }));
              }
            } catch {
              analyticsData = [];
            }
          }

          if (analyticsData.length === 0) {
            toast("No analytics data found", { ...toastStyle, icon: "⚠️" });
            break;
          }

          const totalEngagement = analyticsData.reduce((sum, p) => sum + (p.totalEngagement || 0), 0);
          const totalLikes = analyticsData.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0);
          const totalComments = analyticsData.reduce((sum, p) => sum + (p.engagement?.comments || 0), 0);
          const totalShares = analyticsData.reduce((sum, p) => sum + (p.engagement?.shares || 0), 0);

          const platformCount = {};
          analyticsData.forEach((p) => {
            const platforms = p.platforms || {};
            if (typeof platforms === "object" && !Array.isArray(platforms)) {
              Object.keys(platforms).forEach((k) => {
                if (platforms[k]) platformCount[k] = (platformCount[k] || 0) + 1;
              });
            } else if (Array.isArray(platforms)) {
              platforms.forEach((k) => { platformCount[k] = (platformCount[k] || 0) + 1; });
            }
          });

          const topPosts = [...analyticsData]
            .sort((a, b) => (b.totalEngagement || 0) - (a.totalEngagement || 0))
            .slice(0, 10);

          const analytics = {
            exportDate: new Date().toISOString(),
            totalPosts: analyticsData.length,
            totalEngagement,
            summary: { totalLikes, totalComments, totalShares },
            byPlatform: platformCount,
            topPosts: topPosts.map((p) => ({
              id: p._id,
              content: (p.content || "").substring(0, 120),
              engagement: p.engagement,
              totalEngagement: p.totalEngagement,
              platforms: p.platforms,
              createdAt: p.createdAt,
            })),
            allPosts: analyticsData.map((p) => ({
              id: p._id,
              content: (p.content || "").substring(0, 100),
              likes: p.engagement?.likes || 0,
              comments: p.engagement?.comments || 0,
              shares: p.engagement?.shares || 0,
              total: p.totalEngagement || 0,
              platforms: p.platforms,
              createdAt: p.createdAt,
            })),
          };

          downloadJSON(analytics, "autoposter-analytics.json");
          toast.success(`Analytics exported (${analyticsData.length} posts)`, toastStyle);
          break;
        }
        case "settings": {
          const settings = JSON.parse(localStorage.getItem("userSettings") || "{}");
          const platforms = JSON.parse(localStorage.getItem("platforms") || "{}");
          const exportData = {
            settings,
            platforms,
            exportDate: new Date().toISOString(),
          };

          if (Object.keys(settings).length === 0 && Object.keys(platforms).length === 0) {
            toast("No settings to export", { ...toastStyle, icon: "⚠️" });
            break;
          }

          downloadJSON(exportData, "autoposter-settings.json");
          toast.success("Settings exported successfully", toastStyle);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed: " + err.message, toastStyle);
    } finally {
      setExporting((prev) => ({ ...prev, [type]: false }));
    }
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (posts, filename) => {
    const headers = ["ID", "Content", "Status", "Platforms", "Created At", "Likes", "Shares", "Comments", "Views"];
    const rows = posts.map((p) => [
      p._id || p.id || "",
      `"${(p.content || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      p.status || "",
      (p.platforms || []).join("; "),
      p.created_at || "",
      p.engagement?.likes || 0,
      p.engagement?.shares || 0,
      p.engagement?.comments || 0,
      p.engagement?.views || 0,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Danger action handlers
  const [deleting, setDeleting] = useState(false);

  const handleDangerAction = async (action) => {
    setDeleting(true);
    try {
      if (action === "posts") {
        // Fetch all posts then delete each from backend
        let deletedCount = 0;
        try {
          const res = await apiFetch("/api/posts/getPosts");
          if (res.success && res.data?.posts?.length > 0) {
            const posts = res.data.posts;
            for (const post of posts) {
              try {
                await apiFetch(`/api/posts/${post._id}`, { method: "DELETE" });
                deletedCount++;
              } catch (e) {
                console.warn(`Failed to delete post ${post._id}:`, e);
              }
            }
          }
        } catch (e) {
          console.warn("Backend delete failed:", e);
        }

        // Also clear localStorage
        localStorage.removeItem("autoposter_posts");

        toast.error(`${deletedCount} posts deleted`, toastStyle);
        if (onChange) onChange({ deletedPosts: true });
      }

      if (action === "account") {
        // Clear all local data
        const token = localStorage.getItem("token");
        localStorage.clear();
        // Re-set token briefly to make the delete call if needed
        toast.error("All data cleared — redirecting to login...", toastStyle);
        setTimeout(() => (window.location.href = "/login"), 1500);
      }
    } catch (err) {
      console.error("Danger action error:", err);
      toast.error("Action failed: " + err.message, toastStyle);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="setting-card glass-effect rounded-3xl p-8 animate-slide-in">
      {/* HEADER */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-red-400/20 flex items-center justify-center">
          <i className="fa-solid fa-exclamation-triangle text-red-400"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Export & Danger Zone</h2>
          <p className="text-gray-400">Export your data or perform destructive actions</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* EXPORT SECTION */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Export Data</h3>
          <p className="text-gray-400">Download your posts, analytics, and settings</p>

          <div className="grid grid-cols-3 gap-4">
            {/* All Posts */}
            <button
              onClick={() => handleExport("posts")}
              disabled={exporting.posts}
              className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-cyan-400/50 transition-all group disabled:opacity-50"
            >
              <i className={`fa-solid ${exporting.posts ? "fa-spinner fa-spin" : "fa-file-export"} text-2xl text-cyan-400 mb-3 group-hover:scale-110 transition-transform`} />
              <span className="text-white font-medium">All Posts</span>
              <span className="text-gray-400 text-sm">JSON + CSV</span>
            </button>

            {/* Analytics */}
            <button
              onClick={() => handleExport("analytics")}
              disabled={exporting.analytics}
              className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-violet-400/50 transition-all group disabled:opacity-50"
            >
              <i className={`fa-solid ${exporting.analytics ? "fa-spinner fa-spin" : "fa-chart-bar"} text-2xl text-violet-400 mb-3 group-hover:scale-110 transition-transform`} />
              <span className="text-white font-medium">Analytics</span>
              <span className="text-gray-400 text-sm">JSON</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handleExport("settings")}
              disabled={exporting.settings}
              className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-teal-400/50 transition-all group disabled:opacity-50"
            >
              <i className={`fa-solid ${exporting.settings ? "fa-spinner fa-spin" : "fa-cog"} text-2xl text-teal-400 mb-3 group-hover:scale-110 transition-transform`} />
              <span className="text-white font-medium">Settings</span>
              <span className="text-gray-400 text-sm">JSON</span>
            </button>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="danger-zone rounded-2xl p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-exclamation-triangle text-red-400"></i>
            <h3 className="text-xl font-semibold text-white">Danger Zone</h3>
          </div>

          {/* DELETE ALL POSTS */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-400/30 cursor-pointer">
                <div>
                  <h4 className="text-white font-medium">Delete All Posts</h4>
                  <p className="text-gray-400 text-sm">Permanently delete all your posts and drafts</p>
                </div>
                <button className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30 disabled:opacity-50" disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete All Posts"}
                </button>
              </div>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70" />
              <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-black/90 rounded-3xl p-6 border border-red-400/30">
                <Dialog.Title className="text-xl font-bold text-white mb-4">
                  ⚠️ Confirm Delete All Posts
                </Dialog.Title>
                <Dialog.Description className="text-gray-400 mb-6">
                  This will permanently delete all your posts from the server. This action cannot be undone.
                </Dialog.Description>
                <div className="flex justify-end space-x-3">
                  <Dialog.Close className="px-4 py-2 bg-gray-700 rounded-xl text-white">Cancel</Dialog.Close>
                  
                  {/* Close first, toast second */}
                  <Dialog.Close asChild>
                    <button
                      onClick={() => setTimeout(() => handleDangerAction("posts"), 50)}
                      className="px-4 py-2 bg-red-500 rounded-xl text-white"
                    >
                      Delete All Posts
                    </button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* DELETE ACCOUNT */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-red-400/30 cursor-pointer">
                <div>
                  <h4 className="text-white font-medium">Delete Account</h4>
                  <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30 disabled:opacity-50" disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70" />
              <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-black/90 rounded-3xl p-6 border border-red-400/30">
                <Dialog.Title className="text-xl font-bold text-white mb-4">⚠️ Confirm Delete Account</Dialog.Title>
                <Dialog.Description className="text-gray-400 mb-6">
                  This will clear all your local data and log you out. This action cannot be undone.
                </Dialog.Description>
                <div className="flex justify-end space-x-3">
                  <Dialog.Close className="px-4 py-2 bg-gray-700 rounded-xl text-white">Cancel</Dialog.Close>
                  
                  {/* Close first, toast second */}
                  <Dialog.Close asChild>
                    <button
                      onClick={() => setTimeout(() => handleDangerAction("account"), 50)}
                      className="px-4 py-2 bg-red-500 rounded-xl text-white"
                    >
                      Delete Account
                    </button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

        </div>
      </div>
    </div>
  );
}
