import React from 'react';
import { ShieldAlert, CheckCircle, XCircle, Image, Clock, Filter, User } from 'lucide-react';

const IncidentList = ({ incidents = [], onUpdateStatus, onViewEvidence, selectedBenchFilter, onClearFilter }) => {
  return (
    <div className="glass-card" style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="#ef4444" />
          <h3 style={styles.title}>INCIDENT HISTORY & ADVISORY LOGS</h3>
          <span className="badge badge-warning">{incidents.length} LOGS</span>
        </div>

        {selectedBenchFilter && (
          <button onClick={onClearFilter} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            <Filter size={12} /> Clear Filter ({selectedBenchFilter})
          </button>
        )}
      </div>

      <div style={styles.tableWrapper}>
        {incidents.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No suspicious activities logged for the current CCTV video stream.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student Bench Target</th>
                <th style={styles.th}>Activity</th>
                <th style={styles.th}>CCTV Time</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Evidence</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} color="#6366f1" />
                      <strong style={{ color: '#ffffff' }}>Student @ Bench {incident.benchId}</strong>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600', color: incident.activityType.includes('Phone') ? '#fca5a5' : '#fcd34d' }}>
                      {incident.activityType}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                      <Clock size={12} /> {incident.timestamp}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span className={`badge ${incident.status === 'NEW' ? 'badge-danger' : incident.status === 'REVIEWED' ? 'badge-success' : 'badge-warning'}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {incident.evidencePath ? (
                      <button
                        onClick={() => onViewEvidence(incident.evidencePath)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Image size={13} color="#6366f1" /> Frame Snapshot
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>N/A</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => onUpdateStatus(incident._id, 'REVIEWED')}
                        title="Mark Reviewed"
                        style={{ ...styles.actionBtn, background: 'rgba(16, 185, 129, 0.2)' }}
                      >
                        <CheckCircle size={14} color="#10b981" />
                      </button>
                      <button
                        onClick={() => onUpdateStatus(incident._id, 'DISMISSED')}
                        title="Dismiss False Positive"
                        style={{ ...styles.actionBtn, background: 'rgba(239, 68, 68, 0.2)' }}
                      >
                        <XCircle size={14} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '10px',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  tableWrapper: {
    maxHeight: '320px',
    overflowY: 'auto',
  },
  emptyState: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.85rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    color: '#94a3b8',
    borderBottom: '1px solid var(--border-glass)',
    fontWeight: '600',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  td: {
    padding: '10px 12px',
    verticalAlign: 'middle',
  },
  actionBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default IncidentList;
