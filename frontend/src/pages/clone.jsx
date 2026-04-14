import { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { apiFetch } from "../services/api";
import useSettings from "../hooks/useSettings";
import MainTrainingInterface from "../components/MainTrainingInterface";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=0891b2&color=fff&size=128&bold=true&format=png`;
}

function ProfileImg({ src, name, className }) {
  const fallback = avatarUrl(name);
  return (
    <img
      src={src || fallback}
      alt={name || "Profile"}
      className={className}
      onError={(e) => { e.target.onerror = null; e.target.src = fallback; }}
    />
  );
}

export default function VoiceCloner() {
  const { raw: settingsRaw, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("my");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [postsScraped, setPostsScraped] = useState(0);
  const [postStats, setPostStats] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

  // Presets
  const [presets, setPresets] = useState([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);

  const [expandedPreset, setExpandedPreset] = useState(null);

  const getUserId = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u._id || u.id || "guest";
    } catch { return "guest"; }
  };

  // Load presets
  useEffect(() => { loadPresets(); }, []);

  const loadPresets = async () => {
    try {
      setPresetsLoading(true);
      const data = await apiFetch(`/api/clone/presets?user_id=${getUserId()}`);
      if (data.success) {
        const loaded = data.presets || [];
        setPresets(loaded);
        // Sync: if there's an active preset in DB but not in localStorage, populate it
        const active = loaded.find(p => p.active);
        if (active && !settingsRaw.voiceProfile) {
          saveVoiceToSettings(active);
        }
      }
    } catch (e) {
      console.error("Failed to load presets:", e);
    } finally {
      setPresetsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setShowResults(false);
    setError("");
    setProfile(null);
    setAnalysis(null);
    setPostsScraped(0);
    setPostStats(null);
    setAnalysisId(null);

    try {
      const data = await apiFetch("/api/clone/analyze", {
        method: "POST",
        body: JSON.stringify({ url: url.trim(), user_id: getUserId() }),
      });
      if (data.success) {
        setProfile(data.profile);
        setAnalysis(data.analysis);
        setPostsScraped(data.postsScraped || 0);
        setPostStats(data.postStats || null);
        setAnalysisId(data.analysisId || null);
        setShowResults(true);
        setUrl("");
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (e) {
      setError(e.message || "Failed to analyze profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!saveName.trim() || !analysis) return;
    setSaving(true);
    try {
      const data = await apiFetch("/api/clone/presets", {
        method: "POST",
        body: JSON.stringify({ user_id: getUserId(), name: saveName.trim(), profile, analysis, postStats, url, type: "cloned" }),
      });
      if (data.success) { setSaveModal(false); setSaveName(""); setShowResults(false); setProfile(null); setAnalysis(null); setPostStats(null); setPostsScraped(0); setAnalysisId(null); loadPresets(); }
    } catch (e) { console.error("Save failed:", e); }
    finally { setSaving(false); }
  };

  const saveVoiceToSettings = (preset) => {
    const a = preset.analysis || {};
    const voiceProfile = {
      name: preset.name || preset.profile?.name || "Cloned Voice",
      platform: preset.profile?.platform || "Unknown",
      tone: a.tone || "Neutral",
      structure: a.structure || "",
      sentenceStyle: a.sentenceStyle || "Medium & Clear",
      emojiUsage: a.emojiUsage || "Minimal",
      hashtagUsage: a.hashtagUsage || "Minimal",
      vocabularyLevel: a.vocabularyLevel || "Intermediate",
      hookStyle: a.hookStyle || "",
      ctaStyle: a.ctaStyle || "",
      contentThemes: a.contentThemes || [],
      writingPatterns: a.writingPatterns || [],
      uniqueTraits: a.uniqueTraits || [],
      engagementTactics: a.engagementTactics || [],
      confidenceScore: a.confidenceScore || 0,
      samplePost: a.samplePost || "",
      sampleHook: a.sampleHook || "",
    };
    updateSettings({ ...settingsRaw, voiceProfile });
  };

  const clearVoiceFromSettings = () => {
    const { voiceProfile, ...rest } = settingsRaw;
    updateSettings(rest);
  };

  const handleDeletePreset = async (id) => {
    const preset = presets.find(p => p._id === id);
    try {
      await apiFetch(`/api/clone/presets/${id}`, { method: "DELETE" });
      if (preset?.active) clearVoiceFromSettings();
      loadPresets();
    } catch (e) { console.error("Delete failed:", e); }
  };

  const handleActivatePreset = async (id) => {
    try {
      await apiFetch(`/api/clone/presets/${id}/activate`, { method: "POST", body: JSON.stringify({ user_id: getUserId() }) });
      const preset = presets.find(p => p._id === id);
      if (preset) saveVoiceToSettings(preset);
      loadPresets();
    } catch (e) { console.error("Activate failed:", e); }
  };

  const handleApplyVoice = async () => {
    try {
      const data = await apiFetch("/api/clone/presets", {
        method: "POST",
        body: JSON.stringify({ user_id: getUserId(), name: profile?.name || "Cloned Voice", profile, analysis, postStats, url, type: "cloned" }),
      });
      if (data.success && data.preset_id) {
        await apiFetch(`/api/clone/presets/${data.preset_id}/activate`, { method: "POST", body: JSON.stringify({ user_id: getUserId() }) });
        saveVoiceToSettings({ name: profile?.name || "Cloned Voice", profile, analysis });
        setApplyModal(false);
        loadPresets();
      }
    } catch (e) { console.error("Apply failed:", e); }
  };

  const activePreset = presets.find((p) => p.active);
  const activeAnalysis = activePreset?.analysis;

  return (
    <div className="min-h-screen gradient-bg text-white flex">
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-brain text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Train or Clone Writing Voices</h1>
            <p className="text-xl text-gray-300 mb-2">Teach AutoPoster how you or others write — for more natural, authentic AI posts</p>
            <p className="text-gray-400">Clone successful creators' tones or perfect your own voice with AI analysis</p>
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

              <button
                onClick={() => setActiveTab("train")}
                className={`px-8 py-3 rounded-2xl font-semibold transition-all ${
                  activeTab === "train" ? "tab-active" : "tab-inactive"
                }`}
              >
                <i className="fa-solid fa-file-lines mr-2"></i>
                Train from Files
              </button>
            </div>
          </div>

          {/* MY VOICE */}
          {activeTab === "my" && (
            <div className="mb-12">
              {activePreset ? (
                <>
                  {/* Identity Banner */}
                  <div className="neo-card rounded-3xl p-8 mb-6 border border-cyan-400/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <ProfileImg src={activePreset.profile?.imageUrl} name={activePreset.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400/30" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <i className="fa-solid fa-check text-[8px] text-white"></i>
                          </div>
                        </div>
                        <div>
                          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
                            <i className="fa-solid fa-fingerprint mr-1"></i> My Active Voice
                          </p>
                          <h2 className="text-2xl font-bold text-white">{activePreset.name}</h2>
                          <p className="text-gray-400 text-sm mt-1">
                            {activePreset.profile?.platform || "Unknown"} · {activePreset.type === "personal" ? "Personal" : "Cloned"}
                            {activePreset.created_at && <span className="ml-2 text-gray-500">· {timeAgo(activePreset.created_at)}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-400/10 text-green-400 text-xs font-medium rounded-xl">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Active
                        </span>
                        <button onClick={() => setActiveTab("clone")} className="px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all text-sm">
                          <i className="fa-solid fa-rotate-right mr-1.5"></i>Change Voice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="neo-card rounded-2xl p-4 text-center">
                      <i className="fa-solid fa-microphone text-cyan-400 text-lg mb-2"></i>
                      <p className="text-white font-semibold text-sm">{activeAnalysis?.tone || "—"}</p>
                      <p className="text-gray-500 text-xs mt-1">Tone</p>
                    </div>
                    <div className="neo-card rounded-2xl p-4 text-center">
                      <i className="fa-solid fa-align-left text-violet-400 text-lg mb-2"></i>
                      <p className="text-white font-semibold text-sm">{activeAnalysis?.sentenceStyle || "—"}</p>
                      <p className="text-gray-500 text-xs mt-1">Sentence Style</p>
                    </div>
                    <div className="neo-card rounded-2xl p-4 text-center">
                      <i className="fa-solid fa-face-smile text-yellow-400 text-lg mb-2"></i>
                      <p className="text-white font-semibold text-sm">{activeAnalysis?.emojiUsage || "—"}</p>
                      <p className="text-gray-500 text-xs mt-1">Emoji Usage</p>
                    </div>
                    <div className="neo-card rounded-2xl p-4 text-center">
                      <i className="fa-solid fa-signal text-green-400 text-lg mb-2"></i>
                      <p className="text-green-400 font-bold text-lg">{activeAnalysis?.confidenceScore || 0}%</p>
                      <p className="text-gray-500 text-xs mt-1">Confidence</p>
                    </div>
                  </div>

                  {/* Two-column details */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left: Voice Profile */}
                    <div className="neo-card rounded-3xl p-6">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                        <i className="fa-solid fa-fingerprint text-cyan-400 mr-2"></i> Voice Profile
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-300 text-sm">Structure</span>
                          <div className="mt-1.5"><StructureFlow text={activeAnalysis?.structure} /></div>
                        </div>
                        <Row label="Vocabulary" value={<span className="text-gray-100 text-sm">{activeAnalysis?.vocabularyLevel || "—"}</span>} />
                        <Row label="Hashtags" value={<span className="text-gray-100 text-sm">{activeAnalysis?.hashtagUsage || "—"}</span>} />
                      </div>
                      {(activeAnalysis?.contentThemes || []).length > 0 && (
                        <div className="mt-5 pt-4 border-t border-gray-700/20">
                          <span className="text-gray-400 text-xs uppercase tracking-wider">Content Themes</span>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {activeAnalysis.contentThemes.map((t, i) => <span key={i} className="px-2.5 py-1 bg-cyan-400/10 text-cyan-400 text-xs rounded-lg">{t}</span>)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Style & Patterns */}
                    <div className="neo-card rounded-3xl p-6">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                        <i className="fa-solid fa-pen-nib text-violet-400 mr-2"></i> Style & Patterns
                      </h3>
                      <div className="space-y-4">
                        {activeAnalysis?.hookStyle && (
                          <div className="p-3 bg-black/20 rounded-xl">
                            <span className="text-gray-400 text-xs uppercase tracking-wider">Hook Style</span>
                            <p className="text-gray-200 text-sm mt-1 leading-relaxed">{activeAnalysis.hookStyle}</p>
                          </div>
                        )}
                        {activeAnalysis?.ctaStyle && (
                          <div className="p-3 bg-black/20 rounded-xl">
                            <span className="text-gray-400 text-xs uppercase tracking-wider">CTA Style</span>
                            <p className="text-gray-200 text-sm mt-1 leading-relaxed">{activeAnalysis.ctaStyle}</p>
                          </div>
                        )}
                        {(activeAnalysis?.uniqueTraits || []).length > 0 && (
                          <div>
                            <span className="text-gray-400 text-xs uppercase tracking-wider">Unique Traits</span>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {activeAnalysis.uniqueTraits.map((t, i) => <span key={i} className="px-2.5 py-1 bg-violet-400/10 text-violet-300 text-xs rounded-lg">{t}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sample Post (full width) */}
                  {activeAnalysis?.samplePost && (
                    <div className="neo-card rounded-3xl p-6 mt-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <i className="fa-solid fa-quote-left text-cyan-400 text-sm"></i>
                        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Sample Post in This Voice</span>
                      </div>
                      <p className="text-gray-300 text-sm italic leading-relaxed pl-1">"{activeAnalysis.samplePost}"</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="neo-card rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gray-800/50 flex items-center justify-center">
                    <i className="fa-solid fa-microphone-slash text-4xl text-gray-600"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">No Active Voice</h2>
                  <p className="text-gray-400 mb-6 max-w-sm mx-auto">Clone a creator's writing style or train your own voice to get started</p>
                  <button onClick={() => setActiveTab("clone")} className="px-8 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity">
                    <i className="fa-solid fa-copy mr-2"></i>Clone a Voice
                  </button>
                </div>
              )}
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
                    Analyze Voice
                  </button>
                </div>
              </div>

              {loading && (
                <div className="neo-card rounded-3xl p-8 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                    <h3 className="text-xl font-bold text-white mb-2">Scraping & Analyzing Posts</h3>
                    <p className="text-gray-300">This may take a minute — we're fetching real posts via Apify...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="neo-card rounded-3xl p-6 mb-8 border border-red-400/30">
                  <div className="flex items-center space-x-3">
                    <i className="fa-solid fa-circle-exclamation text-red-400 text-xl"></i>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {showResults && analysis && (
                <div className="neo-card rounded-3xl p-8 mb-8 fade-in">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700/30">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-green-400"></i>
                        Analysis Complete
                      </h2>
                      {postsScraped > 0 && <p className="text-cyan-400 text-sm mt-1"><i className="fa-solid fa-database mr-1"></i>{postsScraped} real posts scraped & analyzed</p>}
                    </div>
                    {profile && (
                      <div className="flex items-center space-x-3 bg-black/20 px-4 py-3 rounded-2xl">
                        <ProfileImg src={profile.imageUrl} name={profile.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-white font-semibold">{profile.name}</div>
                          <div className="text-gray-400 text-sm">{profile.handle} · {profile.platform}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3-column grid */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Column 1: Voice Profile */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <i className="fa-solid fa-fingerprint text-cyan-400 mr-2"></i>
                        Voice Profile
                      </h3>
                      <div className="space-y-3">
                        <Row label="Tone" value={<span className="tone-badge px-3 py-1 rounded-xl text-sm font-medium">{analysis.tone}</span>} />
                        <div>
                          <span className="text-gray-300 text-sm">Structure</span>
                          <div className="mt-1.5"><StructureFlow text={analysis.structure} /></div>
                        </div>
                        <Row label="Sentence Style" value={<span className="text-gray-100 text-sm">{analysis.sentenceStyle}</span>} />
                        <Row label="Vocabulary" value={<span className="text-gray-100 text-sm">{analysis.vocabularyLevel}</span>} />
                        <Row label="Emoji" value={<span className="text-gray-100 text-sm">{analysis.emojiUsage}</span>} />
                        <Row label="Hashtags" value={<span className="text-gray-100 text-sm">{analysis.hashtagUsage}</span>} />
                      </div>
                    </div>

                    {/* Column 2: Style Details */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <i className="fa-solid fa-pen-nib text-violet-400 mr-2"></i>
                        Style Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-400 text-xs uppercase tracking-wider">Hook Style</span>
                          <p className="text-gray-200 mt-1 text-sm leading-relaxed">{analysis.hookStyle}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs uppercase tracking-wider">CTA Style</span>
                          <p className="text-gray-200 mt-1 text-sm leading-relaxed">{analysis.ctaStyle}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs uppercase tracking-wider">Content Themes</span>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(analysis.contentThemes || []).map((t, i) => <span key={i} className="px-2.5 py-1 bg-cyan-400/10 text-cyan-400 text-xs rounded-lg">{t}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Writing Metrics */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <i className="fa-solid fa-chart-line text-cyan-400 mr-2"></i>
                        Writing Metrics
                      </h3>
                      <div className="space-y-3">
                        <Row label="Avg. Post Length" value={<span className="text-white font-semibold text-sm">{postStats?.avgWordCount ? `${postStats.avgWordCount} words` : (analysis.avgPostLength || "—")}</span>} />
                        <Row label="Reading Level" value={<span className="text-white font-semibold text-sm">{postStats?.readingGrade ? `Grade ${postStats.readingGrade}` : (analysis.readingLevel || "—")}</span>} />
                        <Row label="Posts Analyzed" value={<span className="text-white font-semibold text-sm">{postStats?.postCount || postsScraped || "—"}</span>} />
                        {postStats?.shortestPost != null && (
                          <Row label="Range" value={<span className="text-white font-semibold text-sm">{postStats.shortestPost}–{postStats.longestPost} words</span>} />
                        )}
                        {postStats?.emojiPerPost != null && (
                          <Row label="Emoji / Post" value={<span className="text-white font-semibold text-sm">{postStats.emojiPerPost}</span>} />
                        )}
                        <Row label="Confidence" value={<span className="text-green-400 font-semibold text-sm">{analysis.confidenceScore}%</span>} />
                      </div>
                      <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mt-1">
                        <div className="h-full gradient-accent rounded-full transition-all duration-1000" style={{ width: `${analysis.confidenceScore || 0}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Writing Patterns + Unique Traits side by side */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {analysis.writingPatterns?.length > 0 && (
                      <div className="p-5 bg-black/20 rounded-2xl border border-gray-700/20">
                        <h3 className="text-white font-semibold mb-3 flex items-center text-sm">
                          <i className="fa-solid fa-list-check text-violet-400 mr-2"></i>Writing Patterns
                        </h3>
                        <div className="space-y-2">
                          {analysis.writingPatterns.map((p, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <i className="fa-solid fa-check text-green-400 text-xs mt-1"></i>
                              <span className="text-gray-300 text-sm leading-relaxed">{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.uniqueTraits?.length > 0 && (
                      <div className="p-5 bg-black/20 rounded-2xl border border-gray-700/20">
                        <h3 className="text-white font-semibold mb-3 flex items-center text-sm">
                          <i className="fa-solid fa-fingerprint text-cyan-400 mr-2"></i>Unique Traits
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.uniqueTraits.map((t, i) => <span key={i} className="px-3 py-1.5 bg-violet-400/10 text-violet-300 text-sm rounded-xl">{t}</span>)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Style Summary */}
                  {analysis.styleSummary && (
                    <div className="p-5 bg-violet-400/10 rounded-2xl border border-violet-400/20 mb-6">
                      <h4 className="text-white font-semibold mb-2 flex items-center text-sm">
                        <i className="fa-solid fa-quote-left text-violet-400 mr-2"></i>
                        Style Summary
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{analysis.styleSummary}</p>
                    </div>
                  )}

                  {/* Sample Post */}
                  {analysis.samplePost && (
                    <div className="p-5 bg-black/20 rounded-2xl border border-gray-700/30 mb-8">
                      <div className="flex items-center space-x-2 mb-2">
                        <i className="fa-solid fa-quote-left text-cyan-400 text-sm"></i>
                        <span className="text-white font-semibold text-sm">Sample Post in Their Style</span>
                      </div>
                      <p className="text-gray-300 text-sm italic leading-relaxed">"{analysis.samplePost}"</p>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-3">
                    <button onClick={() => { setShowResults(false); setUrl(""); }} className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all">
                      <i className="fa-solid fa-rotate-right mr-2"></i>Analyze Another
                    </button>
                    <button onClick={() => setSaveModal(true)} className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all">
                      <i className="fa-solid fa-bookmark mr-2"></i>Save as Preset
                    </button>
                    <button onClick={() => setApplyModal(true)} className="px-8 py-3 gradient-accent rounded-2xl text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20">
                      <i className="fa-solid fa-check mr-2"></i>Use This Voice
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= TRAIN FROM FILES ================= */}
          {activeTab === "train" && (
            <div className="mb-8">
              <MainTrainingInterface onApply={async (analysis, fileNames) => {
                try {
                  const name = fileNames ? `Trained: ${fileNames.split(",")[0].trim()}` : "Trained Voice";
                  const data = await apiFetch("/api/clone/presets", {
                    method: "POST",
                    body: JSON.stringify({
                      user_id: getUserId(),
                      name,
                      profile: { name, platform: "Document", imageUrl: null },
                      analysis,
                      postStats: null,
                      url: "",
                      type: "personal",
                    }),
                  });
                  if (data.success) {
                    loadPresets();
                    setActiveTab("my");
                  }
                } catch (e) {
                  console.error("Failed to save trained voice:", e);
                }
              }} />
            </div>
          )}

          {/* ================= SAVED VOICES ================= */}
          <div className="neo-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fa-solid fa-bookmark text-yellow-400 mr-3"></i>
                Saved Voice Presets
              </h2>
            </div>

            {presetsLoading ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <p className="text-gray-400">Loading presets...</p>
              </div>
            ) : presets.length === 0 ? (
              <div className="text-center py-8">
                <i className="fa-solid fa-bookmark text-4xl text-gray-600 mb-4"></i>
                <p className="text-gray-400 mb-2">No saved presets yet</p>
                <p className="text-gray-500 text-sm">Clone a creator's voice to save it as a preset</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...presets].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)).map((preset) => (
                  <VoiceCard
                    key={preset._id}
                    icon={<i className={`fa-solid ${preset.type === "personal" ? "fa-user" : "fa-copy"} text-cyan-400`}></i>}
                    bg="bg-cyan-400/20"
                    title={preset.active ? `${preset.name} — My Voice` : preset.name}
                    subtitle={preset.active ? "My Active Voice" : (preset.type === "personal" ? "Personal" : "Cloned")}
                    description={preset.analysis?.tone ? `Tone: ${preset.analysis.tone}` : "Voice preset"}
                    imageUrl={preset.profile?.imageUrl}
                    createdAt={preset.created_at}
                    active={preset.active}
                    status={
                      preset.active
                        ? <span className="text-xs text-green-400 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span> Active</span>
                        : <button onClick={(e) => { e.stopPropagation(); handleActivatePreset(preset._id); }} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">Set Active</button>
                    }
                    onDelete={() => handleDeletePreset(preset._id)}
                    onClick={() => setExpandedPreset(preset)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================= MODALS ================= */}

      {/* Preset Detail Modal */}
      {expandedPreset && (
        <PresetDetailModal
          preset={expandedPreset}
          onClose={() => setExpandedPreset(null)}
          onActivate={(id) => { handleActivatePreset(id); setExpandedPreset(null); }}
          onDelete={(id) => { handleDeletePreset(id); setExpandedPreset(null); }}
        />
      )}

      {saveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-effect glow-border p-8 rounded-2xl text-center w-96">
            <h3 className="text-xl font-bold mb-4">Save Voice Preset</h3>
            <input type="text" placeholder="Preset name..." value={saveName} onChange={(e) => setSaveName(e.target.value)}
              className="w-full p-3 bg-black/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none mb-6" />
            <div className="flex justify-center gap-4">
              <button onClick={() => { setSaveModal(false); setSaveName(""); }} className="px-5 py-2 bg-black/40 rounded-xl border border-white/10">Cancel</button>
              <button onClick={handleSavePreset} disabled={saving || !saveName.trim()} className="px-5 py-2 gradient-accent rounded-xl disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
      {applyModal && (
        <Modal onClose={() => setApplyModal(false)} confirmAction={handleApplyVoice} confirmText="Apply Voice">
          Apply this voice as your active writing style?
        </Modal>
      )}
    </div>
  );
}

/* ================= Reusable Components ================= */
function StructureFlow({ text }) {
  if (!text || text === "—") return <span className="text-gray-500">—</span>;
  const steps = text.split(/\s*(?:->|→|>>|>)\s*/).filter(Boolean);
  if (steps.length <= 1) return <span className="text-gray-100 text-sm">{text}</span>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-cyan-400/10 text-cyan-300 text-xs rounded-lg font-medium">
            {step.trim()}
          </span>
          {i < steps.length - 1 && <i className="fa-solid fa-arrow-right text-gray-600 text-[10px]"></i>}
        </span>
      ))}
    </div>
  );
}

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

/* ================= Preset Detail Modal ================= */
function PresetDetailModal({ preset, onClose, onActivate, onDelete }) {
  const a = preset.analysis || {};
  const p = preset.profile || {};
  const ps = preset.postStats || {};

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-effect glow-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ProfileImg src={p.imageUrl} name={preset.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="text-xl font-bold text-white">{preset.name}</h3>
              <p className="text-gray-400 text-sm">{p.platform || "Unknown"} · {preset.type === "personal" ? "Personal" : "Cloned"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-black/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Voice Profile</h4>
              <Row label="Tone" value={<span className="tone-badge px-2 py-0.5 rounded-lg text-sm">{a.tone || "—"}</span>} />
              <div>
                <span className="text-gray-300 text-sm">Structure</span>
                <div className="mt-1.5"><StructureFlow text={a.structure} /></div>
              </div>
              <Row label="Sentences" value={<span className="text-gray-100 text-sm">{a.sentenceStyle || "—"}</span>} />
              <Row label="Vocabulary" value={<span className="text-gray-100 text-sm">{a.vocabularyLevel || "—"}</span>} />
              <Row label="Emoji" value={<span className="text-gray-100 text-sm">{a.emojiUsage || "—"}</span>} />
              <Row label="Hashtags" value={<span className="text-gray-100 text-sm">{a.hashtagUsage || "—"}</span>} />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Metrics</h4>
              <Row label="Post Length" value={<span className="text-white font-semibold text-sm">{ps.avgWordCount ? `${ps.avgWordCount} words` : (a.avgPostLength || "—")}</span>} />
              <Row label="Reading Level" value={<span className="text-white font-semibold text-sm">{ps.readingGrade ? `Grade ${ps.readingGrade}` : (a.readingLevel || "—")}</span>} />
              <Row label="Posts Analyzed" value={<span className="text-white font-semibold text-sm">{ps.postCount || "—"}</span>} />
              {ps.shortestPost != null && (
                <Row label="Range" value={<span className="text-white font-semibold text-sm">{ps.shortestPost}–{ps.longestPost} words</span>} />
              )}
              <Row label="Confidence" value={<span className="text-green-400 font-semibold text-sm">{a.confidenceScore || 0}%</span>} />
              <div className="pt-1">
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full gradient-accent rounded-full" style={{ width: `${a.confidenceScore || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {a.hookStyle && (
              <div className="p-4 bg-black/20 rounded-xl">
                <span className="text-gray-400 text-xs uppercase tracking-wider">Hook Style</span>
                <p className="text-gray-200 text-sm mt-1 leading-relaxed">{a.hookStyle}</p>
              </div>
            )}
            {a.ctaStyle && (
              <div className="p-4 bg-black/20 rounded-xl">
                <span className="text-gray-400 text-xs uppercase tracking-wider">CTA Style</span>
                <p className="text-gray-200 text-sm mt-1 leading-relaxed">{a.ctaStyle}</p>
              </div>
            )}
          </div>

          {a.contentThemes?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Content Themes</h4>
              <div className="flex flex-wrap gap-2">
                {a.contentThemes.map((t, i) => <span key={i} className="px-2.5 py-1 bg-cyan-400/10 text-cyan-400 text-xs rounded-lg">{t}</span>)}
              </div>
            </div>
          )}

          {a.writingPatterns?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Writing Patterns</h4>
              <div className="space-y-1.5">
                {a.writingPatterns.map((pat, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <i className="fa-solid fa-check text-green-400 text-xs mt-1"></i>
                    <span className="text-gray-300 text-sm">{pat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {a.uniqueTraits?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Unique Traits</h4>
              <div className="flex flex-wrap gap-2">
                {a.uniqueTraits.map((t, i) => <span key={i} className="px-3 py-1.5 bg-violet-400/10 text-violet-300 text-sm rounded-xl">{t}</span>)}
              </div>
            </div>
          )}

          {a.styleSummary && (
            <div className="p-4 bg-violet-400/10 rounded-xl border border-violet-400/20">
              <h4 className="text-white font-semibold text-sm mb-1 flex items-center">
                <i className="fa-solid fa-quote-left text-violet-400 mr-2 text-xs"></i>Style Summary
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{a.styleSummary}</p>
            </div>
          )}

          {a.samplePost && (
            <div className="p-4 bg-black/20 rounded-xl border border-gray-700/30">
              <h4 className="text-white font-semibold text-sm mb-1 flex items-center">
                <i className="fa-solid fa-pen text-cyan-400 mr-2 text-xs"></i>Sample Post
              </h4>
              <p className="text-gray-300 text-sm italic leading-relaxed">"{a.samplePost}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/30 flex justify-between items-center">
          {preset.created_at && (
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <i className="fa-regular fa-clock"></i> Saved {timeAgo(preset.created_at)}
            </span>
          )}
          <div className="flex gap-3">
            {!preset.active && (
              <button onClick={() => onActivate(preset._id)} className="px-4 py-2 gradient-accent rounded-xl text-white text-sm font-medium">
                <i className="fa-solid fa-check mr-1"></i> Set Active
              </button>
            )}
            <button onClick={() => onDelete(preset._id)} className="px-4 py-2 bg-black/30 rounded-xl text-red-400 text-sm border border-red-400/20 hover:border-red-400/50 transition-colors">
              <i className="fa-solid fa-trash mr-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Voice Card ================= */
function VoiceCard({ icon, bg, title, subtitle, description, imageUrl, createdAt, active, status, onDelete, onClick }) {
  return (
    <div onClick={onClick} className={`voice-card neo-card rounded-2xl p-6 cursor-pointer relative overflow-hidden ${active ? "border-l-2 border-l-cyan-400" : ""}`}>
      <div className="flex items-center space-x-3 mb-4">
        <ProfileImg src={imageUrl} name={title} className="w-12 h-12 rounded-2xl object-cover" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{title}</h3>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-3">{description}</p>
      {createdAt && (
        <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
          <i className="fa-regular fa-clock"></i>
          {timeAgo(createdAt)}
        </p>
      )}
      <div className="flex justify-between items-center">
        {status}
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-8 h-8 bg-black/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
            <i className="fa-solid fa-trash text-xs"></i>
          </button>
        )}
      </div>
    </div>
  );
}
