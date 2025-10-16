/**
 * 로그인 페이지
 * 이메일, 비밀번호 입력 및 JWT 인증
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 로그인 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: '이메일과 비밀번호를 입력해주세요' });
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: '로그인 성공! 메인 페이지로 이동합니다...' });
      setTimeout(() => navigate('/'), 1000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.logoSection}>
          <h1 style={styles.logo}>Damoa</h1>
          <p style={styles.tagline}>중고 상품 통합 검색 서비스</p>
        </div>

        <h2 style={styles.title}>로그인</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 이메일 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              style={styles.input}
              required
            />
          </div>

          {/* 비밀번호 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              style={styles.input}
              required
            />
          </div>

          {/* 메시지 */}
          {message.text && (
            <div
              style={{
                ...styles.message,
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#16a34a' : '#dc2626',
              }}
            >
              {message.text}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 회원가입 링크 */}
          <div style={styles.footer}>
            <span style={styles.footerText}>계정이 없으신가요?</span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={styles.linkButton}
            >
              회원가입
            </button>
          </div>

          {/* 메인으로 돌아가기 */}
          <button
            type="button"
            onClick={() => navigate('/')}
            style={styles.backButton}
          >
            메인으로 돌아가기
          </button>
        </form>
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
    background: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)',
    padding: '40px 20px',
  },
  formCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '48px',
    maxWidth: '450px',
    width: '100%',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '40px',
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: '8px',
  },
  tagline: {
    fontSize: '14px',
    color: '#64748b',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: '24px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #dbeafe',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  footerText: {
    fontSize: '14px',
    color: '#64748b',
  },
  linkButton: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2563eb',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  backButton: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default Login;

