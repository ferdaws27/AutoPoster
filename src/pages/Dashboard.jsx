import { useState } from "react";

/* ================= COLORS ================= */
const COLORS = {
  cyan: { bg: "bg-cyan-400/20", text: "text-cyan-400" },
  violet: { bg: "bg-violet-400/20", text: "text-violet-400" },
  green: { bg: "bg-green-400/20", text: "text-green-400" },
};

/* ================= DASHBOARD ================= */
export default function Dashboard() {
  const [posts, setPosts] = useState([]);
const [content, setContent] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [platforms, setPlatforms] = useState({
    twitter: true,
    linkedin: true,
    medium: false,
  });

  const [aiOptions, setAiOptions] = useState({
    optimize: true,
    images: true,
  });
   /* ========= QUICK ACTIONS LOGIC ========= */
  const handleImport = () => {
    document.getElementById("import-file").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("Imported:", file.name);
  };

  const handleExport = () => {
    const data = { posts: "example data" };
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

  const handleAIOptimize = () => {
    console.log("AI Optimize triggered");
  };

  return (
    <div className="gradient-bg min-h-screen text-white">

      {/* ================= SIDEBAR =================
      <aside className="fixed left-0 top-0 h-full w-72 sidebar-glass z-40 p-6">
        <Brand />
        <nav className="space-y-2">
          <NavItem icon="fa-chart-line" label="Dashboard" active />
          <NavItem icon="fa-plus" label="Create" />
          <NavItem icon="fa-folder" label="Library" />
          <NavItem icon="fa-calendar" label="Schedule" />
          <NavItem icon="fa-chart-bar" label="Analytics" />
          <NavItem icon="fa-cog" label="Settings" />
        </nav>
      </aside> */}

      {/* ================= MAIN ================= */}
      <main className="ml-72 p-8">

        {/* HEADER */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Good morning, Dr. Khalil</h2>
            <p className="text-gray-400">Let's create something amazing today</p>
          </div>
          <div className="flex items-center space-x-4">
            <Status />
            <IconButton icon="fa-bell" />
          </div>
        </header>

        {/* QUICK STATS */}
        <section className="grid grid-cols-3 gap-6 mb-8">
          <StatCard icon="fa-file-lines" color="cyan" value="24" label="Total Posts" />
          <StatCard icon="fa-heart" color="violet" value="8.4%" label="Engagement" />
          <StatCard icon="fa-clock" color="green" value="2:30 PM" label="Next Post" />
        </section>

        {/* CONTENT GRID */}
        <section className="grid grid-cols-2 gap-8">
          <UpcomingPosts posts={posts} />
          <Card title="AI Ideas">
            <p className="text-gray-400">AI-generated ideas will appear here.</p>
          </Card>
        </section>
         {/* ================= RECENT ACTIVITY ================= */}
<section className="mt-8">
  <RecentActivity />
</section>
  
        {/* ================= QUICK ACTIONS BAR ================= */}
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
    </div>
  </div>
</div>

      </main>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl gradient-accent pulse-glow z-50"
      >
        <i className="fa-solid fa-plus text-xl"></i>
      </button>

      {/* ================= CREATE POST MODAL ================= */}
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
              <Platform label="Twitter/X" icon="fa-x-twitter"
                checked={platforms.twitter}
                onClick={() => setPlatforms({ ...platforms, twitter: !platforms.twitter })}
              />
              <Platform label="LinkedIn" icon="fa-linkedin-in" blue
                checked={platforms.linkedin}
                onClick={() => setPlatforms({ ...platforms, linkedin: !platforms.linkedin })}
              />
              <Platform label="Medium" icon="fa-medium"
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

            {/* AI OPTIONS (IDENTIQUE HTML) */}
            <AIOptions aiOptions={aiOptions} setAiOptions={setAiOptions} />

            <div className="flex gap-4 mt-6">
              <button
  className="flex-1 p-4 rounded-2xl border border-gray-600"
  onClick={() => {
    if (!content.trim()) return;

    setPosts(prev => [
      {
        id: Date.now(),
        time: "Draft",
        title: content.slice(0, 50),
        desc: "Saved as draft",
        status: "Draft",
        statusColor: "cyan",
        platforms: Object.keys(platforms).filter(p => platforms[p]),
      },
      ...prev,
    ]);

    setContent("");
    setShowCreateModal(false);
  }}
>
  Save Draft
</button>

              <button
  className="flex-1 p-4 rounded-2xl gradient-accent"
  onClick={() => {
    if (!content.trim()) return;

    setPosts(prev => [
      {
        id: Date.now(),
        time: "Scheduled",
        title: content.slice(0, 50),
        desc: "Post scheduled",
        status: "Scheduled",
        statusColor: "green",
        platforms: Object.keys(platforms).filter(p => platforms[p]),
      },
      ...prev,
    ]);

    setContent("");
    setShowCreateModal(false);
  }}
>
  Generate & Preview
</button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= UPCOMING POSTS COMPONENT ================= */

const UpcomingPosts = ({ posts }) => (
  <Card title="Upcoming Posts">
    <div className="space-y-4">

      
  {posts.length === 0 && (
    <p className="text-gray-400">No upcoming posts yet</p>
  )}

  {posts.map(post => (
    <PostItem key={post.id} {...post} />
  ))}
</div>


  </Card>
);

const PostItem = ({ time, title, desc, status, statusColor, platforms }) => {
  const c = COLORS[statusColor];

  return (
    <div className="flex items-center p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-700/30 transition-colors">
      
      <span className={`px-3 py-1 rounded-full ${c.bg} ${c.text} text-xs`}>
        {status}
      </span>
    </div>
  );
};

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
const RecentActivity = () => (
  <div className="glass-effect rounded-3xl p-6 glow-card">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-white">Recent Activity</h2>

      <div className="flex items-center space-x-4">
        <select className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-400">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>

        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
          View all
        </button>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-6">

      {/* Posts Published */}
      <ActivityItem
        icon="fa-paper-plane"
        value="12"
        label="Posts Published"
        color="green"
      />

      {/* Total Views */}
      <ActivityItem
        icon="fa-eye"
        value="2.4K"
        label="Total Views"
        color="cyan"
      />

      {/* Engagements */}
      <ActivityItem
        icon="fa-heart"
        value="186"
        label="Engagements"
        color="violet"
      />

      {/* Avg Rating */}
      <ActivityItem
        icon="fa-star"
        value="4.2"
        label="Avg Rating"
        color="yellow"
      />

    </div>
  </div>
);
const ActivityItem = ({ icon, value, label, color }) => (
  <div className="text-center p-4 rounded-2xl bg-gray-800/30">
    <div className={`w-12 h-12 rounded-2xl bg-${color}-400/20 flex items-center justify-center mx-auto mb-3`}>
      <i className={`fa-solid ${icon} text-${color}-400`}></i>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
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
