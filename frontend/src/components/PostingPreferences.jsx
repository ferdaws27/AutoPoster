import { useState, useEffect } from "react";

export default function PostingPreferences({ initialData, onChange }) {
  const [timezone, setTimezone] = useState(initialData?.timezone || "PKT (GMT+5)");
  const [maxPosts, setMaxPosts] = useState(initialData?.maxPosts || 3);
  const [autoPublish, setAutoPublish] = useState(initialData?.autoPublish || false);
  const [smartScheduling, setSmartScheduling] = useState(initialData?.smartScheduling ?? true);
  const [platformTimes, setPlatformTimes] = useState(
    initialData?.platformTimes || {
      twitter: ["09:00", "15:00", "19:00"],
      linkedin: ["08:00", "12:00", "17:00"],
      medium: ["10:00", "14:00", ""],
    }
  );

  // Notify parent on change
  useEffect(() => {
    if (onChange) {
      onChange({ timezone, maxPosts, autoPublish, smartScheduling, platformTimes });
    }
  }, [timezone, maxPosts, autoPublish, smartScheduling, platformTimes]);

  const updatePlatformTime = (platform, index, value) => {
    setPlatformTimes((prev) => {
      const updated = { ...prev, [platform]: [...prev[platform]] };
      updated[platform][index] = value;
      return updated;
    });
  };

  return (
    <div
      id="posting-preferences"
      className="setting-card glass-effect rounded-3xl p-8 animate-slide-in"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-teal-400/20 flex items-center justify-center">
          <i className="fa-solid fa-clock text-teal-400"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Posting Preferences
          </h2>
          <p className="text-gray-400">
            Configure your posting schedule and limits
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* TIME ZONE & MAX POSTS */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-white font-semibold">
              Default Time Zone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full input-field rounded-2xl p-4 text-white bg-black/20"
            >
              <option>UTC (GMT+0)</option>
              <option>EST (GMT-5)</option>
              <option>PST (GMT-8)</option>
              <option>PKT (GMT+5)</option>
              <option>CET (GMT+1)</option>
              <option>JST (GMT+9)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-white font-semibold">
              Max Posts Per Day
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={maxPosts}
                onChange={(e) => setMaxPosts(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-medium w-8 text-center">
                {maxPosts}
              </span>
            </div>
          </div>
        </div>

        {/* OPTIMAL TIMES */}
        <div className="space-y-4">
          <label className="block text-white font-semibold text-lg">
            Optimal Posting Times
          </label>
          <p className="text-gray-400 text-sm">
            Set your preferred posting times for each platform
          </p>

          <div className="grid gap-4">
            <PlatformTime
              icon="fa-twitter"
              color="text-blue-400"
              name="Twitter"
              times={platformTimes.twitter}
              onTimeChange={(i, v) => updatePlatformTime("twitter", i, v)}
            />
            <PlatformTime
              icon="fa-linkedin"
              color="text-violet-400"
              name="LinkedIn"
              times={platformTimes.linkedin}
              onTimeChange={(i, v) => updatePlatformTime("linkedin", i, v)}
            />
            <PlatformTime
              icon="fa-medium"
              color="text-teal-400"
              name="Medium"
              times={platformTimes.medium}
              onTimeChange={(i, v) => updatePlatformTime("medium", i, v)}
            />
          </div>
        </div>

        {/* TOGGLES */}
        <div className="grid grid-cols-2 gap-6">
          <ToggleCard
            title="Auto-publish"
            subtitle="Publish posts automatically"
            active={autoPublish}
            onToggle={() => setAutoPublish(!autoPublish)}
          />
          <ToggleCard
            title="Smart Scheduling"
            subtitle="AI-optimized posting times"
            active={smartScheduling}
            onToggle={() => setSmartScheduling(!smartScheduling)}
          />
        </div>
      </div>
    </div>
  );
}

/* ====== SUB COMPONENTS ====== */

function PlatformTime({ icon, color, name, times, onTimeChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
      <div className="flex items-center space-x-3">
        <i className={`fa-brands ${icon} ${color}`}></i>
        <span className="text-white font-medium">{name}</span>
      </div>
      <div className="flex items-center space-x-3">
        {times.map((t, i) => (
          <input
            key={i}
            type="time"
            value={t}
            onChange={(e) => onTimeChange(i, e.target.value)}
            className="input-field rounded-xl px-3 py-2 text-white text-sm bg-black/30 [color-scheme:dark]"
          />
        ))}
      </div>
    </div>
  );
}

function ToggleCard({ title, subtitle, active, onToggle }) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
      <div
        onClick={onToggle}
        className={`toggle-switch cursor-pointer ${active ? "active" : ""}`}
      >
        <div className="toggle-knob"></div>
      </div>
    </div>
  );
}
