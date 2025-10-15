/**
 * Pagination 컴포넌트 테스트
 */

import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('렌더링이 정상적으로 되어야 함', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('페이지 번호를 클릭하면 onPageChange가 호출되어야 함', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const page2Button = screen.getByText('2');
    fireEvent.click(page2Button);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('현재 페이지는 다른 스타일이 적용되어야 함', () => {
    const { container } = render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveStyle({ fontWeight: 'bold' });
  });

  it('이전 버튼을 클릭하면 이전 페이지로 이동해야 함', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByText('‹');
    fireEvent.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('다음 버튼을 클릭하면 다음 페이지로 이동해야 함', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByText('›');
    fireEvent.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('첫 페이지에서 이전 버튼이 비활성화되어야 함', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByText('‹');
    expect(prevButton).toBeDisabled();
  });

  it('마지막 페이지에서 다음 버튼이 비활성화되어야 함', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByText('›');
    expect(nextButton).toBeDisabled();
  });

  it('페이지가 1개면 페이지네이션이 표시되지 않아야 함', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );
    
    // 페이지네이션이 null을 반환하면 빈 컨테이너
    expect(container.firstChild).toBeNull();
  });
});

