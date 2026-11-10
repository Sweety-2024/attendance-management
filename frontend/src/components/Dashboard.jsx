
import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayAttendanceCount: 0,
    pendingLeavesCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const currentEmployeeId =
    localStorage.getItem("employeeId") || "EMP001";

  // Fetch Dashboard Stats
  const fetchStats = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/dashboard/stats"
      );

      const data = await res.json();

      if (data.success) {
        setStats(data);
      }

      // Fetch employee attendance status
      const statusRes = await fetch(
        `http://localhost:5000/api/attendance/status?employeeId=${currentEmployeeId}`
      );

      const statusData = await statusRes.json();

      if (statusData.success) {
        setIsCheckedIn(statusData.isCheckedIn);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);

    const intervalId = setInterval(() => {
      fetchStats(false);
    }, 10000);

    const handleFocus = () => fetchStats(false);

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Employee Check In
  const handleCheckIn = async () => {
    if (isCheckedIn) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            "http://localhost:5000/api/attendance/check-in",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                employeeId: currentEmployeeId,
                latitude: lat,
                longitude: lon,
                faceMatched: true,
              }),
            }
          );

          const data = await response.json();

          alert(data.message);

          if (data.success) {
            setIsCheckedIn(true);
            fetchStats(false);
          }
        } catch (err) {
          console.error("Check-in error:", err);
          alert("Backend server connection failed!");
        }
      },
      () => {
        alert("GPS Location access denied or unavailable.");
      }
    );
  };

  // Employee Check Out
  const handleCheckOut = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/attendance/check-out",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: currentEmployeeId,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (data.success) {
        setIsCheckedIn(false);
        fetchStats(false);
      }
    } catch (err) {
      console.error("Check-out error:", err);
      alert("Backend server connection failed!");
    }
  };

  // Attendance Percentage
  const attendancePercentage =
    stats.totalEmployees > 0
      ? Math.round(
          (stats.todayAttendanceCount / stats.totalEmployees) * 100
        )
      : 0;

  return (
    <div className="p-8 bg-blue-50/40 min-h-screen space-y-8 font-sans">

      {/* Dashboard Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">

        <div>
          <div className="flex items-center gap-3 flex-wrap">

            {/* Company Logo */}
            <img
              src="/logo.jpeg"
              alt="Company Logo"
              className="w-14 h-14 object-contain rounded-xl"
            />

            <h1 className="text-2xl font-bold text-blue-950 tracking-tight">
              Executive Dashboard
            </h1>

            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 animate-pulse">
              <ShieldCheck size={12} />
              Live Sync Active
            </span>

          </div>

          <p className="text-sm text-blue-600/80 mt-2">
            Real-time attendance tracking & workforce analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => fetchStats(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer border border-blue-200 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Stats
          </button>

          <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide shadow-md flex items-center gap-2">
            <Building2 size={14} className="text-emerald-300" />

            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>

        </div>
      </header>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl">

        <div className="relative z-10 max-w-2xl">

          <span className="inline-block bg-white/20 text-emerald-100 text-xs font-medium px-3 py-1 rounded-full border border-white/30 mb-3">
            Management Portal
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            Welcome Back, Admin 👋
          </h2>

          <p className="text-blue-100 text-sm opacity-90 leading-relaxed">
            Your dashboard updates dynamically as employees check in,
            register, or submit leaves.
          </p>

        </div>

        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none" />

      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Employees */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">

          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600/70">
              Total Workforce
            </p>

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users size={22} />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-blue-950">
              {stats.totalEmployees}
            </h3>

            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Registered active accounts
            </p>
          </div>

        </div>

        {/* Present Today */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-200">

          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/70">
              Present Today
            </p>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck size={22} />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-emerald-600">
              {stats.todayAttendanceCount}
            </h3>

            <p className="text-xs text-emerald-700 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp size={14} />
              {attendancePercentage}% attendance rate
            </p>
          </div>

        </div>

        {/* Pending Leaves */}
        <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all duration-200">

          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700/70">
              Pending Leave Requests
            </p>

            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <Clock size={22} />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-teal-700">
              {stats.pendingLeavesCount}
            </h3>

            <p className="text-xs text-teal-600 mt-1 font-medium">
              Awaiting management review
            </p>
          </div>

        </div>

      </div>

      {/* Attendance Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Attendance Monitor */}
        <div className="lg:col-span-2 bg-white p-7 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">

          <div>

            <div className="flex justify-between items-center mb-4">

              <div>
                <h3 className="text-lg font-bold text-blue-950">
                  Company Attendance Monitor
                </h3>

                <p className="text-xs text-blue-600/80 mt-0.5">
                  Live check-in status and shift controls
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold font-mono text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {stats.todayAttendanceCount} / {stats.totalEmployees} Checked-In
                </span>
              </div>

            </div>

            {/* Attendance Progress */}
            <div className="w-full bg-blue-50 h-3.5 rounded-full overflow-hidden mb-6 p-0.5 border border-blue-100">

              <div
                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${attendancePercentage}%` }}
              />

            </div>

          </div>

          {/* Check In / Check Out */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-50">

            <button
              onClick={handleCheckIn}
              disabled={isCheckedIn}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold shadow-md transition text-sm ${
                isCheckedIn
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white hover:shadow-lg cursor-pointer"
              }`}
            >
              <LogIn size={18} />

              <span>
                {isCheckedIn
                  ? "Checked In Successfully"
                  : "Shift Check In"}
              </span>
            </button>

            <button
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 active:scale-[0.99] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition cursor-pointer text-sm"
            >
              <LogOut size={18} />
              <span>Shift Check Out</span>
            </button>

          </div>

        </div>

        {/* Administrative Center */}
        <div className="bg-white p-7 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">

          <div>
            <h3 className="text-lg font-bold text-blue-950 mb-1">
              Administrative Center
            </h3>

            <p className="text-xs text-blue-600/80 mb-6">
              Quick reporting and system tools
            </p>
          </div>

          <div className="space-y-3">

            <button
              onClick={() =>
                alert("Preparing attendance report export...")
              }
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border border-blue-200 hover:border-emerald-500 bg-blue-50/60 hover:bg-emerald-50/50 text-blue-900 hover:text-emerald-800 text-sm font-semibold transition cursor-pointer shadow-sm"
            >
              <FileSpreadsheet size={18} className="text-blue-600" />
              <span>Export Attendance Summary</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
