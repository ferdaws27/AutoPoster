import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("FULL URL:", window.location.href);

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
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <div style={{ padding: 20 }}>Connexion en cours...</div>;
}