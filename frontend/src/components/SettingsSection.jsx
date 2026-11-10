import React, { useState } from 'react';
import {
  Settings,
  Clock,
  MapPin,
  ScanFace,
  Calendar,
  AlertTriangle,
  Save,
  CheckCircle2,
  Shield,
  Bell,
  Users
} from 'lucide-react';

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState('shift');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings Form State with company rules pre-configured
  const [settings, setSettings] = useState({
    // Shift & Timing
    shiftStartTime: "10:00",
    shiftEndTime: "18:00",
    gracePeriodMins: 15,
    
    // Late Rule Engine
    maxLateAllowed: 3,
    latePenaltyType: "HALF_DAY", // HALF_DAY or SALARY_DEDUCTION
    autoDeductLeave: true,

    // Verification
    enableGpsGeofence: true,
    officeLatitude: "28.4595",
    officeLongitude: "77.0266",
    allowedRadiusMeters: 100,
    enableFaceRecognition: true,
    allowProxyDetection: true,

    // Weekly Offs
    sundayOff: true,
    alternateSaturdayOff: true, // 2nd & 4th Saturday
    
    // Notifications
    emailAlertOnLate: true,
    managerApprovalRequired: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="text-emerald-600" /> System & Policy Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure shift timings, late penalty rules, geofencing coordinates, and verification modes.
          </p>
        </div>

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition"
        >
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600" />
          Settings updated successfully! Policy rules will apply to the next punch-in cycle.
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('shift')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition ${
            activeTab === 'shift'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={16} /> Shift & Timings
        </button>

        <button
          onClick={() => setActiveTab('penalty')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition ${
            activeTab === 'penalty'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle size={16} /> Late Rule Engine
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition ${
            activeTab === 'verification'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin size={16} /> GPS & Face AI Verification
        </button>

        <button
          onClick={() => setActiveTab('offs')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition ${
            activeTab === 'offs'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar size={16} /> Weekly Off Rules
        </button>
      </div>

      {/* Settings Content Panels */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl">
        
        {/* --- TAB 1: SHIFT & TIMINGS --- */}
        {activeTab === 'shift' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Shift Schedule Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Shift Start Time</label>
                <input 
                  type="time" 
                  value={settings.shiftStartTime}
                  onChange={(e) => setSettings({...settings, shiftStartTime: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="text-xs text-slate-400 mt-1 block">Default: 10:00 AM</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Shift End Time</label>
                <input 
                  type="time" 
                  value={settings.shiftEndTime}
                  onChange={(e) => setSettings({...settings, shiftEndTime: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="text-xs text-slate-400 mt-1 block">Default: 06:00 PM</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Grace Period (Minutes)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={settings.gracePeriodMins}
                  onChange={(e) => setSettings({...settings, gracePeriodMins: parseInt(e.target.value)})}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                <span className="text-sm text-slate-600">Minutes allowed after shift start time</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Employees punching between 10:00 AM and 10:15 AM will not be marked Late.
              </p>
            </div>
          </div>
        )}

        {/* --- TAB 2: LATE RULE ENGINE --- */}
        {activeTab === 'penalty' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Automated Penalty Rules
            </h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Active Logic: </span>
                If an employee accumulates 3 late check-ins (beyond 10:15 AM) in a single month, the system will automatically deduct 1 Half-Day from their balance.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Max Late Allowed Per Month</label>
                <input 
                  type="number" 
                  value={settings.maxLateAllowed}
                  onChange={(e) => setSettings({...settings, maxLateAllowed: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Penalty Action on 3rd Late</label>
                <select
                  value={settings.latePenaltyType}
                  onChange={(e) => setSettings({...settings, latePenaltyType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="HALF_DAY">Deduct 0.5 Day Leave / Salary</option>
                  <option value="FULL_DAY">Deduct 1.0 Day Leave</option>
                  <option value="WARNING">Send Warning Email Only</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.autoDeductLeave}
                  onChange={(e) => setSettings({...settings, autoDeductLeave: e.target.checked})}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">Auto-deduct half day leave automatically at month end</span>
              </label>
            </div>
          </div>
        )}

        {/* --- TAB 3: GPS & FACE AI --- */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Location & Verification Constraints
            </h3>

            {/* GPS Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin size={18} className="text-emerald-600" /> GPS Geofence Verification
                  </h4>
                  <p className="text-xs text-slate-500">Require employees to be within office premises to check in.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.enableGpsGeofence}
                  onChange={(e) => setSettings({...settings, enableGpsGeofence: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              {settings.enableGpsGeofence && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Office Latitude</label>
                    <input 
                      type="text" 
                      value={settings.officeLatitude}
                      onChange={(e) => setSettings({...settings, officeLatitude: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Office Longitude</label>
                    <input 
                      type="text" 
                      value={settings.officeLongitude}
                      onChange={(e) => setSettings({...settings, officeLongitude: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Allowed Radius (Meters)</label>
                    <input 
                      type="number" 
                      value={settings.allowedRadiusMeters}
                      onChange={(e) => setSettings({...settings, allowedRadiusMeters: parseInt(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded p-2 text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Face AI Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <ScanFace size={18} className="text-emerald-600" /> Face Recognition Check-in
                  </h4>
                  <p className="text-xs text-slate-500">Capture live camera photo to prevent proxy attendance.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.enableFaceRecognition}
                  onChange={(e) => setSettings({...settings, enableFaceRecognition: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: WEEKLY OFF RULES --- */}
        {activeTab === 'offs' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Weekly Holiday Engine
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">Sunday Weekly Off</p>
                  <p className="text-xs text-slate-500">Every Sunday is automatically marked as non-working holiday.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.sundayOff}
                  onChange={(e) => setSettings({...settings, sundayOff: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">2nd & 4th Saturday Off</p>
                  <p className="text-xs text-slate-500">Automatically mark 2nd and 4th Saturday of every month as off day.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.alternateSaturdayOff}
                  onChange={(e) => setSettings({...settings, alternateSaturdayOff: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}