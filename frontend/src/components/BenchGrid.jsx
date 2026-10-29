import React from 'react';
import { Grid, AlertCircle, User } from 'lucide-react';

const BenchGrid = ({ activeBenches = {}, onSelectBench, selectedBenchFilter }) => {
  // Generate 12 Student Benches (B01 - B12)
  const benches = Array.from({ length: 12 }, (_, i) => {
    const id = `B${String(i + 1).padStart(2, '0')}`;
    return {
      id,
      name: `Student @ Bench ${id}`,
      hasAlert: activeBenches[id] || false,
    };
  });

  return (
    <div className="glass-card" style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Grid size={18} color="#6366f1" />
          <h3 style={styles.title}>EXAM HALL STUDENT BENCH MATRIX</h3>
        </div>
        <span style={styles.subtext}>Interactive Student Seats (B01 - B12)</span>
      </div>

      <div style={styles.gridContainer}>
        {benches.map((bench) => {
          const isSelected = selectedBenchFilter === bench.id;
          const isFlagged = bench.hasAlert;

          return (
            <div
              key={bench.id}
              onClick={() => onSelectBench(isSelected ? null : bench.id)}
              style={{
                ...styles.benchCard,
                ...(isFlagged ? styles.flaggedCard : {}),
                ...(isSelected ? styles.selectedCard : {}),
              }}
            >
              <div style={styles.benchHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={13} color={isFlagged ? '#ef4444' : isSelected ? '#818cf8' : '#94a3b8'} />
                  <span style={styles.benchId}>{bench.id}</span>
                </div>
                {isFlagged && <AlertCircle size={14} color="#ef4444" className="alert-pulse" />}
              </div>
              <div style={styles.benchLabel}>Student @ {bench.id}</div>
              <div style={{ ...styles.benchStatus, color: isFlagged ? '#fca5a5' : '#64748b' }}>
                {isFlagged ? 'ALERT FLAGGED' : 'CLEAR'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '10px',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  subtext: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  benchCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-glass)',
    borderRadius: '10px',
    padding: '10px 8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  flaggedCard: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)',
  },
  selectedCard: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.2)',
  },
  benchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },
  benchId: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  benchLabel: {
    fontSize: '0.68rem',
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: '2px',
  },
  benchStatus: {
    fontSize: '0.62rem',
    fontWeight: '700',
  },
};

export default BenchGrid;
