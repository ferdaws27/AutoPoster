import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSettings from "../hooks/useSettings";

export default function AiPreferences({ initialData, onChange }) {
  const navigate = useNavigate();
  const { voiceProfile } = useSettings();
  const [selectedModel, setSelectedModel] = useState(
    initialData?.model || "deepseek"
  );
  const [tone, setTone] = useState(initialData?.tone || 60);
  const [creativity, setCreativity] = useState(
    initialData?.creativity || "Balanced"
  );
  const [contentLength, setContentLength] = useState(
    initialData?.contentLength || "Medium (100–200 words)"
  );
  const sliderRef = useRef(null);

  // Notify parent on any change
  useEffect(() => {
    if (onChange) {
      onChange({ model: selectedModel, tone, creativity, contentLength });
    }
  }, [selectedModel, tone, creativity, contentLength]);

  /* ===== SLIDER DRAG ===== */
  useEffect(() => {
    const slider = sliderRef.current;
    const thumb = slider.querySelector(".slider-thumb");

    const onMouseMove = (e) => {
      const rect = slider.getBoundingClientRect();
      let percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      setTone(percent);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", stopDrag);
    };

    const startDrag = () => {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", stopDrag);
    };

    thumb.addEventListener("mousedown", startDrag);
    return () => thumb.removeEventListener("mousedown", startDrag);
  }, []);

  return (
    <div className="setting-card glass-effect rounded-3xl p-8 animate-slide-in">
      {/* HEADER */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-violet-400/20 flex items-center justify-center">
          <i className="fa-solid fa-brain text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Preferences</h2>
          <p className="text-gray-400">
            Customize your AI assistant behavior
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* AI MODELS */}
        <div className="space-y-4">
          <label className="block text-white font-semibold text-lg">
            AI Model
          </label>

          <div className="grid grid-cols-3 gap-4">
            <ModelCard
              title="DeepSeek"
              description="Advanced reasoning and creativity"
              level={5}
              color="cyan"
              active={selectedModel === "deepseek"}
              onClick={() => setSelectedModel("deepseek")}
            />
            <ModelCard
              title="LLaMA"
              description="Balanced performance and speed"
              level={4}
              color="violet"
              active={selectedModel === "llama"}
              onClick={() => setSelectedModel("llama")}
            />
            <ModelCard
              title="Mistral"
              description="Fast and efficient processing"
              level={3}
              color="teal"
              active={selectedModel === "mistral"}
              onClick={() => setSelectedModel("mistral")}
            />
          </div>
        </div>

        {/* TONE SLIDER */}
        <div className="space-y-4">
          <label className="block text-white font-semibold text-lg">
            Content Tone
          </label>

          <div ref={sliderRef} className="relative">
            <div className="slider-track">
              <div
                className="slider-thumb"
                style={{ left: `${tone}%` }}
              />
            </div>

            <div className="flex justify-between mt-3 text-sm">
              <span className="text-gray-400">Professional</span>
              <span className="text-cyan-400 font-medium">
                Friendly
              </span>
              <span className="text-gray-400">Casual</span>
            </div>
          </div>
        </div>

        {/* SELECTS */}
        {/* SELECTS */}
<div className="grid grid-cols-2 gap-6">
  <div className="space-y-2">
    <label className="block text-white font-semibold">
      Creativity Level
    </label>

    <select
      value={creativity}
      onChange={(e) => setCreativity(e.target.value)}
      className="
        w-full
        rounded-2xl
        p-4
        bg-black/30
        backdrop-blur-xl
        border border-white/10
        text-white
        focus:outline-none
        focus:ring-2 focus:ring-cyan-400/50
        appearance-none
      "
    >
      <option className="bg-[#0E1116] text-white">
        Conservative
      </option>
      <option className="bg-[#0E1116] text-white">
        Balanced
      </option>
      <option className="bg-[#0E1116] text-white">
        Creative
      </option>
      <option className="bg-[#0E1116] text-white">
        Experimental
      </option>
    </select>
  </div>

  <div className="space-y-2">
    <label className="block text-white font-semibold">
      Content Length
    </label>

    <select
      value={contentLength}
      onChange={(e) => setContentLength(e.target.value)}
      className="
        w-full
        rounded-2xl
        p-4
        bg-black/30
        backdrop-blur-xl
        border border-white/10
        text-white
        focus:outline-none
        focus:ring-2 focus:ring-cyan-400/50
        appearance-none
      "
    >
      <option className="bg-[#0E1116] text-white">
        Short (50–100 words)
      </option>
      <option className="bg-[#0E1116] text-white">
        Medium (100–200 words)
      </option>
      <option className="bg-[#0E1116] text-white">
        Long (200+ words)
      </option>
      <option className="bg-[#0E1116] text-white">
        Auto-adjust
      </option>
    </select>
  </div>
</div>

        {/* ACTIVE VOICE PROFILE */}
        <div className="space-y-4">
          <label className="block text-white font-semibold text-lg">
            Writing Voice
          </label>

          {voiceProfile ? (
            <div className="p-5 bg-black/20 rounded-2xl border border-cyan-400/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
                    <i className="fa-solid fa-fingerprint text-cyan-400 text-xl"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{voiceProfile.name}</h3>
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-400/10 text-green-400 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Active
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {voiceProfile.tone || "—"} · {voiceProfile.sentenceStyle || "—"} · {voiceProfile.emojiUsage || "—"} emoji
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/dashboard/Clone")}
                  className="px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white border border-gray-600 hover:border-cyan-400/50 transition-all text-sm"
                >
                  <i className="fa-solid fa-pen mr-1.5"></i>Manage
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <p className="text-cyan-400 text-xs font-medium mb-1">Hook</p>
                  <p className="text-white text-sm truncate">{voiceProfile.hookStyle || "—"}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <p className="text-violet-400 text-xs font-medium mb-1">Vocabulary</p>
                  <p className="text-white text-sm truncate">{voiceProfile.vocabularyLevel || "—"}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <p className="text-green-400 text-xs font-medium mb-1">Platform</p>
                  <p className="text-white text-sm truncate">{voiceProfile.platform || "—"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-black/20 rounded-2xl border border-gray-700/30 text-center">
              <i className="fa-solid fa-fingerprint text-3xl text-gray-600 mb-3"></i>
              <p className="text-gray-400 mb-1">No active voice profile</p>
              <p className="text-gray-500 text-sm mb-4">Clone a creator's voice or train your own for personalized AI content</p>
              <button
                onClick={() => navigate("/dashboard/Clone")}
                className="px-5 py-2.5 gradient-accent rounded-xl text-white font-medium hover:opacity-90 transition-opacity text-sm"
              >
                <i className="fa-solid fa-brain mr-2"></i>Set Up Voice
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ===== MODEL CARD ===== */

function ModelCard({ title, description, level, color, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 bg-black/20 rounded-2xl border cursor-pointer transition-all ${
        active
          ? "border-cyan-400/50"
          : "border-gray-700/50 hover:border-gray-400"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">{title}</h3>
        <div
          className={`model-dot w-4 h-4 rounded-full border-2 ${
            active
              ? "bg-cyan-400 border-cyan-400"
              : "border-gray-400"
          }`}
        />
      </div>

      <p className="text-gray-400 text-sm mb-2">{description}</p>

      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < level
                  ? `bg-${color}-400`
                  : "bg-gray-600"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs text-${color}-400`}>
          {level === 5
            ? "Premium"
            : level === 4
            ? "Standard"
            : "Basic"}
        </span>
      </div>
    </div>
  );
}
