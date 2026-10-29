import React, { useState } from 'react';
import { Upload, X, Film, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../services/api';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg('');
    const allowedExtensions = ['mp4', 'avi', 'mov'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setErrorMsg(`Invalid file type (.${ext}). Only MP4, AVI, and MOV files are allowed.`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a CCTV video file.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('cctvVideo', file);

      const res = await API.post('/videos/upload', formData);

      if (res.data.success) {
        onUploadSuccess(res.data.video);
        onClose();
      }
    } catch (err) {
      console.error('Upload Error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Failed to upload CCTV video file.';
      setErrorMsg(serverMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={styles.backdrop}>
      <div className="glass-card slide-down" style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Upload Examination Hall CCTV Footage</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#94a3b8" />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} style={styles.form}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              ...styles.dropZone,
              borderColor: dragActive ? '#6366f1' : 'var(--border-glass)',
              background: dragActive ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <Upload size={36} color="#818cf8" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
              Drag & Drop CCTV Video File
            </p>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Supports MP4, AVI, MOV (Max 500 MB)
            </span>

            <input
              type="file"
              id="cctvVideoInput"
              accept=".mp4,.avi,.mov"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="cctvVideoInput" className="btn-secondary" style={{ marginTop: '14px', cursor: 'pointer' }}>
              Browse File
            </label>
          </div>

          {file && (
            <div style={styles.filePreview}>
              <CheckCircle size={16} color="#10b981" />
              <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '500' }}>
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          )}

          {errorMsg && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!file || isUploading} className="btn-primary">
              {isUploading ? 'Uploading Video...' : 'Upload Video'}
            </button>
          </div>
        </form>
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
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '520px',
    padding: '24px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  dropZone: {
    border: '2px dashed var(--border-glass)',
    borderRadius: '14px',
    padding: '30px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  filePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(16, 185, 129, 0.15)',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
  },
};

export default UploadModal;
