import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { Users, MapPin } from "lucide-react";
import { Protest } from "../types";

// Custom pin so it matches the ember/white brand instead of Leaflet's default blue marker.
function pinIcon(status: Protest["status"]) {
  const color = status === "ongoing" ? "#dc3c14" : status === "cancelled" ? "#9ca3af" : "#f4552b";
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
    <div className={`glass-card overflow-hidden ${heightClass}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {protests.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={pinIcon(p.status)}>
            <Popup>
              <div className="w-56 space-y-1.5 font-body">
                <p className="text-xs font-bold uppercase tracking-wide text-ember-600">{p.cause}</p>
                <p className="font-semibold text-ink-900 leading-snug">{p.title}</p>
                <p className="flex items-center gap-1 text-xs text-ink-900/60">
                  <MapPin size={12} /> {p.address}, {p.city}
                </p>
                <p className="flex items-center gap-1 text-xs text-ink-900/60">
                  <Users size={12} /> {p.joinedCount} joined
                </p>
                <Link to={`/protests/${p.id}`} className="inline-block mt-1 text-xs font-semibold text-ember-600 hover:underline">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
