/**
 * ProductSearch 컴포넌트 테스트
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductSearch from '../ProductSearch';
import axios from 'axios';

// Axios 모킹
jest.mock('axios');

describe('ProductSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('렌더링이 정상적으로 되어야 함', () => {
    render(<ProductSearch />);
    
    expect(screen.getByText(/중고 상품 검색/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/찾으시는 상품을 입력하세요/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /검색/i })).toBeInTheDocument();
  });

  it('검색어를 입력할 수 있어야 함', async () => {
    render(<ProductSearch />);
    
    const input = screen.getByPlaceholderText(/찾으시는 상품을 입력하세요/i);
    await userEvent.type(input, '아이폰');
    
    expect(input.value).toBe('아이폰');
  });

  it('검색 버튼 클릭 시 API 호출이 되어야 함', async () => {
    const mockResponse = {
      data: {
        success: true,
        products: [
          {
            id: 'daangn:12345',
            title: '아이폰 15 프로',
            price: 1200000,
            location: '역삼동',
            originalUrl: 'https://example.com',
            imageUrls: [],
            status: 'available',
            createdAt: new Date().toISOString(),
          },
        ],
        totalCount: 1,
        searchTime: 0.05,
      },
    };

    axios.post.mockResolvedValue(mockResponse);

    render(<ProductSearch />);
    
    const input = screen.getByPlaceholderText(/찾으시는 상품을 입력하세요/i);
    const button = screen.getByRole('button', { name: /검색/i });
    
    await userEvent.type(input, '아이폰');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/search'),
        expect.objectContaining({
          query: '아이폰',
        })
      );
    });
  });

  it('검색 결과가 표시되어야 함', async () => {
    const mockResponse = {
      data: {
        success: true,
        products: [
          {
            id: 'daangn:12345',
            title: '아이폰 15 프로',
            price: 1200000,
            location: '역삼동',
            originalUrl: 'https://example.com',
            imageUrls: [],
            status: 'available',
            createdAt: new Date().toISOString(),
          },
        ],
        totalCount: 1,
        searchTime: 0.05,
      },
    };

    axios.post.mockResolvedValue(mockResponse);

    render(<ProductSearch />);
    
    const input = screen.getByPlaceholderText(/찾으시는 상품을 입력하세요/i);
    const button = screen.getByRole('button', { name: /검색/i });
    
    await userEvent.type(input, '아이폰');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/아이폰 15 프로/i)).toBeInTheDocument();
      expect(screen.getByText(/1,200,000원/i)).toBeInTheDocument();
    });
  });

  it('검색어 없이 검색하면 에러 메시지가 표시되어야 함', async () => {
    render(<ProductSearch />);
    
    const button = screen.getByRole('button', { name: /검색/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/검색어를 입력해주세요/i)).toBeInTheDocument();
    });
  });

  it('API 에러 시 에러 메시지가 표시되어야 함', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));

    render(<ProductSearch />);
    
    const input = screen.getByPlaceholderText(/찾으시는 상품을 입력하세요/i);
    const button = screen.getByRole('button', { name: /검색/i });
    
    await userEvent.type(input, '아이폰');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/실패/i)).toBeInTheDocument();
    });
  });

  it('지역 필터를 선택할 수 있어야 함', () => {
    render(<ProductSearch />);
    
    const select = screen.getByLabelText(/지역/i);
    expect(select).toBeInTheDocument();
    
    fireEvent.change(select, { target: { value: '역삼동' } });
    expect(select.value).toBe('역삼동');
  });

  it('가격 범위를 입력할 수 있어야 함', async () => {
    render(<ProductSearch />);
    
    const minInput = screen.getByLabelText(/최저가/i);
    const maxInput = screen.getByLabelText(/최고가/i);
    
    await userEvent.type(minInput, '500000');
    await userEvent.type(maxInput, '1000000');
    
    expect(minInput.value).toBe('500000');
    expect(maxInput.value).toBe('1000000');
  });
});

