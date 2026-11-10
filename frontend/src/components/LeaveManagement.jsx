import React, { useState, useEffect } from 'react';
import { Check, X, FileText } from 'lucide-react';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leaves');
      const data = await res.json();
      setLeaves(data);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchLeaves(); // Refresh list after status update
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Applications & Approvals</h1>
          <p className="text-sm text-slate-500">Review and approve employee leave requests.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">No leave applications found.</td>
              </tr>
            ) : (
              leaves.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {item.employeeName} <span className="text-xs text-slate-400 font-mono">({item.employeeId})</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.leaveType}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">{item.startDate} to {item.endDate}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{item.reason}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-2">
                    {item.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => updateLeaveStatus(item._id, 'Approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => updateLeaveStatus(item._id, 'Rejected')}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg transition inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}