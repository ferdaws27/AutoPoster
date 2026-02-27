import { useMemo, useState } from "react";
import Background from "../components/Background";
import OAuthButton from "../components/OAuthButton";
import FeatureCarousel from "../components/FeatureCarousel";
import StatsBar from "../components/StatsBar";
import SecurityBadge from "../components/SecurityBadge";
import LoadingOverlay from "../components/LoadingOverlay";
import SuccessModal from "../components/SuccessModal";

import {
  faXTwitter,
  faLinkedinIn,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";

const API_BASE = "http://127.0.0.1:5000"; // backend

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // onboarding modal open/close
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // step state
  const [step, setStep] = useState(1);

  // Platforms state
  const [platforms, setPlatforms] = useState({
    twitter: false,
    linkedin: false,
    medium: false,
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: "fr",
    timezone: "Africa/Tunis",
    frequency: "3xWeek", // daily | 3xWeek | weekly
    bestTime: "18:00",
    tone: "Professional", // Professional | Casual | Friendly
    ai: {
      optimizePerPlatform: true,
      generateHashtags: true,
      imageSuggestions: true,
    },
  });

  // First post (draft)
  const [firstPost, setFirstPost] = useState({
    title: "",
    content: "",
  });

  const selectedCount = useMemo(
    () => Object.values(platforms).filter(Boolean).length,
    [platforms]
  );

  const connect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOnboardingOpen(true);
      setStep(1);
    }, 2000);
  };

  const continueWithoutConnecting = () => {
    setOnboardingOpen(true);
    setStep(1);
  };

  const closeOnboarding = () => {
    setOnboardingOpen(false);
    setStep(1);
  };

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  // Finish onboarding: save local + optional send backend (if token exists)
  const finish = async () => {
    localStorage.setItem("autoposter_platforms", JSON.stringify(platforms));
    localStorage.setItem("autoposter_preferences", JSON.stringify(preferences));
    localStorage.setItem("autoposter_first_post", JSON.stringify(firstPost));

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API_BASE}/api/preferences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ platforms, preferences }),
        });
      } catch (e) {
        console.warn("Could not save preferences to backend yet:", e);
      }
    }

    setOnboardingOpen(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen relative text-white overflow-hidden">
      <Background />
      <FeatureCarousel />

      {/* ================= SECTION: Animated Background ================= */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-transparent rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-400/5 to-violet-400/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "3s" }}
        ></div>
        <div className="mesh-gradient absolute inset-0 opacity-5"></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-30"></div>
        <div
          className="absolute top-3/4 right-1/4 w-1 h-1 bg-violet-400 rounded-full animate-float opacity-40"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-float opacity-20"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-violet-300 rounded-full animate-float opacity-35"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* ================= SECTION: Main Login Container ================= */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-lg">
          {/* ================= BRAND SECTION ================= */}
          <div className="text-center mb-12 animate-float">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl glass-effect glow-cyan relative">
              <div className="absolute inset-0 gradient-accent rounded-3xl opacity-20 animate-pulse-slow"></div>
              <div className="relative z-10 flex items-center space-x-1">
                <i className="fa-solid fa-pen-nib text-2xl text-cyan-400"></i>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-violet-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Auto
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Poster
              </span>
            </h1>

            <p className="text-2xl font-semibold text-gray-300 mb-3">
              Write Once. Post Everywhere.
            </p>

            <p className="text-gray-400 text-lg leading-relaxed">
              Connect your platforms and let AI handle the rest.
            </p>
          </div>

          {/* ================= LOGIN CARD ================= */}
          <div className="glass-effect rounded-3xl p-8 glow-border relative overflow-hidden">
            <div className="absolute inset-0 gradient-accent opacity-5 rounded-3xl" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-3">
                  Welcome to the Future
                </h2>
                <p className="text-gray-400">
                  Connect your social platforms to get started with AI-powered
                  content distribution
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <OAuthButton
                  icon={faXTwitter}
                  label="Connect X (Twitter)"
                  onClick={connect}
                />
                <OAuthButton
                  icon={faLinkedinIn}
                  label="Connect LinkedIn"
                  onClick={connect}
                />
                <OAuthButton
                  icon={faMedium}
                  label="Connect Medium"
                  onClick={connect}
                />
              </div>

              <div className="text-center">
                <div className="flex items-center mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  <span className="px-4 text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                </div>

                <button
                  onClick={continueWithoutConnecting}
                  className="w-full p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
                >
                  <span className="font-medium">
                    Continue without connecting
                  </span>
                  <span className="block text-sm text-gray-500 mt-1">
                    You can add platforms later
                  </span>
                </button>

                {selectedCount > 0 && (
                  <p className="text-center text-xs text-gray-500 mt-4">
                    Selected platforms: {selectedCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FEATURE CARDS */}
      <div className="hidden xl:flex flex-col gap-6 absolute right-8 top-32 z-10">
        {/* AI Features Card */}
        <div className="glass-effect rounded-2xl p-6 border border-cyan-400/20">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center mr-3">
              <i className="fa-solid fa-robot text-white"></i>
            </div>
            <h3 className="text-white font-semibold">AI-Powered Content</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <i className="fa-solid fa-check text-green-400 mr-2 text-xs"></i>
              Platform-optimized posts
            </li>
            <li className="flex items-center">
              <i className="fa-solid fa-check text-green-400 mr-2 text-xs"></i>
              Smart image suggestions
            </li>
            <li className="flex items-center">
              <i className="fa-solid fa-check text-green-400 mr-2 text-xs"></i>
              Engagement analytics
            </li>
          </ul>
        </div>

        {/* Platforms Card */}
        <div className="glass-effect rounded-2xl p-6 border border-violet-400/20">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center mr-3">
              <i className="fa-solid fa-share-nodes text-white"></i>
            </div>
            <h3 className="text-white font-semibold">Multi-Platform</h3>
          </div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <i className="fa-brands fa-x-twitter text-white text-xs"></i>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fa-brands fa-linkedin-in text-white text-xs"></i>
            </div>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <i className="fa-brands fa-medium text-white text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      <StatsBar />
      <SecurityBadge />

      {loading && <LoadingOverlay />}

      {/* ✅ ONBOARDING MODAL */}
      {onboardingOpen && (
        <OnboardingModalInline
          step={step}
          onClose={closeOnboarding}
          onNext={next}
          onBack={back}
          onFinish={finish}
          platforms={platforms}
          setPlatforms={setPlatforms}
          preferences={preferences}
          setPreferences={setPreferences}
          firstPost={firstPost}
          setFirstPost={setFirstPost}
        />
      )}

      {success && <SuccessModal />}
    </div>
  );
}

