const fs = require('fs');
let code = fs.readFileSync('Frontend/src/pages/Profile.jsx', 'utf8');

// Import CSS
code = code.replace(/import PaymentMethodsTab from '\.\.\/components\/PaymentMethodsTab'/, "import PaymentMethodsTab from '../components/PaymentMethodsTab'\nimport './Profile.css'");

// Remove const C
code = code.replace(/const C = \{[\s\S]*?\n\}\n/, '');

// Remove inputStyle
code = code.replace(/const inputStyle = \{[\s\S]*?\}\n/, '');

// Replace styles with classes
code = code.replace(/<div className="page-profile" style=\{\{ background: C\.bg, minHeight: '100vh' \}\}>/, '<div className="page-profile profile-page">');
code = code.replace(/<main style=\{\{ maxWidth: 1400, margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' \}\}>/, '<main className="profile-main">');
code = code.replace(/<aside style=\{\{ background: C\.white, borderRadius: 12, boxShadow: C\.shadow, overflow: 'hidden' \}\}>/, '<aside className="profile-sidebar">');
code = code.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: `1px solid \$\{C\.border\}` \}\}>/, '<div className="profile-sidebar-header">');
code = code.replace(/<div style=\{\{\s+width: 60, height: 60, borderRadius: '50%',\s+background: C\.red, color: 'white',\s+display: 'flex', alignItems: 'center', justifyContent: 'center',\s+fontWeight: 800, fontSize: 22, flexShrink: 0,\s+boxShadow: '0 4px 12px rgba\(255,75,62,0\.3\)',\s+\}\}>/g, '<div className="profile-avatar">');
code = code.replace(/<nav style=\{\{ padding: '12px 8px' \}\}>/, '<nav className="profile-nav">');

code = code.replace(/style=\{\{\s+display: 'block', width: '100%', textAlign: 'left',\s+padding: '11px 16px',\s+background: activeTab === item\.key \? '#fff5f4' : 'none',\s+border: 'none',\s+borderLeft: activeTab === item\.key \? `4px solid \$\{C\.red\}` : '4px solid transparent',\s+borderRadius: 8, marginBottom: 4,\s+fontSize: 14, fontWeight: 600,\s+color: item\.danger \? C\.red : activeTab === item\.key \? C\.red : C\.text,\s+cursor: 'pointer', fontFamily: 'inherit',\s+transition: 'background 0\.15s, color 0\.15s',\s+\}\}/g, 'className="profile-nav-btn" style={{ background: activeTab === item.key ? "#fff5f4" : "none", borderLeft: activeTab === item.key ? "4px solid #FF4B3E" : "4px solid transparent", color: item.danger ? "#FF4B3E" : activeTab === item.key ? "#FF4B3E" : "#2c2c2c" }}');

code = code.replace(/<div style=\{\{ padding: '8px 16px 20px' \}\}>/, '<div className="profile-logout-wrap">');
code = code.replace(/style=\{\{\s+width: '100%', padding: '10px', border: `1\.5px solid \$\{C\.border\}`,\s+borderRadius: 8, background: 'white',\s+color: C\.muted, fontSize: 13, fontWeight: 600,\s+cursor: 'pointer', fontFamily: 'inherit',\s+display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,\s+\}\}/g, 'className="profile-logout-btn"');

code = code.replace(/<section style=\{\{ background: C\.white, borderRadius: 12, boxShadow: C\.shadow, padding: '2\.5rem' \}\}>/, '<section className="profile-content">');

code = code.replace(/style=\{inputStyle\}/g, 'className="profile-input"');

code = code.replace(/style=\{\{\s+padding: '10px 24px', border: `1\.5px solid \$\{C\.green\}`,\s+background: 'white', color: C\.green,\s+borderRadius: 8, fontWeight: 700, fontSize: 14,\s+cursor: loading \? 'not-allowed' : 'pointer',\s+fontFamily: 'Nunito, sans-serif',\s+display: 'flex', alignItems: 'center', gap: 8,\s+transition: 'all 0\.2s', opacity: loading \? 0\.7 : 1,\s+\}\}/g, 'className="profile-btn-save"');

code = code.replace(/style=\{\{\s+padding: '10px 20px', border: `1\.5px solid rgba\(255,75,62,0\.4\)`,\s+background: 'white', color: C\.red,\s+borderRadius: 8, fontWeight: 700, fontSize: 14,\s+cursor: 'pointer', fontFamily: 'Nunito, sans-serif',\s+display: 'flex', alignItems: 'center', gap: 8,\s+transition: 'all 0\.2s',\s+\}\}/g, 'className="profile-btn-delete"');

code = code.replace(/style=\{\{ position: 'fixed', inset: 0, background: 'rgba\(0,0,0,0\.55\)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 \}\}/g, 'className="profile-modal-overlay"');
code = code.replace(/style=\{\{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba\(0,0,0,0\.2\)' \}\}/g, 'className="profile-modal"');

fs.writeFileSync('Frontend/src/pages/Profile.jsx', code);
