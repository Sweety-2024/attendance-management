import React, { useState } from "react";
import { Routes, Route, NavLink, Outlet, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  BarChart3, 
  Settings,
  LogOut
} from "lucide-react";

import Dashboard from "./components/Dashboard";
import EmployeeSection from "./components/EmployeeSection";
import LeaveManagement from "./components/LeaveManagement";
import ReportsSection from "./components/ReportsSection";
import SettingsSection from "./components/SettingsSection";
import EmployeeLogin from "./components/EmployeeLogin";
import EmployeeDashboard from "./components/EmployeeDashboard";

// Admin Layout with Sidebar & Navigation
function AdminLayout({ user, onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="w-64 bg-emerald-900 text-white flex flex-col justify-between p-5 shadow-xl shrink-0">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-wide text-emerald-400">Digital Arena</h1>
            <p className="text-xs text-emerald-200 opacity-80 mt-1 capitalize">
              {user?.role || 'Admin'} Portal ({user?.name})
            </p>
          </div>

          <nav className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/70 mb-3 px-3">Main Menu</p>
            
            <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${isActive ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </NavLink>
            
            <NavLink to="/employees" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${isActive ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              <Users size={18} /> <span>Employees List</span>
            </NavLink>

            <NavLink to="/leave-management" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${isActive ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              <FileSpreadsheet size={18} /> <span>Leave Approvals</span>
            </NavLink>

            <NavLink to="/reports" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${isActive ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              <BarChart3 size={18} /> <span>Attendance Reports</span>
            </NavLink>

            <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${isActive ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800'}`}>
              <Settings size={18} /> <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className="pt-4 border-t border-emerald-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("digital_arena_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("digital_arena_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("digital_arena_user");
  };

  if (!user) {
    return <EmployeeLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (user.role === 'employee') {
    return <EmployeeDashboard employee={user} onLogout={handleLogout} />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout user={user} onLogout={handleLogout} />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<EmployeeSection />} />
        <Route path="leave-management" element={<LeaveManagement />} />
        <Route path="reports" element={<ReportsSection />} />
        <Route path="settings" element={<SettingsSection />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}