// frontend/src/components/SplashScreen.jsx
import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation after 1.8 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    // Completely unmount splash screen after 2.2 seconds
    const removeTimer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        transition: 'opacity 0.4s ease-in-out, visibility 0.4s ease-in-out',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          animation: 'pulseGlow 1.5s infinite alternate ease-in-out',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            backgroundColor: '#2563eb',
            color: '#fff',
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.6)',
          }}
        >
          ⚡
        </div>
        <div style={{ fontSize: '38px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>
          IntelliViz <span style={{ color: '#3b82f6' }}>Pro</span>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounce 1s infinite 0s' }}></div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounce 1s infinite 0.2s' }}></div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounce 1s infinite 0.4s' }}></div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(0.98); opacity: 0.85; }
          100% { transform: scale(1.03); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;