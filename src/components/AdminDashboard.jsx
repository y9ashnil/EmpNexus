import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  Users, 
  ClipboardList, 
  CalendarClock, 
  CircleDollarSign, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Eye,
  FileText
} from 'lucide-react';

export default function AdminDashboard({ activeTab }) {
  const {
    employees,
    tasks,
    leaves,
    attendance,
    payslips,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addTask,
    updateLeaveStatus,
    releasePayslip,
    clockIn,
    clockOut,
    currentUser
  } = useAppState();

  const today = new Date().toISOString().split('T')[0];

  // Modals visibility
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [payrollEmp, setPayrollEmp] = useState(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  // Kiosk mode clock selection
  const [kioskEmpId, setKioskEmpId] = useState('');
  // Performance analytics selector
  const [performanceEmpId, setPerformanceEmpId] = useState('');

  // Form States - Employee
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empDept, setEmpDept] = useState('Engineering');
  const [empDesg, setEmpDesg] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [empPhone, setEmpPhone] = useState('');

  // Form States - Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  // Form States - Payroll Release
  const [payMonth, setPayMonth] = useState('June 2026');
  const [payBonus, setPayBonus] = useState(0);
  const [payDeductions, setPayDeductions] = useState(0);



  // Helper: Get employee name by ID
  const getEmpName = (id) => {
    if (id === 'ADMIN-001') return 'Admin Account';
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown Employee';
  };

  // Open Employee Add Modal
  const handleOpenAddEmp = () => {
    setEditingEmp(null);
    setEmpName('');
    setEmpEmail('');
    setEmpPassword('');
    setEmpDept('Engineering');
    setEmpDesg('');
    setEmpSalary('');
    setEmpPhone('');
    setEmpModalOpen(true);
  };

  // Open Employee Edit Modal
  const handleOpenEditEmp = (emp) => {
    setEditingEmp(emp);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpPassword(emp.password);
    setEmpDept(emp.department);
    setEmpDesg(emp.designation);
    setEmpSalary(emp.salary);
    setEmpPhone(emp.phone || '');
    setEmpModalOpen(true);
  };

  // Submit Employee Form (Add/Edit)
  const handleEmpSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: empName,
      email: empEmail,
      password: empPassword,
      department: empDept,
      designation: empDesg,
      salary: parseFloat(empSalary),
      phone: empPhone
    };

    if (editingEmp) {
      updateEmployee(editingEmp.id, data);
    } else {
      addEmployee(data);
    }
    setEmpModalOpen(false);
  };

  // Submit Task Form
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskAssignee) return alert('Please select an employee.');
    addTask({
      title: taskTitle,
      description: taskDesc,
      assigneeId: taskAssignee,
      dueDate: taskDueDate,
      priority: taskPriority
    });
    setTaskTitle('');
    setTaskDesc('');
    setTaskAssignee('');
    setTaskDueDate('');
    setTaskPriority('medium');
  };

  // Open Payroll Modal
  const handleOpenPayroll = (emp) => {
    setPayrollEmp(emp);
    setPayBonus(0);
    setPayDeductions(0);
    setPayrollModalOpen(true);
  };

  // Release Pay Slip Submit
  const handlePayrollSubmit = (e) => {
    e.preventDefault();
    const base = parseFloat(payrollEmp.salary);
    const bonus = parseFloat(payBonus) || 0;
    const ded = parseFloat(payDeductions) || 0;
    
    releasePayslip({
      employeeId: payrollEmp.id,
      month: payMonth,
      baseSalary: base,
      bonus: bonus,
      deductions: ded,
      netSalary: base + bonus - ded
    });

    setPayrollModalOpen(false);
  };

  const handleKioskClockIn = async () => {
    if (!kioskEmpId) {
      alert('Please select an employee first.');
      return;
    }
    const res = await clockIn(kioskEmpId);
    if (!res.success) {
      alert(res.message);
    } else {
      alert(`Clocked In successfully for ${getEmpName(kioskEmpId)}`);
      setKioskEmpId('');
    }
  };

  const handleKioskClockOut = async () => {
    if (!kioskEmpId) {
      alert('Please select an employee first.');
      return;
    }
    const res = await clockOut(kioskEmpId);
    if (!res.success) {
      alert(res.message);
    } else {
      alert(`Clocked Out successfully for ${getEmpName(kioskEmpId)}`);
      setKioskEmpId('');
    }
  };

  // Filtered employees list
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* HEADER SECTION */}
      <div className="dashboard-header">
        <div>
          <h2>EmpNexus Command</h2>
          <div className="dashboard-title-desc">Admin Control Console & Operations</div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Date: <strong style={{ color: '#fff' }}>{today}</strong>
        </div>
      </div>

      {/* METRIC COUNTER ROW */}
      <div className="stats-grid">
        <div className="stat-card glass-panel info">
          <div className="stat-info">
            <span className="stat-label">Total Staff</span>
            <span className="stat-value">{employees.length}</span>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card glass-panel success">
          <div className="stat-info">
            <span className="stat-label">Clocked In</span>
            <span className="stat-value">
              {attendance.filter(a => a.date === today).length}
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={22} style={{ color: 'var(--color-success)' }} />
          </div>
        </div>

        <div className="stat-card glass-panel warning">
          <div className="stat-info">
            <span className="stat-label">Pending Leaves</span>
            <span className="stat-value">
              {leaves.filter(l => l.status === 'pending').length}
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <CalendarClock size={22} />
          </div>
        </div>

        <div className="stat-card glass-panel danger">
          <div className="stat-info">
            <span className="stat-label">Open Tasks</span>
            <span className="stat-value">
              {tasks.filter(t => t.status !== 'completed').length}
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <ClipboardList size={22} />
          </div>
        </div>
      </div>

      {/* RENDER BY TABS */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          {/* Today's Attendance Registry */}
          <div className="glass-panel section-card">
            <div className="section-header">
              <h3>Today's Attendance Registry</h3>
              <span className="badge badge-info">{today}</span>
            </div>
            
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>In</th>
                    <th>Out</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'ADMIN-001', name: 'Admin Account (Self)', designation: 'Administrator' },
                    ...employees
                  ].map((person) => {
                    const log = attendance.find(a => a.employeeId === person.id && a.date === today);
                    return (
                      <tr key={person.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                              <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.name)}`} 
                                alt={person.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <strong>{person.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{person.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td>{log ? log.clockIn : '--:--'}</td>
                        <td>{log ? (log.clockOut || 'Active') : '--:--'}</td>
                        <td>
                          {log ? (
                            <span className={`badge ${log.status === 'present' ? 'badge-success' : 'badge-warning'}`}>
                              {log.status}
                            </span>
                          ) : (
                            <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>Absent</span>
                          )}
                        </td>
                        <td>
                          {!log ? (
                            <button 
                              onClick={() => clockIn(person.id)} 
                              className="btn btn-success" 
                              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            >
                              In
                            </button>
                          ) : !log.clockOut ? (
                            <button 
                              onClick={() => clockOut(person.id)} 
                              className="btn btn-danger" 
                              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            >
                              Out
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Shift Ended</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar controls for Kiosk and Leaves */}
          <div>
            {/* Employee Quick Clock Kiosk */}
            <div className="glass-panel section-card" style={{ marginBottom: '1.5rem' }}>
              <h3>Employee Kiosk Clock</h3>
              <p style={{ fontSize: '0.8125rem', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
                Mark attendance on the admin terminal
              </p>
              
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Select Name</label>
                <select 
                  className="form-select"
                  value={kioskEmpId}
                  onChange={(e) => setKioskEmpId(e.target.value)}
                  style={{ height: '38px', padding: '0.5rem' }}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-success" 
                  onClick={handleKioskClockIn}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                >
                  In
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleKioskClockOut}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                >
                  Out
                </button>
              </div>
            </div>

            {/* Pending Leaves Panel */}
            <div className="glass-panel section-card">
              <h3>Leaves Inbox</h3>
              <p style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>Latest pending applications</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {leaves.filter(l => l.status === 'pending').slice(0, 3).length === 0 ? (
                  <p style={{ fontSize: '0.875rem', padding: '1rem 0' }}>All clear! No pending leave requests.</p>
                ) : (
                  leaves.filter(l => l.status === 'pending').slice(0, 3).map((lv) => (
                    <div key={lv.id} className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.875rem' }}>{getEmpName(lv.employeeId)}</strong>
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{lv.type}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', margin: '4px 0 8px' }}>
                        {lv.startDate} to {lv.endDate}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: '#fff', fontStyle: 'italic', marginBottom: '8px' }}>
                        "{lv.reason}"
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => updateLeaveStatus(lv.id, 'approved')}
                          className="btn btn-success" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateLeaveStatus(lv.id, 'rejected')}
                          className="btn btn-danger" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DIRECTORY TAB */}
      {activeTab === 'employees' && (
        <div className="glass-panel section-card">
          <div className="section-header">
            <h3>Employee Directory</h3>
            <button className="btn btn-primary" onClick={handleOpenAddEmp}>
              <Plus size={16} /> Add Employee
            </button>
          </div>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', marginBottom: '1.5rem', alignItems: 'center', gap: '10px' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name, department, title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          <div className="table-container">
            {filteredEmployees.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>No employees found matching the criteria.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Dept & Designation</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td><span style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>{emp.id}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`} 
                              alt={emp.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <strong>{emp.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{emp.department}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.designation}</div>
                        </div>
                      </td>
                      <td><strong>Rs. {emp.salary.toLocaleString()}/mo</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary btn-icon"
                            onClick={() => handleOpenEditEmp(emp)}
                            title="Edit Profile"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-icon"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${emp.name}?`)) {
                                deleteEmployee(emp.id);
                              }
                            }}
                            title="Remove Employee"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. LEAVE APPROVALS TAB */}
      {activeTab === 'leaves' && (
        <div className="glass-panel section-card">
          <div className="section-header">
            <h3>Leave Applications Console</h3>
          </div>

          <div className="table-container">
            {leaves.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>No leave requests filed yet.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Dates</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((lv) => (
                    <tr key={lv.id}>
                      <td><strong>{getEmpName(lv.employeeId)}</strong></td>
                      <td>
                        <div>{lv.startDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to {lv.endDate}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">{lv.type}</span>
                      </td>
                      <td style={{ maxWidth: '250px', whiteSpace: 'normal', fontStyle: 'italic' }}>
                        "{lv.reason}"
                      </td>
                      <td>
                        <span className={`badge ${
                          lv.status === 'approved' ? 'badge-success' : 
                          lv.status === 'rejected' ? 'badge-danger' : 
                          'badge-warning'
                        }`}>
                          {lv.status}
                        </span>
                      </td>
                      <td>
                        {lv.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              className="btn btn-success btn-icon"
                              onClick={() => updateLeaveStatus(lv.id, 'approved')}
                              title="Approve Leave"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              className="btn btn-danger btn-icon"
                              onClick={() => updateLeaveStatus(lv.id, 'rejected')}
                              title="Reject Leave"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 4. TASK BOARD TAB */}
      {activeTab === 'tasks' && (
        <div className="dashboard-grid">
          {/* Create Task Form */}
          <div className="glass-panel section-card">
            <h3>Assign New Objective</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem' }}>Create task and designate an engineer</p>

            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Task Objective / Title</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Optimize Database Indexes"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Scope / Instructions</label>
                <textarea 
                  className="form-textarea" 
                  rows="3"
                  placeholder="Provide scope, targets, and notes..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select 
                  className="form-select"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  required
                >
                  <option value="">-- Choose Staff --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Due Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority Tier</label>
                  <select 
                    className="form-select"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <Plus size={16} /> Deploy Task
              </button>
            </form>
          </div>

          {/* Active Tasks Registry */}
          <div className="glass-panel section-card">
            <h3>Active System Objectives</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem' }}>Track task completion status</p>

            <div className="tasks-container" style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {tasks.length === 0 ? (
                <p>No active tasks assigned yet.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="glass-panel task-item" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="task-top">
                      <span className={`badge ${
                        task.priority === 'high' ? 'badge-danger' : 
                        task.priority === 'medium' ? 'badge-warning' : 
                        'badge-success'
                      }`}>
                        {task.priority} priority
                      </span>
                      <span className={`badge ${
                        task.status === 'completed' ? 'badge-success' :
                        task.status === 'in-progress' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>

                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-desc">{task.description}</p>

                    <div className="task-bottom">
                      <div className="task-meta">
                        <span>Owner: <strong>{getEmpName(task.assigneeId)}</strong></span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. PAYROLL CONSOLE TAB */}
      {activeTab === 'payroll' && (
        <div className="dashboard-grid">
          {/* Employee Pay Slip Issuer */}
          <div className="glass-panel section-card">
            <h3>Payroll Matrix</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem' }}>View base compensation and release pay slips</p>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Base Salary</th>
                    <th>Released Pay</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const count = payslips.filter(p => p.employeeId === emp.id).length;
                    return (
                      <tr key={emp.id}>
                        <td><strong>{emp.name}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.designation}</span></td>
                        <td><strong>Rs. {emp.salary.toLocaleString()}</strong></td>
                        <td>
                          <span className="badge badge-info">{count} Slip(s)</span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => handleOpenPayroll(emp)}
                          >
                            <FileText size={12} /> Release Pay
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payslip History ledger */}
          <div className="glass-panel section-card">
            <h3>Disbursement Ledger</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem' }}>Historical payroll release log</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {payslips.length === 0 ? (
                <p>No pay slips released in this ledger cycle.</p>
              ) : (
                payslips.map((ps) => (
                  <div key={ps.id} className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{getEmpName(ps.employeeId)}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700 }}>
                        Rs. {ps.netSalary.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Month: {ps.month}</span>
                      <span>Released: {ps.releasedOn}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. PERFORMANCE ANALYTICS TAB */}
      {activeTab === 'performance' && (() => {
        // Calculate analytics data
        const performanceData = employees.map(emp => {
          const empTasks = tasks.filter(t => t.assigneeId === emp.id);
          const totalTasks = empTasks.length;
          const completedTasks = empTasks.filter(t => t.status === 'completed').length;
          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          const empAtt = attendance.filter(a => a.employeeId === emp.id && a.date !== today); // historical
          const todayAtt = attendance.find(a => a.employeeId === emp.id && a.date === today);
          const totalLogs = empAtt.length + (todayAtt ? 1 : 0);
          
          // Let's assume a baseline of 5 working days for the mock logs
          const presentDays = attendance.filter(a => a.employeeId === emp.id && (a.status === 'present' || a.status === 'late' || a.status === 'half-day')).length;
          const attendanceRate = Math.min(100, Math.round((presentDays / 5) * 100));

          const approvedLeaves = leaves.filter(l => l.employeeId === emp.id && l.status === 'approved').length;

          return {
            id: emp.id,
            name: emp.name,
            department: emp.department,
            designation: emp.designation,
            totalTasks,
            completedTasks,
            completionRate,
            attendanceRate,
            presentDays,
            approvedLeaves
          };
        });

        const activePerfEmpId = performanceEmpId || employees[0]?.id;
        const activePerfEmp = employees.find(e => e.id === activePerfEmpId);

        // Get details of active employee for detailed analytics
        const activeTasks = tasks.filter(t => t.assigneeId === activePerfEmpId);
        const compCount = activeTasks.filter(t => t.status === 'completed').length;
        const ipCount = activeTasks.filter(t => t.status === 'in-progress').length;
        const pendCount = activeTasks.filter(t => t.status === 'pending').length;
        const totalCount = activeTasks.length;

        // Donut variables
        const radius = 30;
        const circ = 2 * Math.PI * radius; // 188.5

        const pComp = totalCount > 0 ? (compCount / totalCount) : 0;
        const pIp = totalCount > 0 ? (ipCount / totalCount) : 0;
        const pPend = totalCount > 0 ? (pendCount / totalCount) : 0;

        const sizeComp = pComp * circ;
        const sizeIp = pIp * circ;
        const sizePend = pPend * circ;

        // Mock trend progression values (Week 1 to Week 5 productivity scores)
        const getTrendData = (empId) => {
          const data = {
            'EMP-001': [70, 75, 82, 80, 95], // Sarah
            'EMP-002': [60, 65, 80, 75, 88], // Marcus
            'EMP-003': [50, 70, 65, 80, 82]  // John
          };
          return data[empId] || [60, 68, 72, 78, 85];
        };

        const trend = getTrendData(activePerfEmpId);
        
        // SVG Line Chart coordinates
        const graphW = 380;
        const graphH = 180;
        const padX = 40;
        const padY = 20;
        const chartW = graphW - 2 * padX;
        const chartH = graphH - 2 * padY;

        const points = trend.map((val, idx) => {
          const x = padX + (idx * (chartW / (trend.length - 1)));
          const y = graphH - padY - (val / 100) * chartH;
          return { x, y, val };
        });

        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${graphH - padY} L ${points[0].x} ${graphH - padY} Z`;

        return (
          <div className="performance-console-layout" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Task Completion Bar Graph */}
              <div className="glass-panel section-card">
                <h3>Task Deliverable Rates</h3>
                <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                  Total vs completed tasks per employee
                </p>
                
                {performanceData.length === 0 ? (
                  <p>No employees in directory.</p>
                ) : (
                  performanceData.map(data => (
                    <div key={data.id} style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                        <span><strong>{data.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({data.department})</span></span>
                        <span>{data.completedTasks}/{data.totalTasks} Tasks ({data.completionRate}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <div style={{
                          width: `${data.completionRate}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                          boxShadow: '0 0 10px rgba(37, 99, 235, 0.4)',
                          transition: 'width 1s ease-in-out',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Attendance circular gauges */}
              <div className="glass-panel section-card">
                <h3>Work Attendance Score</h3>
                <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                  Active presence rate (last 5-day cycle)
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {performanceData.map(data => {
                    const radius = 30;
                    const circ = 2 * Math.PI * radius; // 188.5
                    const dashoffset = circ - (data.attendanceRate / 100) * circ;
                    return (
                      <div key={data.id} className="glass-panel" style={{ padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 120px', maxWidth: '140px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }} title={data.name}>
                          {data.name.split(' ')[0]}
                        </span>
                        
                        <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                            <circle
                              cx="35"
                              cy="35"
                              r={radius}
                              fill="transparent"
                              stroke="rgba(255, 255, 255, 0.04)"
                              strokeWidth="5"
                            />
                            <circle
                              cx="35"
                              cy="35"
                              r={radius}
                              fill="transparent"
                              stroke="var(--color-accent)"
                              strokeWidth="5"
                              strokeDasharray={circ}
                              strokeDashoffset={dashoffset}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 1s ease', filter: 'drop-shadow(0 0 3px rgba(6, 182, 212, 0.5))' }}
                            />
                          </svg>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {data.attendanceRate}%
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{data.presentDays}/5 Days</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Interactive Employee Analytics Section */}
            {activePerfEmp && (
              <div className="glass-panel section-card">
                <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3>Detailed Resource Analytics</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Weekly productivity trend and task breakdowns
                    </p>
                  </div>
                  
                  <div>
                    <select 
                      className="form-select"
                      value={activePerfEmpId}
                      onChange={(e) => setPerformanceEmpId(e.target.value)}
                      style={{ width: '200px', height: '36px', padding: '0 0.75rem' }}
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
                  {/* Line Chart */}
                  <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Productivity Scores (Last 5 Weeks)
                    </h4>
                    
                    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                      <svg viewBox={`0 0 ${graphW} ${graphH}`} width="100%" height={graphH} style={{ overflow: 'visible' }}>
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(yVal => {
                          const y = padY + chartH - (yVal / 100) * chartH;
                          return (
                            <g key={yVal}>
                              <line 
                                x1={padX} 
                                y1={y} 
                                x2={graphW - padX} 
                                y2={y} 
                                stroke="rgba(255,255,255,0.04)" 
                                strokeDasharray="3 3"
                              />
                              <text 
                                x={padX - 8} 
                                y={y + 4} 
                                fill="var(--text-muted)" 
                                fontSize="8" 
                                textAnchor="end"
                              >
                                {yVal}%
                              </text>
                            </g>
                          );
                        })}

                        {/* Area Fill */}
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#areaGrad)" />

                        {/* Chart Line */}
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke="var(--color-primary)" 
                          strokeWidth="3" 
                          strokeLinecap="round"
                          style={{ filter: 'drop-shadow(0 0 4px var(--color-primary-glow))' }}
                        />

                        {/* Data Points */}
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="5" 
                              fill="var(--bg-dark)" 
                              stroke="var(--color-accent)" 
                              strokeWidth="2.5" 
                            />
                            <text 
                              x={p.x} 
                              y={p.y - 10} 
                              fill="#fff" 
                              fontSize="8" 
                              fontWeight="bold" 
                              textAnchor="middle"
                            >
                              {p.val}%
                            </text>
                            <text 
                              x={p.x} 
                              y={graphH - padY + 12} 
                              fill="var(--text-muted)" 
                              fontSize="8" 
                              textAnchor="middle"
                            >
                              Wk {i+1}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Donut Chart and stats */}
                  <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', width: '100%', textAlign: 'left' }}>
                      Task Status Share
                    </h4>

                    {totalCount === 0 ? (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '2rem 0' }}>No tasks assigned.</p>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
                        {/* SVG Pie Ring */}
                        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                            {/* Completed Segment (Green) */}
                            {sizeComp > 0 && (
                              <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                fill="transparent"
                                stroke="var(--color-success)"
                                strokeWidth="8"
                                strokeDasharray={`${sizeComp} ${circ}`}
                                strokeDashoffset="0"
                              />
                            )}
                            {/* In Progress Segment (Blue) */}
                            {sizeIp > 0 && (
                              <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                fill="transparent"
                                stroke="var(--color-info)"
                                strokeWidth="8"
                                strokeDasharray={`${sizeIp} ${circ}`}
                                strokeDashoffset={-sizeComp}
                              />
                            )}
                            {/* Pending Segment (Yellow) */}
                            {sizePend > 0 && (
                              <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                fill="transparent"
                                stroke="var(--color-warning)"
                                strokeWidth="8"
                                strokeDasharray={`${sizePend} ${circ}`}
                                strokeDashoffset={-(sizeComp + sizeIp)}
                              />
                            )}
                          </svg>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.8125rem', fontWeight: 700 }}>
                            {totalCount} T
                          </div>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '50%' }}></span>
                              Completed
                            </span>
                            <strong>{compCount} ({Math.round(pComp*100)}%)</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '8px', height: '8px', background: 'var(--color-info)', borderRadius: '50%' }}></span>
                              In Progress
                            </span>
                            <strong>{ipCount} ({Math.round(pIp*100)}%)</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '8px', height: '8px', background: 'var(--color-warning)', borderRadius: '50%' }}></span>
                              Pending
                            </span>
                            <strong>{pendCount} ({Math.round(pPend*100)}%)</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}


      {/* ======================================= */}
      {/* 1. MODAL: ADD / EDIT EMPLOYEE */}
      {empModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingEmp ? 'Modify Profile' : 'Enlist New Employee'}</h3>
              <button className="modal-close" onClick={() => setEmpModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEmpSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="John Doe"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="john@ems.com"
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="password123"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-select"
                  value={empDept}
                  onChange={(e) => setEmpDept(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={empDesg}
                    onChange={(e) => setEmpDesg(e.target.value)}
                    placeholder="Backend Developer"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Salary (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={empSalary}
                    onChange={(e) => setEmpSalary(e.target.value)}
                    placeholder="5000"
                    required 
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEmpModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmp ? 'Save Changes' : 'Initialize Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: RELEASE PAYROLL SLIP */}
      {payrollModalOpen && payrollEmp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Release Pay Slip</h3>
              <button className="modal-close" onClick={() => setPayrollModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePayrollSubmit}>
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RECIPIENT</div>
                <strong style={{ fontSize: '1rem' }}>{payrollEmp.name}</strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{payrollEmp.designation} | {payrollEmp.department}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Salary Month Cycle</label>
                <select 
                  className="form-select"
                  value={payMonth}
                  onChange={(e) => setPayMonth(e.target.value)}
                >
                  <option value="June 2026">June 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="September 2026">September 2026</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Base Salary (Rs.)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={`Rs. ${payrollEmp.salary.toLocaleString()}`} 
                    disabled 
                    style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bonus (Rs.)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={payBonus}
                    onChange={(e) => setPayBonus(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deductions (Rs.)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={payDeductions}
                  onChange={(e) => setPayDeductions(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED DISBURSEMENT</div>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-success)' }}>
                    Rs. {(payrollEmp.salary + (parseFloat(payBonus) || 0) - (parseFloat(payDeductions) || 0)).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setPayrollModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Confirm & Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
