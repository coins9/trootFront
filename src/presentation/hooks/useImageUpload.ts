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
import { useTranslation } from '../store/languageStore';

interface Options {
  scope: UploadScope;
  /** Maximum images — already-selected count is subtracted */
  max: number;
  current: number;
  onError?: (message: string) => void;
}

interface PermissionStrings {
  title: string;
  message: string;
  allow: string;
  deny: string;
}

const requestAndroidGalleryPermission = async (strings: PermissionStrings): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    // Android 13+(API 33+)는 READ_MEDIA_IMAGES, 그 미만은 READ_EXTERNAL_STORAGE
    const sdkInt = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
    const permission = sdkInt >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    const result = await PermissionsAndroid.request(permission, {
      title: strings.title,
      message: strings.message,
      buttonPositive: strings.allow,
      buttonNegative: strings.deny,
    });
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

const requestAndroidCameraPermission = async (strings: PermissionStrings): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: strings.title,
        message: strings.message,
        buttonPositive: strings.allow,
        buttonNegative: strings.deny,
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
 * HEIC/HEIF 여부 판단.
 * iOS 갤러리 기본 사진은 HEIC → fetch().blob() 업로드가 실패하거나
 * 서버/CDN 이 렌더링하지 못한다. 스크린샷(PNG)만 성공하던 원인.
 */
const isHeicAsset = (a: Asset): boolean => {
  const mimeType = (a.type ?? '').toLowerCase();
  if (mimeType.includes('heic') || mimeType.includes('heif')) return true;
  const ext = (a.uri ?? '').split('.').pop()?.toLowerCase() ?? '';
  return ext === 'heic' || ext === 'heif';
};

/**
 * 이미지를 JPEG으로 변환 (react-native-image-resizer 사용).
 * 최대 4096×4096 유지, 품질 90%, 비율 보존.
 */
const convertToJpeg = async (uri: string): Promise<string> => {
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

/** 서버가 허용하는 최종 형식 — JPG/JPEG, PNG, WEBP */
const SUPPORTED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const SUPPORTED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

/** 지원 형식(jpg/jpeg/png/webp) 여부. RAW·HEIC 은 별도로 JPEG 변환하므로 여기선 제외 */
const isSupportedImage = (a: Asset): boolean => {
  const mime = (a.type ?? '').toLowerCase();
  const ext = (a.uri ?? '').split('.').pop()?.toLowerCase() ?? '';
  if (mime && SUPPORTED_MIMES.has(mime)) return true;
  if (!mime && SUPPORTED_EXTS.has(ext)) return true;
  // 기기가 애매한 mime 을 줘도 확장자가 지원 형식이면 허용
  if (mime.startsWith('image/') && SUPPORTED_EXTS.has(ext)) return true;
  return false;
};

/**
 * 에셋 목록 처리:
 * - RAW / HEIC(HEIF) 파일 → JPEG 변환 후 포함 (iOS 갤러리 사진 호환)
 * - JPG/JPEG/PNG/WEBP → 그대로 포함
 * - 그 외 형식(gif/bmp/tiff 등) → 거부(rejected 카운트) → 호출부에서 커스텀 안내
 * - URI 없는 항목 → 스킵
 */
const processAssets = async (assets: Asset[]): Promise<{ images: LocalImage[]; rejected: number }> => {
  const images: LocalImage[] = [];
  let rejected = 0;
  for (const a of assets) {
    if (!a.uri) continue;
    if (isRawAsset(a) || isHeicAsset(a)) {
      try {
        const jpegUri = await convertToJpeg(a.uri);
        images.push({ uri: jpegUri, type: 'image/jpeg' });
      } catch {
        // 변환 실패 시 원본이라도 업로드 시도 (type 은 jpeg 로 강제)
        images.push({ uri: a.uri, type: 'image/jpeg', fileSize: a.fileSize });
      }
    } else if (isSupportedImage(a)) {
      images.push({ uri: a.uri as string, type: a.type, fileSize: a.fileSize });
    } else {
      rejected += 1;
    }
  }
  return { images, rejected };
};

/**
 * Pick images from gallery or camera and upload to R2.
 * Returns public URLs — callers just store them in state.
 * RAW 파일은 자동으로 JPEG으로 변환된 후 업로드됩니다.
 */
export function useImageUpload({ scope, max, current, onError }: Options) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (images: LocalImage[]): Promise<string[]> => {
    setUploading(true);
    try {
      return await uploadImages(scope, images);
    } catch (e) {
      onError?.(
        e instanceof ApiError ? e.userMessage : t('imageUpload.uploadError'),
      );
      return [];
    } finally {
      setUploading(false);
    }
  }, [scope, onError, t]);

  const pickAndUpload = useCallback(async (): Promise<string[]> => {
    const remaining = max - current;
    if (remaining <= 0) {
      onError?.(t('imageUpload.maxPhotosError').replace('{{max}}', String(max)));
      return [];
    }

    const granted = await requestAndroidGalleryPermission({
      title: t('imageUpload.galleryPermissionTitle'),
      message: t('imageUpload.galleryPermissionMsg'),
      allow: t('imageUpload.allow'),
      deny: t('imageUpload.deny'),
    });
    if (!granted) {
      onError?.(t('imageUpload.galleryPermissionError'));
      return [];
    }

    const picked = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: remaining,
      quality: 0.85 as PhotoQuality,
    });

    if (picked.didCancel || !picked.assets?.length) return [];
    const { images, rejected } = await processAssets(picked.assets);
    if (rejected > 0) onError?.(t('imageUpload.unsupportedFormat'));
    if (!images.length) return [];
    return upload(images);
  }, [max, current, onError, upload, t]);

  const pickFromCamera = useCallback(async (): Promise<string[]> => {
    const remaining = max - current;
    if (remaining <= 0) {
      onError?.(t('imageUpload.maxPhotosError').replace('{{max}}', String(max)));
      return [];
    }

    const granted = await requestAndroidCameraPermission({
      title: t('imageUpload.cameraPermissionTitle'),
      message: t('imageUpload.cameraPermissionMsg'),
      allow: t('imageUpload.allow'),
      deny: t('imageUpload.deny'),
    });
    if (!granted) {
      onError?.(t('imageUpload.cameraPermissionError'));
      return [];
    }

    const picked = await launchCamera({
      mediaType: 'photo',
      quality: 0.85 as PhotoQuality,
      saveToPhotos: false,
    });

    if (picked.didCancel || !picked.assets?.length) return [];
    const { images, rejected } = await processAssets(picked.assets);
    if (rejected > 0) onError?.(t('imageUpload.unsupportedFormat'));
    if (!images.length) return [];
    return upload(images);
  }, [max, current, onError, upload, t]);

  /** Shows an action sheet to choose gallery or camera, then uploads. */
  const pickWithChoice = useCallback((): Promise<string[]> => {
    return new Promise((resolve) => {
      Alert.alert(
        t('imageUpload.actionTitle'),
        t('imageUpload.actionMsg'),
        [
          {
            text: t('imageUpload.actionCamera'),
            onPress: () => pickFromCamera().then(resolve),
          },
          {
            text: t('imageUpload.actionGallery'),
            onPress: () => pickAndUpload().then(resolve),
          },
          {
            text: t('imageUpload.actionCancel'),
            style: 'cancel',
            onPress: () => resolve([]),
          },
        ],
        { cancelable: true, onDismiss: () => resolve([]) },
      );
    });
  }, [pickFromCamera, pickAndUpload, t]);

  return { pickAndUpload, pickFromCamera, pickWithChoice, uploading };
}
