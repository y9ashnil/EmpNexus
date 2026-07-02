import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  Clock, 
  ClipboardList, 
  CalendarClock, 
  CircleDollarSign,
  Play, 
  Square,
  Plus, 
  X,
  FileText,
  User,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';

export default function EmployeeDashboard({ activeTab }) {
  const {
    currentUser,
    tasks,
    leaves,
    attendance,
    payslips,
    updateTaskStatus,
    clockIn,
    clockOut,
    requestLeave
  } = useAppState();

  const today = new Date().toISOString().split('T')[0];

  // Clock state
  const [time, setTime] = useState(new Date());
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState(null);

  // Form states - Leave
  const [lvStart, setLvStart] = useState('');
  const [lvEnd, setLvEnd] = useState('');
  const [lvType, setLvType] = useState('annual');
  const [lvReason, setLvReason] = useState('');
  const [leaveMsg, setLeaveMsg] = useState('');

  // AI Bot Chat States
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: `Hello ${currentUser.name}! I am EmpNexus AI, your personal HR assistant. How can I help you today?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll chat to bottom
  const chatEndRef = useRef(null);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e, textToSend = null) => {
    if (e) e.preventDefault();
    const queryText = textToSend || inputValue;
    if (!queryText.trim()) return;

    // Add user message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: 'user', text: queryText, time: timestamp };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      let response = '';

      const cleanQuery = queryText.toLowerCase().trim();

      // Retrieve employee data state
      const userTasks = tasks.filter(t => t.assigneeId === currentUser.id);
      const userLeaves = leaves.filter(l => l.employeeId === currentUser.id);
      const userAttendance = attendance.filter(a => a.employeeId === currentUser.id);
      const userPayslips = payslips.filter(p => p.employeeId === currentUser.id);

      if (cleanQuery.includes('leave') || cleanQuery.includes('holiday') || cleanQuery.includes('chutti') || cleanQuery.includes('vacation')) {
        const total = userLeaves.length;
        const approved = userLeaves.filter(l => l.status === 'approved').length;
        const pending = userLeaves.filter(l => l.status === 'pending').length;

        // Calculate helper for counting leave duration
        const getDays = (start, end) => {
          const s = new Date(start);
          const e = new Date(end);
          const diff = Math.abs(e - s);
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
          return isNaN(days) ? 1 : days;
        };

        const casualTaken = userLeaves
          .filter(l => l.type === 'casual' && l.status === 'approved')
          .reduce((sum, l) => sum + getDays(l.startDate, l.endDate), 0);

        const sickTaken = userLeaves
          .filter(l => l.type === 'sick' && l.status === 'approved')
          .reduce((sum, l) => sum + getDays(l.startDate, l.endDate), 0);

        const casualRemaining = Math.max(0, 12 - casualTaken);
        const sickRemaining = Math.max(0, 12 - sickTaken);
        
        response = `Your leave status summary:
• **Casual Leave balance**: ${casualRemaining} days remaining (out of 12 days limit; ${casualTaken} days used).
• **Sick Leave balance**: ${sickRemaining} days remaining (out of 12 days limit; ${sickTaken} days used).

All requested leaves:
• Total filed: ${total}
• Approved: ${approved}
• Pending: ${pending}
• Rejected/Cancelled: ${total - approved - pending}

You can request new leaves in the "Leave Center" tab.`;
      } 
      else if (cleanQuery.includes('task') || cleanQuery.includes('todo') || cleanQuery.includes('work') || cleanQuery.includes('objective') || cleanQuery.includes('duty')) {
        const pending = userTasks.filter(t => t.status !== 'completed');
        const completedCount = userTasks.filter(t => t.status === 'completed').length;

        if (pending.length === 0) {
          response = `Excellent work! You have completed all assigned tasks (${completedCount} completed). You currently have no outstanding deliverables.`;
        } else {
          response = `You have ${pending.length} active task(s) (${completedCount} completed). Here are your pending objectives:
` + pending.map((t, i) => `${i + 1}. ${t.title} (Due: ${t.dueDate}, Priority: ${t.priority})`).join('\n') + `
You can update your task status under the "Tasks Board" tab.`;
        }
      } 
      else if (cleanQuery.includes('attendance') || cleanQuery.includes('clock') || cleanQuery.includes('check in') || cleanQuery.includes('check-in')) {
        const todayLog = userAttendance.find(a => a.date === today);
        const presentCount = userAttendance.filter(a => a.status === 'present').length;
        
        if (todayLog) {
          response = `Today's Shift Log (${today}):
• Status: Present (${todayLog.status})
• In: ${todayLog.clockIn}
• Out: ${todayLog.clockOut || 'Active Work Shift'}.
You have clocked in present ${presentCount} times in the database history logs.`;
        } else {
          response = `You have not clocked in for today (${today}) yet. Please use the Check-In panel under "My Console" to log your attendance.`;
        }
      } 
      else if (cleanQuery.includes('salary') || cleanQuery.includes('pay') || cleanQuery.includes('money') || cleanQuery.includes('slip') || cleanQuery.includes('compensation')) {
        response = `Your base salary is $${currentUser.salary.toLocaleString()}/month. A total of ${userPayslips.length} payslips have been released by HR. You can view/print statements in the "Salary Ledger" tab.`;
      } 
      else if (cleanQuery.includes('help') || cleanQuery.includes('hi') || cleanQuery.includes('hello') || cleanQuery.includes('hey')) {
        response = `Hi! I am here to help you navigate EmpNexus. You can ask me:
- "How many leaves do I have?"
- "What tasks are assigned to me?"
- "Check my attendance status today"
- "Show my salary details"`;
      } 
      else {
        response = `I'm sorry, I couldn't search that specific query. You can ask me about your leave balances, assigned tasks, clock-in attendance logs, or salary slips! If you need policy documents or further assistance, please contact the HR Desk.`;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 700);
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Get current user's attendance status today
  const todayAttendance = attendance.find(
    (a) => a.employeeId === currentUser.id && a.date === today
  );

  // Calculate stats
  const userTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const completedTasksCount = userTasks.filter((t) => t.status === 'completed').length;
  const pendingTasksCount = userTasks.filter((t) => t.status !== 'completed').length;
  
  const userLeaves = leaves.filter((l) => l.employeeId === currentUser.id);
  const approvedLeavesCount = userLeaves.filter((l) => l.status === 'approved').length;

  const userPayslips = payslips.filter((p) => p.employeeId === currentUser.id);

  // Clock Actions
  const handleClockIn = async () => {
    const res = await clockIn(currentUser.id);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleClockOut = async () => {
    const res = await clockOut(currentUser.id);
    if (!res.success) {
      alert(res.message);
    }
  };

  // Leave Submit
  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setLeaveMsg('');

    if (!lvStart || !lvEnd || !lvReason) {
      setLeaveMsg('Please fill out all fields.');
      return;
    }

    requestLeave({
      employeeId: currentUser.id,
      startDate: lvStart,
      endDate: lvEnd,
      type: lvType,
      reason: lvReason
    });

    setLvStart('');
    setLvEnd('');
    setLvType('annual');
    setLvReason('');
    setLeaveMsg('Leave request submitted successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => setLeaveMsg(''), 3000);
  };

  // Open Payslip modal
  const handleViewPayslip = (ps) => {
    setViewingPayslip(ps);
    setPayslipModalOpen(true);
  };

  return (
    <div>
      {/* HEADER SECTION */}
      <div className="dashboard-header">
        <div>
          <h2>EmpNexus Terminal</h2>
          <div className="dashboard-title-desc">Welcome back, <strong style={{ color: '#fff' }}>{currentUser.name}</strong></div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>
          <div>{formattedDate}</div>
        </div>
      </div>

      {/* METRIC COUNTER ROW */}
      <div className="stats-grid">
        <div className="stat-card glass-panel info">
          <div className="stat-info">
            <span className="stat-label">Pending Duties</span>
            <span className="stat-value">{pendingTasksCount}</span>
          </div>
          <div className="stat-icon-wrapper">
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="stat-card glass-panel success">
          <div className="stat-info">
            <span className="stat-label">Completed Tasks</span>
            <span className="stat-value">{completedTasksCount}</span>
          </div>
          <div className="stat-icon-wrapper">
            <ClipboardList size={22} style={{ color: 'var(--color-success)' }} />
          </div>
        </div>

        <div className="stat-card glass-panel warning">
          <div className="stat-info">
            <span className="stat-label">Leaves Approved</span>
            <span className="stat-value">{approvedLeavesCount}</span>
          </div>
          <div className="stat-icon-wrapper">
            <CalendarClock size={22} />
          </div>
        </div>

        <div className="stat-card glass-panel info">
          <div className="stat-info">
            <span className="stat-label">Base Compensation</span>
            <span className="stat-value">${currentUser.salary.toLocaleString()}</span>
          </div>
          <div className="stat-icon-wrapper">
            <CircleDollarSign size={22} style={{ color: 'var(--color-success)' }} />
          </div>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          {/* Attendance Clock Panel */}
          <div className="glass-panel section-card digital-clock-panel">
            <Clock size={40} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
            <div className="digital-clock">{formattedTime}</div>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem' }}>Core Office Time: 09:00 AM - 05:00 PM</p>
            
            <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px' }}>
               {!todayAttendance ? (
                <button className="btn btn-primary" onClick={handleClockIn} style={{ flex: 1, height: '44px' }}>
                  <Play size={16} /> In
                </button>
              ) : !todayAttendance.clockOut ? (
                <button className="btn btn-danger" onClick={handleClockOut} style={{ flex: 1, height: '44px' }}>
                  <Square size={16} /> Out
                </button>
              ) : (
                <div style={{ flex: 1, background: 'var(--color-success-bg)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.875rem' }}>
                  Workshift Completed Today
                </div>
              )}
            </div>

            <div className="clock-stats-row">
              <div className="clock-stat-box">
                <div className="clock-stat-label">In</div>
                <div className="clock-stat-time">{todayAttendance ? todayAttendance.clockIn : '--:--'}</div>
              </div>
              <div className="clock-stat-box">
                <div className="clock-stat-label">Out</div>
                <div className="clock-stat-time">{(todayAttendance && todayAttendance.clockOut) ? todayAttendance.clockOut : '--:--'}</div>
              </div>
            </div>
          </div>

          {/* Active Tasks Panel */}
          <div className="glass-panel section-card">
            <h3>Urgent Assigned Objectives</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>Active deliverables due soon</p>

            <div className="tasks-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {userTasks.filter(t => t.status !== 'completed').length === 0 ? (
                <p style={{ fontSize: '0.875rem', padding: '1rem 0' }}>All clear! You have no pending tasks.</p>
              ) : (
                userTasks.filter(t => t.status !== 'completed').map((task) => (
                  <div key={task.id} className="glass-panel task-item" style={{ border: '1px solid rgba(255,255,255,0.03)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{task.title}</strong>
                      <span className={`badge ${task.status === 'in-progress' ? 'badge-info' : 'badge-warning'}`}>
                        {task.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Due: {task.dueDate}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TASKS BOARD TAB */}
      {activeTab === 'tasks' && (
        <div className="glass-panel section-card">
          <div className="section-header">
            <h3>Assigned Objectives Board</h3>
          </div>

          <div className="table-container">
            {userTasks.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>You have not been assigned any tasks yet.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Objective</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userTasks.map((task) => (
                    <tr key={task.id}>
                      <td><span style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>{task.id}</span></td>
                      <td>
                        <strong>{task.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '350px', whiteSpace: 'normal', marginTop: '4px' }}>
                          {task.description}
                        </div>
                      </td>
                      <td>{task.dueDate}</td>
                      <td>
                        <span className={`badge ${
                          task.priority === 'high' ? 'badge-danger' : 
                          task.priority === 'medium' ? 'badge-warning' : 
                          'badge-success'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="form-select"
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          style={{ width: '130px', padding: '0.5rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. LEAVE CENTER TAB */}
      {activeTab === 'leaves' && (
        <div className="dashboard-grid">
          {/* File Leave Request Form */}
          <div className="glass-panel section-card">
            <h3>Request Leave Absency</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem' }}>File request for supervisor approval</p>

            {leaveMsg && (
              <div style={{
                background: leaveMsg.includes('success') ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                color: leaveMsg.includes('success') ? 'var(--color-success)' : 'var(--color-danger)',
                border: '1px solid currentColor',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {leaveMsg}
              </div>
            )}

            <form onSubmit={handleLeaveSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={lvStart}
                    onChange={(e) => setLvStart(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={lvEnd}
                    onChange={(e) => setLvEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Absence Category</label>
                <select 
                  className="form-select"
                  value={lvType}
                  onChange={(e) => setLvType(e.target.value)}
                >
                  <option value="annual">Annual Paid Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Emergency</option>
                  <option value="unpaid">Unpaid Absency</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Notes</label>
                <textarea 
                  className="form-textarea" 
                  rows="3"
                  placeholder="Provide details for leave request validation..."
                  value={lvReason}
                  onChange={(e) => setLvReason(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <Plus size={16} /> File Request
              </button>
            </form>
          </div>

          {/* Leave Request Logs */}
          <div className="glass-panel section-card">
            <h3>Request Logs</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem' }}>Historical absency application status</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {userLeaves.length === 0 ? (
                <p>No leave requests found.</p>
              ) : (
                userLeaves.map((lv) => (
                  <div key={lv.id} className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{lv.type}</span>
                      <span className={`badge ${
                        lv.status === 'approved' ? 'badge-success' : 
                        lv.status === 'rejected' ? 'badge-danger' : 
                        'badge-warning'
                      }`}>
                        {lv.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {lv.startDate} to {lv.endDate}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                      "{lv.reason}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SALARY LEDGER TAB */}
      {activeTab === 'payroll' && (
        <div className="glass-panel section-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-header">
            <h3>Compensation History Ledger</h3>
          </div>

          <div className="table-container">
            {userPayslips.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>No salary records released for your profile yet.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Slip ID</th>
                    <th>Salary Month Cycle</th>
                    <th>Net Disbursement</th>
                    <th>Released On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userPayslips.map((ps) => (
                    <tr key={ps.id}>
                      <td><span style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>{ps.id}</span></td>
                      <td><strong>{ps.month}</strong></td>
                      <td><strong style={{ color: 'var(--color-success)' }}>${ps.netSalary.toLocaleString()}</strong></td>
                      <td>{ps.releasedOn}</td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-icon"
                          onClick={() => handleViewPayslip(ps)}
                          title="Open Pay Slip"
                        >
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: VIEW PAYSLIP RECEIPT */}
      {payslipModalOpen && viewingPayslip && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Compensation Ledger Statement</h3>
              <button className="modal-close" onClick={() => setPayslipModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="payslip-layout">
              <div className="payslip-header-brand">
                <div>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>EMPNEXUS INDUSTRIES</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Financial & HR Services Dept.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STATEMENT ID</div>
                  <strong style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--color-accent)' }}>{viewingPayslip.id}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>EMPLOYEE NAME</span>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentUser.name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>EMPLOYEE ID</span>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'monospace' }}>{currentUser.id}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>DESIGNATION</span>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentUser.designation}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>STATEMENT PERIOD</span>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{viewingPayslip.month}</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                <div className="payslip-row">
                  <span style={{ color: 'var(--text-muted)' }}>Base Compensation (+)</span>
                  <span>${viewingPayslip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="payslip-row">
                  <span style={{ color: 'var(--text-muted)' }}>Performance Bonus (+)</span>
                  <span style={{ color: 'var(--color-success)' }}>+${viewingPayslip.bonus.toLocaleString()}</span>
                </div>
                <div className="payslip-row" style={{ paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Regulatory Deductions (-)</span>
                  <span style={{ color: 'var(--color-danger)' }}>-${viewingPayslip.deductions.toLocaleString()}</span>
                </div>
                <div className="payslip-row payslip-total">
                  <span>NET DISBURSED COMP</span>
                  <span>${viewingPayslip.netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0 0' }}>
              This is a system generated statement, no signature is required. Released on {viewingPayslip.releasedOn}.
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => window.print()} style={{ fontSize: '0.8125rem' }}>
                Print Slip
              </button>
              <button className="btn btn-primary" onClick={() => setPayslipModalOpen(false)} style={{ fontSize: '0.8125rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI ASSISTANT CHAT WIDGET */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        {/* Minimized Chat Bubble Button */}
        {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="btn btn-primary"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              boxShadow: '0 8px 32px 0 rgba(37, 99, 235, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageSquare size={24} style={{ color: '#fff' }} />
          </button>
        )}

        {/* Chat Panel */}
        {chatOpen && (
          <div className="glass-panel" style={{
            width: '340px',
            height: '460px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--glass-border)',
            background: 'rgba(10, 14, 26, 0.95)',
            backdropFilter: 'blur(20px)'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(37, 99, 235, 0.15)',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(37, 99, 235, 0.3)', display: 'flex' }}>
                  <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: '#fff' }}>EmpNexus AI Assistant</strong>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '5px', height: '5px', background: 'var(--color-success)', borderRadius: '50%' }}></span> Online Help
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Log Message Area */}
            <div style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    borderTopRightRadius: msg.sender === 'user' ? '2px' : '12px',
                    borderTopLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                    fontSize: '0.78rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    background: msg.sender === 'user' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#fff',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                    {msg.time}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Thinking</span>
                  <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
                    <span style={{ width: '4px', height: '4px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                    <span style={{ width: '4px', height: '4px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                    <span style={{ width: '4px', height: '4px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestion Quick Chips */}
            <div style={{
              padding: '0.5rem 1rem',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              borderTop: '1px solid rgba(255, 255, 255, 0.03)',
              background: 'rgba(0, 0, 0, 0.15)',
              scrollbarWidth: 'none'
            }}>
              {[
                { label: 'Leaves Balance', query: 'how many leaves do I have?' },
                { label: 'Pending Duties', query: 'what are my pending tasks?' },
                { label: 'Shift Logs', query: 'what is my attendance status?' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleSendMessage(e, chip.query)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--color-accent)',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--glass-border)',
              display: 'flex',
              gap: '8px'
            }}>
              <input 
                type="text" 
                className="form-input"
                placeholder="Ask EmpNexus AI..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ height: '36px', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContents: 'center' }}
              >
                <Send size={14} style={{ margin: 'auto' }} />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
