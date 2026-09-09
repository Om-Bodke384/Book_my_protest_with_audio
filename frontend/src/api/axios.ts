import axios from "axios";
import { useAuthStore } from "../store/authStore";

// In dev, Vite's proxy (see vite.config.ts) forwards "/api" to the local
// backend, so the default of "/api" just works. In production the frontend
// and backend are typically deployed separately (e.g. Vercel + Render), so
// VITE_API_URL should point at the full backend URL, e.g.
// https://bookmyprotest-api.onrender.com/api
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = api
          .post("/auth/refresh")
          .then((r) => {
            const token = r.data.data.accessToken as string;
            useAuthStore.getState().setAccessToken(token);
            return token;
          })
          .catch(() => {
            useAuthStore.getState().clear();
            return null;
          })
          .finally(() => {
            refreshing = null;
          });
      }
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
