import React, { useEffect, useRef, useState } from 'react';
import './NotificationBell.css';

const toneClass = (tone = 'info') => `nb-dot nb-dot-${tone}`;
const DISMISSED_STORAGE_KEY = 'cam-dismissed-notifications';

const readDismissedIds = () => {
  try {
    const stored = localStorage.getItem(DISMISSED_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const NotificationBell = ({ items = [], className = '' }) => {
  const [open, setOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(readDismissedIds);
  const wrapperRef = useRef(null);
  const visibleItems = items.filter((item) => !dismissedIds.includes(String(item.id)));
  const unreadCount = visibleItems.filter((item) => item.unread !== false).length;

  const saveDismissedIds = (nextIds) => {
    const uniqueIds = Array.from(new Set(nextIds.map(String)));
    setDismissedIds(uniqueIds);
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(uniqueIds));
  };

  const handleDismiss = (event, itemId) => {
    event.stopPropagation();
    saveDismissedIds([...dismissedIds, String(itemId)]);
  };

  const handleClearAll = () => {
    saveDismissedIds([...dismissedIds, ...visibleItems.map((item) => item.id)]);
  };

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
              <p>{visibleItems.length ? `${visibleItems.length} update${visibleItems.length === 1 ? '' : 's'} available` : 'No updates right now'}</p>
            </div>
            {visibleItems.length > 0 && (
              <button type="button" className="notification-clear-btn" onClick={handleClearAll}>
                Clear all
              </button>
            )}
          </div>

          <div className="notification-list">
            {visibleItems.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span>Everything is clear.</span>
              </div>
            ) : (
              visibleItems.map((item) => (
                <div className="notification-item" key={item.id}>
                  <span className={toneClass(item.tone)} />
                  <div className="notification-item-content">
                    <div className="notification-item-top">
                      <h4>{item.title}</h4>
                      {item.time && <span>{item.time}</span>}
                    </div>
                    <p>{item.message}</p>
                  </div>
                  <button
                    type="button"
                    className="notification-delete-btn"
                    onClick={(event) => handleDismiss(event, item.id)}
                    aria-label={`Dismiss notification: ${item.title}`}
                    title="Delete notification"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v5" />
                      <path d="M14 11v5" />
                    </svg>
                  </button>
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
