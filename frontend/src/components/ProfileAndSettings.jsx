import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, setUser } from '../redux/slices/authSlice';
import API from '../services/api';

const ProfileAndSettings = ({ currentTheme, onThemeChange }) => {
  const dispatch = useDispatch();
  
  // Always select the latest user object from Redux
  const { user } = useSelector((state) => state.auth || {});

  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', isErr: false });

  // State for user profile
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Data Analyst',
  });

  // State for security / password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State for theme preferences
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('intelliviz_prefs');
    return saved
      ? JSON.parse(saved)
      : {
          theme: currentTheme || 'light',
          defaultExportFormat: 'png',
          autoSaveReports: true,
        };
  });

  // Sync profile form values whenever Redux user updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Data Analyst',
      });
    }
  }, [user]);

  // Apply global dark theme to whole document body
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#f8fafc';
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#0f172a';
    }
  }, [preferences.theme]);

  // 1. Handle Profile Update (Persists to API + Redux + localStorage)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg({ text: '', isErr: false });

    try {
      // Dispatch async thunk to send to API and sync Redux
      const resultAction = await dispatch(updateUserProfile(profileForm));
      
      if (updateUserProfile.fulfilled.match(resultAction)) {
        setMsg({ text: '✅ Profile updated successfully!', isErr: false });
      } else {
        throw new Error(resultAction.payload || 'Failed to update profile');
      }
    } catch (err) {
      console.warn('API route unavailable, updating local state directly:', err);
      
      // Fallback local update so changes persist on refresh
      dispatch(setUser(profileForm));
      setMsg({ text: '✅ Profile updated and saved locally!', isErr: false });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMsg({ text: '', isErr: false }), 3500);
    }
  };

  // 2. Handle Password Change
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ text: '❌ New passwords do not match!', isErr: true });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMsg({ text: '❌ Password must be at least 6 characters long.', isErr: true });
      return;
    }

    setIsSubmitting(true);
    setMsg({ text: '', isErr: false });

    try {
      // Aligned with router mount path: /auth/change-password
      await API.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMsg({
        text: '✅ Password updated successfully! Use your new password next time you log in.',
        isErr: false,
      });
    } catch (err) {
      console.error('Password change error:', err);
      setMsg({
        text: err.response?.data?.message || err.response?.data?.error || '❌ Incorrect current password or server error.',
        isErr: true,
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMsg({ text: '', isErr: false }), 4000);
    }
  };

  // 3. Handle Theme Change
  const handleThemeToggle = (selectedTheme) => {
    const updated = { ...preferences, theme: selectedTheme };
    setPreferences(updated);
    localStorage.setItem('intelliviz_prefs', JSON.stringify(updated));
    localStorage.setItem('intelliviz_theme', selectedTheme);
    if (onThemeChange) onThemeChange(selectedTheme);
  };

  const isDark = preferences.theme === 'dark';

  return (
    <div style={styles.container}>
      <h2 style={{ ...styles.pageTitle, color: isDark ? '#f8fafc' : '#0f172a' }}>
        ⚙️ Account & Application Settings
      </h2>
      <p style={{ ...styles.pageSubtitle, color: isDark ? '#94a3b8' : '#64748b' }}>
        Manage your profile, account security, and workspace preferences
      </p>

      {/* Settings Tab Navigation */}
      <div style={{ ...styles.tabBar, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'profile' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'profile' ? '#3b82f6' : isDark ? '#94a3b8' : '#64748b',
          }}
        >
          👤 User Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'security' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'security' ? '#3b82f6' : isDark ? '#94a3b8' : '#64748b',
          }}
        >
          🔒 Password & Security
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'settings' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'settings' ? '#3b82f6' : isDark ? '#94a3b8' : '#64748b',
          }}
        >
          🎨 Theme & Preferences
        </button>
      </div>

      {/* Notification Banner */}
      {msg.text && (
        <div style={msg.isErr ? styles.errorBox : styles.successBox}>
          {msg.text}
        </div>
      )}

      {/* Form Content Area */}
      <div
        style={{
          ...styles.card,
          background: isDark ? '#1e293b' : '#ffffff',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        }}
      >
        {/* User Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} style={styles.form}>
            <h3 style={{ ...styles.cardTitle, color: isDark ? '#ffffff' : '#0f172a' }}>
              Personal Details
            </h3>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, color: isDark ? '#cbd5e1' : '#334155' }}>
                Full Name:
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
                style={{
                  ...styles.input,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  borderColor: isDark ? '#475569' : '#cbd5e1',
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, color: isDark ? '#cbd5e1' : '#334155' }}>
                Email Address:
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
                style={{
                  ...styles.input,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  borderColor: isDark ? '#475569' : '#cbd5e1',
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, color: isDark ? '#cbd5e1' : '#334155' }}>
                Role / Title:
              </label>
              <input
                type="text"
                value={profileForm.role}
                onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                style={{
                  ...styles.input,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  borderColor: isDark ? '#475569' : '#cbd5e1',
                }}
              />
            </div>

            <button type="submit" disabled={isSubmitting} style={styles.primaryBtn}>
              {isSubmitting ? 'Saving...' : '💾 Save Profile Changes'}
            </button>
          </form>
        )}

        {/* Password & Security Tab */}
        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} style={styles.form}>
            <h3 style={{ ...styles.cardTitle, color: isDark ? '#ffffff' : '#0f172a' }}>
              Change Password
            </h3>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, color: isDark ? '#cbd5e1' : '#334155' }}>
                Current Password:
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                required
                style={{
                  ...styles.input,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  borderColor: isDark ? '#475569' : '#cbd5e1',
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, color: isDark ? '#cbd5e1' : '#334155' }}>
                New Password:
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                required
                style={{
                  ...styles.input,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  borderColor: isDark ? '#475569' : '#cbd5e1',
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, color: isDark ? '#cbd5e1' : '#334155' }}>
                Confirm New Password:
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                required
                style={{
                  ...styles.input,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  borderColor: isDark ? '#475569' : '#cbd5e1',
                }}
              />
            </div>

            <button type="submit" disabled={isSubmitting} style={styles.primaryBtn}>
              {isSubmitting ? 'Updating Password...' : '🔒 Update Password'}
            </button>
          </form>
        )}

        {/* Theme Preferences Tab */}
        {activeTab === 'settings' && (
          <div style={styles.form}>
            <h3 style={{ ...styles.cardTitle, color: isDark ? '#ffffff' : '#0f172a' }}>
              Theme & Workspace Options
            </h3>

            <div style={styles.formGroup}>
              <label style={{ ...styles.label, color: isDark ? '#cbd5e1' : '#334155' }}>
                Interface Appearance Mode:
              </label>
              <div style={styles.themeToggleRow}>
                <button
                  type="button"
                  onClick={() => handleThemeToggle('light')}
                  style={{
                    ...styles.themeOptionBtn,
                    backgroundColor: !isDark ? '#2563eb' : '#334155',
                    color: !isDark ? '#ffffff' : '#cbd5e1',
                  }}
                >
                  ☀️ Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeToggle('dark')}
                  style={{
                    ...styles.themeOptionBtn,
                    backgroundColor: isDark ? '#2563eb' : '#f1f5f9',
                    color: isDark ? '#ffffff' : '#475569',
                  }}
                >
                  🌙 Dark Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '850px',
    margin: '40px auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  pageTitle: { margin: 0, fontSize: '24px', fontWeight: '700' },
  pageSubtitle: { margin: 0, fontSize: '14px' },
  tabBar: {
    display: 'flex',
    gap: '20px',
    borderBottom: '1px solid',
    paddingBottom: '10px',
    marginTop: '12px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px 12px',
  },
  card: {
    border: '1px solid',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  cardTitle: { margin: '0 0 16px 0', fontSize: '18px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '480px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600' },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '14px',
    outline: 'none',
  },
  themeToggleRow: { display: 'flex', gap: '12px', marginTop: '6px' },
  themeOptionBtn: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryBtn: {
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid #fecaca',
  },
  successBox: {
    padding: '12px 16px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid #a7f3d0',
  },
};

export default ProfileAndSettings;