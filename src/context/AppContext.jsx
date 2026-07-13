import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Sample Initial Data for Demo
const initialEmployees = [
  {
    id: 'EMP-001',
    name: 'Sarah Connor',
    email: 'sarah@ems.com',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Senior Frontend Dev',
    salary: 85000,
    joinDate: '2024-03-15',
    phone: '+1 (555) 019-2834'
  },
  {
    id: 'EMP-002',
    name: 'Marcus Wright',
    email: 'marcus@ems.com',
    password: 'password123',
    role: 'employee',
    department: 'Design',
    designation: 'Lead UI/UX Designer',
    salary: 78000,
    joinDate: '2024-08-01',
    phone: '+1 (555) 012-9845'
  },
  {
    id: 'EMP-003',
    name: 'John Connor',
    email: 'john@ems.com',
    password: 'password123',
    role: 'employee',
    department: 'Marketing',
    designation: 'Growth Strategist',
    salary: 62000,
    joinDate: '2025-01-10',
    phone: '+1 (555) 017-4839'
  }
];

const initialTasks = [
  {
    id: 'TSK-101',
    title: 'Redesign Login Page',
    description: 'Implement a new premium dark mode glassmorphism layout with smooth animations.',
    assigneeId: 'EMP-002',
    dueDate: '2026-07-05',
    priority: 'high',
    status: 'in-progress'
  },
  {
    id: 'TSK-102',
    title: 'Migrate state to Context API',
    description: 'Centralize state variables and integrate local storage synchronization.',
    assigneeId: 'EMP-001',
    dueDate: '2026-07-02',
    priority: 'high',
    status: 'completed'
  },
  {
    id: 'TSK-103',
    title: 'Draft summer marketing plan',
    description: 'Design newsletter assets and prepare high-level budget estimations.',
    assigneeId: 'EMP-003',
    dueDate: '2026-07-15',
    priority: 'low',
    status: 'pending'
  }
];

const initialLeaves = [
  {
    id: 'LV-201',
    employeeId: 'EMP-001',
    startDate: '2026-07-10',
    endDate: '2026-07-12',
    type: 'annual',
    reason: 'Family vacation trip.',
    status: 'pending',
    appliedOn: '2026-06-28'
  },
  {
    id: 'LV-202',
    employeeId: 'EMP-003',
    startDate: '2026-06-25',
    endDate: '2026-06-25',
    type: 'sick',
    reason: 'Fever and medical checkup.',
    status: 'approved',
    appliedOn: '2026-06-24'
  }
];

const initialAttendance = [
  {
    id: 'ATT-301',
    employeeId: 'EMP-001',
    date: '2026-06-28',
    clockIn: '09:02 AM',
    clockOut: '05:30 PM',
    status: 'present'
  },
  {
    id: 'ATT-302',
    employeeId: 'EMP-002',
    date: '2026-06-28',
    clockIn: '09:15 AM',
    clockOut: '05:45 PM',
    status: 'present'
  },
  {
    id: 'ATT-303',
    employeeId: 'EMP-003',
    date: '2026-06-28',
    clockIn: '10:10 AM',
    clockOut: '04:00 PM',
    status: 'half-day'
  }
];

const initialPayslips = [
  {
    id: 'PS-401',
    employeeId: 'EMP-001',
    month: 'May 2026',
    baseSalary: 85000,
    bonus: 5000,
    deductions: 2000,
    netSalary: 88000,
    releasedOn: '2026-05-31'
  },
  {
    id: 'PS-402',
    employeeId: 'EMP-002',
    month: 'May 2026',
    baseSalary: 78000,
    bonus: 3000,
    deductions: 1500,
    netSalary: 79500,
    releasedOn: '2026-05-31'
  }
];

// HR Initial Mock Data
const initialJobs = [
  {
    id: 'JOB-901',
    title: 'Lead Frontend Developer',
    department: 'Engineering',
    status: 'open',
    salaryRange: 'Rs. 70000 - Rs. 100000'
  },
  {
    id: 'JOB-902',
    title: 'Senior Product Designer',
    department: 'Design',
    status: 'open',
    salaryRange: 'Rs. 65000 - Rs. 90000'
  },
  {
    id: 'JOB-903',
    title: 'HR Operations Coordinator',
    department: 'Human Resources',
    status: 'closed',
    salaryRange: 'Rs. 45000 - Rs. 60000'
  }
];

const initialCandidates = [
  {
    id: 'CAN-801',
    name: 'Thomas Anderson',
    email: 'neo@matrix.io',
    phone: '+1 (555) 101-0101',
    position: 'Lead Frontend Developer',
    status: 'interviewing',
    appliedOn: '2026-06-20'
  },
  {
    id: 'CAN-802',
    name: 'Trinity Moss',
    email: 'trinity@matrix.io',
    phone: '+1 (555) 202-0202',
    position: 'Senior Product Designer',
    status: 'applied',
    appliedOn: '2026-06-25'
  },
  {
    id: 'CAN-803',
    name: 'Agent Smith',
    email: 'smith@system.gov',
    phone: '+1 (555) 303-3030',
    position: 'Lead Frontend Developer',
    status: 'rejected',
    appliedOn: '2026-06-18'
  }
];

