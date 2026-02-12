import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HookGeneratePage() {
  const navigate = useNavigate();

  const [quote, setQuote] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [platforms, setPlatforms] = useState({
    Twitter: true,
    LinkedIn: true,
    Medium: true,
  });
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState([]);
  const [brandEnabled, setBrandEnabled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [visualModal, setVisualModal] = useState({ visible: false, text: "" });

  const maxLength = 500;

  const sampleVariations = [
    {
      text: "Success isn't just about reaching the destination—it's about who you become during the journey. Every challenge shapes your character. 🌟",
      tone: "motivational",
      platform: "Twitter",
      engagement: "High",
    },
    {
      text: "In my years of experience, true success is measured by the depths of character we develop along the way.",
      tone: "reflective",
      platform: "LinkedIn",
      engagement: "Medium",
    },
    {
      text: "Plot twist: The real treasure was the existential crisis we had along the way. 😅",
      tone: "witty",
      platform: "Twitter",
      engagement: "High",
    },
  ];

  const handleQuoteChange = (e) => {
    setQuote(e.target.value);
    setCharCount(e.target.value.length);
  };

  const togglePlatform = (p) => {
    setPlatforms((prev) => ({ ...prev, [p]: !prev[p] }));
  };

  const toggleBrand = () => setBrandEnabled((prev) => !prev);

  const showNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      4000
    );
  };

  const generateVariations = () => {
    if (!quote.trim()) return showNotification("Please enter a quote first", "error");
    if (quote.trim().length < 10) return showNotification("Quote too short", "warning");

    setLoading(true);
    setVariations([]);
    setTimeout(() => {
      setVariations(sampleVariations);
      setLoading(false);
    }, 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => showNotification("Copied!", "success"));
  };

  const makeVisual = (text) => setVisualModal({ visible: true, text });
  const closeVisual = () => setVisualModal({ visible: false, text: "" });

  const menuItems = [
    { name: "Dashboard", icon: "fa-chart-line", path: "/dashboard" },
    { name: "Create Post", icon: "fa-plus", path: "/create-post" },
    { name: "Hook Generator", icon: "fa-calendar-days", path: "/hook-generator" },
    { name: "Scheduler", icon: "fa-calendar-days", path: "/" },
    { name: "Posts Library", icon: "fa-folder", path: "/posts-library" },
    { name: "Analytics", icon: "fa-chart-pie", path: "/analytics" },
    { name: "Settings", icon: "fa-gear", path: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] p-6">
        <h1 className="text-2xl font-bold text-cyan-400 mb-8">AutoPoster</h1>
        <nav className="space-y-2">
          {menuItems.map((item, i) => (
            <div
              key={i}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer ${
                item.name === "Hook Generator"
                  ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                  : "text-gray-300 hover:bg-white/5 transition-colors"
              }`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-0">
        <div className="gradient-bg min-h-screen text-white">
          {/* HEADER */}
          <div className="p-8 border-b border-gray-800">
            <h1 className="text-3xl font-bold mb-2">Quote Template Generator</h1>
            <p className="text-gray-400">
              Transform any quote into multiple ready-to-share post examples
            </p>
          </div>

          {/* INPUT */}
          <div className="p-8">
            <div className="glass-effect post-card rounded-3xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Your Quote</h2>
              <textarea
                value={quote}
                onChange={handleQuoteChange}
                maxLength={maxLength}
                className="w-full h-48 bg-transparent border border-white/10 rounded-2xl p-6 resize-none"
                placeholder="Enter your quote here..."
              />
              <div className="flex justify-between mt-3 text-gray-400 text-sm">
                <span>
                  {charCount} / {maxLength} characters
                </span>
              </div>

              {/* PLATFORMS */}
              <div className="flex items-center space-x-6 mt-6">
                {["Twitter", "LinkedIn", "Medium"].map((p, i) => (
                  <label key={i} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platforms[p]}
                      onChange={() => togglePlatform(p)}
                      className="sr-only"
                    />
                    <div className="ml-3 flex items-center">
                      <i
                        className={`fa-brands fa-${
                          p === "Twitter" ? "x-twitter" : p.toLowerCase()
                        } mr-2`}
                      ></i>
                      <span>{p}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* BUTTONS */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={generateVariations}
                  className={`px-6 py-3 rounded-2xl gradient-accent flex items-center space-x-2 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Generate Variations</span>
                </button>
                <button
                  onClick={() => {
                    setQuote("");
                    setCharCount(0);
                    setVariations([]);
                  }}
                  className="px-6 py-3 rounded-2xl bg-gray-700 border border-gray-600 text-gray-300"
                >
                  <i className="fa-solid fa-trash mr-2"></i>Clear
                </button>
              </div>
            </div>
          </div>

          {/* VARIATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8 pb-8">
            {variations.map(
              (v, i) =>
                platforms[v.platform] && (
                  <div
                    key={i}
                    className="glass-effect post-card rounded-3xl p-6 border border-white/10 h-full"
                  >
                    <h3 className="text-cyan-400 text-lg font-semibold mb-3">
                      {v.platform}
                    </h3>
                    <div className="bg-white/5 rounded-2xl p-4 text-gray-300 text-sm">
                      {v.text}
                    </div>
                    <div className="mt-2 text-cyan-400 text-xs">
                      {v.engagement} engagement
                    </div>
                    <div className="flex items-center space-x-3 mt-3">
                      <button
                        className="flex-1 px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl hover:bg-cyan-400/30 transition-all text-sm"
                        onClick={() => copyToClipboard(v.text)}
                      >
                        Copy
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-violet-400/20 text-violet-400 rounded-xl hover:bg-violet-400/30 transition-all text-sm"
                        onClick={() => makeVisual(v.text)}
                      >
                        Visual
                      </button>
                    </div>
                  </div>
                )
            )}
          </div>

          {/* BRAND */}
          <div className="max-w-4xl mx-auto mb-12">
            <div
              className={`p-6 rounded-2xl cursor-pointer border border-white/10 flex justify-between items-center ${
                brandEnabled ? "bg-cyan-400/10" : "bg-gray-700/40"
              }`}
              onClick={toggleBrand}
            >
              <div className="flex items-center space-x-4">
                <i className="fa-solid fa-signature text-cyan-400"></i>
                <span className="font-medium">Auto-include brand signature</span>
              </div>
              <span>{brandEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          {notifications.map((n) => (
            <div
              key={n.id}
              className="fixed top-8 right-8 p-4 bg-cyan-400/20 text-cyan-400 rounded-2xl z-50"
            >
              {n.message}
            </div>
          ))}

          {/* MODAL */}
          {visualModal.visible && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
              <div className="glass-effect rounded-3xl p-8 w-full max-w-md border border-white/10">
                <h2 className="text-2xl font-bold mb-6">Create Visual</h2>
                <p className="text-gray-300 mb-4">{visualModal.text}</p>
                <button
                  className="w-full p-3 rounded-2xl border border-gray-600 text-gray-300"
                  onClick={closeVisual}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
