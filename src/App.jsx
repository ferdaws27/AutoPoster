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
