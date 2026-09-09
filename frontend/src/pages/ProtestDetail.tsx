import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Calendar, Users, Building2 } from "lucide-react";
import { api } from "../api/axios";
import { Protest } from "../types";
import MapView from "../components/MapView";
import { useAuthStore } from "../store/authStore";

export default function ProtestDetail() {
  const { id } = useParams();
  const { role } = useAuthStore();
  const [protest, setProtest] = useState<(Protest & { admin?: any }) | null>(null);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get(`/protests/${id}`).then((r) => setProtest(r.data.data));
  }, [id]);

  async function toggleJoin() {
    if (role !== "protester") {
      setMsg("Register as a protester to join this event.");
      return;
    }
    setBusy(true);
    try {
      if (joined) {
        await api.delete(`/protests/${id}/join`);
        setJoined(false);
      } else {
        await api.post(`/protests/${id}/join`);
        setJoined(true);
      }
      const r = await api.get(`/protests/${id}`);
      setProtest(r.data.data);
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!protest) return <div className="max-w-3xl mx-auto px-6 py-14 text-ink-900/50">Loading…</div>;

  const date = new Date(protest.scheduledAt);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      {protest.bannerUrl && (
        <img src={protest.bannerUrl} className="w-full h-64 object-cover rounded-2xl shadow-glass" />
      )}

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-ember-600">{protest.cause}</span>
        <h1 className="font-display text-3xl text-ink-900">{protest.title}</h1>
        <p className="text-ink-900/70">{protest.description}</p>
      </div>

      <div className="glass-card p-5 grid sm:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-ink-900/70">
          <Calendar size={16} className="text-ember-500" /> {date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="flex items-center gap-2 text-ink-900/70">
          <MapPin size={16} className="text-ember-500" /> {protest.address}, {protest.city}
        </div>
        <div className="flex items-center gap-2 text-ink-900/70">
          <Users size={16} className="text-ember-500" /> {protest.joinedCount} people joined
        </div>
        {protest.organizerOrg && (
          <div className="flex items-center gap-2 text-ink-900/70">
            <Building2 size={16} className="text-ember-500" /> {protest.organizerOrg}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggleJoin} disabled={busy} className={joined ? "btn-outline" : "btn-primary"}>
          {joined ? "Leave protest" : "I'm joining this protest"}
        </button>
        {msg && <span className="text-sm text-ink-900/50">{msg}</span>}
      </div>

      <MapView protests={[protest]} center={[protest.latitude, protest.longitude]} zoom={14} heightClass="h-80" />
    </div>
  );
}
