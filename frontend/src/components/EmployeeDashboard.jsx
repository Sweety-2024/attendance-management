import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, CheckCircle2, AlertCircle, FileText, Send, 
  MapPin, UserCheck, LogOut, Check, LogIn, IndianRupee, Gift 
} from 'lucide-react';

export default function EmployeeDashboard({ employee, onLogout }) {
  const [currentUser, setCurrentUser] = useState(employee || {});
  const [leaves, setLeaves] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
  const [checkInMsg, setCheckInMsg] = useState('');
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [loadingCheckOut, setLoadingCheckOut] = useState(false);

  // Once-per-day lock states
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [hasCheckedOutToday, setHasCheckedOutToday] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Salary Configuration
  const baseSalary = currentUser.baseSalary || 30000;
  const totalDaysInMonth = 30; 
  const perDaySalary = baseSalary / totalDaysInMonth;

  // Computed Attendance & Late Metrics
  const totalPresentDays = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const totalLateDays = attendanceRecords.filter(r => r.status === 'Late').length;
  const monthlyLateCount = currentUser.monthlyLateCount || 0;

  // Dynamic Current Month Salary Calculation (Present Days + Company Paid Offs/Holidays)
  const calculateCurrentSalary = () => {
    if (attendanceRecords.length === 0) return baseSalary;
    // Automatically includes company-provided paid offs/festivals (Sundays, 2nd/4th Sats, Diwali, Vishwakarma Puja)
    const totalPaidDays = totalPresentDays + 8; 
    return Math.min(baseSalary, Math.round(totalPaidDays * perDaySalary));
  };

  // Last Month Salary Calculation (Applying half-day deduction if late count >= 3)
  const calculateLastMonthSalary = () => {
    let deduction = 0;
    if (monthlyLateCount >= 3) {
      // 0.5 day deduction for breaching late policy threshold
      deduction = perDaySalary * 0.5; 
    }
    return Math.round(baseSalary - deduction);
  };

  const currentEarnedSalary = calculateCurrentSalary();
  const lastMonthNetSalary = calculateLastMonthSalary();

  useEffect(() => {
    if (currentUser && currentUser.employeeId) {
      fetchEmployeeLeaves(currentUser.employeeId);
      fetchEmployeeAttendance(currentUser.employeeId);
    }
  }, [currentUser]);

  const fetchEmployeeLeaves = async (empId) => {
    try {
      const res = await fetch('http://localhost:5000/api/leaves');
      const data = await res.json();
      setLeaves(data.filter(item => item.employeeId === empId));
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  const fetchEmployeeAttendance = async (empId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/${empId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAttendanceRecords(data);
        // Check if today's record already exists
        const todayRecord = data.find(r => r.date === todayStr);
        if (todayRecord) {
          if (todayRecord.inTime) setHasCheckedInToday(true);
          if (todayRecord.outTime && todayRecord.outTime !== 'Not Out Yet' && todayRecord.outTime !== 'Working...') {
            setHasCheckedOutToday(true);
          }
        } else {
          setHasCheckedInToday(false);
          setHasCheckedOutToday(false);
        }
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // Punch In Handler (Strictly once per day)
  const handleCheckIn = async () => {
    if (hasCheckedInToday) {
      alert("You have already checked in for today! Multiple check-ins are not permitted.");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingCheckIn(true);
    setCheckInMsg('');

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const payload = {
          employeeId: currentUser.employeeId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          faceMatched: true 
        };

        const res = await fetch('http://localhost:5000/api/attendance/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        setCheckInMsg(result.message);

        if (result.success) {
          setHasCheckedInToday(true);
          if (result.lateCount !== undefined) {
            const updated = { ...currentUser, monthlyLateCount: result.lateCount };
            setCurrentUser(updated);
            localStorage.setItem('digital_arena_user', JSON.stringify(updated));
          }
          fetchEmployeeAttendance(currentUser.employeeId);
        }
      } catch (err) {
        setCheckInMsg("Network error during check-in.");
      } finally {
        setLoadingCheckIn(false);
      }
    }, (error) => {
      setLoadingCheckIn(false);
      alert("GPS Permission denied or unavailable. Please enable location services.");
    });
  };

  // Punch Out Handler (Strictly once per day after check-in)
  const handleCheckOut = async () => {
    if (!hasCheckedInToday) {
      alert("You must check in first before checking out!");
      return;
    }
    if (hasCheckedOutToday) {
      alert("You have already checked out for today!");
      return;
    }

    setLoadingCheckOut(true);
    setCheckInMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: currentUser.employeeId })
      });

      const result = await res.json();
      setCheckInMsg(result.message);

      if (result.success) {
        setHasCheckedOutToday(true);
        fetchEmployeeAttendance(currentUser.employeeId);
      }
    } catch (err) {
      setCheckInMsg("Network error during check-out.");
    } finally {
      setLoadingCheckOut(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...leaveForm,
        employeeId: currentUser.employeeId,
        employeeName: currentUser.name
      };

      const res = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Leave request submitted successfully!");
        setLeaveForm({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
        fetchEmployeeLeaves(currentUser.employeeId);
      } else {
        alert("Failed to submit leave request.");
      }
    } catch (err) {
      console.error("Error submitting leave:", err);
    }
  };

  if (!currentUser || !currentUser.employeeId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-100">
        <p>Loading employee profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {currentUser.name}! 👋</h1>
            <p className="text-sm text-slate-400 mt-1">
              ID: <span className="font-mono text-emerald-400">{currentUser.employeeId}</span> | Department: {currentUser.department} | Designation: {currentUser.designation || 'Staff'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-950 border border-emerald-800 px-4 py-2 rounded-xl text-emerald-300 text-xs font-semibold">
              Active Shift: 10:00 AM – 06:00 PM
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} /> Logout
              </button>
            )}
          </div>
        </div>

        {/* Salary Calculation Card (Current Month vs Last Month) */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <IndianRupee size={20} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Salary Overview (Current Present vs. Last Month Payout)</h2>
            </div>
            <span className="text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full">
              Includes Sundays, 2nd/4th Sats & Festivals (Diwali, Vishwakarma Puja)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-semibold">Base Monthly CTC</p>
              <p className="text-2xl font-extrabold text-white font-mono mt-1">₹{baseSalary.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-1">Standard Fixed Salary</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-semibold">Current Month (Present Days)</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">₹{currentEarnedSalary.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-1">{totalPresentDays} days present + company paid offs</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-semibold">Last Month Final Payout</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">₹{lastMonthNetSalary.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {monthlyLateCount >= 3 ? '⚠️ Half-day deduction applied for lates' : 'Full salary (Within late limit)'}
              </p>
            </div>
          </div>

          {/* Festival Holiday & Policy Notice */}
          <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-blue-400" />
              <span><strong>Holiday & Policy Notice:</strong> Official festival holidays (Diwali, Vishwakarma Puja) and weekly offs (Sundays, 2nd & 4th Saturdays) are fully paid. Late penalties apply only if you exceed 3 late arrivals.</span>
            </div>
            <span className="font-semibold text-blue-300">Protected Pay</span>
          </div>
        </div>

        {/* Stats & Check-In / Check-Out Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Late Counter */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
                <AlertCircle size={18} className="text-amber-400" />
                <span>Monthly Late Attendance Counter</span>
              </div>
              <div className="flex items-baseline gap-3 my-3">
                <span className={`text-4xl font-extrabold font-mono ${monthlyLateCount >= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {monthlyLateCount}
                </span>
                <span className="text-slate-400 text-sm">/ 3 Permitted Lates</span>
              </div>
              <p className="text-xs text-slate-400">
                {monthlyLateCount >= 3 
                  ? '⚠️ Warning: 3+ late arrivals reached. Half-day deduction policy active.' 
                  : 'You are within the standard grace time threshold (up to 10:15 AM).'}
              </p>
            </div>
          </div>

          {/* GPS Check-In & Check-Out Card with Once-per-day Lock */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
                <MapPin size={18} className="text-emerald-400" />
                <span>Office Daily Shift Logging (Once-Per-Day)</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Record your in-time once with GPS verification at shift start, and punch out once upon completing work.
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleCheckIn}
                  disabled={loadingCheckIn || hasCheckedInToday}
                  className={`font-semibold py-3 px-3 rounded-xl shadow transition flex items-center justify-center gap-2 text-sm ${
                    hasCheckedInToday 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  }`}
                >
                  <UserCheck size={16} />
                  <span>{hasCheckedInToday ? 'Checked In Today ✅' : (loadingCheckIn ? 'Verifying...' : 'Punch In')}</span>
                </button>

                <button 
                  onClick={handleCheckOut}
                  disabled={loadingCheckOut || !hasCheckedInToday || hasCheckedOutToday}
                  className={`font-semibold py-3 px-3 rounded-xl shadow transition flex items-center justify-center gap-2 text-sm ${
                    !hasCheckedInToday || hasCheckedOutToday 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' 
                      : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  }`}
                >
                  <LogIn size={16} className="rotate-180" />
                  <span>{hasCheckedOutToday ? 'Checked Out Today ✅' : (loadingCheckOut ? 'Recording...' : 'Punch Out')}</span>
                </button>
              </div>

              {checkInMsg && (
                <div className="mt-3 text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 text-center">
                  {checkInMsg}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Date-Wise Attendance History */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-emerald-400" />
            <span>My Date-Wise Attendance History</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">In-Time</th>
                  <th className="py-3 px-4">Out-Time</th>
                  <th className="py-3 px-4">GPS Verification</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">No attendance logs recorded yet. Punch in above!</td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-700/20">
                      <td className="py-3 px-4 font-mono text-emerald-300 font-medium">{record.date}</td>
                      <td className="py-3 px-4 text-emerald-400 font-mono font-medium">{record.inTime || '—'}</td>
                      <td className="py-3 px-4 text-rose-400 font-mono font-medium">{record.outTime || 'Not Out Yet'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <Check size={14} /> Verified
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'Present' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          record.status === 'Late' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Apply Leave Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl lg:col-span-1">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-emerald-400" />
              <span>Apply Leave / Regularization</span>
            </h2>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Leave Type</label>
                <select 
                  value={leaveForm.leaveType} 
                  onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Festival Leave</option>
                  <option>Late Regularization</option>
                  <option>Comp-Off</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Start Date</label>
                <input 
                  type="date" 
                  required 
                  value={leaveForm.startDate}
                  onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">End Date</label>
                <input 
                  type="date" 
                  required 
                  value={leaveForm.endDate}
                  onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Reason</label>
                <textarea 
                  rows="3" 
                  required 
                  placeholder="State your reason clearly..."
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={16} />
                <span>Submit Request</span>
              </button>
            </form>
          </div>

          {/* Leave History Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-emerald-400" />
              <span>My Leave & Regularization History</span>
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">No leave applications submitted yet.</td>
                    </tr>
                  ) : (
                    leaves.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-700/20">
                        <td className="py-3 px-4 font-medium text-slate-200">{item.leaveType}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{item.startDate} to {item.endDate}</td>
                        <td className="py-3 px-4 text-slate-300">{item.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            item.status === 'Rejected' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}