export default function PostingPreferences() {
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
            <select className="w-full input-field rounded-2xl p-4 text-white bg-black/20">
              <option>UTC (GMT+0)</option>
              <option>EST (GMT-5)</option>
              <option>PST (GMT-8)</option>
              <option selected>PKT (GMT+5)</option>
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
                defaultValue="3"
                className="flex-1"
              />
              <span className="text-white font-medium w-8 text-center">
                3
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
            {/* Twitter */}
            <PlatformTime
              icon="fa-x-twitter"
              color="text-blue-400"
              name="Twitter"
              times={["09:00", "15:00", "19:00"]}
            />

            {/* LinkedIn */}
            <PlatformTime
              icon="fa-linkedin"
              color="text-violet-400"
              name="LinkedIn"
              times={["08:00", "12:00", "17:00"]}
            />

            {/* Medium */}
            <PlatformTime
              icon="fa-medium"
              color="text-teal-400"
              name="Medium"
              times={["10:00", "14:00"]}
              lastEmpty
            />
          </div>
        </div>

        {/* TOGGLES */}
        <div className="grid grid-cols-2 gap-6">
          <ToggleCard
            title="Auto-publish"
            subtitle="Publish posts automatically"
          />

          <ToggleCard
            title="Smart Scheduling"
            subtitle="AI-optimized posting times"
            active
          />
        </div>
      </div>
    </div>
  );
}

/* ====== SUB COMPONENTS (VISUAL ONLY) ====== */

function PlatformTime({ icon, color, name, times, lastEmpty }) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
      <div className="flex items-center space-x-3">
        <i className={`fa-brands ${icon} ${color}`}></i>
        <span className="text-white font-medium">{name}</span>
      </div>
      <div className="flex items-center space-x-3">
        {times.map((t) => (
          <input
            key={t}
            type="time"
            defaultValue={t}
            className="input-field rounded-xl px-3 py-2 text-white text-sm bg-black/30"
          />
        ))}
        {lastEmpty && <span className="text-gray-500 text-sm">—</span>}
      </div>
    </div>
  );
}

function ToggleCard({ title, subtitle, active }) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
      <div className={`toggle-switch ${active ? "active" : ""}`}>
        <div className="toggle-knob"></div>
      </div>
    </div>
  );
}
