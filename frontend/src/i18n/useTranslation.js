import useSettings from "../hooks/useSettings";
import { getTranslation } from "./translations";

/**
 * Hook that returns a `t` function for translating UI strings.
 * Uses the language from Settings > AI Preferences.
 * 
 * Usage:
 *   const t = useTranslation();
 *   t("nav.dashboard") → "Tableau de bord" (if lang=fr)
 */
export default function useTranslation() {
  const { language } = useSettings();
  return (path) => getTranslation(language || "en", path);
}

/**
 * Static version for non-hook contexts (stores, utils).
 */
export function getT() {
  try {
    const raw = JSON.parse(localStorage.getItem("userSettings") || "{}");
    const lang = raw.ai?.language || "en";
    return (path) => getTranslation(lang, path);
  } catch {
    return (path) => getTranslation("en", path);
  }
}
