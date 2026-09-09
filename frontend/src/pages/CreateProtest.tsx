import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import LocationPicker from "../components/LocationPicker";

export default function CreateProtest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", cause: "", description: "", address: "", city: "", scheduledAt: "" });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) {
      setError("Drop a pin on the map for where the protest will happen.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append("latitude", String(coords.lat));
      data.append("longitude", String(coords.lng));
      if (banner) data.append("banner", banner);

      const res = await api.post("/protests", data, { headers: { "Content-Type": "multipart/form-data" } });
      navigate(`/protests/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create protest");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Organize a protest</h1>
        <p className="text-sm text-ink-900/50">Pin the location so people nearby can find it on the map.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <input required placeholder="Protest title" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Cause (e.g. Climate Justice, Labor Rights)" className="input-field" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} />
        <textarea required placeholder="Description" rows={4} className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Meeting address" className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input required placeholder="City" className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>

        <input required type="datetime-local" className="input-field" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />

        <LocationPicker value={coords} onChange={(lat, lng) => setCoords({ lat, lng })} />

        <div>
          <label className="text-sm font-medium text-ink-900/70">Banner image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] || null)} className="block mt-1 text-sm" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? "Publishing…" : "Publish protest"}</button>
      </form>
    </div>
  );
}
