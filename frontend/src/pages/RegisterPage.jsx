import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, User, Mail, Lock, UserCheck, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    facultyId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        name: formData.name,
        facultyId: formData.facultyId,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Faculty enrollment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card slide-down" style={styles.card}>
        <div style={styles.brandHeader}>
          <div style={styles.iconCircle}>
            <ShieldAlert size={32} color="#6366f1" />
          </div>
          <h1 style={styles.title}>Faculty Enrollment</h1>
          <p style={styles.subtitle}>Register as an Authorized Examination Invigilator</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type="text"
                name="name"
                required
                placeholder="Dr. John Doe"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Faculty ID Number</label>
            <div style={styles.inputWrapper}>
              <UserCheck size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type="text"
                name="facultyId"
                required
                placeholder="FAC-2026-08"
                value={formData.facultyId}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Official Faculty Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                required
                placeholder="faculty@exam.edu"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
            {loading ? 'Enrolling Account...' : 'Complete Faculty Registration'}
          </button>
        </form>

        <div style={styles.footerLink}>
          <span>Already registered? </span>
          <Link to="/login" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top, #1e1b4b 0%, #0b0f19 70%)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '32px',
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
  },
  input: {
    width: '100%',
    padding: '10px 10px 10px 40px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    justifyContent: 'center',
    marginTop: '6px',
  },
  footerLink: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginTop: '20px',
  },
};

export default RegisterPage;
