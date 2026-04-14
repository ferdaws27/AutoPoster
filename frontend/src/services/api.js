// src/services/api.js
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  // Only add Content-Type for requests with a body (POST, PUT, PATCH)
  if (options.body || options.method?.toUpperCase() === 'POST' || options.method?.toUpperCase() === 'PUT' || options.method?.toUpperCase() === 'PATCH') {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) || (typeof data === "string" ? data : "Erreur API");
    throw new Error(msg);
  }

  return data;
}

/**
 * Call the backend AI generate proxy.
 * Returns the AI-generated text content string.
 */
export async function aiGenerate({ prompt, model, temperature, max_tokens }) {
  const data = await apiFetch("/api/ai/generate/", {
    method: "POST",
    body: JSON.stringify({ prompt, model, temperature, max_tokens }),
  });
  if (!data.success) throw new Error(data.error || "AI generation failed");
  return data.content;
}

