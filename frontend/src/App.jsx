/**
 * 메인 앱 컴포넌트 (고객용)
 */

import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProductSearch from './components/ProductSearch';
import Register from './components/Register';
import Login from './components/Login';
import MyPage from './components/MyPage';

// 메인 레이아웃 컴포넌트
function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // 로그인/회원가입 페이지에서는 헤더를 보이지 않음
  const hideHeader = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div style={styles.app}>
      {!hideHeader && (
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.logo} onClick={() => navigate('/')}>Damoa</h1>
              <p style={styles.subtitle}>중고 상품 통합 검색 서비스</p>
            </div>
            <div style={styles.authButtons}>
              {user ? (
                <>
                  <span style={styles.userName}>{user.name}님</span>
                  <button onClick={() => navigate('/mypage')} style={styles.mypageButton}>
                    마이페이지
                  </button>
                  <button onClick={logout} style={styles.logoutButton}>
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} style={styles.loginButton}>
                    로그인
                  </button>
                  <button onClick={() => navigate('/register')} style={styles.registerButton}>
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main style={hideHeader ? styles.mainFullHeight : styles.main}>
        {children}
      </main>

      {!hideHeader && (
        <footer style={styles.footer}>
          <p>© 2025 Damoa</p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<ProductSearch />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mypage" element={<MyPage />} />
            {/* 예시: 보호된 라우트 (필요 시 추가)
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            */}
          </Routes>
        </MainLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

// 스타일 - Damoa 파란색 테마
const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    color: '#fff',
    padding: '20px 20px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '5px',
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  subtitle: {
    fontSize: '16px',
    margin: 0,
    opacity: 0.95,
    fontWeight: '300',
  },
  authButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '500',
  },
  loginButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  registerButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mypageButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  logoutButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    padding: '20px',
    minHeight: 'calc(100vh - 280px)',
  },
  mainFullHeight: {
    padding: 0,
    minHeight: '100vh',
  },
  footer: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    padding: '20px',
    textAlign: 'center',
    fontSize: '14px',
  },
};

// 전역 애니메이션 추가 (UI/UX 개선 - todolist 4일차)
if (!document.getElementById('global-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'global-animations';
  styleSheet.textContent = `
    /* 헤더 애니메이션 */
    header {
      animation: slideDown 0.5s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 메인 컨텐츠 페이드 인 */
    main {
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* 푸터 애니메이션 */
    footer {
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 부드러운 스크롤 */
    html {
      scroll-behavior: smooth;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default App;

