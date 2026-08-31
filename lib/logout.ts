import { API_BASE_URL } from "./config";

export async function logout(): Promise<void> {
  try {
    let token: string | null = null;
    try {
      token = localStorage.getItem("auth_token");
    } catch {
      // localStorage unavailable
    }

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });
  } catch {
    // Network error: still proceed with local cleanup
  } finally {
    try {
      localStorage.removeItem("auth_token");
    } catch {
      // localStorage unavailable
    }
    window.location.href = "/login";
  }
}
