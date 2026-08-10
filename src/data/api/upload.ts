import { api } from './client';

export type UploadScope = 'artwork' | 'review' | 'profile' | 'product' | 'shop' | 'misc';

interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  headers: Record<string, string>;
  expiresInSec: number;
}

/** 로컬 파일 URI 로부터 MIME 추론 (image-picker 가 type 을 안 줄 때 대비) */
const guessContentType = (uri: string): string => {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'heic': return 'image/heic';
    default: return 'image/jpeg';
  }
};

export interface LocalImage {
  uri: string;
  /** image-picker 가 제공하면 그대로 사용 */
  type?: string;
  fileSize?: number;
}

/**
 * 이미지를 R2 로 직접 업로드하고 공개 URL 을 돌려준다.
 *   1) 서버에 presign 요청 (허가증만 받음 — 파일은 서버를 안 거침)
 *   2) 앱이 R2 로 직접 PUT
 * 서버 대역폭·비용을 쓰지 않는다.
 */
export const uploadImage = async (scope: UploadScope, image: LocalImage): Promise<string> => {
  const contentType = image.type ?? guessContentType(image.uri);

  // 크기를 모르면 blob 을 먼저 받아 정확한 size 로 서명을 요청한다
  const blob = await (await fetch(image.uri)).blob();
  const size = image.fileSize ?? blob.size;

  const presign = await api.post<PresignResult>('/app/uploads/presign', {
    scope,
    contentType,
    size,
  });

  const res = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: presign.headers,
    body: blob,
  });
  if (!res.ok) {
    throw new Error(`R2_UPLOAD_FAILED_${res.status}`);
  }

  return presign.publicUrl;
};

/** 여러 장을 병렬 업로드하고 성공한 URL 만 순서대로 반환 */
export const uploadImages = async (
  scope: UploadScope,
  images: LocalImage[],
): Promise<string[]> => {
  const results = await Promise.all(images.map((img) => uploadImage(scope, img)));
  return results;
};
