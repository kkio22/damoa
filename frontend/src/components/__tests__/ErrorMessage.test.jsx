/**
 * ErrorMessage 컴포넌트 테스트
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage Component', () => {
  it('렌더링이 정상적으로 되어야 함', () => {
    render(<ErrorMessage message="테스트 에러 메시지" />);
    
    expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument();
    expect(screen.getByText('테스트 에러 메시지')).toBeInTheDocument();
  });

  it('기본 에러 메시지가 표시되어야 함', () => {
    render(<ErrorMessage />);
    
    expect(screen.getByText(/알 수 없는 오류가 발생했습니다/i)).toBeInTheDocument();
  });

  it('다시 시도 버튼이 표시되고 클릭할 수 있어야 함', () => {
    const mockRetry = jest.fn();
    render(<ErrorMessage message="에러" onRetry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /다시 시도/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('onRetry prop이 없으면 다시 시도 버튼이 표시되지 않아야 함', () => {
    render(<ErrorMessage message="에러" />);
    
    const retryButton = screen.queryByRole('button', { name: /다시 시도/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('에러 아이콘이 표시되어야 함', () => {
    render(<ErrorMessage message="에러" />);
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});

