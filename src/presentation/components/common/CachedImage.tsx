import React, { memo, useEffect, useState } from 'react';
import { Image, Platform, type ImageStyle, type StyleProp } from 'react-native';
import { cdnThumb } from '../../../infrastructure/config/imageCdn';

interface Props {
  uri: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /**
   * 목록/그리드용 썸네일 폭(px). 지정하면 CDN 리사이즈 URL 을 사용한다
   * (Cloudflare Image Transformations 켜졌을 때만 실제 축소, 아니면 원본).
   */
  thumbWidth?: number;
}

// null/undefined/"" URI 안전 처리 + iOS force-cache 로 CDN 재다운로드 방지
// + 로드 실패 시 (썸네일→원본→자리표시자) 단계적 폴백으로 "가끔 사진이 안 나오는" 현상 완화
const CachedImage = memo(({ uri, style, resizeMode = 'cover', thumbWidth }: Props) => {
  const thumb = thumbWidth ? cdnThumb(uri, thumbWidth) : uri;
  const [failed, setFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);

  // uri 가 바뀌면 폴백 상태 초기화
  useEffect(() => {
    setFailed(false);
    setUseOriginal(false);
  }, [uri]);

  if (!uri || failed) return null;

  const finalUri = useOriginal ? uri : (thumb ?? uri);

  return (
    <Image
      source={Platform.OS === 'ios' ? { uri: finalUri, cache: 'force-cache' } : { uri: finalUri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        // 썸네일 로드 실패 → 원본으로 1회 폴백, 원본까지 실패하면 자리표시자(null)
        if (!useOriginal && finalUri !== uri) setUseOriginal(true);
        else setFailed(true);
      }}
    />
  );
});

CachedImage.displayName = 'CachedImage';
export default CachedImage;
