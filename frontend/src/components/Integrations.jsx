import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { API_URL } from "../services/api";

const PLATFORM_ICONS = {
  twitter: "fa-brands fa-x-twitter",
  linkedin: "fa-brands fa-linkedin-in",
  medium: "fa-brands fa-medium",
};

const PLATFORM_COLORS = {
  twitter: { bg: "bg-black", border: "border-gray-600", accent: "text-white" },
  linkedin: { bg: "bg-blue-400/20", border: "border-blue-400/40", accent: "text-blue-400" },
  medium: { bg: "bg-green-400/20", border: "border-green-400/40", accent: "text-green-400" },
};

export default function Integrations({ onChange }) {
  const { user } = useOutletContext();

  const [platforms, setPlatforms] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("platforms"));
    return saved || {
      twitter: { connected: false, username: null, profile_picture: null, autoPost: false, visibility: "Public" },
      linkedin: { connected: false, username: null, profile_picture: null, autoPost: false, visibility: "Public" },
      medium: { connected: false, username: null, profile_picture: null, autoPost: false, visibility: "Public", token: null },
    };
  });

  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // Sync from user's oauth_provider
  useEffect(() => {
    if (!user) return;
    const provider = user.oauth_provider;

    setPlatforms((prev) => ({
      ...prev,
      twitter: provider === "twitter"
        ? { ...prev.twitter, connected: true, username: `@${user.username || user.name || "user"}`, profile_picture: user.profile_picture }
        : prev.twitter,
      linkedin: provider === "linkedin"
        ? { ...prev.linkedin, connected: true, username: user.full_name || user.name || user.first_name || "LinkedIn User", profile_picture: user.profile_picture }
        : { ...prev.linkedin, connected: false, username: null, profile_picture: null },
      medium: provider === "medium"
        ? { ...prev.medium, connected: true, username: `@${user.username || user.name || "user"}`, profile_picture: user.profile_picture }
        : prev.medium,
    }));
  }, [user]);

  // Save to localStorage + notify parent
  useEffect(() => {
    localStorage.setItem("platforms", JSON.stringify(platforms));
    if (onChange) onChange(platforms);
  }, [platforms]);

  // ========== CONNECT HANDLERS ==========
  const connectPlatform = (key) => {
    if (key === "twitter") {
      window.location.href = `${API_URL}/api/oauth/twitter/start`;
    } else if (key === "linkedin") {
      window.location.href = `${API_URL}/api/oauth/linkedin/start`;
    } else if (key === "medium") {
      window.location.href = `${API_URL}/api/oauth/medium/start`;
    }
  };

  const disconnectPlatform = (key) => {
    setPlatforms((prev) => ({
      ...prev,
      [key]: { ...prev[key], connected: false, username: null, profile_picture: null },
    }));
    if (key === user?.oauth_provider) {
      localStorage.removeItem("user");
    }
  };

  const updatePlatformSetting = (key, field, value) => {
    setPlatforms((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // ========== RENDER ==========
  const renderPlatform = (key, title) => {
    const platform = platforms[key];
    const colors = PLATFORM_COLORS[key];
    const icon = PLATFORM_ICONS[key];

    return (
      <div key={key} className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-gray-700/50 hover:border-gray-600/70 transition-all">
        {/* LEFT */}
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
            <i className={`${icon} ${colors.accent} text-xl`} />
          </div>
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <div className="flex items-center space-x-3 mt-1">
              {platform.connected && platform.profile_picture && (
                <img src={platform.profile_picture} onError={(e) => (e.target.src = "/default-avatar.png")} className="w-6 h-6 rounded-full" alt="profile" />
              )}
              <p className="text-gray-400 text-sm">
                {platform.connected ? platform.username : "Not connected"}
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 ${platform.connected ? "bg-green-400" : "bg-red-400"} rounded-full`} />
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${platform.connected ? "status-connected" : "status-disconnected"}`}>
                {platform.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center space-x-3">
          {!platform.connected ? (
            <button
              onClick={() => connectPlatform(key)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Connect
            </button>
          ) : (
            <>
              {/* CONFIGURE DIALOG */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button
                    onClick={() => setSelectedPlatform(key)}
                    className="px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white text-sm border border-gray-700 hover:border-gray-500 transition-colors"
                  >
                    Configure
                  </button>
                </Dialog.Trigger>

                {selectedPlatform === key && (
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-2xl p-6 w-[420px] z-50">
                      <Dialog.Title className="text-lg font-semibold text-white mb-5 flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                          <i className={`${icon} ${colors.accent}`} />
                        </div>
                        <span>{title} Settings</span>
                      </Dialog.Title>

                      {/* Account Info */}
                      <div className="mb-5 pb-5 border-b border-gray-700">
                        <h4 className="text-white text-sm font-semibold mb-3">Account</h4>
                        <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-xl">
                          {platform.profile_picture && (
                            <img src={platform.profile_picture} onError={(e) => (e.target.src = "/default-avatar.png")} className="w-10 h-10 rounded-full" alt="" />
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">{platform.username}</p>
                            <p className="text-green-400 text-xs">Connected</p>
                          </div>
                        </div>
                      </div>

                      {/* Auto Post Toggle */}
                      <div className="mb-5 pb-5 border-b border-gray-700">
                        <h4 className="text-white text-sm font-semibold mb-3">Posting</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300 text-sm">Auto-post</p>
                            <p className="text-gray-500 text-xs">Automatically publish scheduled posts</p>
                          </div>
                          <div
                            onClick={() => updatePlatformSetting(key, "autoPost", !platform.autoPost)}
                            className={`toggle-switch ${platform.autoPost ? "active" : ""} cursor-pointer`}
                          >
                            <div className="toggle-knob" />
                          </div>
                        </div>

                        {/* Visibility */}
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm mb-2">Default visibility</p>
                          <div className="flex space-x-2">
                            {["Public", "Connections", "Private"].map((v) => (
                              <button
                                key={v}
                                onClick={() => updatePlatformSetting(key, "visibility", v)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  platform.visibility === v
                                    ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                                    : "bg-black/30 text-gray-400 border border-gray-700 hover:text-white"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Disconnect */}
                      <div className="mb-5">
                        <Dialog.Close asChild>
                          <button
                            onClick={() => disconnectPlatform(key)}
                            className="w-full px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                          >
                            Disconnect {title}
                          </button>
                        </Dialog.Close>
                      </div>

                      <div className="flex justify-end">
                        <Dialog.Close asChild>
                          <button className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 rounded-xl text-white text-sm font-medium transition-colors">
                            Done
                          </button>
                        </Dialog.Close>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                )}
              </Dialog.Root>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="setting-card glass-effect rounded-3xl p-8 animate-slide-in">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 flex items-center justify-center">
          <i className="fa-solid fa-plug text-cyan-400"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Integrations</h2>
          <p className="text-gray-400">Connect your social media accounts</p>
        </div>
      </div>

      <div className="grid gap-6">
        {renderPlatform("twitter", "Twitter (X)")}
        {renderPlatform("linkedin", "LinkedIn")}
        {renderPlatform("medium", "Medium")}
      </div>
    </div>
  );
}