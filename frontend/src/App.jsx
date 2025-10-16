/**
 * 메인 앱 컴포넌트 (고객용)
 */

import React from 'react';
import ProductSearch from './components/ProductSearch';

function App() {
  return (
    <div style={styles.app}>
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.logo}>🌊 Damoa</h1>
        <p style={styles.subtitle}>중고 상품 통합 검색 서비스</p>
      </header>

      {/* 메인 컨텐츠 */}
      <main style={styles.main}>
        <ProductSearch />
      </main>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <p>© 2025 Damoa. All rights reserved.</p>
      </footer>
    </div>
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
    padding: '30px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  },
  logo: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '10px',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '16px',
    margin: 0,
    opacity: 0.95,
    fontWeight: '300',
  },
  main: {
    padding: '20px',
    minHeight: 'calc(100vh - 280px)',
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

