/**
 * App 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('App Component', () => {
  it('렌더링이 정상적으로 되어야 함', () => {
    render(<App />);
    
    // 헤더 확인
    expect(screen.getByText(/SmartTrade/i)).toBeInTheDocument();
    expect(screen.getByText(/중고 상품 통합 검색 서비스/i)).toBeInTheDocument();
    
    // 푸터 확인
    expect(screen.getByText(/© SmartTrade/i)).toBeInTheDocument();
  });

  it('헤더에 올바른 스타일이 적용되어야 함', () => {
    render(<App />);
    
    const header = screen.getByText(/SmartTrade/i).closest('header');
    expect(header).toHaveStyle({ backgroundColor: '#ff6b35' });
  });

  it('메인 컨텐츠가 렌더링되어야 함', () => {
    const { container } = render(<App />);
    
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});

