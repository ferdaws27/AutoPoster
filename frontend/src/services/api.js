// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const msg =
      (data && data.message) || (typeof data === "string" ? data : "Erreur API");
    throw new Error(msg);
  }

  return data;
}