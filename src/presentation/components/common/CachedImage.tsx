import React, { memo } from 'react';
import { Image, Platform, type ImageStyle, type StyleProp } from 'react-native';

interface Props {
  uri: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

// null/undefined/"" URI를 안전하게 처리 + iOS cache="force-cache"로 CDN 재다운로드 방지
// 각 호출부에서: uri ? <CachedImage uri={uri} /> : <Fallback />
const CachedImage = memo(({ uri, style, resizeMode = 'cover' }: Props) => {
  if (!uri) return null;

  return (
    <Image
      source={Platform.OS === 'ios' ? { uri, cache: 'force-cache' } : { uri }}
      style={style}
      resizeMode={resizeMode}
    />
  );
});

CachedImage.displayName = 'CachedImage';
export default CachedImage;
