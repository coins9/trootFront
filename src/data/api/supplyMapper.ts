import type { TattooSupply, SupplyCategory } from '../../domain/entities/supplyTypes';
import type { ProductCategory, SupplyProduct } from './index';

const CATEGORY_BY_CODE: Record<ProductCategory, SupplyCategory> = {
  machine: '머신 & 장비',
  needle: '니들 (바늘)',
  ink: '잉크',
  hygiene: '위생·소모품',
  stencil: '스탠실 용품',
  aftercare: '애프터케어',
  furniture: '가구·인테리어',
  etc: '기타',
};

export const toTattooSupply = (product: SupplyProduct, language: 'ko' | 'en'): TattooSupply => {
  const images = product.images.filter(Boolean);
  const localizedName = language === 'en' && product.nameEn?.trim() ? product.nameEn : product.name;
  const localizedDescription = language === 'en' && product.descriptionEn?.trim()
    ? product.descriptionEn
    : product.description;

  return {
    id: product.id,
    category: CATEGORY_BY_CODE[product.category],
    name: localizedName,
    subtitle: product.subtitle ?? '',
    brand: product.brand ?? undefined,
    imageUri: product.thumbnail || images[0] || '',
    images,
    price: product.priceKrw,
    description: localizedDescription ?? undefined,
    seller: { id: product.vendorId, nickname: product.vendorName || '' },
    nameEn: product.nameEn,
    descriptionEn: product.descriptionEn,
    openChatUrl: product.openChatUrl,
    storeUrl: product.storeUrl,
    externalUrl: product.externalUrl ?? undefined,
    isBookmarked: product.isBookmarked ?? false,
    popularityScore: product.likeCount ?? product.soldCount,
  };
};
