export default function SetPreferencesStep({ preferences, setPreferences, onBack, onNext }) {
  const update = (key, value) => setPreferences((p) => ({ ...p, [key]: value }));
  const updateAI = (key, value) =>
    setPreferences((p) => ({ ...p, ai: { ...p.ai, [key]: value } }));

  return (
    <div className="glass-effect rounded-3xl p-8">
      <h2 className="text-2xl font-bold mb-2">Set Preferences</h2>
      <p className="text-gray-400 mb-6">Customize AutoPoster to match your style.</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Language */}
        <div>
          <label className="text-sm text-gray-400">Language</label>
          <select
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={preferences.language}
            onChange={(e) => update("language", e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="text-sm text-gray-400">Timezone</label>
          <input
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={preferences.timezone}
            onChange={(e) => update("timezone", e.target.value)}
            placeholder="Africa/Tunis"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="text-sm text-gray-400">Posting Frequency</label>
          <select
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={preferences.frequency}
            onChange={(e) => update("frequency", e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="3xWeek">3x / week</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/* Best Time */}
        <div>
          <label className="text-sm text-gray-400">Best Time to Post</label>
          <input
            type="time"
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={preferences.bestTime}
            onChange={(e) => update("bestTime", e.target.value)}
          />
        </div>

        {/* Tone */}
        <div className="col-span-2">
          <label className="text-sm text-gray-400">Tone</label>
          <div className="mt-2 flex gap-3">
            {["Professional", "Casual", "Friendly"].map((t) => (
              <button
                key={t}
                onClick={() => update("tone", t)}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  preferences.tone === t
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-gray-700 bg-gray-900/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* AI Options */}
        <div className="col-span-2 mt-2">
          <label className="text-sm text-gray-400">AI Options</label>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <ToggleCard
              title="Optimize"
              active={preferences.ai.optimizePerPlatform}
              onClick={() => updateAI("optimizePerPlatform", !preferences.ai.optimizePerPlatform)}
            />
            <ToggleCard
              title="Hashtags"
              active={preferences.ai.generateHashtags}
              onClick={() => updateAI("generateHashtags", !preferences.ai.generateHashtags)}
            />
            <ToggleCard
              title="Images"
              active={preferences.ai.imageSuggestions}
              onClick={() => updateAI("imageSuggestions", !preferences.ai.imageSuggestions)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
        >
          Back
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-cyan-500 hover:opacity-90 text-white font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ToggleCard({ title, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-4 text-center transition-all ${
        active ? "border-violet-400 bg-violet-400/10" : "border-gray-700 bg-gray-900/40"
      }`}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-400 mt-1">{active ? "On" : "Off"}</div>
    </div>
  );
}