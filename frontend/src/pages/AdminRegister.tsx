import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function AdminRegister() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({ name: "", email: "", password: "", organization: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/register", form);
      const { user, accessToken } = res.data.data;
      setSession(user, "admin", accessToken);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="glass-card p-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-900 text-white mb-1">
            <ShieldCheck size={22} />
          </span>
          <h1 className="font-display text-2xl text-ink-900">Register as an organizer</h1>
          <p className="text-sm text-ink-900/50">Create and manage protest events on the map.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Organization (optional)" className="input-field" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          <input required type="email" placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Password (min 8 characters)" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-primary w-full bg-ink-900 hover:bg-ink-800 shadow-none">
            {loading ? "Creating account…" : "Register as organizer"}
          </button>
        </form>

        <GoogleAuthButton role="admin" onError={setError} />

        <p className="text-center text-sm text-ink-900/50">
          Already an organizer? <Link to="/admin/login" className="text-ember-600 font-semibold">Log in</Link>
        </p>
        <p className="text-center text-xs text-ink-900/40">
          Here to attend instead? <Link to="/register" className="text-ember-600 font-semibold">Register as a protester</Link>
        </p>
      </div>
    </div>
  );
}
