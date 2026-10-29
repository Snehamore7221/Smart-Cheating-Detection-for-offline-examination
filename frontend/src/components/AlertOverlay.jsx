import React, { useEffect, useState } from 'react';
import { AlertTriangle, Smartphone, Users, Activity, X, User } from 'lucide-react';

const AlertOverlay = ({ alert, onClose, durationMs = 6000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!alert) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        if (onClose) onClose(alert._id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [alert, durationMs, onClose]);

  if (!alert) return null;

  const getActivityIcon = (type) => {
    if (type.includes('Phone')) return <Smartphone size={22} color="#ef4444" />;
    if (type.includes('Interaction')) return <Users size={22} color="#f59e0b" />;
    return <Activity size={22} color="#ef4444" />;
  };

  return (
    <div className="slide-down" style={styles.overlayContainer}>
      <div style={styles.cardHeader}>
        <div style={styles.headerLeft}>
          <div className="alert-pulse" style={styles.iconWrapper}>
            <AlertTriangle size={20} color="#ffffff" />
          </div>
          <div>
            <h4 style={styles.title}>🚨 SUSPICIOUS ACTIVITY DETECTED</h4>
            <span style={styles.disclaimer}>Advisory Flag — Faculty Invigilator Decision Required</span>
          </div>
        </div>
        <button onClick={() => onClose(alert._id)} style={styles.closeBtn}>
          <X size={16} color="#94a3b8" />
        </button>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.detailRow}>
          {getActivityIcon(alert.activityType)}
          <div style={{ flex: 1 }}>
            <div style={styles.activityType}>{alert.activityType}</div>
            
            <div style={styles.studentBadge}>
              <User size={13} color="#6366f1" />
              <span>Target: <strong>Student @ Bench {alert.benchId}</strong></span>
            </div>

            <div style={styles.metaRow}>
              <span>Bench: <strong>{alert.benchId}</strong></span>
              <span>•</span>
              <span>CCTV Time: <strong>{alert.timestamp}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>
    </div>
  );
};

const styles = {
  overlayContainer: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 50,
    width: '380px',
    background: 'rgba(15, 23, 42, 0.94)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(239, 68, 68, 0.6)',
    borderRadius: '14px',
    boxShadow: '0 12px 36px rgba(239, 68, 68, 0.3)',
    overflow: 'hidden',
    pointerEvents: 'auto',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.18)',
    borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '0.03em',
    margin: 0,
  },
  disclaimer: {
    fontSize: '0.65rem',
    color: '#fca5a5',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  cardBody: {
    padding: '14px 16px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  activityType: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '4px',
  },
  studentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
    fontSize: '0.8rem',
    padding: '3px 8px',
    borderRadius: '6px',
    marginBottom: '6px',
  },
  metaRow: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.78rem',
    color: '#94a3b8',
  },
  progressTrack: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    background: '#ef4444',
    transition: 'width 0.05s linear',
  },
};

export default AlertOverlay;
