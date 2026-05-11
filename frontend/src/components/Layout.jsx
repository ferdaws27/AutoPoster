import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useSettings from "../hooks/useSettings";
import useTranslation from "../i18n/useTranslation";

export default function Layout() {
  const t = useTranslation();
  const { language } = useSettings();

  const navSections = [
    {
      label: t("nav.main"),
      items: [
        ["fa-chart-line", t("nav.dashboard"), ""],
        ["fa-plus", t("nav.createPost"), "CreatePostPage"],
        ["fa-calendar", t("nav.scheduler"), "scheduling"],
        ["fa-folder", t("nav.postsLibrary"), "PostsLibrary"],
      ],
    },
    {
      label: t("nav.aiTools"),
      items: [
        ["fa-magic", t("nav.hookGenerator"), "HookGeneratorPage "],
        ["fa-quote-left", t("nav.quoteTemplate"), "QuoteTemplateGenerator"],
        ["fa-microphone-alt", t("nav.voiceTrainer"), "voicetrainer"],
        ["fa-brain", t("nav.clone"), "Clone"],
        ["fa-photo-video", t("nav.mediaCompanion"), "MediaCompanion"],
        ["fa-flask", t("nav.abTester"), "ABTesterPage"],
        ["fa-satellite-dish", t("nav.trendradar"), "Trendradar"],
      ],
    },
    {
      label: t("nav.analytics"),
      items: [
        ["fa-chart-line", t("nav.analytics"), "analytics"],
        ["fa-bolt", t("nav.performanceOptimizer"), "PerformanceOptimizer"],
        ["fa-users", t("nav.audienceAnalyzer"), "audience-analyzer"],
       
        ["fa-star", t("nav.aiReputation"), "AIReputationPage"],
        
      ],
    },
    {
      label: t("nav.system"),
      items: [
        ["fa-cog", t("nav.settings"), "settings"],
      ],
    },
  ];

  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    if (!token) return;

    // Try cached user first
    const cached = localStorage.getItem("user");
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch {}
    }

    const fetchUser = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        // Try generic /api/auth/me first
        let res = await fetch(`${API}/api/auth/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          const u = data.user || data;
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          return;
        }
        // Fallback to LinkedIn /me
        res = await fetch(`${API}/api/oauth/linkedin/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
          return;
        }
      } catch (e) {
        console.warn("User fetch error:", e);
      }
      // Fallback: use cached or guest defaults
      if (!cached) {
        const guest = { full_name: "Guest User", email: "guest@autoposter.tn", role: "FREE", profile_picture: "" };
        setUser(guest);
        localStorage.setItem("user", JSON.stringify(guest));
      }
    };

    fetchUser();
  }, [token]);

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="gradient-bg min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-gray-700/50 z-30 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <i className="fa-solid fa-pen-nib text-white" />
            </div>
            <span className="text-xl font-bold text-white">AutoPoster</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">{section.label}</div>
              <div className="space-y-1">
                {section.items.map(([icon, label, to]) => (
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
              </div>
            </div>
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
                {user.full_name || user.name || user.first_name || user.username || "User"}
              </div>
              <div className="text-gray-400 text-xs">
                {user.role || "FREE"}
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