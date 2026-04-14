import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faShareNodes,
  faMagicWandSparkles,
  faClock,
  faChartLine,
  faRocket,
  faCheck,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import * as Toast from "@radix-ui/react-toast";
import { loginGuest } from "../services/auth";
import useSettings from "../hooks/useSettings";
import useTranslation from "../i18n/useTranslation";

/* ================== FEATURE CAROUSEL (outside Login to avoid remount) ================== */
function FeatureCarousel({ features, carouselTitle }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [features.length]);

  const feature = features[index];

  return (
    <div className="fixed top-8 left-8 w-96 z-20 hidden lg:block">
      <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{carouselTitle}</h3>
          <div className="flex space-x-1">
            {features.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === index ? "bg-cyan-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4 transition-all">
          <div className="flex items-start space-x-3">
            <div
              className={`w-8 h-8 rounded-lg ${feature.bgClass} flex items-center justify-center`}
            >
              <FontAwesomeIcon icon={feature.icon} className={`${feature.textClass} text-sm`} />
            </div>
            <div>
              <div className="text-white font-medium mb-1">{feature.title}</div>
              <div className="text-gray-400 text-sm">{feature.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  /* ================== BACKGROUND ================== */
  function Background() {
    return (
      <div className="fixed inset-0 gradient-bg z-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400/10 blur-3xl rounded-full animate-pulse-slow" />
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-violet-400/10 blur-3xl rounded-full animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 blur-3xl rounded-full" />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
    );
  }

  /* ================== OAUTH BUTTON ================== */
  function OAuthButton({ icon, label, onClick }) {
    return (
      <button
        onClick={onClick}
        className="w-full p-4 rounded-2xl bg-black/50 border border-gray-700 hover:border-cyan-400/60 transition-all group relative overflow-hidden hover:bg-black/70 transform hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-violet-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex items-center justify-center space-x-4">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
            <i className={`fa-brands ${icon} text-white text-lg`}></i>
          </div>
          <span className="text-white font-medium text-lg">{label}</span>
          <FontAwesomeIcon icon={faRocket} className="text-gray-600 group-hover:text-cyan-400 transition-colors text-sm ml-auto" />
        </div>
      </button>
    );
  }

  /* ================== FEATURE CARD ================== */
  function FeatureCard({ title, icon, items }) {
    return (
      <div className="w-72 glass-effect rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={icon} className="text-cyan-400" />
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <ul className="text-gray-400 text-sm space-y-2">
          {items.map((item, i) => (
            <li key={i}>✔ {item}</li>
          ))}
        </ul>
      </div>
    );
  }

  // FeatureCarousel moved outside Login - see top of file

  /* ================== STATS CARD ================== */
  function Stat({ value, label, color }) {
    return (
      <div className="text-center">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    );
  }

  function StatsCard() {
    return (
      <div className="fixed bottom-8 left-8 right-8 glass-effect rounded-2xl p-6 border border-gray-700/50 flex justify-between items-center z-20">
        <div className="flex items-center space-x-8">
          <Stat value="10K+" label={t("login.postsCreated")} color="text-cyan-400" />
          <Stat value="500+" label={t("login.activeUsers")} color="text-violet-400" />
          <Stat value="95%" label={t("login.timeSaved")} color="text-green-400" />
        </div>
        <div className="hidden md:flex flex-col items-end text-right space-y-2">
          <div className="text-white font-medium">{t("login.trustedByCreators")}</div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" className="w-8 h-8 rounded-full border-2 border-gray-700" />
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" className="w-8 h-8 rounded-full border-2 border-gray-700" />
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-8 h-8 rounded-full border-2 border-gray-700" />
            </div>
            <span className="text-sm text-gray-400">+497 {t("login.others")}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ================== SECURITY BADGE ================== */
  function SecurityBadge() {
    const [open, setOpen] = useState(true);

    return (
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          duration={Infinity}
          className="glass-effect rounded-2xl p-4 border border-green-400/30 shadow-lg w-80 relative"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-green-400/20 flex items-center justify-center">
              <i className="fas fa-shield-check text-green-400"></i>
            </div>
            <div>
              <div className="text-white font-medium text-sm">{t("login.enterpriseSecurity")}</div>
              <div className="text-gray-400 text-xs">{t("login.securityDesc")}</div>
            </div>
          </div>
          <Toast.Close className="absolute top-2 right-2 text-gray-400 hover:text-white cursor-pointer">
            ✕
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-6 right-6 flex flex-col gap-2 p-4 w-auto max-w-xs z-50" />
      </Toast.Provider>
    );
  }

  /* ================== LOADING OVERLAY ================== */
  function LoadingOverlay() {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-effect rounded-2xl p-8 border border-cyan-400/30 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <p className="text-white font-medium text-lg">{t("login.connecting")}</p>
          <p className="text-gray-400 text-sm mt-1">{t("login.settingUpWorkspace")}</p>
        </div>
      </div>
    );
  }

  /* ================== ONBOARDING MODAL ================== */
  function OnboardingModal({ onClose }) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="glass-effect rounded-3xl p-8 max-w-2xl w-full border border-cyan-400/30 relative">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500 flex items-center justify-center">
              <FontAwesomeIcon icon={faRocket} className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{t("login.letsGetStarted")}</h2>
            <p className="text-gray-400">{t("login.completeProfile")}</p>
          </div>
          <div className="flex items-center justify-between mb-8">
            <Step active label={t("login.connectPlatforms")} number="1" />
            <Divider />
            <Step label={t("login.setPreferences")} number="2" />
            <Divider />
            <Step label={t("login.createFirstPost")} number="3" />
          </div>
          <div className="bg-black/30 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">{t("login.chooseYourPlatforms")}</h3>
            <div className="grid grid-cols-3 gap-4">
              <Platform icon="fa-x-twitter" label="X (Twitter)" />
              <Platform icon="fa-linkedin-in" label="LinkedIn" />
              <Platform icon="fa-medium" label="Medium" />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white">
              {t("login.skipForNow")}
            </button>
            <button className="flex-1 p-4 rounded-2xl bg-cyan-500 text-white font-medium">{t("login.continueSetup")}</button>
          </div>
        </div>
      </div>
    );
  }

  function Step({ number, label, active }) {
    return (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? "bg-cyan-400 text-black" : "bg-gray-600 text-white"}`}>
          {number}
        </div>
        <span className={active ? "text-white" : "text-gray-400"}>{label}</span>
      </div>
    );
  }

  function Divider() {
    return <div className="flex-1 h-px bg-gray-600 mx-4" />;
  }

  function Platform({ icon, label }) {
    return (
      <div className="text-center p-4 rounded-xl border border-gray-600 hover:border-cyan-400 cursor-pointer">
        <i className={`fa-brands ${icon} text-3xl text-white mb-2`}></i>
        <div className="text-sm text-gray-300">{label}</div>
      </div>
    );
  }

  /* ================== SUCCESS MODAL ================== */
  function SuccessModal() {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-cyan-500 flex items-center justify-center animate-pulse">
            <FontAwesomeIcon icon={faCheck} className="text-white text-4xl" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">{t("login.welcomeAboard")}</h2>
          <p className="text-xl text-gray-300 mb-8">{t("login.accountReady")}</p>
          <div className="flex items-center justify-center gap-2">
            <Dot delay="0s" />
            <Dot delay="0.1s" />
            <Dot delay="0.2s" />
          </div>
        </div>
      </div>
    );
  }

  function Dot({ delay }) {
    return <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: delay }}></div>;
  }

  /* ================== LANGUAGE SELECTOR ================== */
  const LANGUAGES = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "nl", label: "Nederlands", flag: "🇳🇱" },
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
  ];

  const { language, updateSettings, raw: rawSettings } = useSettings();
  const t = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleLanguageChange = (newLang) => {
    const updated = { ...rawSettings, ai: { ...(rawSettings.ai || {}), language: newLang } };
    updateSettings(updated);
    setShowLangMenu(false);
  };

  /* ================== LOGIN STATE ================== */
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [success, setSuccess] = useState(false);

  // Typing effect for tagline
  const taglines = [t("login.tagline1"), t("login.tagline2"), t("login.tagline3")];
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Reset typing when language changes
  useEffect(() => {
    setCharIdx(0);
    setDeleting(false);
    setDisplayText("");
  }, [language]);

  useEffect(() => {
    const current = taglines[taglineIdx];
    const timeout = deleting ? 30 : 60;

    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => setCharIdx(charIdx + 1), timeout);
      return () => clearTimeout(t);
    } else if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    } else if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx(charIdx - 1), timeout);
      return () => clearTimeout(t);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTaglineIdx((taglineIdx + 1) % taglines.length);
    }
  }, [charIdx, deleting, taglineIdx]);

  useEffect(() => {
    setDisplayText(taglines[taglineIdx].slice(0, charIdx));
  }, [charIdx, taglineIdx]);

  const connect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOnboarding(true);
    }, 2000);
  };
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const connectTwitter = () => {
    window.location.href = `${API}/api/oauth/twitter/start`;
  };
  const connectLinkedIn = () => {
    window.location.href = `${API}/api/oauth/linkedin/start`;
  };
  const connectMedium = () => {
    window.location.href = `${API}/api/oauth/medium/start`;
  };
  const continueWithoutConnecting = async () => {
    setLoading(true);
    try {
      const data = await loginGuest();
      if (data.user) localStorage.setItem("user", JSON.stringify({
        ...data.user,
        full_name: `${data.user.first_name || "Guest"} ${data.user.last_name || "User"}`.trim(),
      }));
      setSuccess(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    } catch (e) {
      console.error("Guest login failed:", e);
      setLoading(false);
    }
  };

  /* ================== RETURN ================== */
  return (
    <div className="min-h-screen relative text-white overflow-x-hidden">
      <Background />
      <FeatureCarousel features={[
        { icon: faMagicWandSparkles, title: t("login.aiContentOptimization"), description: t("login.aiContentOptimizationDesc"), bgClass: "bg-cyan-400/20", textClass: "text-cyan-400" },
        { icon: faClock, title: t("login.smartScheduling"), description: t("login.smartSchedulingDesc"), bgClass: "bg-violet-400/20", textClass: "text-violet-400" },
        { icon: faChartLine, title: t("login.advancedAnalytics"), description: t("login.advancedAnalyticsDesc"), bgClass: "bg-green-400/20", textClass: "text-green-400" },
      ]} carouselTitle={t("login.whyAutoPoster")} />

      {/* Language Selector - top right */}
      <div className="fixed top-6 right-6 z-40">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="w-10 h-10 rounded-full glass-effect border border-gray-700/50 hover:border-cyan-400/40 transition-all flex items-center justify-center group"
          >
            <FontAwesomeIcon icon={faGlobe} className="text-gray-300 group-hover:text-cyan-400 transition-colors" />
          </button>

          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
              <div className="absolute top-12 right-0 w-48 z-50 glass-effect rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 max-h-72 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                      lang.code === language
                        ? "bg-cyan-400/10 text-cyan-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {lang.code === language && <i className="fa-solid fa-check text-xs ml-auto" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main login container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8 pb-32">
        <div className="w-full max-w-lg">
          {/* Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl glass-effect glow-cyan relative group cursor-default">
              <div className="absolute inset-0 gradient-accent rounded-3xl opacity-20 animate-pulse-slow"></div>
              <div className="absolute inset-0 rounded-3xl bg-cyan-400/10 scale-110 blur-xl animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
              <div className="relative z-10 flex items-center space-x-1 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-pen-nib text-2xl text-cyan-400"></i>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                  <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Auto
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Poster
              </span>
            </h1>
            <p className="text-2xl font-semibold text-gray-300 mb-3 h-8">
              {displayText}<span className="animate-pulse text-cyan-400">|</span>
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">{t("login.connectAndLetAI")}</p>
          </div>

          {/* Login Card */}
          <div className="glass-effect rounded-3xl p-8 glow-border relative overflow-hidden">
            <div className="absolute inset-0 gradient-accent opacity-5 rounded-3xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-3">{t("login.welcomeToFuture")}</h2>
                <p className="text-gray-400">{t("login.connectSocialPlatforms")}</p>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-4 mb-8">
                <OAuthButton icon="fa-x-twitter" label={t("login.connectTwitter")} onClick={connectTwitter} />
                <OAuthButton icon="fa-linkedin-in" label={t("login.connectLinkedIn")} onClick={connectLinkedIn} />
                <OAuthButton icon="fa-medium" label={t("login.connectMedium")} onClick={connectMedium} />
              </div>

              <div className="text-center">
                <div className="flex items-center mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  <span className="px-4 text-gray-500 text-sm">{t("login.or")}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                </div>
                <button onClick={continueWithoutConnecting} disabled={loading} className="w-full p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all disabled:opacity-50">
                  <span className="font-medium">{loading ? t("login.connectingBtn") : t("login.continueWithout")}</span>
                  <span className="block text-sm text-gray-500 mt-1">{t("login.addPlatformsLater")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right feature cards */}
      <div className="hidden xl:flex flex-col gap-6 absolute right-8 top-32 z-10">
       {/* AI Features Card */}
  <div className="glass-effect rounded-2xl p-6 border border-cyan-400/20">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center mr-3">
        <FontAwesomeIcon icon={faRobot} className="text-white" />
      </div>
      <h3 className="text-white font-semibold">{t("login.aiPoweredContent")}</h3>
    </div>
    <ul className="space-y-2 text-sm text-gray-400">
      <li className="flex items-center">
        <FontAwesomeIcon icon={faCheck} className="text-green-400 mr-2 text-xs" />
        {t("login.platformOptimizedPosts")}
      </li>
      <li className="flex items-center">
        <FontAwesomeIcon icon={faCheck} className="text-green-400 mr-2 text-xs" />
        {t("login.smartImageSuggestions")}
      </li>
      <li className="flex items-center">
        <FontAwesomeIcon icon={faCheck} className="text-green-400 mr-2 text-xs" />
        {t("login.engagementAnalytics")}
      </li>
    </ul>
  </div>

  {/* Multi-Platform Card with real logos */}
  <div className="glass-effect rounded-2xl p-6 border border-violet-400/20">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center mr-3">
        <FontAwesomeIcon icon={faShareNodes} className="text-white" />
      </div>
      <h3 className="text-white font-semibold">{t("login.multiPlatform")}</h3>
    </div>

    <div className="flex space-x-2">
      {/* X / Twitter */}
      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
        <i className="fa-brands fa-x-twitter text-white text-xs"></i>
      </div>

      {/* LinkedIn */}
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <i className="fa-brands fa-linkedin-in text-white text-xs"></i>
      </div>

      {/* Medium */}
      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
        <i className="fa-brands fa-medium text-white text-xs"></i>
      </div>
    </div>
  </div>
      </div>

      <StatsCard />
      <SecurityBadge />

      {loading && <LoadingOverlay />}
      {onboarding && <OnboardingModal onClose={() => setOnboarding(false)} />}
      {success && <SuccessModal />}
    </div>
  );
}
