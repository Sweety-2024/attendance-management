import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

export default function EmployeeLogin({ onLoginSuccess }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password })
      });

      const data = await res.json();

      if (data.success) {
        // Optional verification if logged in via Admin tab
        if (isAdminLogin && data.employee.role === 'employee') {
          setErrorMsg("Access Denied: You do not have Admin privileges.");
          setLoading(false);
          return;
        }
        onLoginSuccess(data.employee);
      } else {
        setErrorMsg(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 space-y-6">
        
        {/* Portal Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-emerald-400">Digital Arena</h1>
          <p className="text-sm text-slate-400 mt-1">Attendance & HR Management System</p>
        </div>

        {/* Role Mode Selector */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setIsAdminLogin(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${!isAdminLogin ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Employee Login
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLogin(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${isAdminLogin ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <ShieldCheck size={14} /> Admin Login
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-950 border border-rose-800 text-rose-300 text-xs rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              {isAdminLogin ? 'Admin ID' : 'Employee ID'}
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                placeholder={isAdminLogin ? "e.g. EMP001" : "e.g. EMP102"}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-semibold py-3 rounded-xl transition cursor-pointer text-sm shadow-lg"
          >
            {loading ? 'Authenticating...' : `Sign In as ${isAdminLogin ? 'Admin' : 'Employee'}`}
          </button>
        </form>
      </div>
    </div>
  );
}