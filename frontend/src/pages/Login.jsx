import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faShareNodes,
  faMagicWandSparkles,
  faClock,
  faChartLine,
  faRocket,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faXTwitter, faLinkedinIn, faMedium, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import * as Toast from "@radix-ui/react-toast";

export default function Login() {
  /* ================== BACKGROUND ================== */
  function Background() {
    return (
      <div className="fixed inset-0 gradient-bg z-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400/10 blur-3xl rounded-full" />
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-violet-400/10 blur-3xl rounded-full" />
      </div>
    );
  }

  /* ================== OAUTH BUTTON ================== */
  function OAuthButton({ icon, label, onClick }) {
    return (
      <button
        onClick={onClick}
        className="w-full p-4 rounded-2xl bg-black/50 border border-gray-700 hover:border-cyan-400 transition-all group relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-center space-x-4">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={icon} className="text-white text-lg" />
          </div>
          <span className="text-white font-medium text-lg">{label}</span>
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

  /* ================== FEATURE CAROUSEL ================== */
  const FEATURES = [
    {
      icon: faMagicWandSparkles,
      title: "AI Content Optimization",
      description: "Automatically adapts your content for each platform’s audience and format.",
      color: "cyan",
    },
    {
      icon: faClock,
      title: "Smart Scheduling",
      description: "Posts at optimal times based on engagement and audience behavior.",
      color: "violet",
    },
    {
      icon: faChartLine,
      title: "Advanced Analytics",
      description: "Track growth, engagement, and ROI across all platforms.",
      color: "green",
    },
  ];

  function FeatureCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % FEATURES.length);
      }, 4000);
      return () => clearInterval(timer);
    }, []);

    const feature = FEATURES[index];

    return (
      <div className="fixed top-8 left-8 w-96 z-20 hidden lg:block">
        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Why AutoPoster?</h3>
            <div className="flex space-x-1">
              {FEATURES.map((_, i) => (
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
                className={`w-8 h-8 rounded-lg bg-${feature.color}-400/20 flex items-center justify-center`}
              >
                <FontAwesomeIcon icon={feature.icon} className={`text-${feature.color}-400 text-sm`} />
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
          <Stat value="10K+" label="Posts Created" color="text-cyan-400" />
          <Stat value="500+" label="Active Users" color="text-violet-400" />
          <Stat value="95%" label="Time Saved" color="text-green-400" />
        </div>
        <div className="hidden md:flex flex-col items-end text-right space-y-2">
          <div className="text-white font-medium">Trusted by creators worldwide</div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" className="w-8 h-8 rounded-full border-2 border-gray-700" />
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" className="w-8 h-8 rounded-full border-2 border-gray-700" />
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" className="w-8 h-8 rounded-full border-2 border-gray-700" />
            </div>
            <span className="text-sm text-gray-400">+497 others</span>
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
              <div className="text-white font-medium text-sm">Enterprise Security</div>
              <div className="text-gray-400 text-xs">SOC 2 Compliant • End-to-End Encrypted</div>
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
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 text-white">
        Connecting...
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
            <h2 className="text-3xl font-bold text-white mb-2">Let’s Get You Started</h2>
            <p className="text-gray-400">Complete your profile to unlock AutoPoster</p>
          </div>
          <div className="flex items-center justify-between mb-8">
            <Step active label="Connect Platforms" number="1" />
            <Divider />
            <Step label="Set Preferences" number="2" />
            <Divider />
            <Step label="Create First Post" number="3" />
          </div>
          <div className="bg-black/30 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Choose Your Platforms</h3>
            <div className="grid grid-cols-3 gap-4">
              <Platform icon={faXTwitter} label="Twitter / X" />
              <Platform icon={faLinkedin} label="LinkedIn" />
              <Platform icon={faMedium} label="Medium" />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white">
              Skip for now
            </button>
            <button className="flex-1 p-4 rounded-2xl bg-cyan-500 text-white font-medium">Continue Setup</button>
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
        <FontAwesomeIcon icon={icon} className="text-3xl text-white mb-2" />
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
          <h2 className="text-4xl font-bold text-white mb-4">Welcome Aboard!</h2>
          <p className="text-xl text-gray-300 mb-8">Your AutoPoster account is ready 🚀</p>
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

  /* ================== LOGIN STATE ================== */
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
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
const connectLinkedIn = () => {
  window.location.href = `${API}/api/oauth/linkedin/start`;
};

  /* ================== RETURN ================== */
  return (
    <div className="min-h-screen relative text-white overflow-hidden">
      <Background />
      <FeatureCarousel />

      {/* Main login container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-lg">
          {/* Brand */}
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
            <p className="text-2xl font-semibold text-gray-300 mb-3">Write Once. Post Everywhere.</p>
            <p className="text-gray-400 text-lg leading-relaxed">Connect your platforms and let AI handle the rest.</p>
          </div>

          {/* Login Card */}
          <div className="glass-effect rounded-3xl p-8 glow-border relative overflow-hidden">
            <div className="absolute inset-0 gradient-accent opacity-5 rounded-3xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-3">Welcome to the Future</h2>
                <p className="text-gray-400">Connect your social platforms to get started with AI-powered content distribution</p>
              </div>
              <div className="space-y-4 mb-8">
                <OAuthButton icon={faXTwitter} label="Connect X (Twitter)" onClick={connect} />
                <OAuthButton icon={faLinkedinIn} label="Connect LinkedIn" onClick={connectLinkedIn} />
                <OAuthButton icon={faMedium} label="Connect Medium" onClick={connect} />
              </div>
              <div className="text-center">
                <div className="flex items-center mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  <span className="px-4 text-gray-500 text-sm">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                </div>
                <button onClick={() => setSuccess(true)} className="w-full p-4 rounded-2xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all">
                  <span className="font-medium">Continue without connecting</span>
                  <span className="block text-sm text-gray-500 mt-1">You can add platforms later</span>
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
      <h3 className="text-white font-semibold">AI-Powered Content</h3>
    </div>
    <ul className="space-y-2 text-sm text-gray-400">
      <li className="flex items-center">
        <FontAwesomeIcon icon={faCheck} className="text-green-400 mr-2 text-xs" />
        Platform-optimized posts
      </li>
      <li className="flex items-center">
        <FontAwesomeIcon icon={faCheck} className="text-green-400 mr-2 text-xs" />
        Smart image suggestions
      </li>
      <li className="flex items-center">
        <FontAwesomeIcon icon={faCheck} className="text-green-400 mr-2 text-xs" />
        Engagement analytics
      </li>
    </ul>
  </div>

  {/* Multi-Platform Card with real logos */}
  <div className="glass-effect rounded-2xl p-6 border border-violet-400/20">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center mr-3">
        <FontAwesomeIcon icon={faShareNodes} className="text-white" />
      </div>
      <h3 className="text-white font-semibold">Multi-Platform</h3>
    </div>

    <div className="flex space-x-2">
      {/* X / Twitter */}
      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
        <FontAwesomeIcon icon={faXTwitter} className="text-white text-xs" />
      </div>

      {/* LinkedIn */}
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <FontAwesomeIcon icon={faLinkedinIn} className="text-white text-xs" />
      </div>

      {/* Medium */}
      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
        <FontAwesomeIcon icon={faMedium} className="text-white text-xs" />
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