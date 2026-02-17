import { useRef, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import Integrations from "../components/Integrations";
import AiPreferences from "../components/AiPreferences";
import PostingPreferences from "../components/PostingPreferences";
import ApiKeysStorage from "../components/ApiKeysStorage";
import ExportDanger from "../components/ExportDanger";

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("integrations");

  // États des enfants
  const [integrationData, setIntegrationData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [postingData, setPostingData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [dangerData, setDangerData] = useState(null);

  // Toast Radix
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const integrationsRef = useRef(null);
  const aiRef = useRef(null);
  const postingRef = useRef(null);
  const apiRef = useRef(null);
  const dangerRef = useRef(null);

  const handleCategoryClick = (key, ref) => {
    setActiveCategory(key);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaveSettings = () => {
    const payload = {
      integrations: integrationData,
      ai: aiData,
      posting: postingData,
      api: apiData,
      danger: dangerData,
    };
    console.log("Saving settings...", payload);

    // Affiche le toast sans changer le design
    setToastMessage("Settings saved ✅");
    setToastOpen(true);
  };

  const handleSyncSettings = () => {
    console.log("Syncing settings...");
    setToastMessage("Settings synced 🔄");
    setToastOpen(true);
  };

  return (
    <div className="gradient-bg min-h-screen relative">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 px-8 pt-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">
            Manage your account preferences and integrations
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleSyncSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-black/30 rounded-2xl text-gray-300 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-sync text-sm"></i>
            <span className="text-sm">Sync Settings</span>
          </button>

          <button
            onClick={handleSaveSettings}
            id="save-settings-btn"
            className="flex items-center space-x-2 px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity"
          >
            <i className="fa-solid fa-save"></i>
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* GRID */}
      <main className=" p-8">
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT NAV */}
          <div className="col-span-3">
            <div className="glass-effect rounded-3xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => handleCategoryClick("integrations", integrationsRef)}
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
                  onClick={() => handleCategoryClick("posting", postingRef)}
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
                  onClick={() => handleCategoryClick("danger", dangerRef)}
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
            <div ref={integrationsRef}>
              <Integrations onChange={setIntegrationData} />
            </div>
            <div ref={aiRef}>
              <AiPreferences onChange={setAiData} />
            </div>
            <div ref={postingRef}>
              <PostingPreferences onChange={setPostingData} />
            </div>
            <div ref={apiRef}>
              <ApiKeysStorage onChange={setApiData} />
            </div>
            <div ref={dangerRef}>
              <ExportDanger onChange={setDangerData} />
            </div>
          </div>
        </div>
      </main>

      {/* Toast Radix pour remplacer alert */}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className="bg-gray-900 text-white rounded-xl p-4 shadow-lg fixed bottom-8 right-8 w-72"
        >
          <Toast.Title className="font-semibold">{toastMessage}</Toast.Title>
          <Toast.Description className="text-sm text-gray-400"></Toast.Description>
          <Toast.Action asChild altText="Close">
            <button
              className="text-sm text-cyan-400 hover:underline"
              onClick={() => setToastOpen(false)}
            >
              Close
            </button>
          </Toast.Action>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-6" />
      </Toast.Provider>
    </div>
  );
}
