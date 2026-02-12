export default function Integrations() {
  return (
    <div className="setting-card glass-effect rounded-3xl p-8 animate-slide-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
          <i className="fa-solid fa-plug text-cyan-400"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Platform Integrations
          </h2>
          <p className="text-gray-400">
            Connect your social media accounts
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Twitter */}
        <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-400/20 flex items-center justify-center">
              <i className="fa-brands fa-x-twitter text-blue-400 text-xl"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold">Twitter (X)</h3>
              <p className="text-gray-400 text-sm">@dr_khalil_tech</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="status-connected px-2 py-1 rounded-lg text-xs font-medium">
                  Connected
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="toggle-switch active">
              <div className="toggle-knob" />
            </div>
            <button className="px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white transition-colors text-sm">
              Configure
            </button>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-400/20 flex items-center justify-center">
              <i className="fa-brands fa-linkedin text-violet-400 text-xl"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold">LinkedIn</h3>
              <p className="text-gray-400 text-sm">Dr. Khalil Ahmed</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="status-connected px-2 py-1 rounded-lg text-xs font-medium">
                  Connected
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="toggle-switch active">
              <div className="toggle-knob" />
            </div>
            <button className="px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white transition-colors text-sm">
              Configure
            </button>
          </div>
        </div>

        {/* Medium */}
        <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-400/20 flex items-center justify-center">
              <i className="fa-brands fa-medium text-teal-400 text-xl"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold">Medium</h3>
              <p className="text-gray-400 text-sm">Not connected</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="status-disconnected px-2 py-1 rounded-lg text-xs font-medium">
                  Disconnected
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="toggle-switch">
              <div className="toggle-knob" />
            </div>
            <button className="px-4 py-2 gradient-accent rounded-xl text-white font-medium hover:opacity-90 transition-opacity text-sm">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
