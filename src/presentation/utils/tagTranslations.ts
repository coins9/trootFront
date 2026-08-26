/**
 * 장르·부위·사이즈 등 DB에 한국어로 저장된 태그를 영어로 번역하는 유틸
 * en.ts filter.genre / filter.bodyPart / filter.mood 와 일관성 유지
 */

const GENRE_EN: Record<string, string> = {
  '블랙앤그레이': 'Black & Gray',
  '라인워크':     'Linework',
  '미니타투':     'Mini Tattoo',
  '레터링':       'Lettering',
  '이레즈미':     'Irezumi',
  '올드스쿨':     'Old School',
  '뉴스쿨':       'New School',
  '수채화':       'Watercolor',
  '치카노':       'Chicano',
  '블랙워크':     'Blackwork',
  '리얼리즘':     'Realism',
  '트라이벌':     'Tribal',
  '일러스트':     'Illustration',
  '지오메트릭':   'Geometric',
  '커버업':       'Cover-up',
  '포트레이트':   'Portrait',
  '컬러':         'Color',
  '풍경':         'Landscape',
  '기하학':       'Geometric',
};

const BODY_PART_EN: Record<string, string> = {
  '귀 뒤':    'Behind Ear',
  '뒷목':     'Back Neck',
  '옆목':     'Side Neck',
  '앞목':     'Front Neck',
  '얼굴':     'Face',
  '두피/머리': 'Scalp',
  '어깨':     'Shoulder',
  '상박':     'Upper Arm',
  '하박':     'Forearm',
  '팔꿈치':   'Elbow',
  '손목':     'Wrist',
  '손등':     'Back of Hand',
  '손가락':   'Finger',
  '가슴':     'Chest',
  '복부':     'Abdomen',
  '옆구리':   'Ribs',
  '쇄골':     'Collarbone',
  '날개뼈':   'Shoulder Blade',
  '등 전체':  'Full Back',
  '척추 라인': 'Spine',
  '허리':     'Lower Back',
  '골반/치골': 'Hip/Pelvis',
  '허벅지':   'Thigh',
  '무릎':     'Knee',
  '종아리':   'Calf',
  '발목':     'Ankle',
  '발등':     'Instep',
  '발가락':   'Toes',
  '슬리브':   'Sleeve',
  '풀바디':   'Full Body',
  '터치업':   'Touch-up',
};

const MOOD_EN: Record<string, string> = {
  '다크/퇴폐':   'Dark/Decadent',
  '심플/미니멀':  'Simple/Minimal',
  '귀여운/키치':  'Cute/Kitsch',
  '몽환/신비':   'Dreamy/Mystical',
  '빈티지/러프':  'Vintage/Rough',
  '오리엔탈':    'Oriental',
  '여리여리한/섬세한': 'Delicate',
};

const SIZE_PRESET_EN: Record<string, string> = {
  '손가락 크기':  'Finger Size',
  '명함 크기':   'Card Size',
  '손목 크기':   'Wrist Size',
  '손바닥 크기':  'Palm Size',
  '팔꿈치 크기':  'Elbow Size',
  '어깨 크기':   'Shoulder Size',
  '반팔 크기':   'Half-sleeve',
  '풀슬리브':    'Full Sleeve',
  '등 전체':     'Full Back',
};

/** 장르 태그 번역 */
export const translateGenre = (ko: string, language: string): string =>
  language === 'en' ? (GENRE_EN[ko] ?? ko) : ko;

/** 부위 태그 번역 */
export const translateBodyPart = (ko: string, language: string): string =>
  language === 'en' ? (BODY_PART_EN[ko] ?? ko) : ko;

/** 분위기/무드 태그 번역 */
export const translateMood = (ko: string, language: string): string =>
  language === 'en' ? (MOOD_EN[ko] ?? ko) : ko;

/** 사이즈 프리셋 번역 */
export const translateSizePreset = (ko: string, language: string): string =>
  language === 'en' ? (SIZE_PRESET_EN[ko] ?? ko) : ko;

/**
 * 장르/부위/무드 중 어느 맵에든 해당하면 번역 (범용)
 * 우선순위: 장르 → 부위 → 무드 → 원본
 */
export const translateTag = (ko: string, language: string): string => {
  if (language !== 'en') return ko;
  return GENRE_EN[ko] ?? BODY_PART_EN[ko] ?? MOOD_EN[ko] ?? SIZE_PRESET_EN[ko] ?? ko;
};
