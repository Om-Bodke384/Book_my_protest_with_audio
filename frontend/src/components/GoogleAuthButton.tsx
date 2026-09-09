import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { Role } from "../types";

interface Props {
  role: Role;
  onError?: (message: string) => void;
}

// Renders Google's official button and posts the returned ID token to our
// backend, which verifies it and returns the same { user, accessToken }
// shape as the regular email/password login endpoints.
export default function GoogleAuthButton({ role, onError }: Props) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  // If VITE_GOOGLE_CLIENT_ID isn't set, main.tsx never mounts
  // GoogleOAuthProvider, and this button would throw — so bail out quietly.
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  async function handleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      onError?.("Google sign-in failed — no credential returned");
      return;
    }
    try {
      const endpoint = role === "admin" ? "/auth/admin/google" : "/auth/protester/google";
      const res = await api.post(endpoint, { idToken: credentialResponse.credential });
      const { user, accessToken } = res.data.data;
      setSession(user, role, accessToken);
      navigate(role === "admin" ? "/admin/dashboard" : "/");
    } catch (err: any) {
      onError?.(err.response?.data?.message || "Google sign-in failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-900/10" />
        <span className="text-xs text-ink-900/40">or</span>
        <div className="h-px flex-1 bg-ink-900/10" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.("Google sign-in failed")}
          text={role === "admin" ? "continue_with" : "signin_with"}
          shape="pill"
        />
      </div>
    </div>
  );
}
