import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ compact = false }) => (
  <div className={compact ? 'cam-loader cam-loader-compact' : 'cam-loader'}>
    <div className="cam-loader-mark" aria-hidden="true">
      <span className="cam-loader-ring" />
      <span className="cam-loader-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </span>
    </div>
    <div className="cam-loader-bars" aria-label="Loading">
      <span />
      <span />
      <span />
    </div>
  </div>
);

export default LoadingScreen;
