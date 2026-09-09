import axios from "axios";
import { useAuthStore } from "../store/authStore";

// In dev, Vite's proxy forwards "/api" to the local backend. In production,
// VITE_API_URL should point at the deployed backend including "/api".
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const requestUrl = typeof original?.url === "string" ? original.url : "";
    const isRefreshRequest = requestUrl.endsWith("/auth/refresh");

    // Do not retry the refresh request itself, otherwise an expired refresh
    // cookie can create an endless 401 loop.
    if (original && error.response?.status === 401 && !isRefreshRequest && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = api
          .post("/auth/refresh")
          .then((response) => {
            const token = response.data.data.accessToken as string;
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
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
