import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HookGeneratePage from "./pages/HookGeneratePage";
import SettingsPage from "./pages/settings";
import VoiceTrainer from "./pages/voicetrainer";
import MediaCompanionPage from "./pages/MediaCompanionPage";
import VoiceCloner from "./pages/clone";
import Layout from "./components/Layout";
import SchedulingPage from "./pages/SchedulingPage";
import CreatePostPage from "./pages/CreatePostPage";
import PostsLibrary from "./pages/PostsLibrary";
import Trendradar from "./pages/Trendradar";
import PerformanceOptimizer from "./pages/PerformanceOptimizer";
import Analytics from "./pages/Analytics";
import QuoteTemplateGenerator from "./pages/QuoteTemplateGenerator";
import AIReputationPage from "./pages/AIReputationPage";
import OAuthCallback from "./pages/OAuthCallback";
import AudienceAnalyzer from "./pages/AudienceAnalyzer";
import ABTesterPage from "./pages/ABTesterPage";

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "14px 20px",
            fontSize: "14px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
          success: {
            iconTheme: { primary: "#22d3ee", secondary: "#1a1a2e" },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "#1a1a2e" },
          },
        }}
      />
      <Routes>
        {/* OAuth callback */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard + Layout */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="CreatePostPage" element={<CreatePostPage />} />
          <Route path="scheduling" element={<SchedulingPage />} />
          <Route path="PostsLibrary" element={<PostsLibrary />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="PerformanceOptimizer" element={<PerformanceOptimizer />} />
          <Route path="voicetrainer" element={<VoiceTrainer />} />
          <Route path="HookGeneratorPage" element={<HookGeneratePage />} />
          <Route path="mediacompanion" element={<MediaCompanionPage />} />
          <Route path="trendradar" element={<Trendradar />} />
          <Route path="clone" element={<VoiceCloner />} />
          <Route path="AIReputationPage" element={<AIReputationPage />} />
          <Route
            path="QuoteTemplateGenerator"
            element={<QuoteTemplateGenerator />}
          />
          <Route path="audience-analyzer" element={<AudienceAnalyzer />} />
          <Route path="ABTesterPage" element={<ABTesterPage />} />
        </Route>
      </Routes>
    </Router>
  );
}