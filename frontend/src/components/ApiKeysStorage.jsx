import { useState, useEffect } from "react";

export default function ApiKeysStorage({ initialData, onChange }) {
  const [keys, setKeys] = useState({
    openrouter: initialData?.keys?.openrouter || "",
    deepseek: initialData?.keys?.deepseek || "",
    unsplash: initialData?.keys?.unsplash || "",
  });
  const [dataRetention, setDataRetention] = useState(initialData?.dataRetention || "1 year");
  const [backupFrequency, setBackupFrequency] = useState(initialData?.backupFrequency || "Weekly");
  const [visible, setVisible] = useState({
    openrouter: false,
    deepseek: false,
    unsplash: false,
  });

  // Notify parent on change
  useEffect(() => {
    if (onChange) {
      onChange({ keys, dataRetention, backupFrequency });
    }
  }, [keys, dataRetention, backupFrequency]);

  const toggle = (key) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateKey = (key, value) => {
    setKeys((prev) => ({ ...prev, [key]: value }));
  };

  // Calculate real localStorage usage
  const storageUsed = (() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      total += (localStorage.getItem(key) || "").length * 2; // UTF-16
    }
    return total;
  })();
  const storageKB = (storageUsed / 1024).toFixed(1);
  const storageMB = (storageUsed / (1024 * 1024)).toFixed(2);
  const maxMB = 5; // localStorage limit ~5MB
  const pct = Math.min(100, ((storageUsed / (maxMB * 1024 * 1024)) * 100)).toFixed(1);

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
        {/* OpenRouter */}
        <div className="space-y-3">
          <label className="block text-white font-semibold">
            OpenRouter API Key
          </label>
          <div className="relative">
            <input
              type={visible.openrouter ? "text" : "password"}
              value={keys.openrouter}
              onChange={(e) => updateKey("openrouter", e.target.value)}
              placeholder="Enter your OpenRouter API key (sk-or-...)"
              className="
                w-full rounded-2xl p-4 pr-12 text-white
                bg-black/20 border border-gray-700/50
                focus:bg-black/30 focus:border-cyan-400/40
                focus:outline-none
              "
            />
            <button
              type="button"
              onClick={() => toggle("openrouter")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <i
                className={`fa-solid ${
                  visible.openrouter ? "fa-eye-slash" : "fa-eye"
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
              value={keys.deepseek}
              onChange={(e) => updateKey("deepseek", e.target.value)}
              placeholder="Enter your DeepSeek API key"
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
              value={keys.unsplash}
              onChange={(e) => updateKey("unsplash", e.target.value)}
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
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
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
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value)}
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
            <span className="text-gray-400 text-sm">{storageKB} KB / {maxMB} MB</span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-400 to-violet-400 h-2 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Total: {storageMB} MB</span>
            <span>{pct}% used</span>
          </div>
        </div>
      </div>
    </div>
  );
}
