import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  ScanFace,
  FileSpreadsheet,
  Clock,
  ShieldCheck
} from 'lucide-react';

// Sample Reports Data matching company rules
const attendanceReportsData = [
  {
    id: "DA001",
    name: "Rahul Sharma",
    department: "Engineering",
    totalWorkingDays: 22,
    presentDays: 21,
    absentDays: 1,
    lateCount: 2, // Within 3 limit
    halfDaysDeducted: 0,
    gpsVerificationRate: "95%",
    faceVerificationRate: "100%",
    status: "Good"
  },
  {
    id: "DA002",
    name: "Priya Singh",
    department: "Design",
    totalWorkingDays: 22,
    presentDays: 19.5,
    absentDays: 1,
    lateCount: 4, // Exceeded 3 limit -> Triggered half-day deduction
    halfDaysDeducted: 1.5,
    gpsVerificationRate: "90%",
    faceVerificationRate: "95%",
    status: "Needs Attention"
  },
  {
    id: "DA003",
    name: "Amit Kumar",
    department: "Engineering",
    totalWorkingDays: 22,
    presentDays: 20,
    absentDays: 2,
    lateCount: 1,
    halfDaysDeducted: 0,
    gpsVerificationRate: "98%",
    faceVerificationRate: "98%",
    status: "Good"
  },
  {
    id: "DA004",
    name: "Neha Verma",
    department: "Human Resources",
    totalWorkingDays: 22,
    presentDays: 22,
    absentDays: 0,
    lateCount: 0,
    halfDaysDeducted: 0,
    gpsVerificationRate: "100%",
    faceVerificationRate: "100%",
    status: "Excellent"
  }
];

export default function ReportsSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('Monthly Summary');
  const [selectedMonth, setSelectedMonth] = useState('November 2026');

  const filteredData = attendanceReportsData.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-blue-50/40 min-h-screen text-blue-950 font-sans space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-950 tracking-tight flex items-center gap-2.5">
              <BarChart3 className="text-blue-600" size={26} /> Attendance & Analytics Reports
            </h1>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck size={12} /> Audit Active
            </span>
          </div>
          <p className="text-sm text-blue-600/80 mt-1">
            Analyze monthly shift adherence, late penalties, and GPS/Face verification compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Exporting report CSV...")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer text-xs"
          >
            <Download size={16} />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Policy Audit Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-1">Average On-Time Rate</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-blue-950">89.4%</h3>
            <span className="text-xs font-semibold text-emerald-600">↑ 2.1% this month</span>
          </div>
          <p className="text-xs text-blue-600/70 mt-2 font-medium">Shift: 10:00 AM (15m grace)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-1">Total Late Penalties</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-emerald-600">7 Cases</h3>
            <span className="text-xs font-medium text-blue-600/80">Across 120 staff</span>
          </div>
          <p className="text-xs text-blue-600/70 mt-2 font-medium">Rule: 3 Lates = 1 Half-Day</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-1">GPS Geofence Match Rate</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-blue-950">96.8%</h3>
            <span className="text-xs font-semibold text-emerald-600">High accuracy</span>
          </div>
          <p className="text-xs text-blue-600/70 mt-2 font-medium">Office radius verified</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition">
          <p className="text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-1">Face Recognition Pass</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-blue-950">98.2%</h3>
            <span className="text-xs font-semibold text-emerald-600">Zero proxy logs</span>
          </div>
          <p className="text-xs text-blue-600/70 mt-2 font-medium">AI Check-in active</p>
        </div>

      </div>

      {/* Filters & Navigation Controls */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
          <input 
            type="text" 
            placeholder="Search employee by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-blue-950"
          />
        </div>

        {/* Report Type & Month Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="bg-blue-50/50 border border-blue-200 rounded-xl text-sm px-4 py-2.5 text-blue-900 font-medium focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="Monthly Summary">Monthly Summary Report</option>
            <option value="Late Penalty Audit">Late & Penalty Audit</option>
            <option value="GPS & Face Verification">GPS & Face Verification Log</option>
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-blue-50/50 border border-blue-200 rounded-xl text-sm px-4 py-2.5 text-blue-900 font-medium focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="November 2026">November 2026</option>
            <option value="October 2026">October 2026</option>
            <option value="September 2026">September 2026</option>
          </select>

        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/30">
          <div>
            <h3 className="text-lg font-bold text-blue-950">{selectedReportType}</h3>
            <p className="text-xs text-blue-600/80">Showing aggregated records for {selectedMonth}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-blue-100/70 text-blue-800 rounded-xl border border-blue-200">
            Active Policy: 10:00 AM – 06:00 PM
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-50/60 border-b border-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Present / Total Days</th>
                <th className="py-4 px-6">Late Count (3 Max)</th>
                <th className="py-4 px-6">Half-Day Deduction</th>
                <th className="py-4 px-6">Verification Compliance</th>
                <th className="py-4 px-6 text-right">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-blue-400">No employee records match your search.</td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/40 transition">
                    
                    {/* Employee Info */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-blue-950">{row.name}</p>
                        <p className="text-xs text-blue-500 font-mono">{row.id}</p>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-6 text-blue-900 font-medium">
                      {row.department}
                    </td>

                    {/* Attendance Days */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-blue-950">{row.presentDays}</span>
                      <span className="text-xs text-blue-400"> / {row.totalWorkingDays} days</span>
                    </td>

                    {/* Late Count */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        row.lateCount >= 3 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-800'
                      }`}>
                        {row.lateCount} Lates
                      </span>
                    </td>

                    {/* Half-Day Deductions */}
                    <td className="py-4 px-6">
                      {row.halfDaysDeducted > 0 ? (
                        <span className="text-rose-700 font-bold text-xs bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          -{row.halfDaysDeducted} Day Penalty
                        </span>
                      ) : (
                        <span className="text-blue-400 text-xs font-medium">No Penalty</span>
                      )}
                    </td>

                    {/* Verification Compliance (GPS & Face) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100" title="GPS Verification">
                          <MapPin size={13} /> {row.gpsVerificationRate}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100" title="Face Recognition">
                          <ScanFace size={13} /> {row.faceVerificationRate}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        row.status === 'Excellent' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : row.status === 'Good' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {row.status}
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
  );
}