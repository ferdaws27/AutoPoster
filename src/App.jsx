// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/settings";
import VoiceTrainer from "./pages/voicetrainer";
import MediaCompanionPage from "./pages/MediaCompanionPage";
import VoiceCloner from "./pages/clone";
import Layout from "./components/Layout";

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
          <Route path="voicecloner" element={<VoiceCloner />} />
          
          
        </Route>
      </Routes>
    </Router>
  );
}
