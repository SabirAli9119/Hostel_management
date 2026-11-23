import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import useAuth from '../hooks/useAuth.js';
import { adminNav, userNav } from './navigation.js';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app">
      <Sidebar
        nav={user.role === 'admin' ? adminNav : userNav}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={() => setConfirmLogout(true)}
        user={user}
      />
      <div className="main">
        <Navbar user={user} onMenu={() => setMenuOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message="You will need to sign in again to see your dashboard."
        confirmLabel="Log out"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