/* ====================== ONBOARDING MODAL (INLINE) ====================== */

function OnboardingModalInline({
  step,
  onClose,
  onNext,
  onBack,
  onFinish,
  platforms,
  setPlatforms,
  preferences,
  setPreferences,
  firstPost,
  setFirstPost,
}) {
  const stepLabel =
    step === 1
      ? "Connect Platforms"
      : step === 2
      ? "Set Preferences"
      : "Create First Post";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl glass-effect rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-5 rounded-3xl" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Let’s Get You Started</h2>
              <p className="text-gray-400 mt-1">
                Complete your profile to unlock AutoPoster
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Stepper */}
          <Stepper step={step} />

          {/* Content */}
          <div className="mt-8">
            {step === 1 && (
              <ConnectPlatformsStep
                platforms={platforms}
                setPlatforms={setPlatforms}
              />
            )}
            {step === 2 && (
              <SetPreferencesStep
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}
            {step === 3 && (
              <CreateFirstPostStep
                firstPost={firstPost}
                setFirstPost={setFirstPost}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-gray-400">{stepLabel}</div>

            <div className="flex gap-3">
              {step > 1 ? (
                <button
                  onClick={onBack}
                  className="px-6 py-3 rounded-2xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                >
                  Skip for now
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={onNext}
                  className="px-6 py-3 rounded-2xl bg-cyan-500 hover:opacity-90 text-white font-semibold"
                >
                  Continue Setup
                </button>
              ) : (
                <button
                  onClick={onFinish}
                  className="px-6 py-3 rounded-2xl bg-cyan-500 hover:opacity-90 text-white font-semibold"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const active = "bg-cyan-500 text-black";
  const idle = "bg-gray-700 text-gray-200";

  return (
    <div className="flex items-center gap-4 text-sm">
      <StepDot
        n={1}
        label="Connect Platforms"
        active={step === 1}
        activeCls={active}
        idleCls={idle}
      />
      <div className="flex-1 h-px bg-gray-700" />
      <StepDot
        n={2}
        label="Set Preferences"
        active={step === 2}
        activeCls={active}
        idleCls={idle}
      />
      <div className="flex-1 h-px bg-gray-700" />
      <StepDot
        n={3}
        label="Create First Post"
        active={step === 3}
        activeCls={active}
        idleCls={idle}
      />
    </div>
  );
}

function StepDot({ n, label, active, activeCls, idleCls }) {
  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          active ? activeCls : idleCls
        }`}
      >
        {n}
      </div>
      <div className={`${active ? "text-white" : "text-gray-400"} font-medium`}>
        {label}
      </div>
    </div>
  );
}

/* ====================== STEP 1: Platforms ====================== */

function ConnectPlatformsStep({ platforms, setPlatforms }) {
  const toggle = (key) => setPlatforms((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="bg-black/20 rounded-3xl p-6">
      <h3 className="text-2xl font-bold mb-2">Choose Your Platforms</h3>
      <p className="text-gray-400 mb-6">
        Select where you want AutoPoster to publish.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <PlatformTile
          title="Twitter / X"
          icon="fa-x-twitter"
          active={platforms.twitter}
          onClick={() => toggle("twitter")}
        />
        <PlatformTile
          title="LinkedIn"
          icon="fa-linkedin-in"
          active={platforms.linkedin}
          onClick={() => toggle("linkedin")}
        />
        <PlatformTile
          title="Medium"
          icon="fa-medium"
          active={platforms.medium}
          onClick={() => toggle("medium")}
        />
      </div>
    </div>
  );
}

function PlatformTile({ title, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-6 border transition-all text-center ${
        active ? "border-cyan-400 bg-cyan-400/10" : "border-gray-700 bg-black/20"
      }`}
    >
      <div className="text-3xl mb-3">
        <i className={`fa-brands ${icon}`}></i>
      </div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-400 mt-1">
        {active ? "Selected" : "Tap to select"}
      </div>
    </button>
  );
}

/* ====================== STEP 2: Preferences ====================== */

function SetPreferencesStep({ preferences, setPreferences }) {
  const update = (key, value) =>
    setPreferences((p) => ({ ...p, [key]: value }));
  const updateAI = (key, value) =>
    setPreferences((p) => ({ ...p, ai: { ...p.ai, [key]: value } }));

  return (
    <div className="bg-black/20 rounded-3xl p-6">
      <h3 className="text-2xl font-bold mb-2">Set Preferences</h3>
      <p className="text-gray-400 mb-6">
        Customize AutoPoster to match your style.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400">Language</label>
          <select
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={preferences.language}
            onChange={(e) => update("language", e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400">Timezone</label>
          <input
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={preferences.timezone}
            onChange={(e) => update("timezone", e.target.value)}
            placeholder="Africa/Tunis"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Posting Frequency</label>
          <select
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={preferences.frequency}
            onChange={(e) => update("frequency", e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="3xWeek">3x / week</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400">Best Time</label>
          <input
            type="time"
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={preferences.bestTime}
            onChange={(e) => update("bestTime", e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm text-gray-400">Tone</label>
          <div className="mt-2 flex gap-3">
            {["Professional", "Casual", "Friendly"].map((t) => (
              <button
                key={t}
                onClick={() => update("tone", t)}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  preferences.tone === t
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-gray-700 bg-gray-900/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 mt-2">
          <label className="text-sm text-gray-400">AI Options</label>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <ToggleCard
              title="Optimize"
              active={preferences.ai.optimizePerPlatform}
              onClick={() =>
                updateAI(
                  "optimizePerPlatform",
                  !preferences.ai.optimizePerPlatform
                )
              }
            />
            <ToggleCard
              title="Hashtags"
              active={preferences.ai.generateHashtags}
              onClick={() =>
                updateAI("generateHashtags", !preferences.ai.generateHashtags)
              }
            />
            <ToggleCard
              title="Images"
              active={preferences.ai.imageSuggestions}
              onClick={() =>
                updateAI("imageSuggestions", !preferences.ai.imageSuggestions)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleCard({ title, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-4 text-center transition-all ${
        active
          ? "border-violet-400 bg-violet-400/10"
          : "border-gray-700 bg-gray-900/40"
      }`}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-400 mt-1">{active ? "On" : "Off"}</div>
    </div>
  );
}

/* ====================== STEP 3: First Post ====================== */

function CreateFirstPostStep({ firstPost, setFirstPost }) {
  return (
    <div className="bg-black/20 rounded-3xl p-6">
      <h3 className="text-2xl font-bold mb-2">Create Your First Post</h3>
      <p className="text-gray-400 mb-6">Write a quick draft to start.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Title</label>
          <input
            className="mt-2 w-full bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={firstPost.title}
            onChange={(e) =>
              setFirstPost((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="My first AutoPoster post"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Content</label>
          <textarea
            className="mt-2 w-full min-h-32 bg-gray-900/60 border border-gray-700 rounded-xl px-3 py-3"
            value={firstPost.content}
            onChange={(e) =>
              setFirstPost((p) => ({ ...p, content: e.target.value }))
            }
            placeholder="Write something…"
          />
        </div>
      </div>
    </div>
  );
}