import { Link, useNavigate } from "react-router-dom";
import { Megaphone, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios";
import BgmToggle from "./BgmToggle";

export default function Navbar() {
  const { user, role, clear } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await api.post("/auth/logout");
    clear();
    navigate("/");
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/60">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg text-ink-900">
          <span className="w-8 h-8 rounded-lg bg-ember-500 flex items-center justify-center text-white">
            <Megaphone size={18} />
          </span>
          BookMy<span className="text-ember-600">Protest</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link to="/" className="text-ink-900/70 hover:text-ember-600 transition-colors">
            Explore
          </Link>
          {role === "admin" && (
            <Link to="/admin/dashboard" className="text-ink-900/70 hover:text-ember-600 transition-colors">
              Dashboard
            </Link>
          )}

          <BgmToggle />

          {user ? (
            <div className="flex items-center gap-3 pl-3 ml-1 border-l border-ink-900/10">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-ember-100 text-ember-600 flex items-center justify-center font-semibold text-xs">
                  {user.name[0]}
                </div>
              )}
              <span className="font-medium text-ink-900/80 hidden sm:block">{user.name}</span>
              <button onClick={handleLogout} className="text-ink-900/50 hover:text-ember-600" title="Logout">
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-ink-900/10">
              <Link to="/login" className="btn-outline !px-4 !py-1.5 !text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-1.5 !text-sm">
                Join a cause
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
