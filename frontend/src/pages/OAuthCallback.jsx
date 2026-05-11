import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    console.log("FULL URL:", window.location.href);

    if (!window.location.pathname || !window.location.pathname.includes("/oauth/callback")) {
      console.log("Not on /oauth/callback, skipping OAuth handling.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    let token = params.get("token");

    if (!token && window.location.hash) {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      token = hashParams.get("token");
    }

    console.log("TOKEN =", token);

    if (!token) {
      if (window.location.pathname && window.location.pathname.includes("/oauth/callback")) {
        navigate("/login", { replace: true });
      }
      return;
    }

    const decoded = decodeURIComponent(token);
    localStorage.setItem("token", decoded);

    const saveUser = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${decoded}` },
        });
        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (e) {
        console.warn("Failed to refresh user after OAuth callback:", e);
      }

      const hash = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      const provider = hashParams.get("provider");
      const userEncoded = hashParams.get("user");

      if (provider && userEncoded) {
        try {
          const parts = decodeURIComponent(userEncoded).split("||");
          const fallbackUser = {
            username: parts[0] || "",
            full_name: parts[1] || parts[0] || "",
            name: parts[1] || parts[0] || "",
            profile_picture: parts[2] || "",
            oauth_provider: provider,
          };
          localStorage.setItem("user", JSON.stringify(fallbackUser));
        } catch (e) {
          console.warn("Failed to parse user info:", e);
        }
      }

      navigate("/dashboard", { replace: true });
    };

    saveUser();
  }, [navigate]);

  return <div style={{ padding: 20 }}>Connexion en cours...</div>;
}
