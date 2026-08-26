export const normalizeHttpsUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed.replace(/^http:\/\//i, 'https://') : `https://${trimmed}`;
};

export const isSafeHttpsUrl = (value: string): boolean => {
  try {
    const url = new URL(normalizeHttpsUrl(value));
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
};

export const isKakaoOpenChatUrl = (value: string): boolean => {
  try {
    const url = new URL(normalizeHttpsUrl(value));
    return url.protocol === 'https:' && url.hostname.toLowerCase() === 'open.kakao.com';
  } catch {
    return false;
  }
};
