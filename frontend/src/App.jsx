// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
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
import ABTesterPage from "./pages/ABTesterPage";
import QuoteTemplateGenerator from "./pages/QuoteTemplateGenerator";
import AIReputationPage from "./pages/AIReputationPage";
import OAuthCallback from "./pages/OAuthCallback";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redirection automatique vers login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* OAuth callback (DOIT être public) */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard + Sidebar */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="voicetrainer" element={<VoiceTrainer />} />
          <Route path="mediacompanion" element={<MediaCompanionPage />} />
          <Route path="Analytics" element={<Analytics />} />
          <Route path="Trendradar" element={<Trendradar />} />
          <Route path="AIReputationPage" element={<AIReputationPage />} />
          <Route path="Scheduling" element={<SchedulingPage />} />
          <Route path="create-post" element={<CreatePostPage />} />
          <Route path="PerformanceOptimizer" element={<PerformanceOptimizer />} />
          <Route path="HookGeneratePage" element={<HookGeneratePage />} />
          <Route path="clone" element={<VoiceCloner />} />
          <Route path="QuoteTemplateGenerator" element={<QuoteTemplateGenerator />} />
          <Route path="posts-library" element={<PostsLibrary />} />
          <Route path="ABTesterPage" element={<ABTesterPage />} />
        </Route>

        {/* Fallback */}
      </Routes>
    </Router>
  );
}