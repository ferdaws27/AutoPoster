import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSettings from "../hooks/useSettings";
import useTranslation from "../i18n/useTranslation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast from "react-hot-toast";

const sampleHooksData = [
  { text: "Here's the uncomfortable truth about AI that nobody talks about:", score: 94, type: "bold-statement" },
  { text: "I spent 3 years studying AI implementation, and this shocked me the most:", score: 89, type: "personal-story" },
  { text: "What if everything you know about artificial intelligence is wrong?", score: 87, type: "question" },
  { text: "73% of businesses will fail to adapt to AI. Here's why:", score: 92, type: "statistic" },
  { text: "The AI revolution isn't coming. It's already here, and you're missing it.", score: 90, type: "urgency" },
];

const platformsList = [
  { key: 'twitter', label: 'Twitter/X', icon: 'fa-brands fa-x-twitter', color: 'text-white', description: 'Short, punchy hooks' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', color: 'text-blue-400', description: 'Professional authority' },
  { key: 'medium', label: 'Medium', icon: 'fa-brands fa-medium', color: 'text-green-400', description: 'Editorial depth' },
];

export default function HookGeneratorPage() {
  const navigate = useNavigate();
  const t = useTranslation();
  const { toneLabel, contentLength, connectedPlatforms, temperature, modelId, voiceProfile, creativity, language } = useSettings();
  const [topic, setTopic] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState([]); // <-- vide au départ
  const [selectedHook, setSelectedHook] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    const connected = Object.entries(connectedPlatforms || {})
      .filter(([, v]) => v)
      .map(([k]) => k);
    const validConnected = connected.filter(p => platformsList.some(pl => pl.key === p));
    return validConnected.length > 0 ? validConnected : platformsList.map(p => p.key);
  });
  const [successOpen, setSuccessOpen] = useState(false);
  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);

  useEffect(() => setCharCount(topic.length), [topic]);

  // Load AI tips on mount
  useEffect(() => { loadTips(); }, []);

  const loadTips = async (topicOverride) => {
    setTipsLoading(true);
    try {
      const API_BASE = "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/hook-generator/tips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
        },
        body: JSON.stringify({
          topic: topicOverride || topic || "",
          platforms: selectedPlatforms,
          language: language || "auto",
          voiceProfile: voiceProfile || null,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.tips && Array.isArray(data.tips)) setTips(data.tips);
    } catch (err) {
      console.error("Error loading tips:", err);
    } finally {
      setTipsLoading(false);
    }
  };

  const togglePlatform = (key) => {
    let updated = [...selectedPlatforms];
    if (updated.includes(key)) {
      if (updated.length === 1) return;
      updated = updated.filter(p => p !== key);
    } else {
      updated.push(key);
    }
    setSelectedPlatforms(updated);
  };

  const generateHooks = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setSelectedHook(null);
    setHooks([]);

    try {
      const API_BASE = "http://localhost:5000";
      
      const response = await fetch(`${API_BASE}/api/hook-generator/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify({
          topic: topic,
          platforms: selectedPlatforms,
          language: language || "auto",
          tone: toneLabel,
          contentLength: contentLength,
          temperature: temperature,
          model: modelId,
          creativity: creativity,
          voiceProfile: voiceProfile || null,
          count: 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.hooks && Array.isArray(data.hooks) && data.hooks.length > 0) {
        setHooks(data.hooks);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating hooks:", error);
      toast.error(`Error generating hooks: ${error.message}. Using sample hooks instead.`);
      setHooks([...sampleHooksData]);
    } finally {
      setLoading(false);
    }
  };

  const regenerateHook = async (index) => {
    setLoading(true);
    
    try {
      const API_BASE = "http://localhost:5000";
      const platform = selectedPlatforms[index % selectedPlatforms.length] || 'twitter';
      
      const response = await fetch(`${API_BASE}/api/hook-generator/regenerate-one`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify({
          topic: topic,
          platform: platform,
          language: language || "auto",
          tone: toneLabel,
          contentLength: contentLength,
          temperature: temperature,
          model: modelId,
          creativity: creativity,
          voiceProfile: voiceProfile || null,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.hook) {
        const newHooks = [...hooks];
        newHooks[index] = data.hook;
        setHooks(newHooks);
        
        if (selectedHook?.index === index) setSelectedHook(null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error regenerating hook:", error);
      // Fallback to random sample
      const newHooks = [...hooks];
      const randomHooks = [
        "Stop scrolling. This will change how you think about this forever.",
        "I made a $50K mistake. Here's what I learned:",
        "Everyone's talking about this, but nobody understands why it matters.",
        "3 predictions that will seem obvious by next year:",
        "This happened yesterday. Almost nobody noticed."
      ];
      const randIndex = Math.floor(Math.random() * randomHooks.length);
      newHooks[index] = { ...newHooks[index], text: randomHooks[randIndex], score: 85 + Math.floor(Math.random() * 10) };
      setHooks(newHooks);
      if (selectedHook?.index === index) setSelectedHook(null);
    } finally {
      setLoading(false);
    }
  };

  const selectHook = (hook, index) => setSelectedHook({ ...hook, index });

  const insertHook = (hookOverride) => {
    const hook = hookOverride || selectedHook;
    if (hook) {
      // Stocker le hook sélectionné dans localStorage
      const hookData = {
        text: hook.text,
        platform: selectedPlatforms[0] || 'twitter',
        score: hook.score,
        type: hook.type,
        reason: hook.reason || 'High engagement potential',
        originalTopic: topic,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('selectedHook', JSON.stringify(hookData));
      
      setSuccessOpen(true);
      
      setTimeout(() => {
        navigate('/dashboard/CreatePostPage');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0E1116] to-[#1A1F26] text-white">
     
      {/* Main */}
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center pulse-glow">
            <i className="fa-solid fa-fish-fins text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4">{t("hooks.title")}</h1>
          <p className="text-xl text-gray-300 mb-2">{t("hooks.subtitle")}</p>
          <p className="text-gray-400">{t("hooks.description")}</p>
        </div>

        {/* SECTION: Input Area */}
<div className="glass-effect rounded-3xl p-8 mb-8 slide-up">
  <div className="mb-6">
    <label className="block text-white font-semibold text-lg mb-3 flex items-center">
      <i className="fa-solid fa-lightbulb text-cyan-400 mr-2"></i>
      {t("hooks.topicLabel")}
    </label>
    <textarea
      id="topic-input"
      value={topic}
      onChange={e => setTopic(e.target.value)}
      maxLength={500}
      placeholder={t("hooks.topicPlaceholder")}
      className="w-full h-32 bg-black/20 border border-gray-600 rounded-2xl p-4 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
    ></textarea>
    <div className="flex justify-between items-center mt-2">
      <span className="text-gray-400 text-sm">{t("hooks.topicTip")}</span>
      <span id="char-count" className="text-gray-400 text-sm">{topic.length}/500</span>
    </div>
  </div>

  {/* Platform Selector */}
  <div className="mb-8">
    <label className="block text-white font-semibold text-lg mb-4 flex items-center">
      <i className="fa-solid fa-globe text-violet-400 mr-2"></i>
      {t("hooks.targetPlatforms")}
    </label>
    <div className="flex flex-wrap gap-4">
      {platformsList.map(p => {
        const isActive = selectedPlatforms.includes(p.key);
        return (
          <div
            key={p.key}
            onClick={() => togglePlatform(p.key)}
            className={`platform-selector flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-all ${
              isActive
                ? 'bg-cyan-400/10 border-cyan-400/60 shadow-lg shadow-cyan-400/10'
                : 'border-gray-700 bg-black/20 opacity-50 hover:opacity-75 hover:border-gray-500'
            }`}
            data-platform={p.key}
          >
            <i className={`${p.icon} text-xl ${isActive ? p.color : 'text-gray-500'}`}></i>
            <div>
              <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>{p.label}</div>
              <div className="text-xs text-gray-500">{p.description}</div>
            </div>
            {isActive && (
              <i className="fa-solid fa-circle-check text-cyan-400 text-sm ml-2"></i>
            )}
          </div>
        );
      })}
    </div>
  </div>

  {/* Generate Button */}
  <div className="text-center">
    <button
      id="generate-btn"
      onClick={generateHooks}
      className="px-8 py-4 gradient-accent rounded-2xl text-white font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105"
    >
      <i className="fa-solid fa-bolt mr-2"></i>
      {t("hooks.generateHooks")}
    </button>
  </div>
</div>


        {/* Hooks Section (Visible uniquement après génération) */}
        {hooks.length > 0 && !loading && (
          <div className="glass-effect rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fa-solid fa-sparkles text-cyan-400 mr-3"></i>
                {t("hooks.aiSuggested")}
              </h2>
              <button
                onClick={generateHooks}
                className="px-4 py-2 bg-black/30 border border-gray-600 rounded-2xl text-gray-300 hover:text-white hover:border-cyan-400 transition-all"
              >
                <i className="fa-solid fa-refresh mr-2"></i> {t("hooks.regenerateAll")}
              </button>
            </div>

            <div className="space-y-4">
              {hooks.map((hook, idx) => (
                <div
                  key={idx}
                  className={`hook-card rounded-2xl p-6 cursor-pointer fade-in ${selectedHook?.index === idx ? "selected" : ""}`}
                  onClick={() => selectHook(hook, idx)}
                >
                  <p className="text-white text-lg mb-2">"{hook.text}"</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        hook.platform === 'twitter' ? 'bg-gray-700 text-white' :
                        hook.platform === 'linkedin' ? 'bg-blue-500/20 text-blue-400' :
                        hook.platform === 'medium' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        <i className={`mr-1 ${
                          hook.platform === 'twitter' ? 'fa-brands fa-x-twitter' :
                          hook.platform === 'linkedin' ? 'fa-brands fa-linkedin-in' :
                          hook.platform === 'medium' ? 'fa-brands fa-medium' :
                          'fa-solid fa-globe'
                        }`}></i>
                        {hook.platform === 'twitter' ? 'Twitter/X' : hook.platform === 'linkedin' ? 'LinkedIn' : hook.platform === 'medium' ? 'Medium' : hook.platform}
                      </span>
                      <span className="text-gray-400 text-sm">{hook.type.replace("-", " ")} Hook</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="engagement-bar w-20 h-2 rounded-full bg-gray-700/40">
                        <div className="engagement-fill rounded-full bg-cyan-400" style={{ width: `${hook.score}%` }}></div>
                      </div>
                      <span className="text-cyan-400 font-semibold">{hook.score}%</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectHook(hook, idx);
                          insertHook({ ...hook, index: idx });
                        }}
                        className="px-4 py-2 gradient-accent rounded-xl text-white text-sm font-medium hover:opacity-90"
                      >
                        <i className="fa-solid fa-pen mr-1"></i> Use
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); regenerateHook(idx); }} className="p-2 bg-black/30 border border-gray-600 rounded-xl text-gray-300 hover:text-white hover:border-cyan-400">
                        <i className="fa-solid fa-refresh"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Selected Hook Section */}
{selectedHook && (
  <div id="selected-hook-section" className="glass-effect rounded-3xl p-8 mb-4">
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <i className="text-green-400 fa-solid fa-circle-check mr-3"></i>
      {t("hooks.selectedHook")}
    </h3>
    <div id="selected-hook-display" className="bg-black/20 rounded-2xl p-6 border border-cyan-400/30">
      <p id="selected-hook-text" className="text-white text-lg leading-relaxed">
        "{selectedHook.text}"
      </p>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">{t("hooks.platform")}:</span>
          <div id="selected-platforms" className="flex space-x-2 items-center">
            {selectedHook.platform === 'twitter' && <><i className="text-white fa-brands fa-x-twitter"></i><span className="text-gray-300 text-sm">Twitter/X</span></>}
            {selectedHook.platform === 'linkedin' && <><i className="text-blue-400 fa-brands fa-linkedin-in"></i><span className="text-gray-300 text-sm">LinkedIn</span></>}
            {selectedHook.platform === 'medium' && <><i className="text-green-400 fa-brands fa-medium"></i><span className="text-gray-300 text-sm">Medium</span></>}
            {!['twitter', 'linkedin', 'medium'].includes(selectedHook.platform) && <span className="text-gray-300 text-sm">{selectedHook.platform}</span>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">{t("hooks.engagementScore")}:</span>
          <span id="selected-score" className="text-cyan-400 font-semibold">{selectedHook.score}%</span>
        </div>
      </div>
    </div>
  </div>
)}


{selectedHook && (
  <div className="text-center mb-8">
    <button
      id="insert-hook-btn"
      onClick={insertHook}
      className="px-8 py-4 gradient-accent rounded-2xl text-white font-semibold text-lg hover:opacity-90 transition-all"
    >
      <i className="fa-solid fa-pen mr-2"></i>
      {t("hooks.insertHook")}
    </button>
  </div>
)}



        {/* Loader */}
        {loading && (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center pulse-glow">
              <i className="fa-solid fa-magic-wand-sparkles text-cyan-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 generating-dots">{t("hooks.craftingHooks")}</h3>
            <p className="text-gray-400">{t("hooks.craftingDesc")}</p>
          </div>
        )}

        {/* Success Modal */}
        {successOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="glass-effect rounded-3xl p-8 max-w-md w-full border border-green-400/30 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-400/20 flex items-center justify-center">
                <i className="fa-solid fa-check-circle text-green-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("hooks.hookInserted")}</h3>
              <p className="text-gray-400 mb-6">{t("hooks.hookInsertedDesc")}</p>
              <button onClick={() => setSuccessOpen(false)} className="w-full p-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90">
                {t("hooks.continueWriting")}
              </button>
            </div>
          </div>
          
        )}
        {/* Tips Section — AI Generated */}
<div id="tips-section" className="glass-effect rounded-3xl p-8 mt-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-white flex items-center">
      <i className="fas fa-graduation-cap text-yellow-400 mr-3"></i>
      {t("hooks.tipsTitle")}
    </h2>
    <button
      onClick={() => loadTips()}
      disabled={tipsLoading}
      className="px-4 py-2 bg-black/30 border border-gray-600 rounded-2xl text-gray-300 hover:text-white hover:border-cyan-400 transition-all disabled:opacity-50"
    >
      <i className={`fas ${tipsLoading ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"} mr-2`}></i>
      {tipsLoading ? t("common.generating") : t("hooks.regenerateTips")}
    </button>
  </div>

  {tipsLoading && tips.length === 0 ? (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-400/20 flex items-center justify-center pulse-glow">
        <i className="fas fa-wand-magic-sparkles text-yellow-400 text-2xl"></i>
      </div>
      <p className="text-gray-400">{t("hooks.craftingTips")}</p>
    </div>
  ) : tips.length > 0 ? (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tips.map((tip, idx) => {
        const colorMap = {
          cyan: { bg: "bg-cyan-400/20", text: "text-cyan-400" },
          violet: { bg: "bg-violet-400/20", text: "text-violet-400" },
          teal: { bg: "bg-teal-400/20", text: "text-teal-400" },
          yellow: { bg: "bg-yellow-400/20", text: "text-yellow-400" },
          red: { bg: "bg-red-400/20", text: "text-red-400" },
          pink: { bg: "bg-pink-400/20", text: "text-pink-400" },
          green: { bg: "bg-green-400/20", text: "text-green-400" },
          amber: { bg: "bg-amber-400/20", text: "text-amber-400" },
          blue: { bg: "bg-blue-400/20", text: "text-blue-400" },
        };
        const c = colorMap[tip.color] || colorMap.cyan;
        return (
          <div key={idx} className="bg-black/20 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all">
            <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mb-4`}>
              <i className={`fas ${tip.icon} ${c.text}`}></i>
            </div>
            <h3 className="text-white font-semibold mb-2">{tip.title}</h3>
            <p className="text-gray-400 text-sm">{tip.description}</p>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="text-center py-8">
      <p className="text-gray-500">Click "Regenerate Tips" to get AI-powered writing advice</p>
    </div>
  )}
</div>

        
      </main>
    </div>

  );
}
