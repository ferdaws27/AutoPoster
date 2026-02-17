import { useEffect, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default function QuoteTemplate() {
  const [quote, setQuote] = useState("");
  const [charCount, setCharCount] = useState(quote.length);
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "twitter",
    "linkedin",
    "medium",
  ]);
  const [loading, setLoading] = useState(false);
  const [variationsVisible, setVariationsVisible] = useState(false);
  const [brandEnabled, setBrandEnabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [calloutOpen, setCalloutOpen] = useState(false);
  const [calloutMessage, setCalloutMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info"); // "info" | "warning" | "success"

  const maxLength = 500;

  const sampleVariations = [
    { text: quote, tone: "motivational", platform: "Twitter", engagement: "High" },
    { text: quote, tone: "reflective", platform: "LinkedIn", engagement: "Medium" },
    { text: quote, tone: "witty", platform: "Medium", engagement: "Medium" },
  ];

  useEffect(() => {
    setCharCount(quote.length);
  }, [quote]);

  const togglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
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
    setTimeout(() => setCalloutOpen(false), 3000);
  };

  const generateVariations = () => {
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

    setTimeout(() => {
      setLoading(false);
      setVariationsVisible(true);
      // Plus de toast "Variations generated"
    }, 2500);
  };

  const clearAll = () => {
    setQuote("");
    setVariationsVisible(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showCallout("Copied to clipboard!");
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
      url = `https://medium.com/p/new?content=${encodeURIComponent(text)}`;
    }
    window.open(url, "_blank");
    showCallout(`Posting to ${platform}`);
  };

  const openVisual = (text) => {
    setModalText(text);
    setModalOpen(true);
  };

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="p-8 space-y-16">
        {/* HEADER */}
        <div className="mb-12 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-accent flex items-center justify-center">
            <i className="fa-solid fa-quote-right text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Quote Template Generator — Turn Words Into Impact
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Transform any quote into multiple ready-to-share post examples
          </p>
          <p className="text-gray-400">
            Styled perfectly for Twitter, LinkedIn, and Medium
          </p>
        </div>

        {/* SECTION: Quote Input */}
<div id="quote-input-section" className="max-w-4xl mx-auto mb-12 slide-up">
  <div className="glass-effect rounded-3xl p-8">
    <div className="relative">
      <textarea
        id="quote-input"
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        maxLength={500}
        className="quote-input w-full h-40 bg-transparent text-white text-lg placeholder-gray-400 rounded-2xl p-6 font-medium leading-relaxed"
        placeholder="Enter your quote or thought…"
      ></textarea>
      <div
        className="absolute bottom-4 right-6 quote-counter text-gray-400"
        id="char-counter"
      >
        {quote.length}/500
      </div>
    </div>

    {/* Platform Toggles */}
    <div className="flex items-center justify-center space-x-6 mt-8 mb-6">
      {["twitter", "linkedin", "medium"].map((platform) => (
        <button
          key={platform}
          onClick={() => togglePlatform(platform)}
          className={`platform-toggle flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all ${
            selectedPlatforms.includes(platform) ? "active bg-cyan-400/10 text-cyan-400" : "text-gray-300 hover:text-white"
          }`}
          data-platform={platform}
        >
          <i
            className={`fa-brands ${
              platform === "twitter"
                ? "fa-x-twitter"
                : platform === "linkedin"
                ? "fa-linkedin"
                : "fa-medium"
            } text-xl`}
          ></i>
          <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
        </button>
      ))}
    </div>

    {/* Action Buttons */}
    <div className="flex items-center justify-center space-x-4">
      <button
        id="generate-btn"
        onClick={generateVariations}
        className="generate-btn px-8 py-4 rounded-2xl text-white font-bold text-lg flex items-center space-x-3 gradient-accent"
      >
        <i className="fa-solid fa-wand-magic-sparkles"></i>
        <span>Generate Variations</span>
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

       {/* SECTION: Loading State */}
<div
  id="loading-section"
  className={`max-w-6xl mx-auto mb-12 ${
    loading ? "block" : "hidden"
  }`}
>
  <div className="glass-effect rounded-3xl p-12 text-center">
    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
      <i className="fa-solid fa-brain text-cyan-400 text-2xl floating-icon"></i>
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

{/* SECTION: Variations Output Grid */}
<div
  id="variations-section"
  className={`max-w-7xl mx-auto mb-12 ${
    variationsVisible ? "block" : "hidden"
  }`}
>
  <div className="text-center mb-8">
    <h3 className="text-2xl font-bold text-white mb-2">
      Your Quote Variations
    </h3>
    <p className="text-gray-400">
      AI-generated versions optimized for each platform
    </p>
  </div>

  <div className="grid lg:grid-cols-2 gap-8" id="variations-grid">
    {sampleVariations
      .filter((v) => selectedPlatforms.includes(v.platform.toLowerCase()))
      .map((variation, index) => {
        const finalText =
          variation.text + (brandEnabled ? "\n\n— @EtkanAI" : "");
        return (
          <div key={index} className="rounded-3xl p-6 bg-white/5">
            <h4 className="text-white font-semibold mb-3">
              {variation.platform}
            </h4>
            <div className="bg-black/30 rounded-2xl p-4 mb-4">
              <p className="text-gray-200 whitespace-pre-line">{finalText}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => copyToClipboard(finalText)}
                className="flex-1 px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl"
              >
                Copy
              </button>
              <button
                onClick={() => postToPlatform(finalText, variation.platform)}
                className="flex-1 px-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-xl"
              >
                {`Post to ${variation.platform}`}
              </button>
              <button
                onClick={() => openVisual(finalText)}
                className="px-4 py-2 bg-violet-400/20 text-violet-400 rounded-xl"
              >
                Visual
              </button>
            </div>
          </div>
        );
      })}
  </div>
