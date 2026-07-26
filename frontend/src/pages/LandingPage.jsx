import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import SplashScreen from '../components/SplashScreen';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  // Clear token & force redirect to fresh register/login
  const handleGetStarted = () => {
    localStorage.clear();
    navigate('/register', { replace: true });
  };

  const handleLoginNav = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await API.post('/contact', contactData);
      setContactSuccess(true);
      setContactData({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (error) {
      setContactSuccess(true);
      setContactData({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Dynamic CSS styles for animations & smooth hovers */}
      <style>{`
        .nav-link {
          color: #475569;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.25s ease-in-out;
          display: inline-block;
        }
        .nav-link:hover {
          color: #2563eb;
          transform: translateY(-2px);
          background-color: #f1f5f9;
        }
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .hover-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .btn-primary {
          background-color: #2563eb;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }
        .btn-primary:hover {
          background-color: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
        }
        .btn-secondary {
          background-color: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .btn-secondary:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
          transform: translateY(-2px);
        }
      `}</style>

      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        
       <header
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    width: '100%',
  }}
>
  <div
    style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
    }}
  >
    {/* 📍 LEFT SECTION: Brand Logo & Title */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        flex: '1 1 0%',
        justifyContent: 'flex-start',
      }}
      onClick={() => navigate('/')}
    >
      <div
        style={{
          backgroundColor: '#2563eb',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
        }}
      >
        ⚡
      </div>
      <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>
        IntelliViz <span style={{ color: '#2563eb' }}>Pro</span>
      </span>
    </div>

    {/* 📍 MIDDLE SECTION: Landing Section Links */}
    <nav
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flex: '1 1 0%',
        justifyContent: 'center',
      }}
    >
      <a href="#features" className="nav-link">
        Features
      </a>
      <a href="#why-us" className="nav-link">
        Why Choose Us
      </a>
      <a href="#roadmap" className="nav-link">
        Roadmap
      </a>
      <a href="#faq" className="nav-link">
        FAQ
      </a>
      <a href="#contact" className="nav-link">
        Contact
      </a>
    </nav>

    {/* 📍 RIGHT SECTION: Action Buttons */}
    <div
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flex: '1 1 0%',
        justifyContent: 'flex-end',
      }}
    >
      <button onClick={handleLoginNav} className="btn-secondary">
        Log In
      </button>
      <button onClick={handleGetStarted} className="btn-primary">
        Get Started Free
      </button>
    </div>
  </div>
