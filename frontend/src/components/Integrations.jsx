import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";

export default function Integrations() {
  const { user } = useOutletContext();

  // ✅ INIT STATE AVEC LOCALSTORAGE
  const [platforms, setPlatforms] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("platforms"));

    return (
      saved || {
        twitter: {
          connected: false,
          username: null,
          autoPost: false,
          visibility: "Public",
        },
        linkedin: {
          connected: false,
          username: null,
          profile_picture: null,
          autoPost: false,
          visibility: "Public",
        },
        medium: {
          connected: false,
          username: null,
          autoPost: false,
          visibility: "Public",
        },
      }
    );
  });

  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // ✅ SYNC LINKEDIN AUTO
  useEffect(() => {
    if (user) {
      setPlatforms((prev) => ({
        ...prev,
        linkedin: {
          ...prev.linkedin,
          connected: true,
          username: user.full_name,
          profile_picture: user.profile_picture,
        },
      }));
    }
  }, [user]);

  // ✅ SAVE LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem("platforms", JSON.stringify(platforms));
  }, [platforms]);

  // ✅ TOGGLE (TWITTER + MEDIUM SEULEMENT)
  const toggleConnection = (key) => {
    if (key === "linkedin") return;

    setPlatforms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        connected: !prev[key].connected,
        username: !prev[key].connected
          ? key === "twitter"
            ? "@new_user"
            : "MediumUser"
          : null,
      },
    }));
  };

  // ✅ CONNECT ACCOUNT
  const changeAccount = (key, newUsername) => {
    if (key === "linkedin") return;

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

          {/* IMAGE + NAME */}
          <div className="flex items-center space-x-3 mt-2">
            {platform.connected && platform.profile_picture && (
              <img
                src={platform.profile_picture}
                onError={(e) => (e.target.src = "/default-avatar.png")}
                className="w-8 h-8 rounded-full"
                alt="profile"
              />
            )}

            <p className="text-gray-400 text-sm">
              {platform.connected ? platform.username : "Not connected"}
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <div
              className={`w-2 h-2 ${
                platform.connected ? "bg-green-400" : "bg-red-400"
              } rounded-full`}
            />

            <span
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                platform.connected
                  ? "status-connected"
                  : "status-disconnected"
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
            className={`toggle-switch ${
              platform.connected ? "active" : ""
            } cursor-pointer`}
          >
            <div className="toggle-knob" />
          </div>

          {/* CONFIGURE */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                onClick={() => setSelectedPlatform(key)}
                className="px-4 py-2 bg-black/30 rounded-xl text-gray-300 hover:text-white text-sm"
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

                  <div className="mb-4 border-b border-gray-700 pb-4">
                    <h4 className="text-white text-sm font-semibold mb-2">
                      Account Management
                    </h4>

                    {platform.connected ? (
                      <>
                        <p className="text-gray-300 text-sm">
                          Connected as: {platform.username}
                        </p>

                        {key !== "linkedin" && (
                          <button
                            onClick={() =>
                              changeAccount(key, "New_Account")
                            }
                            className="px-3 py-1 bg-blue-500 text-white rounded-xl text-sm mt-2"
                          >
                            Switch Account
                          </button>
                        )}
                      </>
                    ) : (
                      key !== "linkedin" && (
                        <button
                          onClick={() =>
                            changeAccount(key, "New_Account")
                          }
                          className="px-3 py-1 bg-green-500 text-white rounded-xl text-sm"
                        >
                          Connect Account
                        </button>
                      )
                    )}
                  </div>

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
          <h2 className="text-2xl font-bold text-white">
            Platform Integrations
          </h2>
          <p className="text-gray-400">
            Connect your social media accounts
          </p>
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