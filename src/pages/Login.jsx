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
import { faXTwitter, faLinkedinIn, faMedium } from "@fortawesome/free-brands-svg-icons";

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
      {onboarding && <OnboardingModal onClose={() => setOnboarding(false)} />}
      {success && <SuccessModal />}
    </div>
  );
}
