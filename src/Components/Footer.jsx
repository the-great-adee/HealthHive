import React from 'react';

const Footer = () => {
  return (
    <div style={{
      backgroundColor: '#f0f4f8',
      padding: '20px',
      marginTop: 'auto',
      borderTop: '1px solid #e0e0e0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ minWidth: '250px' }}>
          <a href='/' style={{ color: '#2b6cb0', margin: '0 0 10px 0' }}>
            HealthHive
          </a>
          <p style={{ color: '#4a5568', margin: 0 }}>
            Your Trusted Online Pharmacy
          </p>
        </div>


        <div style={{ display: 'flex', gap: '30px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <a href="/" style={{ color: '#4a5568', textDecoration: 'none' }}>About Us</a>
              <a href="/" style={{ color: '#4a5568', textDecoration: 'none' }}>Contact</a>
              <a href="/" style={{ color: '#4a5568', textDecoration: 'none' }}>Blog</a>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <a href="/" style={{ color: '#4a5568', textDecoration: 'none' }}>Privacy</a>
              <a href="/" style={{ color: '#4a5568', textDecoration: 'none' }}>Terms</a>
              <a href="/" style={{ color: '#4a5568', textDecoration: 'none' }}>Security</a>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #e0e0e0',
        color: '#718096'
      }}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} HealthHive. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;