import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="footer-text">
            © {currentYear} K-BioX. All rights reserved.
          </p>
        </div>
        <div className="footer-section">
          <p className="footer-text">
            Made with 🌨️ for a better future
          </p>
        </div>
        <div className="footer-section">
          <p className="footer-text">
            Powered by <strong>Google Gemini AI</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

