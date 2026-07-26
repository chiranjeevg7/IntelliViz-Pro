import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});

  // Landing page has its own light navbar
  if (location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      {/* 📍 LEFT SECTION: Brand Icon & Title */}
      <div style={styles.leftSection}>
        <Link to="/" style={styles.brand}>
          ⚡ IntelliViz <span style={styles.accent}>Pro</span>
        </Link>
      </div>

      {/* 📍 MIDDLE SECTION: Navigation Links (Dashboard, Chart Studio, Reports) */}
      <div style={styles.middleSection}>
        {user && (
          <div style={styles.navLinks}>
            <Link
              to="/dashboard"
              style={{
                ...styles.link,
                ...(isActive('/dashboard') ? styles.activeLink : {}),
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/visualize"
              style={{
                ...styles.link,
                ...(isActive('/visualize') ? styles.activeLink : {}),
              }}
            >
              Chart Studio
            </Link>
            <Link
              to="/reports"
              style={{
                ...styles.link,
                ...(isActive('/reports') ? styles.activeLink : {}),
              }}
            >
              Reports
            </Link>
          </div>
        )}
      </div>

      {/* 📍 RIGHT SECTION: User Profile / Auth Actions */}
      <div style={styles.rightSection}>
        {user ? (
          <div style={styles.userBadgeGroup}>
            <Link
              to="/settings"
              style={{
                ...styles.profileBtn,
                ...(isActive('/settings') || isActive('/profile') ? styles.activeProfileBtn : {}),
              }}
              title="Account Settings & Profile"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{user.name || 'User'}</span>
            </Link>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        ) : (
          <div style={styles.authLinks}>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.registerBtn}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    padding: '14px 36px',
    backgroundColor: '#0f172a',
    borderBottom: '1px solid #1e293b',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
    boxSizing: 'border-box',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 0%',
    justifyContent: 'flex-start',
  },
  middleSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 0%',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: '1 1 0%',
  },
  brand: {
    fontSize: '20px',
    fontWeight: '800',
    textDecoration: 'none',
    color: '#ffffff',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  accent: { color: '#3b82f6' },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  link: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '6px 14px',
    borderRadius: '6px',
    transition: 'all 0.2s ease-in-out',
  },
  activeLink: {
    color: '#ffffff',
    backgroundColor: '#1e293b',
    fontWeight: '600',
  },
  userBadgeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 14px',
    borderRadius: '8px',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #334155',
    transition: 'all 0.2s ease-in-out',
  },
  activeProfileBtn: {
    borderColor: '#3b82f6',
    backgroundColor: '#0284c7',
    color: '#ffffff',
  },
  logoutBtn: {
    padding: '7px 16px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  registerBtn: {
    padding: '8px 18px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default Navbar;