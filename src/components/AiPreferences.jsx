import { useEffect, useRef, useState } from "react";

export default function AiPreferences() {
  const [tone, setTone] = useState(60);
  const sliderRef = useRef(null);

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

  /* ===== MODEL SELECT ===== */
  useEffect(() => {
    const options = document.querySelectorAll(".model-option");

    options.forEach((option) => {
      option.onclick = () => {
        options.forEach((opt) => {
          opt.classList.remove("border-cyan-400/50");
          const dot = opt.querySelector(".model-dot");
          dot.classList.remove("bg-cyan-400");
          dot.classList.add("border-gray-400");
        });

        option.classList.add("border-cyan-400/50");
        const activeDot = option.querySelector(".model-dot");
        activeDot.classList.add("bg-cyan-400");
        activeDot.classList.remove("border-gray-400");
      };
    });
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
            {/* DeepSeek */}
            <ModelCard
              title="DeepSeek"
              description="Advanced reasoning and creativity"
              level={5}
              color="cyan"
              active
            />

            {/* LLaMA */}
            <ModelCard
              title="LLaMA"
              description="Balanced performance and speed"
              level={4}
              color="violet"
            />

            {/* Mistral */}
            <ModelCard
              title="Mistral"
              description="Fast and efficient processing"
              level={3}
              color="teal"
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
      <option
        className="bg-[#0E1116] text-white"
        defaultValue
      >
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
      <option
        className="bg-[#0E1116] text-white"
        defaultValue
      >
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

      </div>
    </div>
  );
}

/* ===== MODEL CARD ===== */

function ModelCard({ title, description, level, color, active }) {
  return (
    <div
      className={`model-option p-4 bg-black/20 rounded-2xl border cursor-pointer transition-all ${
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
