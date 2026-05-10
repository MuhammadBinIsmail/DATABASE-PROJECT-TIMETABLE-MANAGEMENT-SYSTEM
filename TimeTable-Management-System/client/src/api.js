const API_BASE = "http://localhost:5000/api";

export const api = {
  get: async (path) => {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },
  del: async (path) => {
    const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Delete failed");
    return data;
  }
};
