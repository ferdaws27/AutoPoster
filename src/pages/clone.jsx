import { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function VoiceCloner() {
  const [activeTab, setActiveTab] = useState("my");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [applyModal, setApplyModal] = useState(false);

  const [profile, setProfile] = useState({
    name: "Justin Welsh",
    handle: "@JustinWelsh",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
  });

  const handleAnalyze = () => {
    if (!url.trim()) return;

    setLoading(true);
    setShowResults(false);

    setTimeout(() => {
      if (url.toLowerCase().includes("naval")) {
        setProfile({
          name: "Naval Ravikant",
          handle: "@naval",
          avatar:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
        });
      } else {
        setProfile({
          name: "Justin Welsh",
          handle: "@JustinWelsh",
          avatar:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
        });
      }

      setLoading(false);
      setShowResults(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen gradient-bg text-white flex">
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-user-robot text-3xl"></i>
            </div>
            <h1 className="text-4xl font-bold mb-3">
              Train or Clone Writing Voices
            </h1>
            <p className="text-gray-400 text-lg">
              Teach AutoPoster how you or others write
            </p>
          </div>

          {/* TABS */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-black/20 p-2 rounded-3xl border border-gray-700/30">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-8 py-3 rounded-2xl font-semibold transition-all ${
                  activeTab === "my" ? "tab-active" : "tab-inactive"
                }`}
              >
                <i className="fa-solid fa-user mr-2"></i>
                My Voice
              </button>

              <button
                onClick={() => setActiveTab("clone")}
                className={`px-8 py-3 rounded-2xl font-semibold transition-all ${
                  activeTab === "clone" ? "tab-active" : "tab-inactive"
                }`}
              >
                <i className="fa-solid fa-copy mr-2"></i>
                Clone Profile
              </button>
            </div>
          </div>

          {/* MY VOICE */}
          {activeTab === "my" && (
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* LEFT CARD */}
              <div className="neo-card rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <i className="fa-solid fa-fingerprint text-cyan-400 mr-3"></i>
                  Your Current Voice
                </h2>

                <div className="space-y-4 mb-8">
                  <Row label="Tone" value={<span className="tone-badge px-3 py-1 rounded-xl font-medium">Insightful & Professional</span>} />
                  <Row label="Structure" value="Hook → Insight → CTA" />
                  <Row label="Sentence Style" value="Medium & Clear" />
                  <Row label="Emoji Usage" value="Minimal" />
                  <Row label="Last Updated" value={<span className="text-gray-400">3 days ago</span>} />
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 p-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all">
                    <i className="fa-solid fa-upload mr-2"></i>
                    Retrain Voice
                  </button>

                  <button className="flex-1 p-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity">
                    <i className="fa-solid fa-edit mr-2"></i>
                    Edit Settings
                  </button>
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="neo-card rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <i className="fa-solid fa-chart-simple text-violet-400 mr-3"></i>
                  Training Data
                </h2>

                <div className="space-y-6">
                  <Stat icon="fa-file-lines" color="text-cyan-400" label="Posts Analyzed" value="247" />
                  <Stat icon="fa-clock" color="text-violet-400" label="Training Time" value="12m 34s" />
                  <Stat icon="fa-percentage" color="text-teal-400" label="Accuracy Score" value={<span className="text-green-400">94.2%</span>} />

                  <div className="mt-6 p-4 bg-black/20 rounded-2xl border border-gray-700/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fa-solid fa-lightbulb text-yellow-400"></i>
                      <span className="text-white font-semibold">Recommendation</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Add 20+ more recent posts to improve accuracy to 98%+
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLONE PROFILE */}
          {activeTab === "clone" && (
            <>
              <div className="neo-card rounded-3xl p-8 mb-8 slide-up">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Analyze Any Creator's Voice
                  </h2>
                  <p className="text-gray-400">
                    Paste a LinkedIn, Medium, or X profile URL to clone their writing style
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="relative mb-6">
                    <input
                      type="text"
                      placeholder="Paste a LinkedIn, Medium, or X profile URL or handle..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full p-4 bg-black/30 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <i className="fa-solid fa-link text-gray-400"></i>
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full p-4 gradient-accent rounded-2xl text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <i className="fa-solid fa-brain mr-2"></i>
                    Analyze Voice 🧠
                  </button>
                </div>
              </div>

              {loading && (
                <div className="neo-card rounded-3xl p-8 mb-8 analyzing-animation">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Analyzing Writing Patterns
                    </h3>
                    <p className="text-gray-300">Please wait while we analyze the profile...</p>
                  </div>
                </div>
              )}

              {showResults && (
                <div className="neo-card rounded-3xl p-8 mb-8 fade-in">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    ✓ Analysis Complete
                  </h2>

                  <div className="flex justify-center space-x-4 mt-8">
                    <button className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all">
                      Analyze Another
                    </button>

                    <button
                      onClick={() => setSaveModal(true)}
                      className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all"
                    >
                      Save as Preset 💾
                    </button>

                    <button
                      onClick={() => setApplyModal(true)}
                      className="px-8 py-3 gradient-accent rounded-2xl text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      Use This Voice ✍️
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= SAVED VOICES ================= */}
          <div className="neo-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fa-solid fa-bookmark text-yellow-400 mr-3"></i>
                Saved Voice Presets
              </h2>
              <button className="px-4 py-2 gradient-accent rounded-2xl text-white text-sm font-medium hover:opacity-90 transition-opacity">
                <i className="fa-solid fa-plus mr-2"></i>
                Import Voice
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* My Voice */}
              <VoiceCard
                icon={<i className="fa-solid fa-user text-cyan-400"></i>}
                bg="bg-cyan-400/20"
                title="My Voice"
                subtitle="Personal"
                description="Insightful & Professional tone with clear structure"
                status={<span className="text-xs text-green-400 font-medium">● Active</span>}
                actions={["edit","copy"]}
              />

              {/* Justin Welsh */}
              <VoiceCard
                image="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"
                title="Justin Welsh"
                subtitle="Cloned"
                description="Confident thought-leader with story-driven content"
                status={<span className="text-xs text-gray-400">Saved 2 days ago</span>}
                actions={["copy","edit","trash"]}
              />

              {/* Naval */}
              <VoiceCard
                image="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                title="Naval"
                subtitle="Cloned"
                description="Philosophical wisdom with concise clarity"
                status={<span className="text-xs text-gray-400">Saved 1 week ago</span>}
                actions={["copy","edit","trash"]}
              />

              {/* AI Coach */}
              <VoiceCard
                icon={<i className="fa-solid fa-robot text-violet-400"></i>}
                bg="bg-violet-400/20"
                title="AI Coach"
                subtitle="Template"
                description="Supportive mentor with actionable advice"
                status={<span className="text-xs text-gray-400">Built-in template</span>}
                actions={["copy","edit"]}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODALS ================= */}
      {saveModal && <Modal onClose={() => setSaveModal(false)}>Voice Saved Successfully!</Modal>}
      {applyModal && (
        <Modal
          onClose={() => setApplyModal(false)}
          confirmAction={() => {
            setApplyModal(false);
            alert("Voice applied successfully!");
          }}
          confirmText="Apply Voice"
        >
          Apply Voice Style?
        </Modal>
      )}
    </div>
  );
}

/* ================= Reusable Components ================= */
function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-300">{label}</span>
      <span className="text-gray-100">{value}</span>
    </div>
  );
}

function Stat({ icon, color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <i className={`fa-solid ${icon} ${color}`}></i>
        <span className="text-gray-300">{label}</span>
      </div>
      <span className="text-white font-bold text-xl">{value}</span>
    </div>
  );
}

function Modal({ children, onClose, confirmAction, confirmText }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="glass-effect glow-border p-8 rounded-2xl text-center w-96">
        <h3 className="text-xl font-bold mb-6">{children}</h3>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black/40 rounded-xl border border-white/10"
          >
            Close
          </button>

          {confirmAction && (
            <button
              onClick={confirmAction}
              className="px-5 py-2 gradient-accent rounded-xl"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= Voice Card ================= */
function VoiceCard({ icon, bg, image, title, subtitle, description, status, actions }) {
  return (
    <div className="voice-card neo-card rounded-2xl p-6 cursor-pointer">
      <div className="flex items-center space-x-3 mb-4">
        {icon ? (
          <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
            {icon}
          </div>
        ) : (
          <img src={image} alt={title} className="w-12 h-12 rounded-2xl" />
        )}
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-4">{description}</p>
      <div className="flex justify-between items-center">
        {status}
        <div className="flex space-x-2">
          {actions.includes("edit") && (
            <button className="w-8 h-8 bg-black/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <i className="fa-solid fa-edit text-xs"></i>
            </button>
          )}
          {actions.includes("copy") && (
            <button className="w-8 h-8 bg-black/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <i className="fa-solid fa-copy text-xs"></i>
            </button>
          )}
          {actions.includes("trash") && (
            <button className="w-8 h-8 bg-black/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
              <i className="fa-solid fa-trash text-xs"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
