import { useCallback, useState } from 'react';
import { launchImageLibrary, type PhotoQuality } from 'react-native-image-picker';
import { uploadImages, type LocalImage, type UploadScope } from '../../data/api/upload';
import { ApiError } from '../../data/api/client';

interface Options {
  scope: UploadScope;
  /** 최대 장수 — 이미 담긴 수를 넘겨 남은 만큼만 고르게 한다 */
  max: number;
  current: number;
  onError?: (message: string) => void;
}

/**
 * 갤러리에서 이미지를 고르고 R2 로 업로드한 뒤 공개 URL 배열을 돌려준다.
 * 화면은 반환된 URL 을 그대로 상태에 넣기만 하면 된다.
 */
export function useImageUpload({ scope, max, current, onError }: Options) {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = useCallback(async (): Promise<string[]> => {
    const remaining = max - current;
    if (remaining <= 0) {
      onError?.(`사진은 최대 ${max}장까지 첨부할 수 있어요`);
      return [];
    }

    const picked = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: remaining,
      quality: 0.85 as PhotoQuality,
    });

    if (picked.didCancel || !picked.assets?.length) return [];

    const images: LocalImage[] = picked.assets
      .filter((a) => !!a.uri)
      .map((a) => ({ uri: a.uri as string, type: a.type, fileSize: a.fileSize }));

    setUploading(true);
    try {
      return await uploadImages(scope, images);
    } catch (e) {
      onError?.(
        e instanceof ApiError ? e.userMessage : '사진 업로드에 실패했습니다. 다시 시도해주세요.',
      );
      return [];
    } finally {
      setUploading(false);
    }
  }, [scope, max, current, onError]);

  return { pickAndUpload, uploading };
}
