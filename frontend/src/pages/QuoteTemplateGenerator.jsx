import { useEffect, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import useSettings from "../hooks/useSettings";
import useTranslation from "../i18n/useTranslation";
import { usePosts } from "../hooks/usePosts";
import toast from "react-hot-toast";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function QuoteTemplate() {
  const { connectedPlatforms, voiceProfile } = useSettings();
  const { createPost, publishPost } = usePosts();
  const t = useTranslation();
  const [quote, setQuote] = useState("");
  const [charCount, setCharCount] = useState(0);
  const defaultPlatforms = Object.entries(connectedPlatforms)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    defaultPlatforms.length > 0 ? defaultPlatforms : ["twitter", "linkedin", "medium"]
  );
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [variationsVisible, setVariationsVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [calloutOpen, setCalloutOpen] = useState(false);
  const [calloutMessage, setCalloutMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stylePreset, setStylePreset] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [modalPlatform, setModalPlatform] = useState(null);

  const maxLength = 500;
  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    setCharCount(quote.length);
  }, [quote]);

  // Auto-generate image when modal platform is set
  useEffect(() => {
    if (modalOpen && modalPlatform && modalText) {
      generateImage(modalPlatform);
    }
  }, [modalPlatform, modalOpen]);

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const showToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 3000);
  };

  const showCallout = (message) => {
    setCalloutMessage(message);
    setCalloutOpen(true);
    setTimeout(() => setCalloutOpen(false), 2500);
  };

  const generateVariations = async () => {
    if (!quote.trim()) {
      showToast(t("quotes.enterQuoteFirst"), "warning");
      return;
    }
    if (quote.length < 10) {
      showToast(t("quotes.quoteTooShort"), "warning");
      return;
    }

    setLoading(true);
    setVariationsVisible(false);

    try {
      const response = await fetch(`${API_BASE}/api/quote-generator/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote,
          selectedPlatforms,
          brandEnabled: false,
          voiceProfile: voiceProfile || null,
          stylePreset: stylePreset || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const result = Array.isArray(data.variations) ? data.variations : [];
      setVariations(result);
      setVariationsVisible(true);

      setHistory((prev) => [
        {
          quote,
          createdAt: new Date().toISOString(),
          variations: result,
        },
        ...prev.slice(0, 9),
      ]);

      showToast("Variations generated successfully", "success");
    } catch (error) {
      showToast(error.message || "Server error", "warning");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setQuote("");
    setVariations([]);
    setVariationsVisible(false);
    setSelectedPlatforms(["twitter", "linkedin", "medium"]);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showCallout("Copied to clipboard!");
    } catch {
      showToast("Copy failed", "warning");
    }
  };

  const postToPlatform = async (text, platform) => {
    if (!text) {
      toast.error("No content to publish");
      return;
    }

    const platformLower = platform.toLowerCase();
    
    try {
      toast.loading(`Publishing to ${platform}...`);
      
      // 1) Create the post as draft first (matching CreatePostPage pattern)
      const newPost = await createPost({
        idea: quote,
        content: text,
        platforms: { [platformLower]: true },
        status: "draft",
        engagement: {},
        selectedImages: []
      });
      
      // 2) Publish it to LinkedIn (matching CreatePostPage pattern)
      if (platformLower === "linkedin" && newPost?.id) {
        try {
          await publishPost(newPost.id);
          toast.success(`Quote published successfully to ${platform}!`);
        } catch (pubErr) {
          toast.error(`Failed to publish to LinkedIn: ${pubErr.message}`);
        }
      } else {
        // For other platforms, just save as draft
        toast.success(`Quote saved successfully for ${platform}!`);
      }
    } catch (err) {
      console.error('Error publishing quote:', err);
      toast.error(`Failed to publish: ${err.message}`);
    }
  };

  const openVisual = (text, platform = "twitter") => {
    setModalText(text);
    setModalPlatform(platform.toLowerCase());
    setModalOpen(true);
    setGeneratedImage(null);
  };

  const generateImage = async (platform = "twitter") => {
    if (!modalText.trim()) {
      showToast("No text to generate image", "warning");
      return;
    }

    setImageLoading(true);
    try {
      // Modern Corporate Design
      const platformDesign = {
        twitter: {
          gradient1: "#0A1929",
          gradient2: "#1A3A52",
          accent1: "#1DA1F2",
          accent2: "#1A8FCC"
        },
        linkedin: {
          gradient1: "#003366",
          gradient2: "#0055AA",
          accent1: "#0077B5",
          accent2: "#0A66C2"
        },
        medium: {
          gradient1: "#1F1F1F",
          gradient2: "#3F3F3F",
          accent1: "#FFFFFF",
          accent2: "#E0E0E0"
        }
      };

      const design = platformDesign[platform] || platformDesign.twitter;

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d", { alpha: false });

      // Draw gradient background (diagonal)
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, design.gradient1);
      gradient.addColorStop(1, design.gradient2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle noise texture
      ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(Math.random() * canvas.width, 0, 1, canvas.height);
      }

      // Main text styling
      const fontSize = 56;
      const fontFamily = "'Segoe UI', '-apple-system', 'Helvetica Neue', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";

      // Word wrap function
      const wrapText = (text, maxWidth) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        for (let word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          ctx.font = `600 ${fontSize}px ${fontFamily}`;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      // Wrap and calculate position
      const maxWidth = canvas.width - 200;
      const lines = wrapText(modalText, maxWidth);
      const lineHeight = 75;
      const totalHeight = lines.length * lineHeight;
      let startY = (canvas.height - totalHeight) / 2;

      // Draw main text with professional styling
      ctx.font = `600 ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = "#FFFFFF";
      
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillText(line, canvas.width / 2, y);
      });

      // Draw top accent bar
      ctx.fillStyle = design.accent1;
      ctx.fillRect(0, 0, canvas.width, 4);

      // Draw bottom accent bar
      ctx.fillRect(0, canvas.height - 4, canvas.width, 4);

      // Platform label - Corporate style
      ctx.font = `700 18px ${fontFamily}`;
      ctx.fillStyle = design.accent1;
      ctx.textAlign = "right";
      const platformLabel = platform.toUpperCase();
      ctx.fillText(platformLabel, canvas.width - 40, canvas.height - 30);

      // Small divider before label
      ctx.fillStyle = design.accent1;
      ctx.fillRect(canvas.width - 150, canvas.height - 45, 100, 1);

      // Convert to data URL
      const imageData = canvas.toDataURL("image/png");
      setGeneratedImage(imageData);
      showToast("Image generated successfully!", "success");
    } catch (error) {
      console.error("Canvas error:", error);
      showToast("Image generation failed", "warning");
    } finally {
      setImageLoading(false);
    }
  };

  const downloadImage = (imageData) => {
    try {
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `quote-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showCallout("Image downloaded!");
    } catch (error) {
      showToast("Download failed", "warning");
    }
  };

  const loadHistoryItem = (item) => {
    setQuote(item.quote);
    setVariations(item.variations || []);
    setVariationsVisible(true);
    showCallout("History loaded");
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quote-generator/history?limit=20`);
      const data = await res.json();
      if (data.success) setHistory(data.history || []);
    } catch (err) {
      console.error("History error:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quote-generator/templates`);
      const data = await res.json();
      if (data.success) setTemplates(data.templates || []);
    } catch (err) {
      console.error("Templates error:", err);
    }
  };

  const saveTemplate = async (variation) => {
    try {
      const res = await fetch(`${API_BASE}/api/quote-generator/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          quote, 
          variation,
          allVariations: variations // Include all generated variations
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(t("quotes.templateSaved"), "success");
        fetchTemplates();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast("Failed to save template", "warning");
    }
  };

  const deleteTemplate = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/quote-generator/templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTemplates((prev) => prev.filter((tmpl) => tmpl.id !== id));
        showToast(t("quotes.templateDeleted"), "info");
      }
    } catch (err) {
      showToast("Failed to delete", "warning");
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/quote-generator/history/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
        showToast("History item deleted", "info");
      }
    } catch (err) {
      showToast("Failed to delete", "warning");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quote-generator/analytics`);
      const data = await res.json();
      if (data.success) setAnalytics(data);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const stylePresets = [
    { key: "", label: t("quotes.default"), icon: "fa-wand-magic-sparkles" },
    { key: "motivational", label: t("quotes.motivational"), icon: "fa-fire" },
    { key: "professional", label: t("quotes.professional"), icon: "fa-briefcase" },
    { key: "humorous", label: t("quotes.humorous"), icon: "fa-face-laugh" },
    { key: "poetic", label: t("quotes.poetic"), icon: "fa-feather" },
    { key: "provocative", label: t("quotes.provocative"), icon: "fa-bolt" },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#0b1020] p-8 space-y-16">
        {/* HEADER */}
        <div className="mb-12 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-cyan-500 via-violet-500 to-teal-500 flex items-center justify-center shadow-2xl">
            <i className="fa-solid fa-quote-right text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("quotes.title")}
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {t("quotes.subtitle")}
          </p>
          <p className="text-gray-400">
            {t("quotes.description")}
          </p>
        </div>

        {/* INPUT SECTION */}
        <div id="quote-input-section" className="max-w-4xl mx-auto mb-12">
          <div className="rounded-3xl p-8 bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="relative">
              <textarea
                id="quote-input"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                maxLength={maxLength}
                className="w-full h-40 bg-transparent text-white text-lg placeholder-gray-400 rounded-2xl p-6 font-medium leading-relaxed border border-white/10 outline-none focus:border-cyan-400 resize-none"
                placeholder={t("quotes.inputPlaceholder")}
              />
              <div className="absolute bottom-4 right-6 text-gray-400">
                {charCount}/{maxLength}
              </div>
            </div>

            {/* PLATFORM TOGGLES */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 mb-6">
              {["twitter", "linkedin", "medium"].map((platform) => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all border ${
                    selectedPlatforms.includes(platform)
                      ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/40"
                      : "text-gray-300 border-white/10 hover:text-white hover:border-white/30"
                  }`}
                >
                  <i
                    className={`fa-brands ${
                      platform === "twitter"
                        ? "fa-x-twitter"
                        : platform === "linkedin"
                        ? "fa-linkedin-in"
                        : "fa-medium"
                    } text-xl`}
                  ></i>
                  <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                </button>
              ))}
            </div>

            {/* STYLE PRESETS */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm text-center mb-3">{t("quotes.stylePresets")}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {stylePresets.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => setStylePreset(preset.key)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      stylePreset === preset.key
                        ? "bg-violet-400/15 text-violet-300 border-violet-400/50"
                        : "text-gray-400 border-white/10 hover:text-white hover:border-white/25"
                    }`}
                  >
                    <i className={`fa-solid ${preset.icon}`}></i>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                id="generate-btn"
                onClick={generateVariations}
                disabled={loading}
                className="px-8 py-4 rounded-2xl text-white font-bold text-lg flex items-center space-x-3 bg-gradient-to-r from-cyan-500 via-violet-500 to-teal-500 disabled:opacity-60"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>{loading ? t("common.generating") : t("quotes.generateVariations")}</span>
                <i className="fa-solid fa-pen-fancy"></i>
              </button>

              <button
                id="clear-btn"
                onClick={clearAll}
                className="px-6 py-4 rounded-2xl text-gray-300 border border-gray-600 hover:border-gray-400 hover:text-white transition-all font-medium"
              >
                {t("common.clear")}
              </button>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div id="loading-section" className="max-w-6xl mx-auto mb-12">
            <div className="rounded-3xl p-12 text-center bg-white/5 backdrop-blur-md border border-white/10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <i className="fa-solid fa-brain text-cyan-400 text-2xl animate-pulse"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t("quotes.craftingVariations")}
              </h3>
              <p className="text-gray-400 mb-6">
                {t("quotes.analyzingTone")}
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* VARIATIONS */}
        {variationsVisible && (
          <div id="variations-section" className="max-w-7xl mx-auto mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                {t("quotes.yourVariations")}
              </h3>
              <p className="text-gray-400">
                {t("quotes.variationsDesc")}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {variations.map((variation, index) => (
                <div
                  key={index}
                  className="rounded-3xl p-6 bg-white/5 border border-white/10 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold text-lg">
                      {variation.platform}
                    </h4>
                    {variation.tone && (
                      <span className="text-xs px-3 py-1 rounded-full bg-violet-400/20 text-violet-300">
                        {variation.tone}
                      </span>
                    )}
                  </div>

                  <div className="bg-black/30 rounded-2xl p-4 mb-4 min-h-[140px]">
                    <p className="text-gray-200 whitespace-pre-line leading-7">
                      {variation.text}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => copyToClipboard(variation.text)}
                      className="flex-1 min-w-[120px] px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl hover:bg-cyan-400/30"
                    >
                      {t("common.copy")}
                    </button>
                    <button
                      onClick={() => postToPlatform(variation.text, variation.platform)}
                      className="flex-1 min-w-[150px] px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl hover:bg-cyan-400/30"
                    >
                      {`${t("quotes.postTo")} ${variation.platform}`}
                    </button>
                    <button
                      onClick={() => openVisual(variation.text, variation.platform)}
                      className="px-4 py-2 bg-violet-400/20 text-violet-400 rounded-xl hover:bg-violet-400/30"
                    >
                      {t("quotes.visual")}
                    </button>
                    <button
                      onClick={() => saveTemplate(variation)}
                      className="px-4 py-2 bg-amber-400/20 text-amber-400 rounded-xl hover:bg-amber-400/30"
                      title="Save as template"
                    >
                      <i className="fa-solid fa-bookmark"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-12">
          {[
            {
              title: t("quotes.recentQuotes"),
              desc: `${history.length || 0} ${t("quotes.quotesGenerated")}`,
              icon: "fa-history",
              color: "cyan",
              action: () => { fetchHistory(); setShowHistory(!showHistory); setShowTemplates(false); setShowAnalytics(false); },
              active: showHistory,
            },
            {
              title: t("quotes.savedTemplates"),
              desc: `${templates.length || 0} ${t("quotes.templatesSaved")}`,
              icon: "fa-bookmark",
              color: "violet",
              action: () => { fetchTemplates(); setShowTemplates(!showTemplates); setShowHistory(false); setShowAnalytics(false); },
              active: showTemplates,
            },
            {
              title: t("quotes.stylePresets"),
              desc: stylePreset ? stylePresets.find(s => s.key === stylePreset)?.label : t("quotes.defaultStyle"),
              icon: "fa-palette",
              color: "teal",
              action: () => {
                const currentIdx = stylePresets.findIndex(s => s.key === stylePreset);
                const next = stylePresets[(currentIdx + 1) % stylePresets.length];
                setStylePreset(next.key);
                showCallout(`Style: ${next.label}`);
              },
              active: !!stylePreset,
            },
            {
              title: t("quotes.quoteAnalytics"),
              desc: analytics ? `${analytics.total_generations} total` : t("quotes.viewStats"),
              icon: "fa-chart-simple",
              color: "amber",
              action: () => { fetchAnalytics(); setShowAnalytics(!showAnalytics); setShowHistory(false); setShowTemplates(false); },
              active: showAnalytics,
            },
          ].map((item, i) => {
            const colorMap = {
              cyan: { bg: "bg-cyan-400/20", text: "text-cyan-400", border: "border-cyan-400" },
              violet: { bg: "bg-violet-400/20", text: "text-violet-400", border: "border-violet-400" },
              teal: { bg: "bg-teal-400/20", text: "text-teal-400", border: "border-teal-400" },
              amber: { bg: "bg-amber-400/20", text: "text-amber-400", border: "border-amber-400" },
            };
            const c = colorMap[item.color] || colorMap.cyan;
            return (
              <div
                key={i}
                onClick={item.action}
                className={`rounded-2xl p-6 text-center hover:bg-white/5 transition-all cursor-pointer border bg-white/5 ${
                  item.active ? `${c.border} ${c.bg}` : "border-cyan-400/20"
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl ${c.bg} flex items-center justify-center`}>
                  <i className={`fa-solid ${item.icon} ${c.text}`}></i>
                </div>
                <h4 className="text-white font-medium mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* HISTORY PANEL */}
        {showHistory && (
          <div className="max-w-5xl mx-auto mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="fa-solid fa-history text-cyan-400 mr-3"></i>
              {t("quotes.recentHistory")}
            </h3>
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t("quotes.noHistory")}</div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="rounded-2xl p-5 bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate mb-1">"{item.quote}"</p>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                        <span className="text-gray-500 text-xs">{(item.variations || []).length} variations</span>
                        <div className="flex gap-1">
                          {(item.selectedPlatforms || []).map(p => (
                            <i key={p} className={`fa-brands ${p === "twitter" ? "fa-x-twitter text-white" : p === "linkedin" ? "fa-linkedin-in text-blue-400" : "fa-medium text-green-400"} text-xs`}></i>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => loadHistoryItem(item)} className="px-4 py-2 rounded-xl bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 text-sm">{t("common.load")}</button>
                      <button onClick={() => deleteHistoryItem(item.id)} className="px-3 py-2 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400/20 text-sm"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEMPLATES PANEL */}
        {showTemplates && (
          <div className="max-w-5xl mx-auto mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="fa-solid fa-bookmark text-violet-400 mr-3"></i>
              {t("quotes.savedTemplates")}
            </h3>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t("quotes.noTemplates")}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="rounded-2xl p-6 bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm px-3 py-1 rounded-full bg-violet-400/20 text-violet-300">{tpl.variation?.platform || "—"}</span>
                      <span className="text-gray-500 text-xs">{tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 italic">"{tpl.quote?.slice(0, 80)}..."</p>
                    <div className="bg-black/30 rounded-xl p-4 mb-4">
                      <p className="text-white whitespace-pre-line text-sm">{tpl.variation?.text}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => copyToClipboard(tpl.variation?.text || "")} className="flex-1 px-3 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl text-sm hover:bg-cyan-400/30">{t("common.copy")}</button>
                      <button onClick={() => { 
  console.log("Template data:", tpl); 
  console.log("All variations:", tpl.allVariations); 
  
  setQuote(tpl.quote || ""); 
  
  // Handle old templates without allVariations
  if (tpl.allVariations && tpl.allVariations.length > 0) {
    // New template with all variations
    setVariations(tpl.allVariations);
    setVariationsVisible(true);
    showCallout("Quote and variations loaded");
  } else if (tpl.variation) {
    // Old template with single variation - create array with this variation
    setVariations([tpl.variation]);
    setVariationsVisible(true);
    showCallout("Quote and variation loaded");
  } else {
    // Fallback - no variations
    setVariations([]);
    setVariationsVisible(false);
    showCallout("Quote loaded (no variations)");
  }
}} className="flex-1 px-3 py-2 bg-violet-400/20 text-violet-400 rounded-xl text-sm hover:bg-violet-400/30">{t("quotes.useQuote")}</button>
                      <button onClick={() => deleteTemplate(tpl.id)} className="px-3 py-2 bg-red-400/10 text-red-400 rounded-xl text-sm hover:bg-red-400/20"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS PANEL */}
        {showAnalytics && analytics && (
          <div className="max-w-5xl mx-auto mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <i className="fa-solid fa-chart-simple text-amber-400 mr-3"></i>
              {t("quotes.quoteAnalytics")}
            </h3>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: t("quotes.totalGenerations"), value: analytics.total_generations, icon: "fa-quote-right", color: "cyan" },
                { label: t("quotes.savedTemplates"), value: analytics.saved_templates, icon: "fa-bookmark", color: "violet" },
                { label: t("quotes.thisWeek"), value: analytics.this_week, icon: "fa-calendar-week", color: "teal" },
                { label: t("quotes.avgVariations"), value: analytics.avg_variations, icon: "fa-layer-group", color: "amber" },
              ].map((stat, i) => {
                const cm = {
                  cyan: { bg: "bg-cyan-400/20", text: "text-cyan-400" },
                  violet: { bg: "bg-violet-400/20", text: "text-violet-400" },
                  teal: { bg: "bg-teal-400/20", text: "text-teal-400" },
                  amber: { bg: "bg-amber-400/20", text: "text-amber-400" },
                };
                const sc = cm[stat.color] || cm.cyan;
                return (
                  <div key={i} className="rounded-2xl p-6 bg-white/5 border border-white/10 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl ${sc.bg} flex items-center justify-center`}>
                      <i className={`fa-solid ${stat.icon} ${sc.text}`}></i>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>
            {analytics.platforms && Object.keys(analytics.platforms).length > 0 && (
              <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
                <h4 className="text-white font-semibold mb-4">{t("quotes.platformUsage")}</h4>
                <div className="space-y-3">
                  {Object.entries(analytics.platforms).map(([platform, count]) => {
                    const total = Object.values(analytics.platforms).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={platform} className="flex items-center gap-4">
                        <span className="text-gray-300 w-20 capitalize">{platform}</span>
                        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-gray-400 text-sm w-16 text-right">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
          <div className="rounded-3xl p-8 max-w-4xl w-full bg-[#121829] border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl text-white mb-4">{t("quotes.createVisual")}</h3>
            
            {/* Original quote text */}
            <div className="bg-black/30 rounded-2xl p-6 mb-6 text-center">
              <p className="text-white text-lg whitespace-pre-line">{modalText}</p>
            </div>

            {/* Platform selection buttons */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3">Change platform or regenerate:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {["twitter", "linkedin", "medium"].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => generateImage(platform)}
                    disabled={imageLoading}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all border ${
                      imageLoading
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-white/10"
                    } ${
                      modalPlatform === platform
                        ? "bg-cyan-400/20 text-cyan-400 border-cyan-400/60"
                        : "text-white border-white/20 bg-white/5"
                    }`}
                  >
                    <i
                      className={`fa-brands ${
                        platform === "twitter"
                          ? "fa-x-twitter"
                          : platform === "linkedin"
                          ? "fa-linkedin-in"
                          : "fa-medium"
                      }`}
                    ></i>
                    <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated image preview */}
            {generatedImage && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3">Generated Image Preview:</p>
                <div className="bg-black/50 rounded-2xl p-4 flex justify-center">
                  <img src={generatedImage} alt="Generated quote" className="max-w-full max-h-96 rounded-xl" />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-between">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-3 border border-gray-600 rounded-2xl text-gray-300 hover:border-gray-400 hover:text-white transition-all"
              >
                {t("common.close")}
              </button>
              
              {generatedImage && (
                <>
                  <button
                    onClick={() => downloadImage(generatedImage)}
                    className="px-6 py-3 bg-cyan-400/20 text-cyan-400 rounded-2xl hover:bg-cyan-400/30 transition-all flex items-center space-x-2"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download Image</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedImage);
                      showCallout("Image data copied!");
                    }}
                    className="px-6 py-3 bg-violet-400/20 text-violet-400 rounded-2xl hover:bg-violet-400/30 transition-all"
                  >
                    {t("common.copy")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALLOUT */}
      {calloutOpen && (
        <div className="fixed top-8 right-8 z-50 w-80 bg-cyan-400/20 text-cyan-400 rounded-2xl p-4 shadow-lg flex items-start space-x-3 border border-cyan-400/20">
          <InfoCircledIcon className="w-6 h-6 mt-0.5" />
          <span className="text-white">{calloutMessage}</span>
        </div>
      )}

      {/* TOAST */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`px-5 py-3 rounded-xl shadow-2xl border border-white/20 ${
            toastType === "warning"
              ? "bg-yellow-400/20 text-yellow-300"
              : toastType === "success"
              ? "bg-green-400/20 text-green-300"
              : "bg-cyan-400/20 text-white"
          }`}
        >
          <Toast.Description>{toastMessage}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed top-8 right-8 w-80 z-50" />
      </Toast.Provider>
    </>
  );
}