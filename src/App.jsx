import React, { useState, useEffect } from 'react';
import { AppStateProvider, useAppState } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import HRDashboard from './components/HRDashboard';
import { Menu } from 'lucide-react';

function MainApp() {
  const { currentUser } = useAppState();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reset navigation to overview whenever user logins or logouts
  useEffect(() => {
    setActiveTab('overview');
    setSidebarOpen(false);
  }, [currentUser]);

  if (!currentUser) {
    return <Login />;
  }

  const isAdmin = currentUser.role === 'admin';
  const isHR = currentUser.role === 'hr';

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      <div className="main-layout">
        <header className="mobile-header">
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="mobile-logo-text">EmpNexus</span>
          <div style={{ width: 24 }}></div> {/* Balance spacer */}
        </header>
        <main className="main-content">
          {isAdmin ? (
            <AdminDashboard activeTab={activeTab} />
          ) : isHR ? (
            <HRDashboard activeTab={activeTab} />
          ) : (
            <EmployeeDashboard activeTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <MainApp />
    </AppStateProvider>
  );
}
