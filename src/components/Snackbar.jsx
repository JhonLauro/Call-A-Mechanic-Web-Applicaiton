import React, { useEffect } from 'react';
import './Snackbar.css';

const Snackbar = ({ open, message, type = 'success', onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!open || !message) return undefined;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, message, duration, onClose]);

  if (!open || !message) return null;

  return (
    <div className={`snackbar snackbar-${type}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" className="snackbar-close" onClick={onClose} aria-label="Close notification">
        x
      </button>
    </div>
  );
};

export default Snackbar;
