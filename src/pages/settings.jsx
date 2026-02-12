import { useRef, useState } from "react";
import Integrations from "../components/Integrations";
import AiPreferences from "../components/AiPreferences";
import PostingPreferences from "../components/PostingPreferences";
import ApiKeysStorage from "../components/ApiKeysStorage";
import ExportDanger from "../components/ExportDanger";

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("integrations");

  const integrationsRef = useRef(null);
  const aiRef = useRef(null);
  const postingRef = useRef(null);
  const apiRef = useRef(null);
  const dangerRef = useRef(null);

  const handleCategoryClick = (key, ref) => {
    setActiveCategory(key);
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="gradient-bg min-h-screen">
     

      {/* MAIN CONTENT */}
      <main className="ml-64 p-8">
        {/* ✅ HEADER SECTION — AJOUTÉ */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-400">
              Manage your account preferences and integrations
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-black/30 rounded-2xl text-gray-300 hover:text-white transition-colors">
              <i className="fa-solid fa-sync text-sm"></i>
              <span className="text-sm">Sync Settings</span>
            </button>

            <button
              id="save-settings-btn"
              className="flex items-center space-x-2 px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
            >
              <i className="fa-solid fa-save"></i>
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT NAV */}
          <div className="col-span-3">
            <div className="glass-effect rounded-3xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Categories
              </h2>

              <nav className="space-y-2">
                <button
                  onClick={() =>
                    handleCategoryClick("integrations", integrationsRef)
                  }
                  className={`w-full flex items-center space-x-3 p-3 rounded-2xl ${
                    activeCategory === "integrations"
                      ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <i className="fa-solid fa-plug w-5" />
                  <span>Integrations</span>
                </button>

                <button
                  onClick={() => handleCategoryClick("ai", aiRef)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-2xl ${
                    activeCategory === "ai"
                      ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <i className="fa-solid fa-brain w-5" />
                  <span>AI Preferences</span>
                </button>

                <button
                  onClick={() =>
                    handleCategoryClick("posting", postingRef)
                  }
                  className={`w-full flex items-center space-x-3 p-3 rounded-2xl ${
                    activeCategory === "posting"
                      ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <i className="fa-solid fa-clock w-5" />
                  <span>Posting</span>
                </button>

                <button
                  onClick={() => handleCategoryClick("api", apiRef)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-2xl ${
                    activeCategory === "api"
                      ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <i className="fa-solid fa-key w-5" />
                  <span>API & Storage</span>
                </button>

                <button
                  onClick={() =>
                    handleCategoryClick("danger", dangerRef)
                  }
                  className={`w-full flex items-center space-x-3 p-3 rounded-2xl ${
                    activeCategory === "danger"
                      ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <i className="fa-solid fa-exclamation-triangle w-5" />
                  <span>Export & Danger</span>
                </button>
              </nav>
            </div>
          </div>

          {/* CONTENT */}
          <div className="col-span-9 space-y-8">
            <div
              ref={integrationsRef}
              className={
                activeCategory === "integrations"
                  ? "ring-2 ring-cyan-400/20 rounded-3xl"
                  : ""
              }
            >
              <Integrations />
            </div>

            <div
              ref={aiRef}
              className={
                activeCategory === "ai"
                  ? "ring-2 ring-violet-400/20 rounded-3xl"
                  : ""
              }
            >
              <AiPreferences />
            </div>

            <div
              ref={postingRef}
              className={
                activeCategory === "posting"
                  ? "ring-2 ring-teal-400/20 rounded-3xl"
                  : ""
              }
            >
              <PostingPreferences />
            </div>

            <div
              ref={apiRef}
              className={
                activeCategory === "api"
                  ? "ring-2 ring-yellow-400/20 rounded-3xl"
                  : ""
              }
            >
              <ApiKeysStorage />
            </div>

            <div
              ref={dangerRef}
              className={
                activeCategory === "danger"
                  ? "ring-2 ring-red-400/20 rounded-3xl"
                  : ""
              }
            >
              <ExportDanger />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
