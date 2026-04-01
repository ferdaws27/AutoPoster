// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Component } from 'react';

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
import ABTesterPage from "./pages/ABTesterPage";
import QuoteTemplateGenerator from "./pages/QuoteTemplateGenerator";
import AIReputationPage from "./pages/AIReputationPage";
import OAuthCallback from "./pages/OAuthCallback";
import PostsProvider from "./context/PostsProvider";

// Error Boundary component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('Error caught by Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-6">An error occurred while loading this page.</p>
            <details className="text-left bg-black/30 p-4 rounded-lg">
              <summary className="cursor-pointer text-cyan-400">Error Details</summary>
              <pre className="text-red-300 text-sm mt-2">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <PostsProvider>
        <Router>
          <Routes>
            {/* OAuth callback route for external providers (reads token from hash or query) */}
            <Route path="/oauth/callback" element={<OAuthCallback />} />

          

          {/* Login */}
          {/* Login at / and /login */}
          <Route path="/" element={<Login />} />
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
            <Route path="CreatePostPage" element={<CreatePostPage />} />
            <Route path="PostsLibrary" element={<PostsLibrary />} />
            <Route path="HookGeneratePage" element={<HookGeneratePage />} />
            <Route path="PerformanceOptimizer" element={<PerformanceOptimizer />} />
            <Route path="ABTesterPage" element={<ABTesterPage />} />
            <Route path="QuoteTemplateGenerator" element={<QuoteTemplateGenerator />} />
            <Route path="clone" element={<VoiceCloner />} />
          </Route>

        </Routes>
      </Router>
    </PostsProvider>
    </ErrorBoundary>
  );
}