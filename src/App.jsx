import React, { useState, useEffect } from 'react';
import { AppStateProvider, useAppState } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import HRDashboard from './components/HRDashboard';

function MainApp() {
  const { currentUser } = useAppState();
  const [activeTab, setActiveTab] = useState('overview');

  // Reset navigation to overview whenever user logins or logouts
  useEffect(() => {
    setActiveTab('overview');
  }, [currentUser]);

  if (!currentUser) {
    return <Login />;
  }

  const isAdmin = currentUser.role === 'admin';
  const isHR = currentUser.role === 'hr';

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
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
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <MainApp />
    </AppStateProvider>
  );
}
