import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ArrowLeft, Shield, CheckCircle, AlertCircle, Building2, Briefcase, ChevronDown, Check } from 'lucide-react';

// Department & Designation mapping dataset (Updated for EndlessSol)
const departmentData = {
  Marketing: ['SEO Expert', 'Digital Marketing Lead', 'Content Writer', 'Social Media Specialist'],
  Finance: ['SOX Compliance Officer', 'Auditor', 'Financial Analyst'],
  Engineering: ['Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'DevOps Specialist'],
  Sales: ['Sales Manager', 'Business Development Executive', 'Account Manager'],
  Operations: ['Admin Executive', 'Operations Manager', 'Support Specialist']
};

export default function EmployeeSection() {
  const [employees, setEmployees] = useState([
    { _id: '1', employeeId: 'ESC001', name: 'Saurabh Rajput', department: 'Marketing', designation: 'SEO Expert', role: 'manager', salary: '₹20,000' },
    { _id: '2', employeeId: 'ESC002', name: 'Kaushal Jha', department: 'Engineering', designation: 'Full Stack Engineer', role: 'employee', salary: '₹20,000' },
    { _id: '3', employeeId: 'ESC003', name: 'Preeti Kumari', department: 'Sales', designation: 'Sales Manager', role: 'manager', salary: '₹15,000' },
    { _id: '4', employeeId: 'ESC004', name: 'Nikita Passi (PASSY)', department: 'Operations', designation: 'Admin Executive', role: 'admin', salary: 'N/A' }
  ]);
  const [activeView, setActiveView] = useState('list'); // 'list' or 'add'
  const [formData, setFormData] = useState({
    employeeId: 'ESC005',
    name: '',
    password: '',
    department: 'Marketing',
    designation: 'SEO Expert',
    role: 'employee',
    salary: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Dropdown open/close states
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isDesigOpen, setIsDesigOpen] = useState(false);

  const API_BASE = `http://${window.location.hostname}:5000/api`;

  useEffect(() => {
    // Uncomment when connecting to database
    // fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      const data = await res.json();
      if (data && data.length > 0) {
        setEmployees(data);
      }
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      setTimeout(() => {
        const newEntry = {
          _id: Date.now().toString(),
          ...formData
        };
        setEmployees([newEntry, ...employees]);
        setSuccessMsg("Employee added successfully!");
        setFormData({ 
          employeeId: `ESC00${employees.length + 2}`, 
          name: '', 
          password: '', 
          department: 'Marketing', 
          designation: 'SEO Expert', 
          role: 'employee',
          salary: ''
        });
        setLoading(false);
        setTimeout(() => {
          setActiveView('list');
          setSuccessMsg('');
        }, 1500);
      }, 600);

    } catch (err) {
      setError("Network error while connecting to server.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      
      {/* View 1: Employee List Directory */}
      {activeView === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">EndlessSol - Employee Directory</h1>
              <p className="text-sm text-slate-500">Manage registered staff, system roles, credentials, and salaries.</p>
            </div>
            <button 
              onClick={() => setActiveView('add')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus size={16} /> Add New Employee
            </button>
          </div>

          {/* Employee Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Emp ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Monthly Salary</th>
                  <th className="py-3 px-4">System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">No employees found.</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{emp.employeeId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{emp.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{emp.department}</td>
                      <td className="py-3.5 px-4 text-slate-600">{emp.designation}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{emp.salary || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          emp.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          emp.role === 'hr' ? 'bg-blue-100 text-blue-700' :
                          emp.role === 'manager' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {emp.role || 'employee'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View 2: Add Employee Form Page */}
      {activeView === 'add' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setActiveView('list')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Add New Employee</h1>
                <p className="text-xs text-slate-500">Create credentials and assign roles for EndlessSol.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Employee ID</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. ESC005"
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Saurabh Rajput"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Salary (₹)</label>
                <input 
                  type="text" 
                  placeholder="e.g. ₹20,000 or N/A"
                  value={formData.salary}
                  onChange={e => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">System Role</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Department Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Department</label>
              <button
                type="button"
                onClick={() => {
                  setIsDeptOpen(!isDeptOpen);
                  setIsDesigOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border transition-all duration-200 outline-none ${
                  isDeptOpen ? 'border-emerald-500 ring-2 ring-emerald-100 bg-white' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`w-5 h-5 ${formData.department ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-800">{formData.department || 'Select Department'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDeptOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDeptOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 py-2">
                  {Object.keys(departmentData).map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        setFormData({ 
                          ...formData, 
                          department: dept, 
                          designation: departmentData[dept][0]
                        });
                        setIsDeptOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      <span>{dept}</span>
                      {formData.department === dept && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Designation Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Designation</label>
              <button
                type="button"
                onClick={() => {
                  setIsDesigOpen(!isDesigOpen);
                  setIsDeptOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border transition-all duration-200 outline-none ${
                  isDesigOpen ? 'border-emerald-500 ring-2 ring-emerald-100 bg-white' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className={`w-5 h-5 ${formData.designation ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-800">{formData.designation || 'Select Designation'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDesigOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDesigOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 max-h-56 overflow-y-auto">
                  {(departmentData[formData.department] || []).map((desig) => (
                    <button
                      key={desig}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, designation: desig });
                        setIsDesigOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      <span>{desig}</span>
                      {formData.designation === desig && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button 
                type="button" 
                onClick={() => setActiveView('list')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow transition cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save Employee'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}