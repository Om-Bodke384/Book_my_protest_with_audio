import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireRole from "./components/RequireRole";
import Home from "./pages/Home";
import ProtesterRegister from "./pages/ProtesterRegister";
import ProtesterLogin from "./pages/ProtesterLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProtest from "./pages/CreateProtest";
import ProtestDetail from "./pages/ProtestDetail";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<ProtesterRegister />} />
        <Route path="/login" element={<ProtesterLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/protests/:id" element={<ProtestDetail />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/admin/protests/new"
          element={
            <RequireRole role="admin">
              <CreateProtest />
            </RequireRole>
          }
        />
      </Routes>
    </div>
  );
}
