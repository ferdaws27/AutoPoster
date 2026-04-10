import { useEffect, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default function QuoteTemplate() {
  const [quote, setQuote] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "twitter",
    "linkedin",
    "medium",
  ]);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [variationsVisible, setVariationsVisible] = useState(false);
  const [brandEnabled, setBrandEnabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [calloutOpen, setCalloutOpen] = useState(false);
  const [calloutMessage, setCalloutMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [history, setHistory] = useState([]);

  const maxLength = 500;
  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    setCharCount(quote.length);
  }, [quote]);

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
      showToast("Please enter a quote first", "warning");
      return;
    }
    if (quote.length < 10) {
      showToast("Quote too short. Minimum 10 characters.", "warning");
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
          brandEnabled,
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
    setBrandEnabled(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showCallout("Copied to clipboard!");
    } catch {
      showToast("Copy failed", "warning");
    }
  };

  const postToPlatform = (text, platform) => {
    let url = "";

    if (platform === "Twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    } else if (platform === "LinkedIn") {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        text
      )}`;
    } else if (platform === "Medium") {
      url = `https://medium.com/new-story`;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      showCallout(`Opening ${platform}`);
    }
  };

  const openVisual = (text) => {
    setModalText(text);
    setModalOpen(true);
  };

  const loadHistoryItem = (item) => {
    setQuote(item.quote);
    setVariations(item.variations || []);
    setVariationsVisible(true);
    showCallout("History loaded");
  };

  return (
    <>
      <div className="min-h-screen bg-[#0b1020] p-8 space-y-16">
        {/* HEADER */}
        <div className="mb-12 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-cyan-500 via-violet-500 to-teal-500 flex items-center justify-center shadow-2xl">
            <i className="fa-solid fa-quote-right text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Quote Template Generator — Turn Words Into Impact
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Transform any quote into AI-generated ready-to-share content
          </p>
          <p className="text-gray-400">
            Optimized for Twitter, LinkedIn, and Medium
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
                placeholder="Enter your quote or thought…"
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
                        ? "fa-twitter"
                        : platform === "linkedin"
                        ? "fa-linkedin"
                        : "fa-medium"
                    } text-xl`}
                  ></i>
                  <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                </button>
              ))}
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
                <span>{loading ? "Generating..." : "Generate Variations"}</span>
                <i className="fa-solid fa-pen-fancy"></i>
              </button>

              <button
                id="clear-btn"
                onClick={clearAll}
                className="px-6 py-4 rounded-2xl text-gray-300 border border-gray-600 hover:border-gray-400 hover:text-white transition-all font-medium"
              >
                Clear
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
                AI is crafting your variations...
              </h3>
              <p className="text-gray-400 mb-6">
                Analyzing tone, audience, and platform requirements
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
                Your Quote Variations
              </h3>
              <p className="text-gray-400">
                AI-generated versions optimized for each platform
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
                      Copy
                    </button>
                    <button
                      onClick={() => postToPlatform(variation.text, variation.platform)}
                      className="flex-1 min-w-[150px] px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl hover:bg-cyan-400/30"
                    >
                      {`Post to ${variation.platform}`}
                    </button>
                    <button
                      onClick={() => openVisual(variation.text)}
                      className="px-4 py-2 bg-violet-400/20 text-violet-400 rounded-xl hover:bg-violet-400/30"
                    >
                      Visual
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRAND TOGGLE */}
        <div id="brand-section" className="max-w-4xl mx-auto mb-12">
          <div
            className={`rounded-2xl p-6 cursor-pointer border transition-all duration-300 ${
              brandEnabled
                ? "border-violet-400 bg-violet-400/5"
                : "border-gray-700 hover:border-violet-400/40"
            }`}
            onClick={() => setBrandEnabled(!brandEnabled)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center">
                  <i className="fa-solid fa-signature text-violet-400"></i>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Auto-include brand signature
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Add "@EtkanAI" to all generated variations
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">
                  {brandEnabled ? "Enabled" : "Disabled"}
                </span>
                <div className="w-12 h-6 bg-gray-600 rounded-full relative transition-all">
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                      brandEnabled ? "left-6" : "left-0.5"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-12">
          {[
            {
              title: "Recent Quotes",
              desc: "View your quote history",
              icon: "fa-history",
              action: () => showCallout("Scroll down to history"),
            },
            {
              title: "Save Templates",
              desc: "Store your best outputs",
              icon: "fa-bookmark",
              action: () => showCallout("Connect MongoDB history"),
            },
            {
              title: "Style Presets",
              desc: "Customize quote formats",
              icon: "fa-palette",
              action: () => showCallout("Add prompt presets in backend"),
            },
            {
              title: "Quote Analytics",
              desc: "Track quote performance",
              icon: "fa-chart-simple",
              action: () => showCallout("Analytics module coming soon"),
            },
          ].map((item, i) => (
            <div
              key={i}
              onClick={item.action}
              className="rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer border border-cyan-400/20 bg-white/5"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <i className={`fa-solid ${item.icon} text-cyan-400`}></i>
              </div>
              <h4 className="text-white font-medium mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* HISTORY */}
        {history.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Recent History
            </h3>

            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-5 bg-white/5 border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium line-clamp-2 mb-1">
                      {item.quote}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => loadHistoryItem(item)}
                    className="px-4 py-2 rounded-xl bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
          <div className="rounded-3xl p-8 max-w-2xl w-full bg-[#121829] border border-white/10 shadow-2xl">
            <h3 className="text-2xl text-white mb-4">Create Visual Quote</h3>
            <div className="bg-black/30 rounded-2xl p-6 mb-6 text-center">
              <p className="text-white text-lg whitespace-pre-line">{modalText}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 p-3 border border-gray-600 rounded-2xl text-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  showCallout("Connect image generation next");
                }}
                className="flex-1 p-3 bg-gradient-to-r from-cyan-500 via-violet-500 to-teal-500 rounded-2xl text-white"
              >
                Generate Image
              </button>
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