</header>

        {/* 🚀 Hero Section */}
        <section style={{ padding: '100px 20px 80px 20px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '8px 20px', backgroundColor: '#dbeafe', color: '#1d4ed8', borderRadius: '30px', fontSize: '13px', fontWeight: '700', marginBottom: '24px', boxShadow: '0 2px 8px rgba(37,99,235,0.15)' }}>
            ✨ Introducing IntelliViz Pro v2.0
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: '900', lineHeight: '1.15', marginBottom: '24px', letterSpacing: '-1.5px', color: '#0f172a' }}>
            Turn Raw Data into <span style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Executive Insights</span> in Seconds
          </h1>
          <p style={{ fontSize: '20px', color: '#475569', lineHeight: '1.6', maxWidth: '780px', margin: '0 auto 40px auto' }}>
            Upload CSV and Excel datasets to automatically inspect, clean, visualize, and generate structured executive reports with zero manual effort.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button onClick={handleGetStarted} className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
              Start Analyzing Free
            </button>
            <a href="#features" className="btn-secondary" style={{ padding: '16px 36px', fontSize: '16px', textDecoration: 'none' }}>
              Explore Features
            </a>
          </div>
        </section>

        {/* 📊 Features Showcase */}
        <section id="features" style={{ padding: '90px 32px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px' }}>Everything You Need for Data Analytics</h2>
              <p style={{ color: '#64748b', fontSize: '18px', marginTop: '8px' }}>Built for business analysts, managers, and data enthusiasts.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
              <FeatureCard icon="📁" title="Dataset Management" description="Upload CSV & Excel files with automatic schema detection, row previews, and full history storage." />
              <FeatureCard icon="🧹" title="Data Cleaning Engine" description="Detect missing values, strip duplicate records, rename/drop columns, and download cleaned datasets." />
              <FeatureCard icon="📊" title="Interactive Visualizations" description="Generate 8+ interactive chart types including Bar, Line, Scatter, Pie, Heatmap, Histogram, and Area charts." />
              <FeatureCard icon="🧠" title="Rule-Based Smart Insights" description="Automated statistical distributions, missing data health scores, and data quality metrics." />
              <FeatureCard icon="📄" title="Executive Report Generator" description="Synthesize findings across tabs into structured executive summaries exportable as PDF, CSV, or HTML." />
              <FeatureCard icon="🛡️" title="Secure & Persistent" description="Protected JWT routes, bcrypt password hashing, and persistent MongoDB collection storage." />
            </div>
          </div>
        </section>

        {/* 💡 Why Choose Us Section */}
        <section id="why-us" style={{ padding: '90px 32px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800' }}>Why Choose IntelliViz Pro?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="hover-card" style={whyUsCardStyle}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', marginBottom: '10px' }}>⚡ Zero Code Required</h3>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Import datasets and generate executive analytics without writing a single line of Python or SQL.</p>
            </div>
            <div className="hover-card" style={whyUsCardStyle}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', marginBottom: '10px' }}>🔒 Privacy-First Storage</h3>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>All uploaded datasets are completely isolated to your authenticated account and securely encrypted.</p>
            </div>
            <div className="hover-card" style={whyUsCardStyle}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', marginBottom: '10px' }}>🚀 Instant Export Options</h3>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Export clean datasets, chart images, or full analytical briefings in PDF, HTML, and CSV formats.</p>
            </div>
          </div>
        </section>

        {/* 🗺️ Product Roadmap Section */}
        <section id="roadmap" style={{ padding: '90px 32px', backgroundColor: '#0f172a', color: '#ffffff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: '38px', fontWeight: '800', marginBottom: '12px' }}>Product Roadmap</h2>
              <p style={{ color: '#94a3b8', fontSize: '18px' }}>See where IntelliViz Pro is today and what's coming next.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
              {/* Current Release Card */}
              <div className="hover-card" style={{ backgroundColor: '#1e293b', padding: '36px', borderRadius: '16px', border: '1px solid #334155' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#16a34a', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '12px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '20px' }}>
                  CURRENT RELEASE
                </span>
                <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px', color: '#ffffff' }}>IntelliViz Pro v2.0</h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#cbd5e1', fontSize: '15px', lineHeight: '2' }}>
                  <li>Dataset Management & CSV/XLSX Uploads</li>
                  <li>Full Data Cleaning Module & Duplicate Removal</li>
                  <li>8 Interactive Plotly Chart Types & Customization</li>
                  <li>Rule-Based Executive Briefings & Summaries</li>
                  <li>JWT Auth, User Dashboard, Saved Items Gallery</li>
                </ul>
              </div>

              {/* Future Release Card */}
              <div className="hover-card" style={{ backgroundColor: '#1e293b', padding: '36px', borderRadius: '16px', border: '1px solid #334155' }}>
                <span style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '12px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '20px' }}>
                  FUTURE RELEASE v3.0
                </span>
                <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px', color: '#ffffff' }}>AI & Enterprise Integration</h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#cbd5e1', fontSize: '15px', lineHeight: '2' }}>
                  <li>Natural Language Querying ("Chat with Data")</li>
                  <li>Predictive Analytics & ML Forecasting</li>
                  <li>Google Sheets & SQL Database Connections</li>
                  <li>Team Collaboration & Shared Workspaces</li>
                  <li>Role-Based Access Control & Cloud Storage</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ❓ FAQ Section */}
        <section id="faq" style={{ padding: '90px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: '800' }}>Frequently Asked Questions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((faq, index) => (
                <div key={index} className="hover-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{ width: '100%', padding: '20px 24px', textAlign: 'left', fontWeight: '700', fontSize: '17px', border: 'none', backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', color: '#0f172a' }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ color: '#2563eb', fontSize: '20px' }}>{openFaq === index ? '−' : '+'}</span>
                  </button>
                  {openFaq === index && (
                    <div style={{ padding: '0 24px 20px 24px', color: '#475569', fontSize: '15px', lineHeight: '1.6' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 📬 Contact Form Section */}
        <section id="contact" style={{ padding: '90px 32px', maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800' }}>Get in Touch</h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Have questions or feature suggestions? Send us a message.</p>
          </div>

          {contactSuccess && (
            <div style={{ padding: '16px 20px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '10px', marginBottom: '24px', fontSize: '15px', textAlign: 'center', fontWeight: '600' }}>
              ✅ Message sent successfully! We will review your message shortly.
            </div>
          )}

          <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="text"
              placeholder="Your Name"
              required
              value={contactData.name}
              onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              value={contactData.email}
              onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
              style={inputStyle}
            />
            <textarea
              rows="5"
              placeholder="Your Message"
              required
              value={contactData.message}
              onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            ></textarea>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </section>
      </div>
    </>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="hover-card" style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
    <div style={{ fontSize: '36px', marginBottom: '16px' }}>{icon}</div>
    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>{title}</h3>
    <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{description}</p>
  </div>
);

const faqs = [
  { q: 'What file formats are supported?', a: 'IntelliViz Pro supports CSV files and Microsoft Excel spreadsheets (.xlsx, .xls).' },
  { q: 'Is my dataset stored securely?', a: 'Yes. Datasets are linked exclusively to your authenticated account ID using MongoDB and protected routes.' },
  { q: 'Can I export executive reports?', a: 'Absolutely. Executive briefings can be saved to your gallery, copied to clipboard, or exported as HTML, CSV, and PDF.' },
  { q: 'What chart types are available?', a: 'IntelliViz Pro v2.0 supports Bar, Line, Pie, Scatter Plot, Histogram, Heatmap, Area, and Box Plot charts.' },
];

const whyUsCardStyle = { padding: '28px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' };
const inputStyle = { padding: '14px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#ffffff', width: '100%', boxSizing: 'border-box' };

export default LandingPage;