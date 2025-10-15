/**
 * EmptyState 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState Component', () => {
  it('렌더링이 정상적으로 되어야 함', () => {
    render(<EmptyState />);
    
    expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument();
  });

  it('커스텀 아이콘을 표시할 수 있어야 함', () => {
    render(<EmptyState icon="📦" />);
    
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('커스텀 제목과 메시지를 표시할 수 있어야 함', () => {
    render(
      <EmptyState
        title="커스텀 제목"
        message="커스텀 메시지"
      />
    );
    
    expect(screen.getByText('커스텀 제목')).toBeInTheDocument();
    expect(screen.getByText('커스텀 메시지')).toBeInTheDocument();
  });

  it('제안 목록이 표시되어야 함', () => {
    const suggestions = [
      '첫 번째 제안',
      '두 번째 제안',
      '세 번째 제안',
    ];
    
    render(<EmptyState suggestions={suggestions} />);
    
    expect(screen.getByText('💡 검색 팁:')).toBeInTheDocument();
    suggestions.forEach((suggestion) => {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    });
  });

  it('제안이 없으면 제안 섹션이 표시되지 않아야 함', () => {
    render(<EmptyState suggestions={[]} />);
    
    expect(screen.queryByText('💡 검색 팁:')).not.toBeInTheDocument();
  });

  it('기본 아이콘이 표시되어야 함', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});

