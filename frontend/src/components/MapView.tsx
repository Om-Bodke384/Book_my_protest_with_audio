import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { Users, MapPin, ShieldCheck } from "lucide-react";
import { Protest } from "../types";

const statusColors: Record<Protest["status"], string> = {
  upcoming: "#2563eb",
  ongoing: "#dc3c14",
  completed: "#64748b",
  cancelled: "#374151",
};

// The pin represents the organizer's registered protest location.
function pinIcon(status: Protest["status"]) {
  const color = statusColors[status];
  const html = `
    <div style="position:relative;width:34px;height:34px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;
        ${status === "ongoing" ? "animation:pulse-ring 1.8s infinite;" : ""}"></div>
      <div style="position:absolute;top:6px;left:6px;width:22px;height:22px;border-radius:50%;
        background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>
    </div>`;
  return L.divIcon({ html, className: "", iconSize: [34, 34], iconAnchor: [17, 17] });
}

interface Props {
  protests: Protest[];
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
}

export default function MapView({ protests, center = [20.5937, 78.9629], zoom = 5, heightClass = "h-[520px]" }: Props) {
  return (
    <div className={`glass-card overflow-hidden ${heightClass} relative`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {protests.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={pinIcon(p.status)}>
            <Popup>
              <div className="w-56 space-y-1.5 font-body">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-ember-600">{p.cause}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize text-white"
                    style={{ backgroundColor: statusColors[p.status] }}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="font-semibold text-ink-900 leading-snug">{p.title}</p>
                <p className="flex items-center gap-1 text-xs text-ink-900/60">
                  <ShieldCheck size={12} /> Organized by {p.organizerOrg || p.organizerName || "Community organizer"}
                </p>
                <p className="flex items-center gap-1 text-xs text-ink-900/60">
                  <MapPin size={12} /> {p.address}, {p.city}
                </p>
                <p className="flex items-center gap-1 text-xs text-ink-900/60">
                  <Users size={12} /> {p.joinedCount} protesters attending
                </p>
                <Link to={`/protests/${p.id}`} className="inline-block mt-1 text-xs font-semibold text-ember-600 hover:underline">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/95 px-3 py-2 shadow-glass backdrop-blur">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-900/60">Protest status</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-900/70">
          {(Object.keys(statusColors) as Protest["status"][]).map((status) => (
            <span key={status} className="flex items-center gap-1 capitalize">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
              {status}
            </span>
          ))}
        </div>
        <p className="mt-1.5 border-t border-ink-900/10 pt-1.5 text-[10px] text-ink-900/50">
          Pins mark organizer locations · counts show protesters attending · attendee addresses stay private
        </p>
      </div>
    </div>
  );
}
