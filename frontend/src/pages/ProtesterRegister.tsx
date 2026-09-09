import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserRound, Camera } from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function ProtesterRegister() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "", city: "", phone: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (photo) data.append("photo", photo);

      const res = await api.post("/auth/protester/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { user, accessToken } = res.data.data;
      setSession(user, "protester", accessToken);
      navigate("/");
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
          <h1 className="font-display text-2xl text-ink-900">Register as a protester</h1>
          <p className="text-sm text-ink-900/50">Put a face and a name behind the cause.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-ember-50 border-2 border-dashed border-ember-300 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <UserRound className="text-ember-400" size={34} />
                )}
              </div>
              <span className="absolute bottom-0 right-0 bg-ember-500 text-white rounded-full p-1.5 shadow group-hover:bg-ember-600">
                <Camera size={13} />
              </span>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>

          <input required placeholder="Full name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Password (min 8 characters)" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <textarea required placeholder="Address" className="input-field resize-none" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="City" className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input placeholder="Phone" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Register & join the movement"}
          </button>
        </form>

        <GoogleAuthButton role="protester" onError={setError} />
        <p className="text-xs text-center text-ink-900/40 -mt-2">
          Signing up with Google skips the address for now — you can add it later from your profile.
        </p>

        <p className="text-center text-sm text-ink-900/50">
          Already registered? <Link to="/login" className="text-ember-600 font-semibold">Log in</Link>
        </p>
        <p className="text-center text-xs text-ink-900/40">
          Organizing an event instead? <Link to="/admin/register" className="text-ember-600 font-semibold">Register as an admin</Link>
        </p>
      </div>
    </div>
  );
}
