import { useCallback, useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  type PhotoQuality,
} from 'react-native-image-picker';
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

const toLocalImages = (assets: Asset[]): LocalImage[] =>
  assets
    .filter((a) => !!a.uri)
    .map((a) => ({ uri: a.uri as string, type: a.type, fileSize: a.fileSize }));

/**
 * Pick images from gallery or camera and upload to R2.
 * Returns public URLs — callers just store them in state.
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
    return upload(toLocalImages(picked.assets));
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
    return upload(toLocalImages(picked.assets));
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
