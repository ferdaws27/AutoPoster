// src/services/auth.js
import { apiFetch } from "./api";

export async function loginGuest() {
  // ✅ login temporaire (guest) en attendant vrai OAuth + vrai user/password
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "guest@autoposter.tn",
      password: "guest",
    }),
  });

  localStorage.setItem("token", data.access_token);
  return data;
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}