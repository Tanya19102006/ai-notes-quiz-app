const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  // For file uploads (FormData) the browser sets the Content-Type itself
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await res.json().catch(() => ({}));

  // Expired/invalid token: tell AuthContext to log the user out
  if (res.status === 401 && token) window.dispatchEvent(new Event("auth-expired"));

  if (!res.ok) throw new Error(data.message || "Request failed.");
  return data;
}

export const api = {
  signup: (email, password) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  generate: (notes) =>
    request("/notes/generate", { method: "POST", body: JSON.stringify({ notes }) }),
  extractPdf: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/notes/extract", { method: "POST", body: form });
  },
  history: () => request("/notes/history"),
  getNote: (id) => request(`/notes/${id}`),
  deleteNote: (id) => request(`/notes/${id}`, { method: "DELETE" })
};
