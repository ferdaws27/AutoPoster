// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import PostsLibrary from  "./pages/PostsLibrary";
import PerformanceOptimizer from "./pages/PerformanceOptimizer";
import Analytics from  "./pages/Analytics";
import ABTesterPage from "./pages/ABTesterPage";





export default function App() {
  return (

    <Router >
     
      <Routes>
        {/* Login page is separate */}
        <Route path="/login" element={<Login />} />

        {/* All other pages share the sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="voicetrainer" element={<VoiceTrainer />} />
          <Route path="mediacompanion" element={<MediaCompanionPage />} />
          <Route path="Analytics" element={<Analytics />} />
          
          <Route path="/Scheduling" element={<SchedulingPage />} />
           {/* Create Post */}
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/PerformanceOptimizer" element={<PerformanceOptimizer />} />
        <Route path="/HookGeneratePage" element={<HookGeneratePage />} />
         <Route path="/clone" element={<VoiceCloner />} />
        

        {/* Posts Library */}
        <Route path="/posts-library" element={<PostsLibrary />} />
         <Route path="/MediaCompanionPage" element={<MediaCompanionPage />} />
         <Route path="ABTesterPage" element={<ABTesterPage />}></Route>
         

        </Route>
        

      </Routes>
    </Router>
  );
}
