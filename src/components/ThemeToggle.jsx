import React, { useEffect, useState } from 'react';
import './ThemeToggle.css';

const getSavedTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('cam-theme') === 'dark' ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('cam-theme', theme);
};

const ThemeToggle = ({ className = '' }) => {
  const [theme, setTheme] = useState(getSavedTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'theme-toggle-dark' : 'theme-toggle-light'} ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-orbit" aria-hidden="true">
        <span className="theme-toggle-icon theme-toggle-sun">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <span className="theme-toggle-icon theme-toggle-moon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20.5 14.4A7.4 7.4 0 0 1 9.6 3.5 8.7 8.7 0 1 0 20.5 14.4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
