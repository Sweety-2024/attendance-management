const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. MONGODB DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/digital_arena_attendance";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));


// --- 2. DATABASE SCHEMAS & MODELS ---

// Employee Schema (Includes role & password)
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  role: { type: String, enum: ['employee', 'admin', 'hr', 'manager'], default: 'employee' },
  avatar: String,
  monthlyLateCount: { type: Number, default: 0 }
});
const Employee = mongoose.model('Employee', employeeSchema);

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, uppercase: true, trim: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  inTime: { type: String },
  outTime: { type: String },
  status: { type: String, enum: ['Present', 'Late', 'Half-Day', 'Absent', 'On Leave'], default: 'Present' },
  gpsVerified: { type: Boolean, default: false },
  faceVerified: { type: Boolean, default: false }
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Leave & Regularization Schema
const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true },
  leaveType: { type: String, enum: ['Casual Leave', 'Sick Leave', 'Late Regularization', 'Comp-Off'] },
  startDate: String,
  endDate: String,
  duration: String,
  reason: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  appliedOn: { type: String, default: new Date().toISOString().split('T')[0] }
});
const Leave = mongoose.model('Leave', leaveSchema);


// --- 3. AUTHENTICATION & SEED ROUTES ---

// Unified Login Route (Admin & Employee)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    if (!employeeId || !password) {
      return res.status(400).json({ success: false, message: "Please provide both Employee ID and Password." });
    }

    const cleanEmpId = employeeId.trim();

    // Case-insensitive exact match regex query
    const employee = await Employee.findOne({ 
      employeeId: { $regex: new RegExp(`^${cleanEmpId}$`, 'i') } 
    });
    
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee ID not found in database." });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password." });
    }

    res.json({ 
      success: true, 
      message: "Login successful", 
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
        role: employee.role || 'employee',
        department: employee.department,
        designation: employee.designation,
        monthlyLateCount: employee.monthlyLateCount || 0
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Seed Initial Admin User (Run once via POST request if database is empty)
app.post('/api/seed', async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    if (count > 0) {
      return res.status(400).json({ message: "Database already contains employee records." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password123", salt);

    const defaultAdmin = new Employee({
      employeeId: "EMP001",
      name: "System Admin",
      password: hashedPassword,
      department: "Management",
      designation: "System Administrator",
      role: "admin"
    });

    await defaultAdmin.save();
    res.status(201).json({ message: "Default Admin created successfully!", employeeId: "EMP001", password: "Password123" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- 4. ADMIN DASHBOARD & MANAGEMENT ROUTES ---

// Get Live Admin Dashboard Statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const totalEmployees = await Employee.countDocuments();
    const todayAttendanceCount = await Attendance.countDocuments({ 
      date: today, 
      status: { $in: ['Present', 'Late', 'Half-Day'] } 
    });
    const pendingLeavesCount = await Leave.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      totalEmployees,
      todayAttendanceCount,
      pendingLeavesCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Registered Employees (For Admin Employee Section)
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find({}, { password: 0 }).sort({ _id: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add New Employee (Used by Admin Panel)
app.post('/api/employees', async (req, res) => {
  try {
    const { employeeId, name, password, department, designation, avatar, role } = req.body;

    if (!employeeId || !name || !password) {
      return res.status(400).json({ error: "Please fill in all required fields." });
    }

    const formattedId = employeeId.trim().toUpperCase();
    const existingEmp = await Employee.findOne({ employeeId: formattedId });
    if (existingEmp) {
      return res.status(400).json({ error: "Employee ID already exists in database." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmp = new Employee({
      employeeId: formattedId,
      name,
      password: hashedPassword,
      department: department || 'General',
      designation: designation || 'Staff',
      role: role || 'employee',
      avatar
    });

    await newEmp.save();
    
    const empResponse = newEmp.toObject();
    delete empResponse.password;

    res.status(201).json({ message: "Employee added successfully", employee: empResponse });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Today's Live Attendance for All Employees (For Admin Reports/Overview)
app.get('/api/attendance/all/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await Attendance.find({ date: today }).sort({ _id: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage Leave Requests (Get All Applications)
app.get('/api/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ _id: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Leave Status (Approve/Reject by Admin/Manager)
app.patch('/api/leaves/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedLeave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: "Leave status updated successfully", updatedLeave });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// --- 5. EMPLOYEE PORTAL & ATTENDANCE ROUTES ---

// Get Attendance History for a Specific Employee
app.get('/api/attendance/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await Attendance.find({ employeeId: employeeId.trim().toUpperCase() }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employee Punch In API (GPS & Face Verification)
app.post('/api/attendance/check-in', async (req, res) => {
  try {
    const { employeeId, latitude, longitude, faceMatched } = req.body;
    
    const OFFICE_LAT = 28.68810039852606; 
    const OFFICE_LON = 77.13187762559795;
    const ALLOWED_RADIUS_METERS = 100;

    const distanceMeters = Math.sqrt(Math.pow(latitude - OFFICE_LAT, 2) + Math.pow(longitude - OFFICE_LON, 2)) * 111320;
    
    if (distanceMeters > ALLOWED_RADIUS_METERS) {
      return res.status(400).json({ success: false, message: "Check-in failed: You are outside the office GPS perimeter." });
    }

    if (!faceMatched) {
      return res.status(400).json({ success: false, message: "Check-in failed: Face recognition verification failed." });
    }

    const formattedId = employeeId.trim().toUpperCase();
    let employee = await Employee.findOne({ employeeId: formattedId });
    if (!employee) return res.status(404).json({ message: "Employee not found in database." });

    const todayDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const isLate = (hours > 10) || (hours === 10 && minutes > 15);
    let status = isLate ? 'Late' : 'Present';

    if (isLate) {
      employee.monthlyLateCount += 1;
      if (employee.monthlyLateCount >= 3) {
        status = 'Half-Day';
      }
      await employee.save();
    }

    const attendanceRecord = new Attendance({
      employeeId: formattedId,
      date: todayDate,
      inTime: timeString,
      status,
      gpsVerified: true,
      faceVerified: true
    });

    await attendanceRecord.save();
    res.json({ success: true, message: "Checked in successfully!", time: timeString, status, lateCount: employee.monthlyLateCount });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employee Punch Out API
app.post('/api/attendance/check-out', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const formattedId = employeeId.trim().toUpperCase();
    const todayDate = new Date().toISOString().split('T')[0];

    const attendanceRecord = await Attendance.findOne({ 
      employeeId: formattedId, 
      date: todayDate 
    });

    if (!attendanceRecord) {
      return res.status(400).json({ success: false, message: "No check-in record found for today. Please punch in first." });
    }

    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    attendanceRecord.outTime = timeString;
    await attendanceRecord.save();

    res.json({ 
      success: true, 
      message: "Checked out successfully!", 
      outTime: timeString 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Leave Application (Used by Employee Portal)
app.post('/api/leaves', async (req, res) => {
  try {
    const newLeave = new Leave(req.body);
    await newLeave.save();
    res.status(201).json({ message: "Leave request submitted successfully", newLeave });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: "HR & Attendance Management System API is running successfully! 🚀" 
  });
});


// POST /api/attendance/check-in
app.post('/check-in', async (req, res) => {
  try {
    const { employeeId, latitude, longitude } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check if employee already checked in today
    const existingAttendance = await Attendance.findOne({ employeeId, date: today });
    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already checked in for today! Multiple check-ins are not allowed." 
      });
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    
    // Late threshold: after 10:15 AM
    const isLate = currentHour > 10 || (currentHour === 10 && currentMinute > 15);

    const newAttendance = new Attendance({
      employeeId,
      date: today,
      inTime: currentTime,
      outTime: '',
      status: isLate ? 'Late' : 'Present'
    });

    await newAttendance.save();

    // Update late count if late
    if (isLate) {
      await Employee.findOneAndUpdate(
        { employeeId }, 
        { $inc: { monthlyLateCount: 1 } }
      );
    }

    res.json({ 
      success: true, 
      message: `Punch In successful at ${currentTime}!` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during check-in" });
  }
});

// POST /api/attendance/check-out
app.post('/check-out', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ employeeId, date: today });
    if (!attendance) {
      return res.status(400).json({ success: false, message: "No active check-in found for today!" });
    }

    if (attendance.outTime) {
      return res.status(400).json({ success: false, message: "You have already checked out for today!" });
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    attendance.outTime = currentTime;
    await attendance.save();

    res.json({ success: true, message: `Punch Out successful at ${currentTime}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during check-out" });
  }
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});