// frontend/src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '32px 24px',
        borderTop: '1px solid #1e293b',
        textAlign: 'center',
        fontSize: '14px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚡</span> IntelliViz Pro
        </div>
        <div>
          © {new Date().getFullYear()} IntelliViz Pro v2.0. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;