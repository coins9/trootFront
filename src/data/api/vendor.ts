import { api } from './client';
import type { ProductCategory } from './index';

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface MyVendor {
  id: string;
  userId: string;
  name: string;
  businessNo: string;
  ecommerceRegNo: string | null;
  contactEmail: string;
  entryPhase: 'FREE' | 'PAID';
  commissionRate: string;
  status: VendorStatus;
  productCount: number;
  openChatUrl: string | null;
  inquiryCount: number;
  createdAt: string;
}

export interface MyProduct {
  id: string;
  vendorId: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  brand: string | null;
  priceKrw: number;
  stock: number;
  images: string[];
  thumbnail: string | null;
  attributes: Record<string, unknown>;
  externalUrl: string | null;
  isActive: boolean;
  soldCount: number;
  createdAt: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  category: ProductCategory;
  brand?: string;
  priceKrw: number;
  stock?: number;
  images?: string[];
  thumbnail?: string;
  attributes?: Record<string, unknown>;
  externalUrl?: string;
}

/** 상품 카테고리 — 등록 화면 선택지 */
export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'machine', label: '타투머신' },
  { value: 'needle', label: '바늘' },
  { value: 'ink', label: '잉크' },
  { value: 'hygiene', label: '위생용품' },
  { value: 'stencil', label: '스텐실' },
  { value: 'aftercare', label: '애프터케어' },
  { value: 'furniture', label: '가구·집기' },
  { value: 'etc', label: '기타' },
];

export const supplyVendorApi = {
  /** 없으면 404 → 아직 입점 신청 전 */
  me: () => api.get<MyVendor>('/app/supplies/vendors/me'),

  apply: (body: {
    name: string;
    businessNo: string;
    ecommerceRegNo?: string;
    contactEmail: string;
  }) => api.post<MyVendor>('/app/supplies/vendors/apply', body),

  myProducts: () => api.get<MyProduct[]>('/app/supplies/vendors/me/products'),

  createProduct: (body: ProductPayload) =>
    api.post<MyProduct>('/app/supplies/vendors/me/products', body),

  updateProduct: (id: string, body: ProductPayload) =>
    api.patch<MyProduct>(`/app/supplies/vendors/me/products/${id}`, body),

  deleteProduct: (id: string) =>
    api.delete<{ deleted: boolean }>(`/app/supplies/vendors/me/products/${id}`),

  updateVendor: (body: {
    openChatUrl?: string; name?: string; businessNo?: string;
    ecommerceRegNo?: string; contactEmail?: string;
  }) => api.patch<MyVendor>('/app/supplies/vendors/me', body),
};
