import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

export default function Integrations() {
  const [platforms, setPlatforms] = useState({
    twitter: {
      connected: true,
      username: "@dr_khalil_tech",
      autoPost: true,
      visibility: "Public",
    },
    linkedin: {
      connected: true,
      username: "Dr. Khalil Ahmed",
      autoPost: false,
      visibility: "Public",
    },
    medium: {
      connected: false,
      username: null,
      autoPost: false,
      visibility: "Public",
    },
  });

  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const toggleConnection = (key) => {
    setPlatforms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        connected: !prev[key].connected,
        username: !prev[key].connected ? "New Account" : null,
      },
    }));
  };

  const updateSetting = (key, field, value) => {
    setPlatforms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const changeAccount = (key, newUsername) => {
    setPlatforms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        username: newUsername,
        connected: true,
      },
    }));
  };

  const renderPlatform = (key, title) => {
    const platform = platforms[key];

    return (
      <div
        key={key}
        className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-gray-700/50"
      >
        {/* LEFT */}
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-gray-400 text-sm">
            {platform.connected ? platform.username : "Not connected"}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <div
              className={`w-2 h-2 ${
                platform.connected ? "bg-green-400" : "bg-red-400"
              } rounded-full`}
            />
            <span
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                platform.connected ? "status-connected" : "status-disconnected"
              }`}
            >
              {platform.connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center space-x-3">
          {/* TOGGLE */}
          <div
            onClick={() => toggleConnection(key)}
            className={`toggle-switch ${platform.connected ? "active" : ""} cursor-pointer`}
          >
            <div className="toggle-knob" />
          </div>

          {/* CONFIGURE BUTTON */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                onClick={() => setSelectedPlatform(key)}
                className="px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white transition-colors text-sm"
              >
                Configure
              </button>
            </Dialog.Trigger>

            {selectedPlatform === key && (
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-2xl p-6 w-96">
                  <Dialog.Title className="text-lg font-semibold text-white mb-4">
                    {title} Settings
                  </Dialog.Title>

                  {/* -------------------- ACCOUNT MANAGEMENT -------------------- */}
                  <div className="mb-4 border-b border-gray-700 pb-4">
                    <h4 className="text-white text-sm font-semibold mb-2">
                      Account Management
                    </h4>

                    {platform.connected ? (
                      <>
                        <p className="text-gray-300 text-sm mb-2">
                          Connected as: {platform.username}
                        </p>
                        <button
                          onClick={() => changeAccount(key, "New_Account")}
                          className="px-3 py-1 bg-blue-500 text-white rounded-xl text-sm"
                        >
                          Switch Account
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => changeAccount(key, "New_Account")}
                        className="px-3 py-1 bg-green-500 text-white rounded-xl text-sm"
                      >
                        Connect Account
                      </button>
                    )}
                  </div>


                  {/* -------------------- MODAL FOOTER -------------------- */}
                  <div className="flex justify-end mt-6">
                    <Dialog.Close asChild>
                      <button className="px-4 py-2 bg-violet-500 rounded-xl text-white text-sm">
                        Save
                      </button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </Dialog.Root>
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
