// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/settings";
import VoiceTrainer from "./pages/voicetrainer";
import MediaCompanionPage from "./pages/MediaCompanionPage";
import VoiceCloner from "./pages/clone";
import Layout from "./components/Layout";
import SchedulingPage from "./pages/SchedulingPage";
import CreatePostPage from "./pages/CreatePostPage";
import PostsLibrary from  "./pages/PostsLibrary";
import PerformanceOptimizer from "./pages/PerformanceOptimizer";
<<<<<<< HEAD
import QuoteTemplate from "./pages/Quotetemplate"; // si .jsx

=======
import ABTesterPage from "./pages/ABTesterPage";
>>>>>>> 46646ae145a050626ddda62065379fd628f66fb5





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
          
          <Route path="/Scheduling" element={<SchedulingPage />} />
           {/* Create Post */}
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/PerformanceOptimizer" element={<PerformanceOptimizer />} />
<<<<<<< HEAD
        <Route path="/QuoteTemplate" element={<QuoteTemplate />} />
=======
        <Route path="/hook-generator" element={<HookGenerator />} />
         <Route path="/clone" element={<VoiceCloner />} />

>>>>>>> 46646ae145a050626ddda62065379fd628f66fb5

        {/* Posts Library */}
        <Route path="/posts-library" element={<PostsLibrary />} />
         <Route path="/MediaCompanionPage" element={<MediaCompanionPage />} />
         <Route path="ABTesterPage" element={<ABTesterPage />}></Route>
         

        </Route>
        

      </Routes>
    </Router>
  );
}
