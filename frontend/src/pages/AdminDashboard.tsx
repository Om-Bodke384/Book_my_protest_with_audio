import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../api/axios";
import { Protest } from "../types";
import { useAuthStore } from "../store/authStore";

const statusOptions: Protest["status"][] = ["upcoming", "ongoing", "completed", "cancelled"];

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const [protests, setProtests] = useState<Protest[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api.get("/protests/mine").then((r) => setProtests(r.data.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function changeStatus(id: string, status: string) {
    await api.patch(`/protests/${id}/status`, { status });
    load();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Welcome, {user?.name}</h1>
          <p className="text-sm text-ink-900/50">Manage the protests you've organized.</p>
        </div>
        <Link to="/admin/protests/new" className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> New protest
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-ink-900/50">Loading…</p>
      ) : protests.length === 0 ? (
        <div className="glass-card p-10 text-center text-ink-900/50">
          You haven't organized any protests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {protests.map((p) => (
            <div key={p.id} className="glass-card p-5 flex items-center justify-between gap-4">
              <div>
                <Link to={`/protests/${p.id}`} className="font-semibold text-ink-900 hover:text-ember-600">{p.title}</Link>
                <p className="text-xs text-ink-900/50">{p.city} · {new Date(p.scheduledAt).toLocaleString()}</p>
              </div>
              <select
                value={p.status}
                onChange={(e) => changeStatus(p.id, e.target.value)}
                className="input-field !w-auto !py-1.5 text-sm capitalize"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