const initialInterviews = [
  {
    id: 'INT-701',
    candidateName: 'Thomas Anderson',
    position: 'Lead Frontend Developer',
    date: '2026-07-02',
    time: '11:00 AM',
    type: 'Technical & System Architect',
    interviewer: 'Sarah Connor',
    status: 'scheduled'
  }
];

const initialVerifications = [
  {
    employeeId: 'EMP-001',
    backgroundCheck: 'passed',
    idProof: 'approved',
    idProofUrl: 'passport_sarah.pdf',
    academicCert: 'approved',
    academicCertUrl: 'bs_degree_sarah.pdf'
  },
  {
    employeeId: 'EMP-002',
    backgroundCheck: 'passed',
    idProof: 'approved',
    idProofUrl: 'license_marcus.pdf',
    academicCert: 'pending',
    academicCertUrl: 'design_cert_marcus.pdf'
  },
  {
    employeeId: 'EMP-003',
    backgroundCheck: 'pending',
    idProof: 'pending',
    idProofUrl: 'birth_cert_john.pdf',
    academicCert: 'pending',
    academicCertUrl: 'hs_diploma_john.pdf'
  }
];

export const AppStateProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('ems_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Fetch initial data from backend database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        };

        const empRes = await fetch(`${API_URL}/employees`, { headers });
        const empData = await empRes.json();
        setEmployees(empData);

        const taskRes = await fetch(`${API_URL}/tasks`, { headers });
        const taskData = await taskRes.json();
        setTasks(taskData);

        const leaveRes = await fetch(`${API_URL}/leaves`, { headers });
        const leaveData = await leaveRes.json();
        setLeaves(leaveData);

        const attRes = await fetch(`${API_URL}/attendance`, { headers });
        const attData = await attRes.json();
        setAttendance(attData);

        const payRes = await fetch(`${API_URL}/payslips`, { headers });
        const payData = await payRes.json();
        setPayslips(payData);

        const jobsRes = await fetch(`${API_URL}/jobs`, { headers });
        const jobsData = await jobsRes.json();
        setJobs(jobsData);

        const candRes = await fetch(`${API_URL}/candidates`, { headers });
        const candData = await candRes.json();
        setCandidates(candData);

        const intRes = await fetch(`${API_URL}/interviews`, { headers });
        const intData = await intRes.json();
        setInterviews(intData);

        const verRes = await fetch(`${API_URL}/verifications`, { headers });
        const verData = await verRes.json();
        setVerifications(verData);
      } catch (err) {
        console.error("Failed to load initial data from backend API:", err);
      }
    };
    fetchData();
  }, [currentUser]);

  // Sync state to local storage on changes (enables cross-tab synchronization via storage event)
  useEffect(() => {
    localStorage.setItem('ems_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('ems_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ems_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('ems_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('ems_payslips', JSON.stringify(payslips));
  }, [payslips]);

  useEffect(() => {
    localStorage.setItem('ems_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('ems_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('ems_interviews', JSON.stringify(interviews));
  }, [interviews]);

  useEffect(() => {
    localStorage.setItem('ems_verifications', JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('ems_current_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('ems_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (!e.newValue) return;
        if (e.key === 'ems_employees') setEmployees(JSON.parse(e.newValue));
        if (e.key === 'ems_tasks') setTasks(JSON.parse(e.newValue));
        if (e.key === 'ems_leaves') setLeaves(JSON.parse(e.newValue));
        if (e.key === 'ems_attendance') setAttendance(JSON.parse(e.newValue));
        if (e.key === 'ems_payslips') setPayslips(JSON.parse(e.newValue));
        if (e.key === 'ems_jobs') setJobs(JSON.parse(e.newValue));
        if (e.key === 'ems_candidates') setCandidates(JSON.parse(e.newValue));
        if (e.key === 'ems_interviews') setInterviews(JSON.parse(e.newValue));
        if (e.key === 'ems_verifications') setVerifications(JSON.parse(e.newValue));
      } catch (err) {
        console.error("Failed to parse cross-tab storage sync:", err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Actions
  const login = async (email, password, roleType) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, roleType })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addEmployee = async (empData) => {
    try {
      const res = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(empData)
      });
      const newEmp = await res.json();
      setEmployees((prev) => [...prev, newEmp]);
      
      // Reload verifications because backend auto-created verifications record
      const verRes = await fetch(`${API_URL}/verifications`);
      const verData = await verRes.json();
      setVerifications(verData);

      return newEmp;
    } catch (err) {
      console.error("Add employee failed:", err);
    }
  };

  const updateEmployee = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const updated = await res.json();
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? updated : emp))
      );
      if (currentUser && currentUser.id === id) {
        setCurrentUser(updated);
      }
    } catch (err) {
      console.error("Update employee failed:", err);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await fetch(`${API_URL}/employees/${id}`, { 
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        }
      });
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      setTasks((prev) => prev.filter((task) => task.assigneeId !== id));
      setVerifications(prev => prev.filter((v) => v.employeeId !== id));
    } catch (err) {
      console.error("Delete employee failed:", err);
    }
  };

  const addTask = async (taskData) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(taskData)
      });
      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error("Add task failed:", err);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
    } catch (err) {
      console.error("Update task status failed:", err);
    }
  };

  const clockIn = async (employeeId) => {
    try {
      const now = new Date();
      const clockInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const res = await fetch(`${API_URL}/attendance/clock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, time: clockInTime })
      });
      const data = await res.json();
      if (data.id) {
        setAttendance((prev) => [data, ...prev]);
        return { success: true, log: data };
      }
      return { success: false, message: data.message || 'Clock In failed.' };
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const clockOut = async (employeeId) => {
    try {
      const now = new Date();
      const clockOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const res = await fetch(`${API_URL}/attendance/clock-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, time: clockOutTime })
      });
      const updatedLog = await res.json();
      if (updatedLog.id) {
        setAttendance((prev) =>
          prev.map((item) => (item.employeeId === employeeId && item.date === updatedLog.date) ? updatedLog : item)
        );
        return { success: true };
      }
      return { success: false, message: 'Clock Out failed.' };
    } catch (err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const requestLeave = async (leaveData) => {
    try {
      const res = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });
      const newLeave = await res.json();
      setLeaves((prev) => [newLeave, ...prev]);
      return newLeave;
    } catch (err) {
      console.error("Request leave failed:", err);
    }
  };

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      const res = await fetch(`${API_URL}/leaves/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? updated : l))
      );
    } catch (err) {
      console.error("Update leave status failed:", err);
    }
  };

  const releasePayslip = async (payslipData) => {
    try {
      const res = await fetch(`${API_URL}/payslips`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(payslipData)
      });
      const newPayslip = await res.json();
      setPayslips((prev) => [newPayslip, ...prev]);
      return newPayslip;
    } catch (err) {
      console.error("Release payslip failed:", err);
    }
  };

  const addJob = async (jobData) => {
    try {
      const res = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(jobData)
      });
      const newJob = await res.json();
      setJobs(prev => [...prev, newJob]);
      return newJob;
    } catch (err) {
      console.error("Add job failed:", err);
    }
  };

  const toggleJobStatus = async (jobId) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      const newStatus = job.status === 'open' ? 'closed' : 'open';
      const res = await fetch(`${API_URL}/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setJobs(prev => prev.map(j => j.id === jobId ? updated : j));
    } catch (err) {
      console.error("Toggle job status failed:", err);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        }
      });
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      console.error("Delete job failed:", err);
    }
  };

  const addCandidate = async (candData) => {
    try {
      const res = await fetch(`${API_URL}/candidates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(candData)
      });
      const newCand = await res.json();
      setCandidates(prev => [...prev, newCand]);
      return newCand;
    } catch (err) {
      console.error("Add candidate failed:", err);
    }
  };

  const updateCandidateStatus = async (candId, status) => {
    try {
      const res = await fetch(`${API_URL}/candidates/${candId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      setCandidates(prev => prev.map(c => c.id === candId ? updated : c));
    } catch (err) {
      console.error("Update candidate status failed:", err);
    }
  };

  const scheduleInterview = async (intData) => {
    try {
      const res = await fetch(`${API_URL}/interviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(intData)
      });
      const newInt = await res.json();
      setInterviews(prev => [...prev, newInt]);
      return newInt;
    } catch (err) {
      console.error("Schedule interview failed:", err);
    }
  };

  const updateInterviewStatus = async (intId, status) => {
    try {
      const res = await fetch(`${API_URL}/interviews/${intId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      setInterviews(prev => prev.map(i => i.id === intId ? updated : i));
    } catch (err) {
      console.error("Update interview status failed:", err);
    }
  };

  const updateVerificationStatus = async (employeeId, field, status) => {
    try {
      const res = await fetch(`${API_URL}/verifications/${employeeId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ field, status })
      });
      const updated = await res.json();
      setVerifications(prev =>
        prev.map(v => v.employeeId === employeeId ? updated : v)
      );
    } catch (err) {
      console.error("Update verification status failed:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        tasks,
        leaves,
        attendance,
        payslips,
        jobs,
        candidates,
        interviews,
        verifications,
        currentUser,
        login,
        logout,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addTask,
        updateTaskStatus,
        clockIn,
        clockOut,
        requestLeave,
        updateLeaveStatus,
        releasePayslip,
        addJob,
        toggleJobStatus,
        deleteJob,
        addCandidate,
        updateCandidateStatus,
        scheduleInterview,
        updateInterviewStatus,
        updateVerificationStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
