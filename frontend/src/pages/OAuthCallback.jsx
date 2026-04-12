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

      // Check for provider + user info (Medium OAuth passes these)
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      const provider = hashParams.get("provider");
      const userEncoded = hashParams.get("user");

      if (provider && userEncoded) {
        try {
          const parts = decodeURIComponent(userEncoded).split("||");
          const userData = {
            username: parts[0] || "",
            full_name: parts[1] || parts[0] || "",
            name: parts[1] || parts[0] || "",
            profile_picture: parts[2] || "",
            oauth_provider: provider,
          };
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (e) {
          console.warn("Failed to parse user info:", e);
        }
      }

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