</div>


        {/* BRAND SIGNATURE TOGGLE */}
        <div id="brand-section" className="max-w-4xl mx-auto mb-12 slide-up">
          <div
            className={`brand-toggle rounded-2xl p-6 cursor-pointer border transition-all duration-300 ${
              brandEnabled
                ? "border-violet-400 bg-violet-400/5"
                : "border-gray-700 hover:border-violet-400/40"
            }`}
            onClick={() => setBrandEnabled(!brandEnabled)}
          >
            <div className="flex items-center justify-between">
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
            { title: "Recent Quotes", desc: "View your quote history", icon: "fa-history" },
            { title: "Save Templates", desc: "Build your quote library", icon: "fa-bookmark" },
            { title: "Style Presets", desc: "Customize quote formats", icon: "fa-palette" },
            { title: "Quote Analytics", desc: "Track quote performance", icon: "fa-chart-simple" },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => showCallout(`${item.title} opened`)}
              className="glass-effect rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer border border-cyan-400/20"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                <i className={`fa-solid ${item.icon} text-cyan-400`}></i>
              </div>
              <h4 className="text-white font-medium mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
          <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full">
            <h3 className="text-2xl text-white mb-4">Create Visual Quote</h3>
            <div className="bg-black/30 rounded-2xl p-6 mb-6 text-center">
              <p className="text-white text-lg">{modalText}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 p-3 border border-gray-600 rounded-2xl text-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 p-3 gradient-accent rounded-2xl text-white"
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALLOUT */}
      {calloutOpen && (
        <div className="fixed top-8 right-8 z-50 w-80 bg-cyan-400/20 text-cyan-400 rounded-2xl p-4 shadow-lg flex items-start space-x-3">
          <InfoCircledIcon className="w-6 h-6" />
          <span className="text-white">{calloutMessage}</span>
        </div>
      )}

      {/* RADIX TOAST */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`px-5 py-3 rounded-xl shadow-2xl border border-white/20 ${
            toastType === "warning"
              ? "bg-yellow-400/20 text-yellow-400"
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
