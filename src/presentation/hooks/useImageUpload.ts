import { useCallback, useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  type PhotoQuality,
} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { uploadImages, type LocalImage, type UploadScope } from '../../data/api/upload';
import { ApiError } from '../../data/api/client';

interface Options {
  scope: UploadScope;
  /** Maximum images — already-selected count is subtracted */
  max: number;
  current: number;
  onError?: (message: string) => void;
}

const requestAndroidGalleryPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    // Android 13+(API 33+)는 READ_MEDIA_IMAGES, 그 미만은 READ_EXTERNAL_STORAGE
    const sdkInt = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
    const permission = sdkInt >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    const result = await PermissionsAndroid.request(permission, {
      title: '사진 접근 권한',
      message: 'T:ROOT가 갤러리에서 사진을 선택하려면 접근 권한이 필요합니다.',
      buttonPositive: '허용',
      buttonNegative: '거부',
    });
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

const requestAndroidCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: '카메라 권한',
        message: 'T:ROOT가 사진을 찍으려면 카메라 권한이 필요합니다.',
        buttonPositive: '허용',
        buttonNegative: '거부',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

type Asset = { uri?: string; type?: string; fileSize?: number };

/** RAW 파일 확장자 목록 */
const RAW_EXTS = new Set([
  'dng', 'raw', 'arw', 'cr2', 'cr3', 'nef', 'orf', 'rw2',
  'raf', 'srw', 'nrw', 'pef', '3fr', 'erf', 'mef', 'mrw', 'x3f',
]);

/** MIME 타입 또는 URI 확장자로 RAW 파일 여부 판단 */
const isRawAsset = (a: Asset): boolean => {
  const mimeType = (a.type ?? '').toLowerCase();
  if (
    mimeType &&
    (mimeType.includes('raw') ||
      mimeType.includes('dng') ||
      mimeType.includes('x-adobe') ||
      mimeType.includes('x-sony') ||
      mimeType.includes('x-nikon') ||
      mimeType.includes('x-canon') ||
      mimeType.includes('x-olympus') ||
      mimeType.includes('x-fuji'))
  ) {
    return true;
  }
  const ext = (a.uri ?? '').split('.').pop()?.toLowerCase() ?? '';
  return RAW_EXTS.has(ext);
};

/**
 * RAW 파일을 JPEG으로 변환 (react-native-image-resizer 사용).
 * 최대 4096×4096 유지, 품질 90%, 비율 보존.
 */
const convertRawToJpeg = async (uri: string): Promise<string> => {
  const result = await ImageResizer.createResizedImage(
    uri,
    4096,
    4096,
    'JPEG',
    90,
    0,
    undefined,
    false,
    { mode: 'contain', onlyScaleDown: true },
  );
  return result.uri;
};

/**
 * 에셋 목록 처리:
 * - RAW 파일 → JPEG 변환 후 포함
 * - 일반 파일 → 그대로 포함
 * - URI 없는 항목 → 스킵
 */
const processAssets = async (assets: Asset[]): Promise<LocalImage[]> => {
  const images: LocalImage[] = [];
  for (const a of assets) {
    if (!a.uri) continue;
    if (isRawAsset(a)) {
      try {
        const jpegUri = await convertRawToJpeg(a.uri);
        images.push({ uri: jpegUri, type: 'image/jpeg' });
      } catch {
        // 변환 실패 시 해당 파일 스킵
      }
    } else {
      images.push({ uri: a.uri as string, type: a.type, fileSize: a.fileSize });
    }
  }
  return images;
};

/**
 * Pick images from gallery or camera and upload to R2.
 * Returns public URLs — callers just store them in state.
 * RAW 파일은 자동으로 JPEG으로 변환된 후 업로드됩니다.
 */
export function useImageUpload({ scope, max, current, onError }: Options) {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (images: LocalImage[]): Promise<string[]> => {
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
  }, [scope, onError]);

  const pickAndUpload = useCallback(async (): Promise<string[]> => {
    const remaining = max - current;
    if (remaining <= 0) {
      onError?.(`사진은 최대 ${max}장까지 첨부할 수 있어요`);
      return [];
    }

    const granted = await requestAndroidGalleryPermission();
    if (!granted) {
      onError?.('갤러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
      return [];
    }

    const picked = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: remaining,
      quality: 0.85 as PhotoQuality,
    });

    if (picked.didCancel || !picked.assets?.length) return [];
    const images = await processAssets(picked.assets);
    if (!images.length) return [];
    return upload(images);
  }, [max, current, onError, upload]);

  const pickFromCamera = useCallback(async (): Promise<string[]> => {
    const remaining = max - current;
    if (remaining <= 0) {
      onError?.(`사진은 최대 ${max}장까지 첨부할 수 있어요`);
      return [];
    }

    const granted = await requestAndroidCameraPermission();
    if (!granted) {
      onError?.('카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
      return [];
    }

    const picked = await launchCamera({
      mediaType: 'photo',
      quality: 0.85 as PhotoQuality,
      saveToPhotos: false,
    });

    if (picked.didCancel || !picked.assets?.length) return [];
    const images = await processAssets(picked.assets);
    if (!images.length) return [];
    return upload(images);
  }, [max, current, onError, upload]);

  /** Shows an action sheet to choose gallery or camera, then uploads. */
  const pickWithChoice = useCallback((): Promise<string[]> => {
    return new Promise((resolve) => {
      Alert.alert(
        '사진 추가',
        '사진을 가져올 방법을 선택해주세요',
        [
          {
            text: '카메라 촬영',
            onPress: () => pickFromCamera().then(resolve),
          },
          {
            text: '갤러리에서 선택',
            onPress: () => pickAndUpload().then(resolve),
          },
          {
            text: '취소',
            style: 'cancel',
            onPress: () => resolve([]),
          },
        ],
        { cancelable: true, onDismiss: () => resolve([]) },
      );
    });
  }, [pickFromCamera, pickAndUpload]);

  return { pickAndUpload, pickFromCamera, pickWithChoice, uploading };
}
