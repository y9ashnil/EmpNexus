import React from 'react';
import { useAppState } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  CalendarClock, 
  CircleDollarSign, 
  LogOut, 
  ShieldAlert, 
  UserCheck,
  BarChart3,
  FileClock,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const { currentUser, logout } = useAppState();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const isHR = currentUser.role === 'hr';

  const adminMenu = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Directory', icon: Users },
    { id: 'leaves', label: 'Leave Approvals', icon: CalendarClock },
    { id: 'tasks', label: 'Task Board', icon: ClipboardList },
    { id: 'payroll', label: 'Payroll Console', icon: CircleDollarSign },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: FileClock },
  ];

  const hrMenu = [
    { id: 'recruitment', label: 'Recruitment', icon: Users },
    { id: 'interviews', label: 'Interviews', icon: CalendarClock },
    { id: 'verification', label: 'Verification', icon: UserCheck },
    { id: 'salaries', label: 'Salaries', icon: CircleDollarSign },
  ];

  const employeeMenu = [
    { id: 'overview', label: 'My Console', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks Board', icon: ClipboardList },
    { id: 'leaves', label: 'Leave Center', icon: CalendarClock },
    { id: 'payroll', label: 'Salary Ledger', icon: CircleDollarSign },
  ];

  const menuItems = isAdmin ? adminMenu : isHR ? hrMenu : employeeMenu;

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '6px',
            borderRadius: '8px',
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isAdmin ? (
              <ShieldAlert size={20} style={{ color: 'var(--color-primary)' }} />
            ) : isHR ? (
              <Users size={20} style={{ color: 'var(--color-accent)' }} />
            ) : (
              <UserCheck size={20} style={{ color: 'var(--color-accent)' }} />
            )}
          </div>
          <span className="sidebar-logo-text">EmpNexus</span>
        </div>
        
        {/* Mobile close button */}
        {sidebarOpen && (
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={{ overflow: 'hidden' }}>
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`} 
            alt={currentUser.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="user-details">
          <span className="user-name" title={currentUser.name}>{currentUser.name}</span>
          <span className="user-role">
            {isAdmin ? 'System Administrator' : isHR ? 'HR Manager' : currentUser.designation}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (setSidebarOpen) setSidebarOpen(false); // Close sidebar on mobile
              }}
            >
              <Icon className="nav-item-icon" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div 
          className="nav-item" 
          onClick={() => {
            logout();
            if (setSidebarOpen) setSidebarOpen(false); // Close sidebar on mobile
          }} 
          style={{ color: 'var(--color-danger)', border: 'none' }}
        >
          <LogOut className="nav-item-icon" />
          <span>Exit Portal</span>
        </div>
      </div>
    </aside>
  );
}
