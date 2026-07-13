import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  Users, 
  CalendarClock, 
  UserCheck, 
  CircleDollarSign, 
  ClipboardList, 
  Plus, 
  X, 
  Search, 
  Check, 
  Eye, 
  AlertTriangle,
  Briefcase
} from 'lucide-react';

export default function HRDashboard({ activeTab }) {
  const {
    employees,
    jobs,
    candidates,
    interviews,
    verifications,
    addJob,
    toggleJobStatus,
    addCandidate,
    updateCandidateStatus,
    scheduleInterview,
    updateInterviewStatus,
    updateVerificationStatus,
    updateEmployee
  } = useAppState();

  const today = new Date().toISOString().split('T')[0];

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals visibility
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [candModalOpen, setCandModalOpen] = useState(false);
  const [intModalOpen, setIntModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  // Active items for editing
  const [activeSalaryEmp, setActiveSalaryEmp] = useState(null);

  // Form States - Job
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('Engineering');
  const [jobSalary, setJobSalary] = useState('');

  // Form States - Candidate
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candPos, setCandPos] = useState('');

  // Form States - Interview
  const [intCand, setIntCand] = useState('');
  const [intDate, setIntDate] = useState('');
  const [intTime, setIntTime] = useState('');
  const [intType, setIntType] = useState('technical');
  const [intInterviewer, setIntInterviewer] = useState('');

  // Form States - Salary Adjust
  const [adjustVal, setAdjustVal] = useState('');

  // Submit Job Form
  const handleJobSubmit = (e) => {
    e.preventDefault();
    addJob({
      title: jobTitle,
      department: jobDept,
      salaryRange: jobSalary
    });
    setJobTitle('');
    setJobSalary('');
    setJobModalOpen(false);
  };

  // Submit Candidate Form
  const handleCandSubmit = (e) => {
    e.preventDefault();
    if (!candPos) return alert('Please select a position.');
    addCandidate({
      name: candName,
      email: candEmail,
      phone: candPhone,
      position: candPos
    });
    setCandName('');
    setCandEmail('');
    setCandPhone('');
    setCandPos('');
    setCandModalOpen(false);
  };

  // Submit Interview Form
  const handleIntSubmit = (e) => {
    e.preventDefault();
    if (!intCand) return alert('Please select a candidate.');
    scheduleInterview({
      candidateName: intCand,
      position: candidates.find(c => c.name === intCand)?.position || 'Job Opening',
      date: intDate,
      time: intTime,
      type: intType,
      interviewer: intInterviewer
    });
    setIntCand('');
    setIntDate('');
    setIntTime('');
    setIntType('technical');
    setIntInterviewer('');
    setIntModalOpen(false);
  };

  // Submit Salary Adjust
  const handleSalarySubmit = (e) => {
    e.preventDefault();
    updateEmployee(activeSalaryEmp.id, {
      salary: parseFloat(adjustVal)
    });
    setSalaryModalOpen(false);
  };



  // Filtered employees for list
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* HEADER SECTION */}
      <div className="dashboard-header">
        <div>
          <h2>EmpNexus HR Desk</h2>
          <div className="dashboard-title-desc">Human Resources Management & Auditing Portal</div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Cycle Date: <strong style={{ color: '#fff' }}>{today}</strong>
        </div>
      </div>

      {/* METRIC ROW */}
      <div className="stats-grid">
        <div className="stat-card glass-panel info">
          <div className="stat-info">
            <span className="stat-label">Active Job Openings</span>
            <span className="stat-value">{jobs.filter(j => j.status === 'open').length}</span>
          </div>
          <div className="stat-icon-wrapper">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="stat-card glass-panel success">
          <div className="stat-info">
            <span className="stat-label">Total Applicants</span>
            <span className="stat-value">{candidates.length}</span>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={22} style={{ color: 'var(--color-success)' }} />
          </div>
        </div>

        <div className="stat-card glass-panel warning">
          <div className="stat-info">
            <span className="stat-label">Interviews Today</span>
            <span className="stat-value">
              {interviews.filter(i => i.date === today && i.status === 'scheduled').length}
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <CalendarClock size={22} />
          </div>
        </div>

        <div className="stat-card glass-panel danger">
          <div className="stat-info">
            <span className="stat-label">Pending Document Checks</span>
            <span className="stat-value">
              {verifications.filter(v => v.idProof === 'pending' || v.academicCert === 'pending').length}
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <ClipboardList size={22} />
          </div>
        </div>
      </div>

      {/* 1. RECRUITMENT TAB */}
      {activeTab === 'recruitment' && (
        <div className="dashboard-grid">
          {/* Job Openings Panel */}
          <div className="glass-panel section-card">
            <div className="section-header">
              <h3>Job Openings Registry</h3>
              <button className="btn btn-primary" onClick={() => setJobModalOpen(true)}>
                <Plus size={16} /> Post Opening
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {jobs.map(job => (
                <div key={job.id} className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{job.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{job.department}</div>
                    </div>
                    <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-danger'}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Salary: <strong>{job.salaryRange}</strong></span>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => toggleJobStatus(job.id)}
                      style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                    >
                      Toggle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate list */}
          <div className="glass-panel section-card">
            <div className="section-header">
              <h3>Applicant Tracking System</h3>
              <button className="btn btn-secondary" onClick={() => setCandModalOpen(true)} style={{ padding: '6px 12px' }}>
                <Plus size={14} /> Add Candidate
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Target Role</th>
                    <th>Stage Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(cand => (
                    <tr key={cand.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cand.name)}`} 
                              alt={cand.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <strong>{cand.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cand.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{cand.position}</td>
                      <td>
                        <select 
                          className="form-select"
                          value={cand.status}
                          onChange={(e) => updateCandidateStatus(cand.id, e.target.value)}
                          style={{ padding: '0.35rem', fontSize: '0.75rem', width: '110px' }}
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offered">Offered</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERVIEW SCHEDULE TAB */}
      {activeTab === 'interviews' && (
        <div className="dashboard-grid">
          {/* Schedule Form */}
          <div className="glass-panel section-card">
            <h3>Schedule Candidate Interview</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Set up system evaluation timelines</p>

            <form onSubmit={handleIntSubmit}>
              <div className="form-group">
                <label className="form-label">Select Candidate</label>
                <select 
                  className="form-select"
                  value={intCand}
                  onChange={(e) => setIntCand(e.target.value)}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.filter(c => c.status !== 'rejected').map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.position})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Interview Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={intDate}
                    onChange={(e) => setIntDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time slot</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 10:00 AM"
                    value={intTime}
                    onChange={(e) => setIntTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Interview Stage Type</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Technical Phase, System Design, HR Alignment"
                  value={intType}
                  onChange={(e) => setIntType(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interviewer</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Sarah Connor"
                  value={intInterviewer}
                  onChange={(e) => setIntInterviewer(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Schedule Interview
              </button>
            </form>
          </div>

          {/* Scheduled List */}
          <div className="glass-panel section-card">
            <h3>Scheduled Panels</h3>
            <p style={{ fontSize: '0.8125rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Evaluation pipelines checklist</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {interviews.length === 0 ? (
                <p>No interviews scheduled.</p>
              ) : (
                interviews.map(i => (
                  <div key={i.id} className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong>{i.candidateName}</strong>
                      <span className={`badge ${i.status === 'scheduled' ? 'badge-warning' : i.status === 'passed' ? 'badge-success' : 'badge-danger'}`}>
                        {i.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <div>Role: <strong>{i.position}</strong></div>
                      <div>Type: {i.type}</div>
                      <div>Time: {i.date} @ {i.time}</div>
                      <div>Interviewer: {i.interviewer}</div>
                    </div>

                    {i.status === 'scheduled' && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        <button 
                          onClick={() => updateInterviewStatus(i.id, 'passed')}
                          className="btn btn-success" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          Pass Candidate
                        </button>
                        <button 
                          onClick={() => updateInterviewStatus(i.id, 'failed')}
                          className="btn btn-danger" 
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          Fail Candidate
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. EMPLOYEE VERIFICATION TAB */}
      {activeTab === 'verification' && (
        <div className="glass-panel section-card">
          <div className="section-header">
            <h3>Staff Verification Checks</h3>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID Verification</th>
                  <th>Academic Check</th>
                  <th>Background Check</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const check = verifications.find(v => v.employeeId === emp.id);
                  if (!check) return null;
                  
                  const isCompliant = check.backgroundCheck === 'passed' && 
                                      check.idProof === 'approved' && 
                                      check.academicCert === 'approved';
                  return (
                    <tr key={emp.id}>
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
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${check.idProof === 'approved' ? 'badge-success' : check.idProof === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {check.idProof}
                        </span>
                        {check.idProof === 'pending' && (
                          <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => updateVerificationStatus(emp.id, 'idProof', 'approved')}
                              className="btn btn-success" 
                              style={{ padding: '2px 4px', fontSize: '0.65rem' }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => updateVerificationStatus(emp.id, 'idProof', 'rejected')}
                              className="btn btn-danger" 
                              style={{ padding: '2px 4px', fontSize: '0.65rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${check.academicCert === 'approved' ? 'badge-success' : check.academicCert === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {check.academicCert}
                        </span>
                        {check.academicCert === 'pending' && (
                          <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => updateVerificationStatus(emp.id, 'academicCert', 'approved')}
                              className="btn btn-success" 
                              style={{ padding: '2px 4px', fontSize: '0.65rem' }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => updateVerificationStatus(emp.id, 'academicCert', 'rejected')}
                              className="btn btn-danger" 
                              style={{ padding: '2px 4px', fontSize: '0.65rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${check.backgroundCheck === 'passed' ? 'badge-success' : check.backgroundCheck === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                          {check.backgroundCheck}
                        </span>
                        {check.backgroundCheck === 'pending' && (
                          <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => updateVerificationStatus(emp.id, 'backgroundCheck', 'passed')}
                              className="btn btn-success" 
                              style={{ padding: '2px 4px', fontSize: '0.65rem' }}
                            >
                              Pass
                            </button>
                            <button 
                              onClick={() => updateVerificationStatus(emp.id, 'backgroundCheck', 'failed')}
                              className="btn btn-danger" 
                              style={{ padding: '2px 4px', fontSize: '0.65rem' }}
                            >
                              Fail
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {isCompliant ? (
                          <span className="badge badge-success">Verified Compliant</span>
                        ) : (
                          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> Pending Auditing
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SALARY MANAGEMENT TAB */}
      {activeTab === 'salaries' && (
        <div className="glass-panel section-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-header">
            <h3>Employee Compensation Audit</h3>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department & Designation</th>
                  <th>Base Monthly Salary</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
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
                          <br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department} - {emp.designation}</td>
                    <td><strong>Rs. {emp.salary.toLocaleString()}/mo</strong></td>
                    <td>
                      <button 
                        onClick={() => {
                          setActiveSalaryEmp(emp);
                          setAdjustVal(emp.salary);
                          setSalaryModalOpen(true);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Adjust Salary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* ======================================= */}
      {/* 1. MODAL: POST JOB */}
      {jobModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Post New Job Opening</h3>
              <button className="modal-close" onClick={() => setJobModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleJobSubmit}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                  placeholder="e.g. Senior Frontend Engineer" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-select"
                  value={jobDept}
                  onChange={(e) => setJobDept(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Salary Range (Monthly)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={jobSalary} 
                  onChange={(e) => setJobSalary(e.target.value)} 
                  placeholder="e.g. Rs. 65000 - Rs. 85000" 
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setJobModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: ADD CANDIDATE */}
      {candModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Enlist Candidate Profile</h3>
              <button className="modal-close" onClick={() => setCandModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCandSubmit}>
              <div className="form-group">
                <label className="form-label">Candidate Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={candName} 
                  onChange={(e) => setCandName(e.target.value)} 
                  placeholder="Thomas Anderson" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={candEmail} 
                    onChange={(e) => setCandEmail(e.target.value)} 
                    placeholder="neo@matrix.io" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={candPhone} 
                    onChange={(e) => setCandPhone(e.target.value)} 
                    placeholder="+1 (555) 012-3214" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Position Applied For</label>
                <select 
                  className="form-select"
                  value={candPos}
                  onChange={(e) => setCandPos(e.target.value)}
                  required
                >
                  <option value="">-- Select Opening --</option>
                  {jobs.filter(j => j.status === 'open').map(j => (
                    <option key={j.id} value={j.title}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setCandModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Enlist Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: ADJUST SALARY */}
      {salaryModalOpen && activeSalaryEmp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Adjust Employee Salary</h3>
              <button className="modal-close" onClick={() => setSalaryModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalarySubmit}>
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RESOURCE</div>
                <strong style={{ fontSize: '1rem' }}>{activeSalaryEmp.name}</strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{activeSalaryEmp.designation}</div>
              </div>

              <div className="form-group">
                <label className="form-label">New Monthly Base Salary (Rs.)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={adjustVal} 
                  onChange={(e) => setAdjustVal(e.target.value)} 
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setSalaryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}
