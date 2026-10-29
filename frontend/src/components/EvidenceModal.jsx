import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const EvidenceModal = ({ evidencePath, onClose }) => {
  if (!evidencePath) return null;

  return (
    <div style={styles.backdrop}>
      <div className="glass-card slide-down" style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff' }}>Evidence Frame Snapshot</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#94a3b8" />
          </button>
        </div>

        <div style={styles.imageContainer}>
          <img
            src={evidencePath}
            alt="Evidence Frame Snapshot"
            style={styles.image}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{ display: 'none', padding: '30px', textAlign: 'center', color: '#64748b' }}>
            Evidence frame image unavailable or processing.
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} className="btn-secondary">Close Snapshot</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '680px',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  imageContainer: {
    width: '100%',
    maxHeight: '420px',
    background: '#000000',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
};

export default EvidenceModal;
