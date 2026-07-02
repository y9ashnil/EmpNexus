const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'empnexus.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database at:", dbPath);
  }
});

db.serialize(() => {
  // 1. Employees Table
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    designation TEXT NOT NULL,
    department TEXT NOT NULL,
    salary REAL NOT NULL,
    joinDate TEXT NOT NULL,
    phone TEXT
  )`);

  // 2. Tasks Table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assigneeId TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    FOREIGN KEY(assigneeId) REFERENCES employees(id)
  )`);

  // 3. Leaves Table
  db.run(`CREATE TABLE IF NOT EXISTS leaves (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    type TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL,
    FOREIGN KEY(employeeId) REFERENCES employees(id)
  )`);

  // 4. Attendance Table
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    date TEXT NOT NULL,
    clockIn TEXT NOT NULL,
    clockOut TEXT,
    status TEXT NOT NULL,
    FOREIGN KEY(employeeId) REFERENCES employees(id)
  )`);

  // 5. Payslips Table
  db.run(`CREATE TABLE IF NOT EXISTS payslips (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    month TEXT NOT NULL,
    baseSalary REAL NOT NULL,
    bonus REAL NOT NULL,
    deductions REAL NOT NULL,
    netSalary REAL NOT NULL,
    releasedOn TEXT NOT NULL,
    FOREIGN KEY(employeeId) REFERENCES employees(id)
  )`);

  // 6. Jobs Table
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    salaryRange TEXT NOT NULL,
    status TEXT NOT NULL
  )`);

  // 7. Candidates Table
  db.run(`CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    position TEXT NOT NULL,
    status TEXT NOT NULL
  )`);

  // 8. Interviews Table
  db.run(`CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY,
    candidateName TEXT NOT NULL,
    position TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    interviewer TEXT NOT NULL,
    status TEXT NOT NULL
  )`);

  // 9. Verifications Table
  db.run(`CREATE TABLE IF NOT EXISTS verifications (
    employeeId TEXT PRIMARY KEY,
    backgroundCheck TEXT NOT NULL,
    idProof TEXT NOT NULL,
    idProofUrl TEXT,
    academicCert TEXT NOT NULL,
    academicCertUrl TEXT,
    FOREIGN KEY(employeeId) REFERENCES employees(id)
  )`);

  // 10. Audit Logs Table
  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    operatorEmail TEXT NOT NULL,
    action TEXT NOT NULL,
    ipAddress TEXT,
    timestamp TEXT NOT NULL
  )`);

  // Seed default employees
  db.get("SELECT COUNT(*) as count FROM employees", (err, row) => {
    if (row && row.count === 0) {
      console.log("Seeding initial data...");

      // Seed Employees
      const stmt = db.prepare(`INSERT INTO employees VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      stmt.run('EMP-001', 'Sarah Connor', 'sarah@ems.com', 'password123', 'employee', 'Senior Software Engineer', 'Engineering', 8500, '2022-04-15', '+1 (555) 019-2831');
      stmt.run('EMP-002', 'Marcus Wright', 'marcus@ems.com', 'password123', 'employee', 'Product Designer', 'Design', 7200, '2023-01-10', '+1 (555) 021-3948');
      stmt.run('EMP-003', 'John Connor', 'john@ems.com', 'password123', 'employee', 'Junior Analyst', 'Operations', 4800, '2023-11-01', '+1 (555) 039-4821');
      stmt.finalize();

      // Seed Verifications
      const vStmt = db.prepare(`INSERT INTO verifications VALUES (?, ?, ?, ?, ?, ?)`);
      vStmt.run('EMP-001', 'passed', 'approved', 'passport_sarah.pdf', 'approved', 'bs_degree_sarah.pdf');
      vStmt.run('EMP-002', 'passed', 'approved', 'license_marcus.pdf', 'pending', 'design_cert_marcus.pdf');
      vStmt.run('EMP-003', 'pending', 'pending', 'birth_cert_john.pdf', 'pending', 'hs_diploma_john.pdf');
      vStmt.finalize();

      // Seed Tasks
      const tStmt = db.prepare(`INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?)`);
      tStmt.run('TASK-101', 'Perform security code audit', 'Audit code repository for package dependencies vulnerabilities.', 'EMP-001', '2026-07-05', 'in-progress', 'high');
      tStmt.run('TASK-102', 'Redesign login widget interface', 'Enhance layout style with premium formal corporate design tokens.', 'EMP-002', '2026-07-02', 'pending', 'medium');
      tStmt.run('TASK-103', 'Update directory records', 'Sync compliance statuses for recently hired resource members.', 'EMP-003', '2026-07-10', 'completed', 'low');
      tStmt.finalize();

      // Seed Leaves
      const lStmt = db.prepare(`INSERT INTO leaves VALUES (?, ?, ?, ?, ?, ?, ?)`);
      lStmt.run('LV-201', 'EMP-001', 'annual', '2026-07-12', '2026-07-16', 'Visiting family and relatives.', 'approved');
      lStmt.run('LV-202', 'EMP-003', 'casual', '2026-07-20', '2026-07-21', 'Medical health check-up appointment.', 'pending');
      lStmt.finalize();

      // Seed Attendance
      const aStmt = db.prepare(`INSERT INTO attendance VALUES (?, ?, ?, ?, ?, ?)`);
      aStmt.run('ATT-301', 'EMP-001', '2026-06-28', '09:02 AM', '05:01 PM', 'present');
      aStmt.run('ATT-302', 'EMP-002', '2026-06-28', '08:55 AM', '05:04 PM', 'present');
      aStmt.run('ATT-303', 'EMP-003', '2026-06-28', '09:15 AM', '04:58 PM', 'present');
      aStmt.finalize();

      // Seed Payslips
      const pStmt = db.prepare(`INSERT INTO payslips VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      pStmt.run('PS-401', 'EMP-001', 'June 2026', 8500, 450, 200, 8750, '2026-06-28');
      pStmt.run('PS-402', 'EMP-002', 'June 2026', 7200, 200, 150, 7250, '2026-06-28');
      pStmt.finalize();

      // Seed Jobs
      const jStmt = db.prepare(`INSERT INTO jobs VALUES (?, ?, ?, ?, ?)`);
      jStmt.run('JOB-501', 'Senior Backend Engineer', 'Engineering', '$7,000 - $9,500', 'open');
      jStmt.run('JOB-502', 'Lead UI/UX Designer', 'Design', '$6,500 - $8,500', 'open');
      jStmt.finalize();

      // Seed Candidates
      const cStmt = db.prepare(`INSERT INTO candidates VALUES (?, ?, ?, ?, ?, ?)`);
      cStmt.run('CAND-601', 'Thomas Anderson', 'neo@matrix.io', '+1 (555) 012-3214', 'Senior Backend Engineer', 'screening');
      cStmt.finalize();

      // Seed Interviews
      const iStmt = db.prepare(`INSERT INTO interviews VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      iStmt.run('INT-701', 'Thomas Anderson', 'Senior Backend Engineer', '2026-07-02', '10:00 AM', 'Technical Phase', 'Sarah Connor', 'scheduled');
      iStmt.finalize();

      // Seed Audit Logs
      const auditStmt = db.prepare(`INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?)`);
      auditStmt.run('AUD-901', 'admin@ems.com', 'System database initialized and seeded with sample accounts.', '127.0.0.1', new Date().toISOString());
      auditStmt.run('AUD-902', 'admin@ems.com', 'Approved initial compliance files for EMP-001 (Sarah Connor).', '127.0.0.1', new Date().toISOString());
      auditStmt.finalize();

      console.log("Seeding complete!");
    }
  });
});

module.exports = db;
