import { useState } from "react";
import Background from "../components/Background";
import OAuthButton from "../components/OAuthButton";
import FeatureCard from "../components/FeatureCard";
import FeatureCarousel from "../components/FeatureCarousel";
import StatsBar from "../components/StatsBar";
import SecurityBadge from "../components/SecurityBadge";
import LoadingOverlay from "../components/LoadingOverlay";
import OnboardingModal from "../components/OnboardingModal";
import SuccessModal from "../components/SuccessModal";

import { faRobot, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import {
  faXTwitter,
  faLinkedinIn,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [success, setSuccess] = useState(false);

  const connect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOnboarding(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen relative text-white overflow-hidden">
      <Background />

      {/* FEATURE CAROUSEL */}
      <FeatureCarousel />

      {/* MAIN CONTAINER */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-lg">

          {/* ================= BRAND SECTION ================= */}
          <div className="text-center mb-12 animate-float">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl glass-effect glow-cyan relative">
              <div className="absolute inset-0 gradient-accent rounded-3xl opacity-20 animate-pulse-slow" />
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
              <span className="gradient-accent bg-clip-text text-transparent">
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
                  onClick={() => setSuccess(true)}
                  className="w-full p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
                >
                  <span className="font-medium">
                    Continue without connecting
                  </span>
                  <span className="block text-sm text-gray-500 mt-1">
                    You can add platforms later
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FEATURE CARDS */}
      <div className="hidden xl:flex flex-col gap-6 absolute right-8 top-32 z-10">
        <FeatureCard
          title="AI-Powered Content"
          icon={faRobot}
          items={[
            "Platform-optimized posts",
            "Smart image suggestions",
            "Engagement analytics",
          ]}
        />
        <FeatureCard
          title="Multi-Platform"
          icon={faShareNodes}
          items={["Twitter/X", "LinkedIn", "Medium"]}
        />
      </div>

      <StatsBar />
      <SecurityBadge />

      {loading && <LoadingOverlay />}
      {onboarding && <OnboardingModal onClose={() => setOnboarding(false)} />}
      {success && <SuccessModal />}
    </div>
  );
}
