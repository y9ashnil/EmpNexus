const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// Helper for generating random IDs
const genId = (prefix) => `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

// Helper for logging actions
const logAction = (operatorEmail, action, ipAddress = '127.0.0.1') => {
  const auditId = genId('AUD');
  db.run(
    `INSERT INTO audit_logs (id, operatorEmail, action, ipAddress, timestamp) VALUES (?, ?, ?, ?, ?)`,
    [auditId, operatorEmail || 'system@ems.com', action, ipAddress, new Date().toISOString()],
    (err) => {
      if (err) console.error("Audit log write failed:", err.message);
    }
  );
};

// RBAC middleware to verify admin privileges
const checkAdminRole = (req, res, next) => {
  const operatorRole = req.headers['x-user-role'];
  if (operatorRole !== 'admin') {
    return res.status(403).json({ error: "Access Denied: Administrative privileges required." });
  }
  next();
};

// RBAC middleware to verify HR or admin privileges
const checkHRRole = (req, res, next) => {
  const operatorRole = req.headers['x-user-role'];
  if (operatorRole !== 'hr' && operatorRole !== 'admin') {
    return res.status(403).json({ error: "Access Denied: HR or Administrative privileges required." });
  }
  next();
};

// Middleware to resolve requester's employee ID for data scoping
const resolveEmployeeId = (req, res, next) => {
  const email = req.headers['x-user-email'];
  const role = req.headers['x-user-role'];

  if (role === 'employee' && email) {
    if (email.toLowerCase() === 'admin@ems.com') {
      req.employeeId = 'ADMIN-001';
      return next();
    }

    db.get(
      "SELECT id FROM employees WHERE LOWER(email) = ?",
      [email.toLowerCase()],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        req.employeeId = row ? row.id : null;
        next();
      }
    );
  } else {
    req.employeeId = null;
    next();
  }
};

// Admin Metrics Aggregator
app.get('/api/admin/metrics', checkAdminRole, (req, res) => {
  db.get("SELECT COUNT(*) as totalEmployees FROM employees", [], (err, empRow) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get("SELECT COUNT(*) as activeTasks FROM tasks WHERE status != 'completed'", [], (err, taskRow) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT COUNT(*) as pendingLeaves FROM leaves WHERE status = 'pending'", [], (err, leaveRow) => {
        if (err) return res.status(500).json({ error: err.message });

        const today = new Date().toISOString().split('T')[0];
        db.get("SELECT COUNT(*) as todayPresentCount FROM attendance WHERE date = ? AND status = 'present'", [today], (err, attRow) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            totalEmployees: empRow.totalEmployees,
            activeTasks: taskRow.activeTasks,
            pendingLeaves: leaveRow.pendingLeaves,
            todayPresentCount: attRow.todayPresentCount
          });
        });
      });
    });
  });
});

// Admin Audit Trail Logs
app.get('/api/admin/audit-logs', checkAdminRole, (req, res) => {
  db.all("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 1. Authentication
app.post('/api/login', (req, res) => {
  const { email, password, roleType } = req.body;

  if (roleType === 'admin') {
    if (email === 'admin@ems.com' && password === 'admin123') {
      return res.json({
        success: true,
        user: { id: 'ADMIN-001', name: 'Admin Account', email, role: 'admin' }
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
  } 
  
  if (roleType === 'hr') {
    if (email === 'hr@ems.com' && password === 'hr123') {
      return res.json({
        success: true,
        user: { id: 'HR-001', name: 'EmpNexus HR Manager', email, role: 'hr' }
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid HR Credentials' });
  }

  // Employee Login (including Admin login on Employee portal)
  if (email.toLowerCase() === 'admin@ems.com' && password === 'admin123') {
    return res.json({
      success: true,
      user: {
        id: 'ADMIN-001',
        name: 'Admin Account',
        email: 'admin@ems.com',
        password: 'admin123',
        role: 'employee',
        designation: 'System Administrator',
        department: 'Management',
        salary: 15000,
        joinDate: '2024-01-01',
        phone: '+1 (555) 000-0000'
      }
    });
  }

  db.get(
    "SELECT * FROM employees WHERE LOWER(email) = ? AND password = ?",
    [email.toLowerCase(), password],
    (err, employee) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (employee) {
        return res.json({ success: true, user: employee });
      }
      return res.status(401).json({ success: false, message: 'Invalid Employee Credentials' });
    }
  );
});

// 2. Employees Directory
app.get('/api/employees', (req, res) => {
  db.all("SELECT * FROM employees", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/employees', checkAdminRole, (req, res) => {
  const { name, email, password, designation, department, salary, phone } = req.body;
  const operatorEmail = req.headers['x-user-email'];
  const newId = genId('EMP');
  const joinDate = new Date().toISOString().split('T')[0];

  db.run(
    `INSERT INTO employees (id, name, email, password, role, designation, department, salary, joinDate, phone) 
     VALUES (?, ?, ?, ?, 'employee', ?, ?, ?, ?, ?)`,
    [newId, name, email, password, designation, department, parseFloat(salary), joinDate, phone],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Initialize verifications
      db.run(
        `INSERT INTO verifications (employeeId, backgroundCheck, idProof, idProofUrl, academicCert, academicCertUrl)
         VALUES (?, 'pending', 'pending', 'passport_doc.pdf', 'pending', 'academic_doc.pdf')`,
        [newId],
        (vErr) => {
          if (vErr) console.error("Failed to initialize verification entry:", vErr.message);
          
          logAction(operatorEmail, `Created employee record ${newId} (${name})`);
          db.get("SELECT * FROM employees WHERE id = ?", [newId], (gErr, row) => {
            res.json(row);
          });
        }
      );
    }
  );
});

app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, designation, department, salary, phone } = req.body;

  db.run(
    `UPDATE employees SET name = ?, email = ?, designation = ?, department = ?, salary = ?, phone = ? WHERE id = ?`,
    [name, email, designation, department, parseFloat(salary), phone, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM employees WHERE id = ?", [id], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

app.delete('/api/employees/:id', checkAdminRole, (req, res) => {
  const { id } = req.params;
  const operatorEmail = req.headers['x-user-email'];
  
  db.run("DELETE FROM employees WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    // Cleanup cascade
    db.run("DELETE FROM verifications WHERE employeeId = ?", [id]);
    db.run("DELETE FROM tasks WHERE assigneeId = ?", [id]);
    db.run("DELETE FROM leaves WHERE employeeId = ?", [id]);
    db.run("DELETE FROM attendance WHERE employeeId = ?", [id]);
    logAction(operatorEmail, `Deleted employee record ${id}`);
    res.json({ success: true, message: `Removed employee ${id}` });
  });
});

// 3. Tasks Management
app.get('/api/tasks', resolveEmployeeId, (req, res) => {
  if (req.employeeId) {
    db.all("SELECT * FROM tasks WHERE assigneeId = ?", [req.employeeId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.post('/api/tasks', checkAdminRole, (req, res) => {
  const { title, description, assigneeId, dueDate, priority } = req.body;
  const operatorEmail = req.headers['x-user-email'];
  const newId = genId('TASK');

  db.run(
    `INSERT INTO tasks (id, title, description, assigneeId, dueDate, status, priority) VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [newId, title, description, assigneeId, dueDate, priority],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction(operatorEmail, `Assigned new task ${newId} (${title}) to employee ${assigneeId}`);
      db.get("SELECT * FROM tasks WHERE id = ?", [newId], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    `UPDATE tasks SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM tasks WHERE id = ?", [id], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

// 4. Leave Operations
app.get('/api/leaves', resolveEmployeeId, (req, res) => {
  if (req.employeeId) {
    db.all("SELECT * FROM leaves WHERE employeeId = ?", [req.employeeId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all("SELECT * FROM leaves", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.post('/api/leaves', (req, res) => {
  const { employeeId, type, startDate, endDate, reason } = req.body;
  const newId = genId('LV');

  db.run(
    `INSERT INTO leaves (id, employeeId, type, startDate, endDate, reason, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [newId, employeeId, type, startDate, endDate, reason],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM leaves WHERE id = ?", [newId], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

app.put('/api/leaves/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    `UPDATE leaves SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM leaves WHERE id = ?", [id], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

// 5. Attendance logs
app.get('/api/attendance', resolveEmployeeId, (req, res) => {
  if (req.employeeId) {
    db.all("SELECT * FROM attendance WHERE employeeId = ?", [req.employeeId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all("SELECT * FROM attendance", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.post('/api/attendance/clock-in', (req, res) => {
  const { employeeId, time } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const newId = genId('ATT');

  // Verify if they already clocked in today
  db.get(
    "SELECT * FROM attendance WHERE employeeId = ? AND date = ?",
    [employeeId, today],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ success: false, message: 'Already logged In today.' });

      db.run(
        `INSERT INTO attendance (id, employeeId, date, clockIn, clockOut, status) VALUES (?, ?, ?, ?, NULL, 'present')`,
        [newId, employeeId, today, time],
        function (iErr) {
          if (iErr) return res.status(500).json({ error: iErr.message });
          db.get("SELECT * FROM attendance WHERE id = ?", [newId], (gErr, newRow) => {
            res.json(newRow);
          });
        }
      );
    }
  );
});

app.post('/api/attendance/clock-out', (req, res) => {
  const { employeeId, time } = req.body;
  const today = new Date().toISOString().split('T')[0];

  db.run(
    `UPDATE attendance SET clockOut = ? WHERE employeeId = ? AND date = ?`,
    [time, employeeId, today],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM attendance WHERE employeeId = ? AND date = ?", [employeeId, today], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

// 6. Payslips Management
app.get('/api/payslips', resolveEmployeeId, (req, res) => {
  if (req.employeeId) {
    db.all("SELECT * FROM payslips WHERE employeeId = ?", [req.employeeId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all("SELECT * FROM payslips", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.post('/api/payslips', checkAdminRole, (req, res) => {
  const { employeeId, month, baseSalary, bonus, deductions } = req.body;
  const operatorEmail = req.headers['x-user-email'];
  const newId = genId('PS');
  const releasedOn = new Date().toISOString().split('T')[0];
  const netSalary = parseFloat(baseSalary) + parseFloat(bonus) - parseFloat(deductions);

  db.run(
    `INSERT INTO payslips (id, employeeId, month, baseSalary, bonus, deductions, netSalary, releasedOn) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [newId, employeeId, month, parseFloat(baseSalary), parseFloat(bonus), parseFloat(deductions), netSalary, releasedOn],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction(operatorEmail, `Released pay slip ${newId} for employee ${employeeId} (${month})`);
      db.get("SELECT * FROM payslips WHERE id = ?", [newId], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

// 7. Recruitment: Jobs Opening
app.get('/api/jobs', (req, res) => {
  db.all("SELECT * FROM jobs", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/jobs', checkHRRole, (req, res) => {
  const { title, department, salaryRange } = req.body;
  const newId = genId('JOB');

  db.run(
    `INSERT INTO jobs (id, title, department, salaryRange, status) VALUES (?, ?, ?, ?, 'open')`,
    [newId, title, department, salaryRange],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM jobs WHERE id = ?", [newId], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

app.put('/api/jobs/:id/status', checkHRRole, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    `UPDATE jobs SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM jobs WHERE id = ?", [id], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

// 8. Recruitment: Candidates
app.get('/api/candidates', (req, res) => {
  db.all("SELECT * FROM candidates", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/candidates', checkHRRole, (req, res) => {
  const { name, email, phone, position } = req.body;
  const newId = genId('CAND');

  db.run(
    `INSERT INTO candidates (id, name, email, phone, position, status) VALUES (?, ?, ?, ?, ?, 'applied')`,
    [newId, name, email, phone, position],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM candidates WHERE id = ?", [newId], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

app.put('/api/candidates/:id/status', checkHRRole, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    `UPDATE candidates SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM candidates WHERE id = ?", [id], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

// 9. Recruitment: Interviews
app.get('/api/interviews', (req, res) => {
  db.all("SELECT * FROM interviews", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/interviews', checkHRRole, (req, res) => {
  const { candidateName, position, date, time, type, interviewer } = req.body;
  const newId = genId('INT');

  db.run(
    `INSERT INTO interviews (id, candidateName, position, date, time, type, interviewer, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
    [newId, candidateName, position, date, time, type, interviewer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM interviews WHERE id = ?", [newId], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

app.put('/api/interviews/:id/status', checkHRRole, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    `UPDATE interviews SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM interviews WHERE id = ?", [id], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

// 10. Compliance Checks: Verifications
app.get('/api/verifications', (req, res) => {
  db.all("SELECT * FROM verifications", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/verifications/:employeeId', checkHRRole, (req, res) => {
  const { employeeId } = req.params;
  const { field, status } = req.body; // field is backgroundCheck, idProof, or academicCert

  // Validate field to prevent injection
  const allowedFields = ['backgroundCheck', 'idProof', 'academicCert'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ success: false, message: 'Invalid compliance field.' });
  }

  db.run(
    `UPDATE verifications SET ${field} = ? WHERE employeeId = ?`,
    [status, employeeId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM verifications WHERE employeeId = ?", [employeeId], (gErr, row) => {
        res.json(row);
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`EmpNexus Backend Express Server running on port ${PORT}`);
});
