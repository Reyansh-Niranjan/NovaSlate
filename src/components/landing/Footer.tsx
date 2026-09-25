import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-foot t-t-3xs rte">
      <div className="u-container">
        <nav className="s__nav">
          <ul className="s__pages">
            <li className="s__page">
              <a href="#curriculum" className="s__link">Digital Library (Class 1–12)</a>
            </li>
            <li className="s__page">
              <a href="#features" className="s__link">Technical Pipeline</a>
            </li>
            <li className="s__page">
              <a href="#pricing" className="s__link">Atlas ESP32 Hardware</a>
            </li>
            <li className="s__page">
              <a href="#privacy" className="s__link">Privacy Policy</a>
            </li>
            <li className="s__page">
              <a href="#terms" className="s__link">Terms of Service</a>
            </li>
            <li className="s__page">
              <a
                href="https://github.com/Reyansh-Niranjan/NovaSlate"
                target="_blank"
                rel="noopener noreferrer"
                className="s__link underline"
              >
                GitHub Repository
              </a>
            </li>
          </ul>
        </nav>
        <div className="s__contact">
          <a
            href="https://github.com/Reyansh-Niranjan/NovaSlate"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Engineered by Reyansh Niranjan
          </a>
        </div>
        <ul className="s__socials">
          <li className="s__social">
            <span className="text-[var(--color-gray)]">
              © {new Date().getFullYear()} NovaSlate. Open-access curriculum infrastructure & offline hardware for Indian K-12 education.
            </span>
          </li>
        </ul>
      </div>
    </footer>
  );
};

