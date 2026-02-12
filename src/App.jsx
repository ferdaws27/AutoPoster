<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SchedulingPage from "./SchedulingPage";
import CreatePostPage from "./CreatePostPage";
import PostsLibrary from  "./PostsLibrary";
import HookGenerator from "./HookGenerator";
import PerformanceOptimizer from "./PerformanceOptimizer";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Page principale */}
        <Route path="/" element={<SchedulingPage />} />

        {/* Create Post */}
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/PerformanceOptimizer" element={<PerformanceOptimizer />} />
        <Route path="/hook-generator" element={<HookGenerator />} />

        {/* Posts Library */}
        <Route path="/posts-library" element={<PostsLibrary />} />
      </Routes>
    </Router>
  );
}
=======
import Login from "./pages/login";

//export default function App() {
  //<div className="min-h-screen bg-black"></div>
  //return <Login />;
//}

import SettingsPage from "./pages/settings";
import VoiceTrainer from "./pages/voicetrainer";
import MediaCompanionPage from "./pages/MediaCompanionPage";
import VoiceCloner from "./pages/clone";
import Dashboard from "./pages/Dashboard";



export default function App() {
  <div className="gradient-bg min-h-screen"></div>
  return <Login/>;}
>>>>>>> 9c3d31e368c23a014e6ff9ee08ca15204217e407
