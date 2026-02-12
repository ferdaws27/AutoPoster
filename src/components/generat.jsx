import { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Generate({ text }) {
  const [uiState, setUiState] = useState("idle"); // idle | loading | results
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(
    "Analyzing content structure..."
  );

  /* ================= LOADING SIMULATION ================= */
  useEffect(() => {
    if (uiState !== "loading") return;

    let value = 0;
    const steps = [
      "Analyzing content structure...",
      "Extracting key ideas...",
      "Designing visual narrative...",
      "Building storyboard...",
      "Finalizing visual plan...",
    ];

    const interval = setInterval(() => {
      value = Math.min(value + 10, 100);
      setProgress(value);
      setCurrentStep(
        steps[Math.min(Math.floor(value / 20), steps.length - 1)]
      );

      if (value === 100) {
        clearInterval(interval);
        setTimeout(() => setUiState("results"), 400);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [uiState]);

  const handleGenerate = () => {
    if (!text?.trim()) return;
    setProgress(0);
    setUiState("loading");
  };

  const handleReset = () => {
    setUiState("idle");
    setProgress(0);
  };

  return (
    <>
      {/* ================= IDLE ================= */}
      {uiState === "idle" && (
        <div className="text-center mb-8 slide-up">
          <button
            onClick={handleGenerate}
            disabled={!text?.trim()}
            className="px-12 py-4 gradient-accent rounded-3xl text-white font-bold text-xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-magic-wand-sparkles mr-3"></i>
            Generate Visual Plan
          </button>
          <p className="text-gray-400 mt-4">
            This may take 10–15 seconds to process your content
          </p>
        </div>
      )}

      {/* ================= LOADING ================= */}
      {uiState === "loading" && (
        <div className="glass-effect rounded-3xl p-12 mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-cyan-400/20 flex items-center justify-center pulse-glow">
            <i className="fa-solid fa-brain text-2xl text-cyan-400"></i>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            AI is Creating Your Visual Plan
          </h3>
          <p className="text-gray-400 mb-6">{currentStep}</p>

          <div className="max-w-md mx-auto">
            <div className="bg-black/30 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="gradient-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Processing</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESULTS ================= */}
      {uiState === "results" && (
        <>
          {/* SPLIT VIEW */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">

            {/* SCRIPT */}
            <div className="glass-effect rounded-3xl p-8 bounce-in">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <i className="fa-solid fa-video text-cyan-400 mr-3"></i>
                Video Script
              </h3>

              <div className="space-y-5 text-gray-300">
                <div>
                  <span className="text-cyan-400 font-semibold">Hook</span>
                  <p>Capture attention instantly with a strong opening.</p>
                </div>
                <div>
                  <span className="text-cyan-400 font-semibold">Main Content</span>
                  <p>Break key ideas into short, visual-friendly points.</p>
                </div>
                <div>
                  <span className="text-cyan-400 font-semibold">CTA</span>
                  <p>Encourage likes, comments or follows.</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 text-sm text-cyan-400">
                <i className="fa-solid fa-clock mr-2"></i>
                Estimated duration: 45–60 seconds
              </div>
            </div>

            {/* STORYBOARD */}
            <div className="glass-effect rounded-3xl p-8 bounce-in">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <i className="fa-solid fa-storyboard text-violet-400 mr-3"></i>
                Visual Storyboard
              </h3>

              <ul className="space-y-3 text-gray-300">
                {[
                  "Frame 1 – Visual Hook",
                  "Frame 2 – Context",
                  "Frame 3 – Key Insight",
                  "Frame 4 – Supporting Visual",
                  "Frame 5 – Call To Action",
                ].map((frame, i) => (
                  <li
                    key={i}
                    className="p-3 bg-black/20 rounded-xl border border-gray-700/50"
                  >
                    {frame}
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-violet-400/10 rounded-2xl border border-violet-400/20 text-sm text-violet-400">
                <i className="fa-solid fa-mobile-alt mr-2"></i>
                Optimized for 9:16 mobile format
              </div>
            </div>
          </div>

          {/* EXPORT */}
          <div className="glass-effect rounded-3xl p-8 slide-up">
  <h3 className="text-2xl font-bold text-white mb-6 text-center">
    Export Your Visual Plan
  </h3>

  <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
    {[
      {
        id: "export-canva",
        icon: "fa-upload",
        title: "Export to Canva 📤",
        desc: "Open directly in Canva with pre-filled templates and text",
        color: "cyan",
      },
      {
        id: "export-capcut",
        icon: "fa-video",
        title: "Export to CapCut 🎥",
        desc: "Generate timeline with scenes, text overlays, and transitions",
        color: "violet",
      },
      {
        id: "export-pdf",
        icon: "fa-file-pdf",
        title: "Download PDF",
        desc: "Complete visual guide with script, storyboard, and notes",
        color: "teal",
      },
    ].map((item) => (
      <button
        key={item.id}
        id={item.id}
        className={`bg-black/20 border border-gray-700/50 rounded-2xl p-6 text-center transition-all group
        hover:border-${item.color}-400/50`}
      >
        <div
          className={`w-12 h-12 mx-auto mb-4 rounded-2xl bg-${item.color}-400/20 
          flex items-center justify-center transition-colors 
          group-hover:bg-${item.color}-400/30`}
        >
          <i
            className={`fa-solid ${item.icon} text-${item.color}-400`}
          ></i>
        </div>

        <h4 className="text-white font-semibold mb-2">
          {item.title}
        </h4>

        <p className="text-gray-400 text-sm">
          {item.desc}
        </p>
      </button>
    ))}
  </div>

  <div className="text-center mt-8">
    <button
      onClick={handleReset}
      className="px-8 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all"
    >
      <i className="fa-solid fa-plus mr-2"></i>
      Create Another Visual Plan
    </button>
  </div>
</div>

        </>
      )}
    </>
  );
}
