// src/services/api.js
export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

/**
 * Validate if user input is meaningful and significant
 * Returns {valid: boolean, message: string}
 */
export function validateInputMeaningfulness(text) {
  if (!text || typeof text !== 'string') {
    return {
      valid: false,
      message: "❌ Input cannot be empty. Please provide meaningful content."
    };
  }

  const trimmed = text.trim();

  // Check minimum length
  if (trimmed.length < 3) {
    return {
      valid: false,
      message: "❌ Input is too short. Please provide at least 3 characters of meaningful content."
    };
  }

  // Check for repeated characters (e.g., "aaaaaaa", "!!!!!")
  const repeatedCharPattern = /(.)\1{4,}/g;
  if (repeatedCharPattern.test(trimmed)) {
    return {
      valid: false,
      message: "❌ Input contains repetitive characters. Please provide logical and meaningful content."
    };
  }

  // Check for only special characters or numbers
  const meaningfulPattern = /[a-zA-Z]/;
  if (!meaningfulPattern.test(trimmed)) {
    return {
      valid: false,
      message: "❌ Input must contain letters. Please provide meaningful text."
    };
  }

  // Check if it's mostly spaces or gibberish
  const words = trimmed.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) {
    return {
      valid: false,
      message: "❌ Input is not meaningful. Please provide proper words and phrases."
    };
  }

  // Check for excessive special characters
  const specialCharRatio = (trimmed.match(/[^a-zA-Z0-9\s]/g) || []).length / trimmed.length;
  if (specialCharRatio > 0.5) {
    return {
      valid: false,
      message: "❌ Input contains too many special characters. Please provide logical and clear content."
    };
  }

  // ✅ NEW: Check for gibberish - words must contain vowels (realistic language patterns)
  const vowels = 'aeiouAEIOU';
  let totalVowels = 0;
  let totalLetters = 0;
  
  for (const word of words) {
    // Count only letters
    const letters = word.match(/[a-zA-Z]/g) || [];
    const wordVowels = letters.filter(l => vowels.includes(l)).length;
    
    totalLetters += letters.length;
    totalVowels += wordVowels;
    
    // Each word must have at least 1 vowel in 4+ letter words
    if (letters.length >= 4 && wordVowels === 0) {
      return {
        valid: false,
        message: "❌ Input appears to be gibberish or random characters. Please provide real, meaningful words."
      };
    }
  }

  // Overall text should have a reasonable vowel ratio (typically 30-50% of letters are vowels)
  if (totalLetters > 0) {
    const vowelRatio = totalVowels / totalLetters;
    // If vowel ratio is too low, it's likely nonsense (like "DHFGDFKHDFKJGDFGD")
    if (vowelRatio < 0.15) {
      return {
        valid: false,
        message: "❌ Input does not look like real language. Please provide meaningful, logical content in a real language."
      };
    }
  }

  return { valid: true, message: "" };
}

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
