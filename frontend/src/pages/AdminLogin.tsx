import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function AdminLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", form);
      const { user, accessToken } = res.data.data;
      setSession(user, "admin", accessToken);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className="glass-card p-8 space-y-6">
        <h1 className="font-display text-2xl text-ink-900 text-center">Organizer login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-primary w-full bg-ink-900 hover:bg-ink-800 shadow-none">{loading ? "Logging in…" : "Log in"}</button>
        </form>
        <GoogleAuthButton role="admin" onError={setError} />
        <p className="text-center text-sm text-ink-900/50">
          New organizer? <Link to="/admin/register" className="text-ember-600 font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
}
