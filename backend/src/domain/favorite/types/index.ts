/**
 * 즐겨찾기 타입 정의
 */

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  product_data: ProductData;
  created_at: Date;
}

export interface ProductData {
  id: string;
  title: string;
  price: string;
  image?: string;
  url: string;
  platform: string;
  location?: string;
  description?: string;
}

export interface AddFavoriteRequest {
  product_id: string;
  product_data: ProductData;
}

export interface FavoriteResponse {
  id: string;
  product_id: string;
  product_data: ProductData;
  favorite_count: number;
  created_at: Date;
}

export interface FavoriteListResponse {
  success: boolean;
  favorites: FavoriteResponse[];
  total: number;
}

export interface AddFavoriteResponse {
  success: boolean;
  message: string;
  favorite: FavoriteResponse;
}

export interface DeleteFavoriteResponse {
  success: boolean;
  message: string;
}

export interface FavoriteCountResponse {
  product_id: string;
  count: number;
}

