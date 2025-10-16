/**
 * 회원가입 페이지
 * 이메일, 비밀번호, 이름, 전화번호 입력 및 유효성 검사
 */


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 실시간 유효성 검사
  const validate = (name, value) => {
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : '올바른 이메일 형식이 아닙니다';

      case 'password':
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]).{8,}$/;
        return passwordRegex.test(value)
          ? ''
          : '비밀번호는 8글자 이상, 영문, 특수문자 1개 이상 포함해야 합니다';

      case 'passwordConfirm':
        return value === formData.password ? '' : '비밀번호가 일치하지 않습니다';

      case 'name':
        return value.trim().length >= 2 ? '' : '이름은 2글자 이상 입력해주세요';

      case 'phone':
        const phoneRegex = /^010\d{7,8}$/;
        const phoneOnly = value.replace(/[^0-9]/g, '');
        return phoneRegex.test(phoneOnly) ? '' : '올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)';

      default:
        return '';
    }
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 실시간 유효성 검사
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // 전화번호 자동 포맷팅
  const formatPhone = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    const error = validate('phone', formatted);
    setErrors(prev => ({ ...prev, phone: error }));
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 최종 유효성 검사
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validate(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const result = await register(
      formData.email,
      formData.password,
      formData.passwordConfirm,
      formData.name,
      formData.phone.replace(/[^0-9]/g, '') // 숫자만 전송
    );

    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.subtitle}>환영합니다! 다같이 만들어가는 분석</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 이메일 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              이메일 <span style={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일 입력 (예: user@example.com)"
              style={{
                ...styles.input,
                borderColor: errors.email ? '#ef4444' : '#dbeafe',
              }}
              required
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          {/* 비밀번호 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              비밀번호 <span style={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 입력 (8자 이상, 영문, 특수문자 포함)"
              style={{
                ...styles.input,
                borderColor: errors.password ? '#ef4444' : '#dbeafe',
              }}
              required
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          {/* 비밀번호 확인 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              비밀번호 확인 <span style={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호 재입력"
              style={{
                ...styles.input,
                borderColor: errors.passwordConfirm ? '#ef4444' : '#dbeafe',
              }}
              required
            />
            {errors.passwordConfirm && <span style={styles.errorText}>{errors.passwordConfirm}</span>}
          </div>

          {/* 이름 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              이름 <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력해주세요"
              style={{
                ...styles.input,
                borderColor: errors.name ? '#ef4444' : '#dbeafe',
              }}
              required
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          {/* 전화번호 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              전화번호 <span style={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="전화번호 입력 (010-XXXX-XXXX)"
              style={{
                ...styles.input,
                borderColor: errors.phone ? '#ef4444' : '#dbeafe',
              }}
              required
            />
            {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
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

          {/* 버튼 */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? '처리 중...' : '가입완료'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={styles.cancelButton}
            >
              이미 계정이 있으신가요?
            </button>
          </div>
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
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '32px',
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
  required: {
    color: '#ef4444',
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  errorText: {
    fontSize: '13px',
    color: '#ef4444',
    marginTop: '4px',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
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
  },
  cancelButton: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2563eb',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default Register;