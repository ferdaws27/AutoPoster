import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Layout() {
  const navItems = [
    ["fa-chart-line", "Dashboard", ""],
    ["fa-plus", "Create Post", "CreatePostPage"],
    ["fa-calendar", "Scheduler", "scheduling"],
    ["fa-folder", "Posts Library", "PostsLibrary"],
    ["fa-chart-line", "Analytics", "analytics"],
    ["fa-cog", "Settings", "settings"],
    ["fa-bolt", "Performance Optimizer", "PerformanceOptimizer"],
    ["fa-microphone-alt", "Voice Trainer", "voicetrainer"],
    ["fa-magic", "Hook Generator", "HookGeneratorPage "],
    ["fa-photo-video", "Media Companion", "MediaCompanion"],
    ["fa-flask", "AB Tester", "ABTesterPage"],
    ["fa-flask", "Trendradar", "Trendradar"],
    ["fa-clone", "Clone", "Clone"],
    ["fa-star", "AI Reputation", "AIReputationPage"],
    ["fa-star", "Quote Template Generator", "QuoteTemplateGenerator"],
    ["fa-users", "Audience Analyzer", "audience-analyzer"],
  ];

  const [user, setUser] = useState(null);
  const linkedinToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/oauth/linkedin/me",
          {
            headers: {
              Authorization: `Bearer ${linkedinToken}`,
            },
          }
        );

        const data = await response.json();

        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (linkedinToken) {
      fetchUser();
    }
  }, [linkedinToken]);

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="gradient-bg min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-gray-700/50 z-30 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <i className="fa-solid fa-pen-nib text-white" />
            </div>
            <span className="text-xl font-bold text-white">AutoPoster</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-2">
          {navItems.map(([icon, label, to]) => (
            <NavLink
              key={label}
              to={to}
              end={to === ""}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 p-3 rounded-2xl border transition-colors ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-bold"
                    : "text-gray-300 hover:bg-white/5 border-transparent"
                }`
              }
            >
              <i className={`fa-solid ${icon} w-5`} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* USER */}
        <div className="p-6">
          <div className="flex items-center space-x-3 p-3 rounded-2xl glass-effect">
            <img
              src={user.profile_picture || ""}
              onError={(e) => (e.target.src = "/default-avatar.png")}
              className="w-10 h-10 rounded-xl"
              alt="Profile"
            />
            <div>
              <div className="text-white font-medium text-sm">
                {user.full_name}
              </div>
              <div className="text-gray-400 text-xs">
                {user.role || "LinkedIn User"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* PASS USER */}
      <main className="ml-64 p-8 min-h-screen text-white">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}