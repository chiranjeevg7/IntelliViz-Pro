// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard initialTab="data" />} />
              <Route path="/visualize" element={<Dashboard initialTab="analytics" />} />
              <Route path="/reports" element={<Dashboard initialTab="reports" />} />
              <Route path="/saved-items" element={<Dashboard initialTab="saved" />} />
              <Route path="/settings" element={<Dashboard initialTab="settings" />} />
              <Route path="/profile" element={<Dashboard initialTab="settings" />} />
            </Route>

            {/* Default Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;