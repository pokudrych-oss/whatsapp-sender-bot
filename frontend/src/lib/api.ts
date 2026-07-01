const isDev = import.meta.env.DEV;

export const API_URL = import.meta.env.VITE_API_URL || (isDev ? "http://localhost:5000/api" : `${window.location.origin}/api`);
export const WS_URL = import.meta.env.VITE_WS_URL || (isDev ? "ws://localhost:5000" : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`);

// Helper fetch wrappers
export async function apiRequest(path: string, options?: RequestInit) {
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
