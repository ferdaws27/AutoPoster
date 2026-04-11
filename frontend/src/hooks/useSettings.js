import { useSyncExternalStore, useCallback } from "react";

// --- Central settings store (localStorage-backed) ---

const SETTINGS_KEY = "userSettings";
const PLATFORMS_KEY = "platforms";

let listeners = new Set();

function emitChange() {
  listeners.forEach((fn) => fn());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return localStorage.getItem(SETTINGS_KEY) || "{}";
}

// Model name mapping (settings → OpenRouter model ID)
const MODEL_MAP = {
  deepseek: "deepseek/deepseek-chat",
  llama: "meta-llama/llama-3-8b-instruct",
  mistral: "mistralai/mistral-7b-instruct",
};

// Tone value to label
function toneToLabel(value) {
  if (value <= 33) return "professional";
  if (value <= 66) return "friendly";
  return "casual";
}

// Creativity to temperature
function creativityToTemp(creativity) {
  switch (creativity) {
    case "Conservative": return 0.3;
    case "Balanced": return 0.6;
    case "Creative": return 0.8;
    case "Experimental": return 1.0;
    default: return 0.6;
  }
}

/**
 * Shared hook: reads settings from localStorage reactively.
 * Any page can call useSettings() to get the current configuration.
 */
export default function useSettings() {
  const raw = useSyncExternalStore(subscribe, getSnapshot);
  const settings = JSON.parse(raw);

  // --- AI Preferences ---
  const ai = settings.ai || {};
  const selectedModel = ai.model || "deepseek";
  const modelId = MODEL_MAP[selectedModel] || MODEL_MAP.deepseek;
  const tone = ai.tone ?? 60;
  const toneLabel = toneToLabel(tone);
  const creativity = ai.creativity || "Balanced";
  const temperature = creativityToTemp(creativity);
  const contentLength = ai.contentLength || "Medium (100–200 words)";

  // --- Posting Preferences ---
  const posting = settings.posting || {};
  const timezone = posting.timezone || "UTC (GMT+0)";
  const maxPostsPerDay = posting.maxPosts || 3;
  const autoPublish = posting.autoPublish || false;
  const smartScheduling = posting.smartScheduling ?? true;
  const platformTimes = posting.platformTimes || {
    twitter: ["09:00", "15:00", "19:00"],
    linkedin: ["08:00", "12:00", "17:00"],
    medium: ["10:00", "14:00", ""],
  };

  // --- API Keys ---
  const apiSettings = settings.api || {};
  const apiKeys = apiSettings.keys || {};

  // Resolved OpenRouter key: settings > env var
  const openRouterKey =
    apiKeys.openrouter ||
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.VITE_OPENROUTER_API_KEY ||
        import.meta.env?.VITE_OPENAI_API_KEY)) ||
    "";

  // --- Voice Profile ---
  const voiceProfile = settings.voiceProfile || null;

  // --- Platform integrations ---
  let platforms;
  try {
    platforms = JSON.parse(localStorage.getItem(PLATFORMS_KEY) || "{}");
  } catch {
    platforms = {};
  }
  const connectedPlatforms = {
    twitter: platforms.twitter?.connected || false,
    linkedin: platforms.linkedin?.connected || false,
    medium: platforms.medium?.connected || false,
  };

  // --- Updater (for settings page to trigger re-renders everywhere) ---
  const updateSettings = useCallback((newSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    emitChange();
  }, []);

  return {
    // AI
    selectedModel,
    modelId,
    tone,
    toneLabel,
    creativity,
    temperature,
    contentLength,

    // Posting
    timezone,
    maxPostsPerDay,
    autoPublish,
    smartScheduling,
    platformTimes,

    // API Keys
    apiKeys,
    openRouterKey,

    // Voice Profile
    voiceProfile,

    // Platforms
    connectedPlatforms,

    // Raw
    raw: settings,

    // Updater
    updateSettings,
  };
}

// Static version for non-hook contexts (store, utils)
export function getSettings() {
  const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  const ai = raw.ai || {};
  const model = ai.model || "deepseek";
  return {
    modelId: MODEL_MAP[model] || MODEL_MAP.deepseek,
    toneLabel: toneToLabel(ai.tone ?? 60),
    temperature: creativityToTemp(ai.creativity || "Balanced"),
    contentLength: ai.contentLength || "Medium (100–200 words)",
    timezone: raw.posting?.timezone || "UTC (GMT+0)",
    maxPostsPerDay: raw.posting?.maxPosts || 3,
    openRouterKey:
      (raw.api?.keys?.openrouter) ||
      (typeof import.meta !== "undefined" &&
        (import.meta.env?.VITE_OPENROUTER_API_KEY ||
          import.meta.env?.VITE_OPENAI_API_KEY)) ||
      "",
  };
}
