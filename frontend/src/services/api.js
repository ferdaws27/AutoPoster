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
    
    // Handle credit exhaustion with user-friendly message
    if (res.status === 402 || (typeof msg === "string" && msg.toLowerCase().includes("credit"))) {
      throw new Error("⚠️ AI credits exhausted. Please recharge your OpenRouter account at openrouter.ai/settings/credits");
    }
    
    throw new Error(msg);
  }

  return data;
}

/**
 * Call the backend AI generate proxy.
 * Returns the AI-generated text content string.
 */
export async function aiGenerate({ prompt, model, temperature, max_tokens, system, user_content, language }) {
  const data = await apiFetch("/api/ai/generate/", {
    method: "POST",
    body: JSON.stringify({ prompt, model, temperature, max_tokens, system, user_content, language }),
  });
  if (!data.success) throw new Error(data.error || "AI generation failed");
  return data.content;
}

// ─── A/B Test API ───
export async function createABTest(payload) {
  return apiFetch("/api/ab-tests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getABTests() {
  return apiFetch("/api/ab-tests/");
}

export async function runABTest(testId) {
  return apiFetch(`/api/ab-tests/${testId}/run`, { method: "POST" });
}

export async function deleteABTest(testId) {
  return apiFetch(`/api/ab-tests/${testId}`, { method: "DELETE" });
}

export async function pauseABTest(testId) {
  return apiFetch(`/api/ab-tests/${testId}/pause`, { method: "POST" });
}

export async function getABStats() {
  return apiFetch("/api/ab-tests/stats");
}

export async function aiAssistABTest(content, action) {
  return apiFetch("/api/ab-tests/ai-assist", {
    method: "POST",
    body: JSON.stringify({ content, action }),
  });
}

export async function getABTestAnalysis(testId) {
  return apiFetch(`/api/ab-tests/${testId}/analysis`);
}

export async function getABInsights() {
  return apiFetch("/api/ab-tests/insights");
}

export async function getABSettings() {
  return apiFetch("/api/ab-tests/settings");
}

export async function saveABSettings(settings) {
  return apiFetch("/api/ab-tests/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
