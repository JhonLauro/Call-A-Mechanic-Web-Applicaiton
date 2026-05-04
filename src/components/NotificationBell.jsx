import React, { useEffect, useRef, useState } from 'react';
import './NotificationBell.css';

const toneClass = (tone = 'info') => `nb-dot nb-dot-${tone}`;

const NotificationBell = ({ items = [], className = '' }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const unreadCount = items.filter((item) => item.unread !== false).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`notification-bell ${className}`} ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="notification-bell-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-menu">
          <div className="notification-menu-header">
            <div>
              <h3>Notifications</h3>
              <p>{items.length ? `${items.length} update${items.length === 1 ? '' : 's'} available` : 'No updates right now'}</p>
            </div>
          </div>

          <div className="notification-list">
            {items.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span>Everything is clear.</span>
              </div>
            ) : (
              items.map((item) => (
                <div className="notification-item" key={item.id}>
                  <span className={toneClass(item.tone)} />
                  <div className="notification-item-content">
                    <div className="notification-item-top">
                      <h4>{item.title}</h4>
                      {item.time && <span>{item.time}</span>}
                    </div>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
