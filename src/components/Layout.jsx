import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  const navItems = [
    ["fa-chart-line", "Dashboard", "/"],
    ["fa-plus", "Create Post", "/create-post"], // Create Post
    ["fa-calendar", "Scheduler", "/Scheduling"], // Scheduler
    ["fa-folder", "Posts Library", "/posts-library"], // Posts Library
    ["fa-chart-line", "Analytics", "/Analytics"], // Analytics
    ["fa-cog", "Settings", "/settings"], // Settings
    ["fa-bolt", "Performance Optimizer", "/PerformanceOptimizer"], // Performance Optimizer
    ["fa-microphone-alt", "Voice Trainer", "/voicetrainer"], // Voice Trainer
    ["fa-magic", "Hook Generator", "/HookGeneratePage"], // Hook Generator
    ["fa-photo-video", "Media Companion", "/MediaCompanionPage"], // Media Companion
    ["fa-flask", "AB Tester", "/ABTesterPage"], // AB Tester
    ["fa-clone", "Clone", "/clone"], // Clone
    ["fa-star", "AIReputationPage", "/AIReputationPage"], // Clone



  ];

  return (
    <div className="gradient-bg min-h-screen">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-gray-700/50 z-30 flex flex-col">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center">
              <i className="fa-solid fa-pen-nib text-white" />
            </div>
            <span className="text-xl font-bold text-white">AutoPoster</span>
          </div>
        </div>

        {/* Navigation (scrollable) */}
        <nav className="flex-1 overflow-y-auto px-6 space-y-2">
          {navItems.map(([icon, label, path]) => (
            <NavLink
              key={label}
              to={path}
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

        {/* USER PROFILE (fixe en bas) */}
        <div className="p-6">
          <div className="flex items-center space-x-3 p-3 rounded-2xl glass-effect">
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
              className="w-10 h-10 rounded-xl"
              alt="Profile"
            />
            <div>
              <div className="text-white font-medium text-sm">Dr. Khalil</div>
              <div className="text-gray-400 text-xs">Pro Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 p-8 min-h-screen text-white">
        <Outlet />
      </main>
    </div>
  );
}

