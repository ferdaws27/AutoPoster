import { useState } from "react";

export default function ApiKeysStorage() {
  const [visible, setVisible] = useState({
    ux: false,
    deepseek: false,
    unsplash: false,
  });

  const toggle = (key) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="setting-card glass-effect rounded-3xl p-8 animate-slide-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
          <i className="fa-solid fa-key text-yellow-400"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">API Keys & Storage</h2>
          <p className="text-gray-400">
            Manage your API keys and storage preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* UX Pilot */}
        <div className="space-y-3">
          <label className="block text-white font-semibold">
            UX Pilot AI API Key
          </label>
          <div className="relative">
            <input
              type={visible.ux ? "text" : "password"}
              defaultValue="sk-proj-••••••••••••••••••"
              className="
                w-full rounded-2xl p-4 pr-12 text-white
                bg-black/20 border border-gray-700/50
                focus:bg-black/30 focus:border-cyan-400/40
                focus:outline-none
              "
            />
            <button
              type="button"
              onClick={() => toggle("ux")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <i
                className={`fa-solid ${
                  visible.ux ? "fa-eye-slash" : "fa-eye"
                }`}
              />
            </button>
          </div>
        </div>

        {/* DeepSeek */}
        <div className="space-y-3">
          <label className="block text-white font-semibold">
            DeepSeek API Key
          </label>
          <div className="relative">
            <input
              type={visible.deepseek ? "text" : "password"}
              defaultValue="sk-••••••••••••••••••"
              className="
                w-full rounded-2xl p-4 pr-12 text-white
                bg-black/20 border border-gray-700/50
                focus:bg-black/30 focus:border-cyan-400/40
                focus:outline-none
              "
            />
            <button
              type="button"
              onClick={() => toggle("deepseek")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <i
                className={`fa-solid ${
                  visible.deepseek ? "fa-eye-slash" : "fa-eye"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Unsplash */}
        <div className="space-y-3">
          <label className="block text-white font-semibold">
            Unsplash API Key
          </label>
          <div className="relative">
            <input
              type={visible.unsplash ? "text" : "password"}
              placeholder="Enter your Unsplash API key for image generation"
              className="
                w-full rounded-2xl p-4 pr-12 text-white
                bg-black/20 border border-gray-700/50
                focus:bg-black/30 focus:border-cyan-400/40
                focus:outline-none
              "
            />
            <button
              type="button"
              onClick={() => toggle("unsplash")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <i
                className={`fa-solid ${
                  visible.unsplash ? "fa-eye-slash" : "fa-eye"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Storage settings */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="space-y-3">
            <label className="block text-white font-semibold">
              Data Retention
            </label>
            <select
              defaultValue="1 year"
              className="
                w-full rounded-2xl p-4 text-white
                bg-black/20 border border-gray-700/50
                focus:bg-black/30 focus:border-cyan-400/40
                focus:outline-none appearance-none
              "
            >
              <option className="bg-gray-900">30 days</option>
              <option className="bg-gray-900">90 days</option>
              <option className="bg-gray-900">1 year</option>
              <option className="bg-gray-900">Forever</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-white font-semibold">
              Backup Frequency
            </label>
            <select
              defaultValue="Weekly"
              className="
                w-full rounded-2xl p-4 text-white
                bg-black/20 border border-gray-700/50
                focus:bg-black/30 focus:border-cyan-400/40
                focus:outline-none appearance-none
              "
            >
              <option className="bg-gray-900">Daily</option>
              <option className="bg-gray-900">Weekly</option>
              <option className="bg-gray-900">Monthly</option>
              <option className="bg-gray-900">Manual</option>
            </select>
          </div>
        </div>

        {/* Storage usage */}
        <div className="p-6 bg-black/20 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Storage Usage</h3>
            <span className="text-gray-400 text-sm">2.3 GB / 10 GB</span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-400 to-violet-400 h-2 rounded-full"
              style={{ width: "23%" }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Posts: 1.2 GB</span>
            <span>Images: 0.8 GB</span>
            <span>Backups: 0.3 GB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
