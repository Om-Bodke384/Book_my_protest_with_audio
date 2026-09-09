import { Link } from "react-router-dom";
import { MapPin, Users, Calendar } from "lucide-react";
import { Protest } from "../types";

const statusStyle: Record<Protest["status"], string> = {
  upcoming: "bg-blue-50 text-blue-700",
  ongoing: "bg-ember-500 text-white",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-slate-200 text-slate-600 line-through",
};

export default function ProtestCard({ protest }: { protest: Protest }) {
  const date = new Date(protest.scheduledAt);
  return (
    <Link to={`/protests/${protest.id}`} className="glass-card p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200 group">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ember-600">{protest.cause}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[protest.status]}`}>
          {protest.status === "ongoing" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1 pulse-dot" />}
          {protest.status}
        </span>
      </div>

      <h3 className="font-display text-lg leading-snug text-ink-900 group-hover:text-ember-600 transition-colors">
        {protest.title}
      </h3>
      <p className="text-sm text-ink-900/60 line-clamp-2">{protest.description}</p>

      <div className="flex flex-col gap-1.5 mt-1 text-xs text-ink-900/55">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} /> {date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} · {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={13} /> {protest.address}, {protest.city}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} /> {protest.joinedCount} joined{protest.organizerOrg ? ` · organized by ${protest.organizerOrg}` : ""}
        </span>
      </div>
    </Link>
  );
}
