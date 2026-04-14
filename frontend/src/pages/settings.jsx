import { useRef, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Integrations from "../components/Integrations";
import AiPreferences from "../components/AiPreferences";
import PostingPreferences from "../components/PostingPreferences";
import ApiKeysStorage from "../components/ApiKeysStorage";
import ExportDanger from "../components/ExportDanger";
import { apiFetch } from "../services/api";
import useSettings from "../hooks/useSettings";
import useTranslation from "../i18n/useTranslation";

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("integrations");
  const { user } = useOutletContext();
  const { updateSettings, voiceProfile } = useSettings();
  const t = useTranslation();

  // Load settings synchronously to avoid initialData being null on first render
  const [initialSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("userSettings");
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
    return {};
  });

  // Child states
  const [integrationData, setIntegrationData] = useState(initialSettings.integrations || null);
  const [aiData, setAiData] = useState(initialSettings.ai || null);
  const [postingData, setPostingData] = useState(initialSettings.posting || null);
  const [apiData, setApiData] = useState(initialSettings.api || null);
  const [dangerData, setDangerData] = useState(initialSettings.danger || null);

  // Global state
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const integrationsRef = useRef(null);
  const aiRef = useRef(null);
  const postingRef = useRef(null);
  const apiRef = useRef(null);
  const dangerRef = useRef(null);

  const handleCategoryClick = (key, ref) => {
    setActiveCategory(key);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSettingChange = (category, data) => {
    setHasChanges(true);
    switch (category) {
      case "integrations":
        setIntegrationData(data);
        break;
      case "ai":
        setAiData(data);
        break;
      case "posting":
        setPostingData(data);
        break;
      case "api":
        setApiData(data);
        break;
      case "danger":
        setDangerData(data);
        break;
      default:
        break;
    }
  };

  // Auto-save to localStorage whenever any setting changes
  useEffect(() => {
    if (!hasChanges) return;
    const payload = {
      integrations: integrationData,
      ai: aiData,
      posting: postingData,
      api: apiData,
      danger: dangerData,
      ...(voiceProfile ? { voiceProfile } : {}),
      lastUpdated: new Date().toISOString(),
    };
    updateSettings(payload);
  }, [integrationData, aiData, postingData, apiData, dangerData]);

  const handleSaveSettings = async () => {
    if (!hasChanges) {
      showToast("No changes to save", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        integrations: integrationData,
        ai: aiData,
        posting: postingData,
        api: apiData,
        danger: dangerData,
        ...(voiceProfile ? { voiceProfile } : {}),
        lastUpdated: new Date().toISOString(),
      };

      // Save locally + notify all listeners
      updateSettings(payload);

      // Optional: Send to backend
      try {
        await apiFetch("/api/user/settings", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
        console.log("Settings saved to server");
      } catch (backendError) {
        console.warn("Saved locally, server unavailable:", backendError);
      }

      setHasChanges(false);
      showToast("Settings saved successfully", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncSettings = async () => {
    setSaving(true);
    try {
      const response = await apiFetch("/api/user/settings");
      if (response && response.data) {
        const settings = response.data;
        setIntegrationData(settings.integrations || null);
        setAiData(settings.ai || null);
        setPostingData(settings.posting || null);
        setApiData(settings.api || null);
        setDangerData(settings.danger || null);

        // Also save to localStorage
        updateSettings(settings);

        setHasChanges(false);
        showToast("Settings synced from server", "success");
      }
    } catch (error) {
      console.warn("Unable to sync with server, using local cache", error);
      showToast("Using local cache (server unavailable)", "warning");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = "success") => {
    const options = {
      style: {
        background: "#1a1a2e",
        color: "#fff",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "12px 20px",
        fontSize: "14px",
      },
    };
    if (type === "success") toast.success(message, options);
    else if (type === "warning") toast(message, { ...options, icon: "⚠️" });
    else toast.error(message, options);
  };

  return (
    <div className="gradient-bg min-h-screen relative">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 px-8 pt-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t("settings.title")}</h1>
          <p className="text-gray-400">
            {t("settings.subtitle")}
            {hasChanges && <span className="ml-3 text-yellow-400">• {t("settings.unsavedChanges")}</span>}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleSyncSettings}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-black/30 rounded-2xl text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fa-solid fa-sync text-sm ${saving && "fa-spin"}`}></i>
            <span className="text-sm">{t("settings.syncSettings")}</span>
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving || !hasChanges}
            id="save-settings-btn"
            className="flex items-center space-x-2 px-6 py-3 gradient-accent rounded-2xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fa-solid ${saving ? "fa-spinner fa-spin" : "fa-save"}`}></i>
            <span>{saving ? t("settings.saving") : t("settings.saveChanges")}</span>
          </button>
        </div>
      </div>

      {/* GRID */}
      <main className=" p-8">
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT NAV */}
          <div className="col-span-3">
            <div className="glass-effect rounded-3xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-4">{t("nav.main") === "Principal" ? "Catégories" : "Categories"}</h2>
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
                  <span>{t("settings.integrations")}</span>
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
                  <span>{t("settings.aiPreferences")}</span>
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
                  <span>{t("settings.posting")}</span>
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
                  <span>{t("settings.apiStorage")}</span>
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
                  <span>{t("settings.exportDanger")}</span>
                </button>
              </nav>
        </div>
          </div>

          {/* CONTENT */}
          <div className="col-span-9 space-y-8">
            <div ref={integrationsRef}>
              <Integrations 
                onChange={(data) => handleSettingChange("integrations", data)} 
              />
            </div>
            <div ref={aiRef}>
              <AiPreferences 
                initialData={aiData}
                onChange={(data) => handleSettingChange("ai", data)} 
              />
            </div>
            <div ref={postingRef}>
              <PostingPreferences 
                initialData={postingData}
                onChange={(data) => handleSettingChange("posting", data)} 
              />
            </div>
            <div ref={apiRef}>
              <ApiKeysStorage 
                initialData={apiData}
                onChange={(data) => handleSettingChange("api", data)} 
              />
            </div>
            <div ref={dangerRef}>
              <ExportDanger 
                initialData={dangerData}
                onChange={(data) => handleSettingChange("danger", data)} 
              />
            </div>
          </div>
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
    </div>
  );
}
