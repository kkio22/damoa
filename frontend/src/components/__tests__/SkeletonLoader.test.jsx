/**
 * SkeletonLoader 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import SkeletonLoader from '../SkeletonLoader';

describe('SkeletonLoader Component', () => {
  it('렌더링이 정상적으로 되어야 함', () => {
    const { container } = render(<SkeletonLoader />);
    expect(container).toBeInTheDocument();
  });

  it('기본 6개의 스켈레톤 카드가 표시되어야 함', () => {
    const { container } = render(<SkeletonLoader />);
    const cards = container.querySelectorAll('.skeleton-card');
    expect(cards.length).toBe(6);
  });

  it('count prop으로 스켈레톤 개수를 지정할 수 있어야 함', () => {
    const { container } = render(<SkeletonLoader count={12} />);
    const cards = container.querySelectorAll('.skeleton-card');
    expect(cards.length).toBe(12);
  });

  it('shimmer 애니메이션 클래스가 적용되어야 함', () => {
    const { container } = render(<SkeletonLoader />);
    const shimmerElements = container.querySelectorAll('.skeleton-shimmer');
    expect(shimmerElements.length).toBeGreaterThan(0);
  });
});

