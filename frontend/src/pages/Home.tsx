import { useEffect, useState } from "react";
import { Search, MapPinned } from "lucide-react";
import { api } from "../api/axios";
import { Protest } from "../types";
import MapView from "../components/MapView";
import ProtestCard from "../components/ProtestCard";

export default function Home() {
  const [protests, setProtests] = useState<Protest[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/protests")
      .then((r) => setProtests(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = protests.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.city.toLowerCase().includes(query.toLowerCase()) ||
      p.cause.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      <section className="text-center space-y-5 py-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ember-600 bg-ember-50 px-3 py-1 rounded-full">
          <MapPinned size={13} /> {protests.length} causes near you and beyond
        </span>
        <h1 className="font-display text-4xl md:text-5xl text-ink-900 leading-tight">
          Find a protest. <span className="text-ember-500">Show up.</span> Be counted.
        </h1>
        <p className="text-ink-900/60 max-w-xl mx-auto">
          BookMyProtest connects organizers with people ready to march. Register, drop a pin, and let your city see where the movement is happening.
        </p>

        <div className="max-w-md mx-auto relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/30" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by cause, city, or title..."
            className="input-field !pl-11"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-ink-900">Live protest map</h2>
        <MapView protests={filtered} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink-900">All causes</h2>
        {loading ? (
          <p className="text-ink-900/50 text-sm">Loading protests…</p>
        ) : filtered.length === 0 ? (
          <p className="text-ink-900/50 text-sm">No protests match that search yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <ProtestCard key={p.id} protest={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
