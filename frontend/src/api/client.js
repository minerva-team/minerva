const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

const text = await response.text();
const data = text ? JSON.parse(text) : {};

if (!response.ok) {
  throw new Error(data.detail || "Something went wrong");
}

return data;
}