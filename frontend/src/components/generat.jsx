import { useState, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Generate({ text, selectedType }) {
  const [uiState, setUiState] = useState("idle"); // idle | loading | results
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [slideImages, setSlideImages] = useState({}); // { 0: "url", 1: "url", ... }
  const [failedImages, setFailedImages] = useState({}); // track broken images

  // Video builder state
  const [videoBuildState, setVideoBuildState] = useState("idle"); // idle | building | done | error
  const [videoBuildStep, setVideoBuildStep] = useState("");
  const [videoBuildProgress, setVideoBuildProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);

  // Carousel builder state
  const [carouselBuildState, setCarouselBuildState] = useState("idle"); // idle | building | done | error
  const [carouselBuildStep, setCarouselBuildStep] = useState("");
  const [carouselBuildProgress, setCarouselBuildProgress] = useState(0);
  const [carouselZipUrl, setCarouselZipUrl] = useState(null);

  const loadingSteps = [
    "Analyzing content structure...",
    "Identifying key messages...",
    "Creating visual framework...",
    "Generating script/slides...",
    "Optimizing for engagement...",
    "Finalizing visual plan...",
  ];

  // Fetch images for each slide using SerpAPI backend proxy
  const fetchSlideImages = async (slides) => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
    const images = {};
    await Promise.all(
      slides.map(async (slide, i) => {
        const query = slide.imageQuery || slide.headline || "";
        if (!query) return;
        try {
          const res = await fetch(
            `${backendUrl}/api/images/search?q=${encodeURIComponent(query)}&num=1`
          );
          const data = await res.json();
          if (data.success && data.images?.[0]?.original) {
            images[i] = data.images[0].original;
          } else if (data.success && data.images?.[0]?.thumbnail) {
            images[i] = data.images[0].thumbnail;
          }
        } catch {
          // silently skip
        }
      })
    );
    setSlideImages(images);
  };

  const handleGenerate = async () => {
    if (!text?.trim() || !selectedType) return;

    setUiState("loading");
    setError(null);
    setResult(null);
    setLoadingStep(0);
    setLoadingProgress(0);

    // Animate progress bar while waiting
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingSteps.length) {
        setLoadingStep(step);
        setLoadingProgress(Math.round(((step + 1) / loadingSteps.length) * 100));
      }
    }, 2000);

    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

    try {
      const res = await fetch(`${backendUrl}/api/media/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, type: selectedType }),
      });

      const data = await res.json();
      clearInterval(interval);
      if (!res.ok || !data.success) throw new Error(data.error || "Generation failed");

      setLoadingProgress(100);
      setLoadingStep(loadingSteps.length - 1);

      setTimeout(() => {
        setResult(data.data);
        setUiState("results");
        // Fetch images for carousel slides
        if (selectedType === "carousel" && data.data.slides) {
          fetchSlideImages(data.data.slides);
        }
      }, 500);
    } catch (err) {
      clearInterval(interval);
      console.error("Generation error:", err);
      setError(err.message);
      setUiState("idle");
    }
  };

  const handleReset = () => {
    setUiState("idle");
    setResult(null);
    setError(null);
    setCopied(false);
    setSlideImages({});
    setFailedImages({});
    setExportStatus("");
    setVideoBuildState("idle");
    setVideoUrl(null);
    setVideoBuildProgress(0);
    setCarouselBuildState("idle");
    setCarouselZipUrl(null);
    setCarouselBuildProgress(0);
  };

  // ---- BUILD REAL VIDEO ----
  const handleBuildVideo = async () => {
    if (!result?.scenes) return;

    setVideoBuildState("building");
    setVideoBuildProgress(0);
    setVideoBuildStep("Preparing scenes...");

    // Progress steps — AI generates images per scene + TTS + assembly
    const steps = [
      { pct: 5, text: "Creating photorealistic image prompts..." },
      { pct: 10, text: "Submitting scenes to AI image generator..." },
      { pct: 15, text: "Generating voiceover for all scenes..." },
      { pct: 25, text: "AI is generating images for each scene..." },
      { pct: 35, text: "Waiting for AI images... this takes a moment" },
      { pct: 45, text: "Processing AI-generated images..." },
      { pct: 55, text: "Adding cinematic overlays to images..." },
      { pct: 65, text: "Building video clips from scenes..." },
      { pct: 75, text: "Assembling all scenes into video..." },
      { pct: 85, text: "Encoding final MP4..." },
      { pct: 90, text: "Almost done..." },
      { pct: 95, text: "Finalizing your video..." },
    ];
    let stepIdx = 0;
    const progressInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        setVideoBuildProgress(steps[stepIdx].pct);
        setVideoBuildStep(steps[stepIdx].text);
        stepIdx++;
      }
    }, 12000);

    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

    try {
      const res = await fetch(`${backendUrl}/api/media/build-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: result.title || "AutoPoster Video",
          scenes: result.scenes,
          musicSuggestion: result.musicSuggestion || "",
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setVideoBuildProgress(100);
      setVideoBuildStep("Video ready!");
      setVideoBuildState("done");
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Video build error:", err);
      setVideoBuildStep(err.message);
      setVideoBuildState("error");
    }
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${(result?.title || "video").replace(/[^a-zA-Z0-9]/g, "_")}.mp4`;
    a.click();
  };

  // ---- BUILD REAL CAROUSEL ----
  const handleBuildCarousel = async () => {
    if (!result?.slides) return;

    setCarouselBuildState("building");
    setCarouselBuildProgress(0);
    setCarouselBuildStep("Preparing slides...");

    const steps = [
      { pct: 5, text: "Creating image prompts for each slide..." },
      { pct: 15, text: "Submitting to AI image generator..." },
      { pct: 30, text: "AI is generating slide backgrounds..." },
      { pct: 45, text: "Waiting for AI images..." },
      { pct: 60, text: "Adding text overlays and branding..." },
      { pct: 75, text: "Building slide images..." },
      { pct: 85, text: "Packaging carousel ZIP..." },
      { pct: 95, text: "Almost done..." },
    ];
    let stepIdx = 0;
    const progressInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        setCarouselBuildProgress(steps[stepIdx].pct);
        setCarouselBuildStep(steps[stepIdx].text);
        stepIdx++;
      }
    }, 10000);

    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    const backendUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

    try {
      const res = await fetch(`${backendUrl}/api/media/build-carousel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: result.title || "Carousel",
          slides: result.slides,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setCarouselZipUrl(url);
      setCarouselBuildProgress(100);
      setCarouselBuildStep("Carousel ready!");
      setCarouselBuildState("done");
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Carousel build error:", err);
      setCarouselBuildStep(err.message);
      setCarouselBuildState("error");
    }
  };

  const handleDownloadCarousel = () => {
    if (!carouselZipUrl) return;
    const a = document.createElement("a");
    a.href = carouselZipUrl;
    a.download = `${(result?.title || "carousel").replace(/[^a-zA-Z0-9]/g, "_")}_carousel.zip`;
    a.click();
  };

  const [exportStatus, setExportStatus] = useState("");

  // ---- EXPORT: Copy formatted text to clipboard (Canva) ----
  const handleExportCanva = () => {
    if (!result) return;
    let content = "";
    if (selectedType === "carousel" && result.slides) {
      content = `CAROUSEL: ${result.title || "Untitled"}\n${"=".repeat(40)}\n\n`;
      result.slides.forEach((s) => {
        content += `--- SLIDE ${s.slideNumber} ---\n`;
        content += `HEADLINE: ${s.headline}\n`;
        content += `BODY: ${s.body}\n`;
        content += `DESIGN: ${s.designNote || ""}\n\n`;
      });
    } else if (selectedType === "video" && result.scenes) {
      content = `VIDEO SCRIPT: ${result.title || "Untitled"}\nDuration: ${result.duration || "N/A"} | Format: ${result.format || "9:16"}\n${"=".repeat(40)}\n\n`;
      result.scenes.forEach((s) => {
        content += `--- SCENE ${s.sceneNumber} (${s.type}) [${s.duration}] ---\n`;
        content += `NARRATION: ${s.narration}\n`;
        content += `VISUAL: ${s.visualDirection}\n`;
        if (s.textOverlay) content += `TEXT OVERLAY: ${s.textOverlay}\n`;
        content += `TRANSITION: ${s.transition}\n\n`;
      });
    }
    if (result.hashtags?.length) {
      content += `HASHTAGS: ${result.hashtags.map((t) => "#" + t.replace(/^#/, "")).join(" ")}\n`;
    }
    navigator.clipboard.writeText(content).then(() => {
      setExportStatus("canva");
      setTimeout(() => setExportStatus(""), 2500);
    });
  };

  // ---- EXPORT: Download .srt / .txt for CapCut ----
  const handleExportCapcut = () => {
    if (!result) return;
    let content = "";
    if (selectedType === "video" && result.scenes) {
      // SRT-like format for CapCut import
      let elapsed = 0;
      result.scenes.forEach((s, i) => {
        const dur = parseInt(s.duration) || 5;
        const start = formatSRT(elapsed);
        elapsed += dur;
        const end = formatSRT(elapsed);
        content += `${i + 1}\n${start} --> ${end}\n${s.narration}\n\n`;
      });
    } else if (selectedType === "carousel" && result.slides) {
      result.slides.forEach((s) => {
        content += `[Slide ${s.slideNumber}]\n${s.headline}\n${s.body}\n\n`;
      });
    }
    downloadFile(
      content,
      `${(result.title || "script").replace(/[^a-zA-Z0-9]/g, "_")}.${selectedType === "video" ? "srt" : "txt"}`,
      "text/plain"
    );
    setExportStatus("capcut");
    setTimeout(() => setExportStatus(""), 2500);
  };

  // ---- EXPORT: Download PDF (print-ready HTML) ----
  const handleExportPDF = () => {
    if (!result) return;
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${result.title || "Visual Plan"}</title>
<style>body{font-family:Inter,Arial,sans-serif;background:#fff;color:#1a1a2e;padding:40px;max-width:800px;margin:auto}
h1{color:#00C2FF;border-bottom:3px solid #00C2FF;padding-bottom:10px}
h2{color:#7B61FF;margin-top:30px}
.slide,.scene{background:#f8f9fa;border-radius:12px;padding:20px;margin:16px 0;border-left:4px solid #00C2FF}
.slide h3,.scene h3{margin:0 0 8px;color:#1a1a2e}
.meta{color:#666;font-size:13px;margin-top:6px}
.hashtags{margin-top:20px;color:#00C2FF}
.footer{margin-top:40px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee;padding-top:20px}
</style></head><body>`;

    html += `<h1>${result.title || "Visual Plan"}</h1>`;

    if (selectedType === "carousel" && result.slides) {
      html += `<p style="color:#666">${result.slides.length} slides | ${result.estimatedEngagement || ""}</p>`;
      html += `<h2>Carousel Slides</h2>`;
      result.slides.forEach((s) => {
        html += `<div class="slide"><h3>Slide ${s.slideNumber}: ${s.headline}</h3>`;
        html += `<p>${s.body}</p>`;
        html += `<p class="meta"><strong>Design:</strong> ${s.designNote || ""}</p></div>`;
      });
    } else if (selectedType === "video" && result.scenes) {
      html += `<p style="color:#666">Duration: ${result.duration || "N/A"} | Format: ${result.format || "9:16"} | ${result.estimatedEngagement || ""}</p>`;
      html += `<h2>Video Script</h2>`;
      result.scenes.forEach((s) => {
        html += `<div class="scene"><h3>Scene ${s.sceneNumber}: ${s.type} (${s.duration})</h3>`;
        html += `<p><strong>Narration:</strong> "${s.narration}"</p>`;
        html += `<p><strong>Visual:</strong> ${s.visualDirection}</p>`;
        if (s.textOverlay) html += `<p><strong>Text Overlay:</strong> ${s.textOverlay}</p>`;
        html += `<p class="meta">Transition: ${s.transition}</p></div>`;
      });
      if (result.musicSuggestion) {
        html += `<h2>Music</h2><p>${result.musicSuggestion}</p>`;
      }
    }

    if (result.hashtags?.length) {
      html += `<p class="hashtags"><strong>Hashtags:</strong> ${result.hashtags.map((t) => "#" + t.replace(/^#/, "")).join(" ")}</p>`;
    }
    html += `<div class="footer">Generated by AutoPoster Media Companion</div></body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);

    setExportStatus("pdf");
    setTimeout(() => setExportStatus(""), 2500);
  };

  // helpers
  const formatSRT = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(Math.floor(sec % 60)).padStart(2, "0");
    return `${h}:${m}:${s},000`;
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!result) return;
    let textContent = "";
    if (selectedType === "video" && result.scenes) {
      textContent = result.scenes
        .map(
          (s) =>
            `Scene ${s.sceneNumber} (${s.type} - ${s.duration})\nNarration: ${s.narration}\nVisual: ${s.visualDirection}\nText Overlay: ${s.textOverlay || "—"}\nTransition: ${s.transition}`
        )
        .join("\n\n");
    } else if (result.slides) {
      textContent = result.slides
        .map(
          (s) =>
            `Slide ${s.slideNumber}\nHeadline: ${s.headline}\nBody: ${s.body}\nDesign: ${s.designNote || ""}`
        )
        .join("\n\n");
    }
    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ==================== RENDER ==================== */
  return (
    <>
      {/* ================= IDLE — Generate Button ================= */}
      {uiState === "idle" && (
        <div className="text-center mb-8 slide-up">
          {error && (
            <div className="max-w-md mx-auto mb-4 p-4 bg-red-400/10 border border-red-400/30 rounded-2xl text-red-400 text-sm">
              <i className="fa-solid fa-circle-exclamation mr-2" />
              {error}
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={!text?.trim() || !selectedType}
            className="px-12 py-4 gradient-accent rounded-3xl text-white font-bold text-xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-magic-wand-sparkles mr-3" />
            Generate Visual Plan
          </button>
          <p className="text-gray-400 mt-4">
            {!selectedType
              ? "Select an output type above first"
              : !text?.trim()
              ? "Enter your post content in Step 1"
              : "This may take 10-15 seconds to process your content"}
          </p>
        </div>
      )}

      {/* ================= LOADING ================= */}
      {uiState === "loading" && (
        <div className="glass-effect rounded-3xl p-12 mb-8 text-center max-w-7xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-cyan-400/20 flex items-center justify-center pulse-glow">
            <i className="fa-solid fa-brain text-2xl text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">AI is Creating Your Visual Plan</h3>
          <p className="text-gray-400 mb-6">Analyzing your content and generating the perfect visual story structure...</p>
          <div className="max-w-md mx-auto">
            <div className="bg-black/30 rounded-full h-2 mb-4">
              <div
                className="gradient-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{loadingSteps[loadingStep]}</span>
              <span>{loadingProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESULTS — Split View ================= */}
      {uiState === "results" && result && (
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Split View: Left (Script) + Right (Storyboard) */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* ---- LEFT PANEL: Script / Outline ---- */}
            <div className="glass-effect rounded-3xl p-8 bounce-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  {selectedType === "video" ? (
                    <i className="fa-solid fa-video text-cyan-400 mr-3" />
                  ) : (
                    <i className="fa-solid fa-images text-violet-400 mr-3" />
                  )}
                  <span>{selectedType === "video" ? "Video Script" : "Carousel Slides"}</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-black/30 rounded-xl text-gray-400 hover:text-white transition-colors"
                    title="Copy script"
                  >
                    <i className={`fa-solid ${copied ? "fa-check text-green-400" : "fa-copy"}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
                {/* VIDEO scenes */}
                {selectedType === "video" &&
                  result.scenes?.map((scene, i) => (
                    <div
                      key={i}
                      className="script-line bg-black/20 rounded-2xl p-4 border border-gray-700/50"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                            {scene.sceneNumber || i + 1}
                          </div>
                          <span className="text-cyan-400 font-semibold text-sm uppercase">{scene.type}</span>
                        </div>
                        <span className="text-gray-400 text-xs">{scene.duration}</span>
                      </div>
                      <p className="text-white mb-3">"{scene.narration}"</p>
                      <div className="text-gray-400 text-sm flex items-center">
                        <i className="fa-solid fa-camera mr-2" />
                        {scene.visualDirection}
                      </div>
                    </div>
                  ))}

                {/* CAROUSEL slides */}
                {selectedType === "carousel" &&
                  result.slides?.map((slide, i) => (
                    <div
                      key={i}
                      className="script-line bg-black/20 rounded-2xl p-4 border border-gray-700/50"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-violet-400/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                            {slide.slideNumber || i + 1}
                          </div>
                          <span className="text-violet-400 font-semibold">Slide {slide.slideNumber || i + 1}</span>
                        </div>
                      </div>
                      {slideImages[i] && (
                        <img
                          src={slideImages[i]}
                          alt={slide.headline}
                          className="w-full h-32 rounded-xl object-cover mb-3"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      )}
                      <h4 className="text-white font-semibold mb-2">{slide.headline}</h4>
                      <p className="text-gray-300 mb-3 whitespace-pre-line">{slide.body}</p>
                      <div className="text-gray-400 text-sm flex items-center">
                        <i className="fa-solid fa-palette mr-2" />
                        {slide.designNote}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Bottom info bar */}
              {selectedType === "video" ? (
                <div className="mt-6 p-4 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
                  <div className="flex items-center space-x-2 text-cyan-400 text-sm font-medium mb-2">
                    <i className="fa-solid fa-clock" />
                    <span>Estimated Duration: {result.duration || "45-60 seconds"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-cyan-400 text-sm">
                    <i className="fa-solid fa-bullseye" />
                    <span>Optimized for Instagram Reels, TikTok, YouTube Shorts</span>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-violet-400/10 rounded-2xl border border-violet-400/20">
                  <div className="flex items-center space-x-2 text-violet-400 text-sm font-medium mb-2">
                    <i className="fa-solid fa-image" />
                    <span>{result.slides?.length || 0} slides generated</span>
                  </div>
                  <div className="flex items-center space-x-2 text-violet-400 text-sm">
                    <i className="fa-solid fa-mobile-alt" />
                    <span>Optimized for LinkedIn & Instagram carousels</span>
                  </div>
                </div>
              )}
            </div>

            {/* ---- RIGHT PANEL: Visual Storyboard ---- */}
            <div className="glass-effect rounded-3xl p-8 bounce-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <i className="fa-solid fa-film text-violet-400 mr-3" />
                  Visual Storyboard
                </h3>
              </div>

              <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
                {/* VIDEO storyboard frames */}
                {selectedType === "video" &&
                  result.scenes?.map((scene, i) => (
                    <div
                      key={i}
                      className="storyboard-card bg-black/20 rounded-2xl p-4 border border-gray-700/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-violet-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-play text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">Scene {scene.sceneNumber || i + 1}</span>
                            <span className="text-gray-400 text-xs">{scene.duration}</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-1 truncate">{scene.narration}</p>
                          <p className="text-gray-400 text-xs truncate">{scene.visualDirection}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* CAROUSEL storyboard frames */}
                {selectedType === "carousel" &&
                  result.slides?.map((slide, i) => (
                    <div
                      key={i}
                      className="storyboard-card bg-black/20 rounded-2xl p-4 border border-gray-700/50"
                    >
                      <div className="flex items-center space-x-4">
                        {slideImages[i] && !failedImages[i] ? (
                          <img
                            src={slideImages[i]}
                            alt={slide.headline}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                            onError={() => setFailedImages((prev) => ({ ...prev, [i]: true }))}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-violet-400/20 to-teal-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-image text-violet-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">Slide {slide.slideNumber || i + 1}</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-1 font-medium truncate">{slide.headline}</p>
                          <p className="text-gray-400 text-xs truncate">{slide.designNote}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Bottom info bar */}
              <div className="mt-6 p-4 bg-violet-400/10 rounded-2xl border border-violet-400/20">
                <div className="flex items-center space-x-2 text-violet-400 text-sm font-medium mb-2">
                  <i className="fa-solid fa-image" />
                  <span>
                    {selectedType === "video"
                      ? `${result.scenes?.length || 0} scenes generated`
                      : `${result.slides?.length || 0} slides generated`}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-violet-400 text-sm">
                  <i className="fa-solid fa-mobile-alt" />
                  <span>Optimized for 9:16 mobile format</span>
                </div>
              </div>
            </div>
          </div>

          {/* Music suggestion (video only) */}
          {selectedType === "video" && result.musicSuggestion && (
            <div className="glass-effect rounded-2xl p-6">
              <h5 className="text-sm font-medium text-cyan-400 mb-2">
                <i className="fa-solid fa-music mr-2" />
                Music Suggestion
              </h5>
              <p className="text-gray-300">{result.musicSuggestion}</p>
            </div>
          )}

          {/* Hashtags */}
          {result.hashtags?.length > 0 && (
            <div className="glass-effect rounded-3xl p-6">
              <h5 className="text-sm font-medium text-cyan-400 mb-3">
                <i className="fa-solid fa-hashtag mr-2" />
                Suggested Hashtags
              </h5>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-cyan-400/10 text-cyan-400 rounded-full text-sm">
                    #{tag.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Engagement estimate */}
          {result.estimatedEngagement && (
            <div className="glass-effect rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm">
                <i className="fa-solid fa-chart-line text-cyan-400 mr-2" />
                Estimated engagement: <span className="text-white font-medium">{result.estimatedEngagement}</span>
              </p>
            </div>
          )}

          {/* ---- BUILD REAL CAROUSEL (carousel only) ---- */}
          {selectedType === "carousel" && result.slides && (
            <div className="glass-effect rounded-3xl p-8 border border-violet-400/20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-violet-400/20 to-teal-400/20 flex items-center justify-center">
                  {carouselBuildState === "done" ? (
                    <i className="fa-solid fa-circle-check text-3xl text-green-400" />
                  ) : carouselBuildState === "building" ? (
                    <i className="fa-solid fa-images text-3xl text-violet-400 animate-pulse" />
                  ) : (
                    <i className="fa-solid fa-wand-magic-sparkles text-3xl text-violet-400" />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {carouselBuildState === "done"
                    ? "Your Carousel is Ready!"
                    : carouselBuildState === "building"
                    ? "Building Your Carousel..."
                    : "Build Real Carousel Images"}
                </h3>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  {carouselBuildState === "done"
                    ? "AI-generated backgrounds + professional text overlay — ready to post"
                    : carouselBuildState === "building"
                    ? carouselBuildStep
                    : carouselBuildState === "error"
                    ? carouselBuildStep
                    : "Generate stunning AI backgrounds for each slide, overlay your headlines and body text, and download ready-to-post carousel images"}
                </p>

                {/* Progress bar */}
                {carouselBuildState === "building" && (
                  <div className="max-w-md mx-auto mb-6">
                    <div className="bg-black/30 rounded-full h-2.5 mb-3">
                      <div
                        className="h-2.5 rounded-full transition-all duration-1000"
                        style={{
                          width: `${carouselBuildProgress}%`,
                          background: "linear-gradient(90deg, #8B5CF6, #06B6D4)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{carouselBuildStep}</span>
                      <span>{carouselBuildProgress}%</span>
                    </div>
                  </div>
                )}

                {/* Done — download */}
                {carouselBuildState === "done" && carouselZipUrl && (
                  <div className="max-w-md mx-auto mb-6">
                    <div className="p-6 bg-green-400/10 border border-green-400/30 rounded-2xl mb-4">
                      <i className="fa-solid fa-file-zipper text-green-400 text-4xl mb-3" />
                      <p className="text-green-400 font-medium">{result.slides?.length} slide images generated</p>
                      <p className="text-gray-400 text-sm mt-1">1080×1080px — optimized for LinkedIn & Instagram</p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleDownloadCarousel}
                        className="px-8 py-3 rounded-2xl text-white font-semibold hover:opacity-90 transition-all"
                        style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                      >
                        <i className="fa-solid fa-download mr-2" />
                        Download ZIP
                      </button>
                      <button
                        onClick={() => { setCarouselBuildState("idle"); setCarouselZipUrl(null); }}
                        className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 transition-all"
                      >
                        <i className="fa-solid fa-redo mr-2" />
                        Rebuild
                      </button>
                    </div>
                  </div>
                )}

                {/* Build button */}
                {carouselBuildState === "idle" && (
                  <button
                    onClick={handleBuildCarousel}
                    className="px-10 py-4 rounded-3xl text-white font-bold text-lg hover:opacity-90 transition-all transform hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                  >
                    <i className="fa-solid fa-wand-magic-sparkles mr-3" />
                    Generate Carousel Images
                  </button>
                )}

                {/* Error */}
                {carouselBuildState === "error" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-xl text-red-400 text-sm max-w-md mx-auto">
                      <i className="fa-solid fa-circle-exclamation mr-2" />
                      {carouselBuildStep}
                    </div>
                    <button
                      onClick={handleBuildCarousel}
                      className="px-8 py-3 rounded-2xl text-white font-semibold hover:opacity-90 transition-all"
                      style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                    >
                      <i className="fa-solid fa-redo mr-2" />
                      Retry
                    </button>
                  </div>
                )}

                {/* Pipeline info */}
                {carouselBuildState === "idle" && (
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-violet-400/20 flex items-center justify-center">
                        <i className="fa-solid fa-image text-violet-400 text-sm" />
                      </div>
                      <p className="text-gray-400 text-xs">AI Backgrounds</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-cyan-400/20 flex items-center justify-center">
                        <i className="fa-solid fa-font text-cyan-400 text-sm" />
                      </div>
                      <p className="text-gray-400 text-xs">Text Overlay</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-teal-400/20 flex items-center justify-center">
                        <i className="fa-solid fa-file-zipper text-teal-400 text-sm" />
                      </div>
                      <p className="text-gray-400 text-xs">ZIP Download</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- BUILD REAL VIDEO (video only) ---- */}
          {selectedType === "video" && result.scenes && (
            <div className="glass-effect rounded-3xl p-8 border border-cyan-400/20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 flex items-center justify-center">
                  {videoBuildState === "done" ? (
                    <i className="fa-solid fa-circle-check text-3xl text-green-400" />
                  ) : videoBuildState === "building" ? (
                    <i className="fa-solid fa-film text-3xl text-cyan-400 animate-pulse" />
                  ) : (
                    <i className="fa-solid fa-clapperboard text-3xl text-cyan-400" />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {videoBuildState === "done"
                    ? "Your Video is Ready! 🎬"
                    : videoBuildState === "building"
                    ? "Building Your Video..."
                    : "Build a Real Video"}
                </h3>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  {videoBuildState === "done"
                    ? "AI-generated voiceover + visuals assembled into a ready-to-post MP4"
                    : videoBuildState === "building"
                    ? videoBuildStep
                    : videoBuildState === "error"
                    ? videoBuildStep
                    : "Generate voiceover (AI voice), fetch scene images, and assemble everything into a real MP4 video — all automatically"}
                </p>

                {/* Progress bar (building) */}
                {videoBuildState === "building" && (
                  <div className="max-w-md mx-auto mb-6">
                    <div className="bg-black/30 rounded-full h-2.5 mb-3">
                      <div
                        className="gradient-accent h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${videoBuildProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{videoBuildStep}</span>
                      <span>{videoBuildProgress}%</span>
                    </div>
                  </div>
                )}

                {/* Video player (done) */}
                {videoBuildState === "done" && videoUrl && (
                  <div className="max-w-2xl mx-auto mb-6">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className="w-full rounded-2xl border border-gray-700/50"
                      style={{ maxHeight: "500px" }}
                    />
                    <div className="flex justify-center gap-4 mt-4">
                      <button
                        onClick={handleDownloadVideo}
                        className="px-8 py-3 gradient-accent rounded-2xl text-white font-semibold hover:opacity-90 transition-all"
                      >
                        <i className="fa-solid fa-download mr-2" />
                        Download MP4
                      </button>
                      <button
                        onClick={() => { setVideoBuildState("idle"); setVideoUrl(null); }}
                        className="px-6 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 transition-all"
                      >
                        <i className="fa-solid fa-redo mr-2" />
                        Rebuild
                      </button>
                    </div>
                  </div>
                )}

                {/* Build button (idle) */}
                {videoBuildState === "idle" && (
                  <button
                    onClick={handleBuildVideo}
                    className="px-10 py-4 gradient-accent rounded-3xl text-white font-bold text-lg hover:opacity-90 transition-all transform hover:scale-105"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles mr-3" />
                    Generate Real Video
                  </button>
                )}

                {/* Error retry */}
                {videoBuildState === "error" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-xl text-red-400 text-sm max-w-md mx-auto">
                      <i className="fa-solid fa-circle-exclamation mr-2" />
                      {videoBuildStep}
                    </div>
                    <button
                      onClick={handleBuildVideo}
                      className="px-8 py-3 gradient-accent rounded-2xl text-white font-semibold hover:opacity-90 transition-all"
                    >
                      <i className="fa-solid fa-redo mr-2" />
                      Retry
                    </button>
                  </div>
                )}

                {/* Pipeline info */}
                {videoBuildState === "idle" && (
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-cyan-400/20 flex items-center justify-center">
                        <i className="fa-solid fa-microphone text-cyan-400 text-sm" />
                      </div>
                      <p className="text-gray-400 text-xs">AI Voice</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-violet-400/20 flex items-center justify-center">
                        <i className="fa-solid fa-images text-violet-400 text-sm" />
                      </div>
                      <p className="text-gray-400 text-xs">Scene Images</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-teal-400/20 flex items-center justify-center">
                        <i className="fa-solid fa-film text-teal-400 text-sm" />
                      </div>
                      <p className="text-gray-400 text-xs">MP4 Export</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- EXPORT OPTIONS ---- */}
          <div className="glass-effect rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Export Your Visual Plan</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <button
                onClick={handleExportCanva}
                className="bg-black/20 border border-gray-700/50 rounded-2xl p-6 text-center hover:border-cyan-400/50 transition-all group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-400/30 transition-colors">
                  {exportStatus === "canva" ? (
                    <i className="fa-solid fa-check text-green-400" />
                  ) : (
                    <i className="fa-solid fa-upload text-cyan-400" />
                  )}
                </div>
                <h4 className="text-white font-semibold mb-2">
                  {exportStatus === "canva" ? "Copied!" : "Export to Canva 📤"}
                </h4>
                <p className="text-gray-400 text-sm">Copy all slide/script text to clipboard for Canva</p>
              </button>

              <button
                onClick={handleExportCapcut}
                className="bg-black/20 border border-gray-700/50 rounded-2xl p-6 text-center hover:border-violet-400/50 transition-all group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-violet-400/20 flex items-center justify-center group-hover:bg-violet-400/30 transition-colors">
                  {exportStatus === "capcut" ? (
                    <i className="fa-solid fa-check text-green-400" />
                  ) : (
                    <i className="fa-solid fa-video text-violet-400" />
                  )}
                </div>
                <h4 className="text-white font-semibold mb-2">
                  {exportStatus === "capcut" ? "Downloaded!" : "Export to CapCut 🎥"}
                </h4>
                <p className="text-gray-400 text-sm">
                  {selectedType === "video"
                    ? "Download .srt subtitle file for CapCut import"
                    : "Download formatted text with all slides"}
                </p>
              </button>

              <button
                onClick={handleExportPDF}
                className="bg-black/20 border border-gray-700/50 rounded-2xl p-6 text-center hover:border-teal-400/50 transition-all group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-teal-400/20 flex items-center justify-center group-hover:bg-teal-400/30 transition-colors">
                  {exportStatus === "pdf" ? (
                    <i className="fa-solid fa-check text-green-400" />
                  ) : (
                    <i className="fa-solid fa-file-pdf text-teal-400" />
                  )}
                </div>
                <h4 className="text-white font-semibold mb-2">
                  {exportStatus === "pdf" ? "Opening..." : "Download PDF"}
                </h4>
                <p className="text-gray-400 text-sm">Print or save as PDF with full visual guide</p>
              </button>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-black/30 rounded-2xl text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 transition-all"
              >
                <i className="fa-solid fa-plus mr-2" />
                Create Another Visual Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
