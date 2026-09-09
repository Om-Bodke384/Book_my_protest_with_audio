import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import { Crosshair } from "lucide-react";

const icon = L.divIcon({
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#dc3c14;
    transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}

// Admins click anywhere on the map to drop the protest pin — no manual lat/lng typing.
export default function LocationPicker({ value, onChange }: Props) {
  const [center] = useState<[number, number]>([20.5937, 78.9629]);

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition((pos) => {
      onChange(pos.coords.latitude, pos.coords.longitude);
    });
  }

  return (
    <div className="space-y-2">
      <div className="glass-card overflow-hidden h-72 relative">
        <MapContainer center={value ? [value.lat, value.lng] : center} zoom={value ? 13 : 5} className="w-full h-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCapture onPick={onChange} />
          {value && <Marker position={[value.lat, value.lng]} icon={icon} />}
        </MapContainer>
        <button
          type="button"
          onClick={useMyLocation}
          className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur shadow-glass rounded-lg px-3 py-1.5 text-xs font-semibold text-ember-600 flex items-center gap-1 hover:bg-white"
        >
          <Crosshair size={14} /> Use my location
        </button>
      </div>
      <p className="text-xs text-ink-900/50">
        {value ? `Pinned at ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : "Click on the map to drop the protest pin."}
      </p>
    </div>
  );
}
