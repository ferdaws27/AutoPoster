import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("FULL URL:", window.location.href);

    // If we're not actually on the callback pathname, skip handling.
    // This avoids running the token parsing after navigation (or on StrictMode remount).
    if (!window.location.pathname || !window.location.pathname.includes("/oauth/callback")) {
      console.log("Not on /oauth/callback, skipping OAuth handling.");
      return;
    }

    // 1) Essayer querystring ?token=...
    const params = new URLSearchParams(window.location.search);
    let token = params.get("token");

    // 2) Sinon essayer hash #token=...
    if (!token && window.location.hash) {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      token = hashParams.get("token");
    }

    console.log("TOKEN =", token);

    if (token) {
      // decode au cas où
      const decoded = decodeURIComponent(token);
      localStorage.setItem("token", decoded);
      navigate("/dashboard", { replace: true });
    } else {
      // Only redirect to /login if we're actually on the callback path.
      // In dev React StrictMode can mount effects twice and the second mount
      // may run after navigation, which would incorrectly send users to /login.
      if (window.location.pathname && window.location.pathname.includes("/oauth/callback")) {
        navigate("/login", { replace: true });
      }
      // otherwise do nothing — we're probably already at another route.
    }
  }, []);

  return <div style={{ padding: 20 }}>Connexion en cours...</div>;
}