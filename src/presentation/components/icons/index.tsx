import React from 'react';
import Svg, {
  Path, Circle, Ellipse, Line, Rect, Polyline, Polygon,
  Text as SvgText, TextPath, Defs, G,
} from 'react-native-svg';
import { COLORS } from '../../theme/colors';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const BellIcon = ({ size = 24, color = COLORS.white, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="18" cy="5" r="3" fill={COLORS.gold} />
  </Svg>
);

export const SearchIcon = ({ size = 24, color = COLORS.white, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const LocationPinIcon = ({ size = 14, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const BookmarkIcon = ({ size = 20, color = COLORS.white, strokeWidth = 1.8, filled = false }: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const StarIcon = ({ size = 14, color = COLORS.gold, filled = true }: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const HeartIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8, filled = false }: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CommentIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const EyeIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const ChevronDownIcon = ({ size = 16, color = COLORS.white, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="6 9 12 15 18 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronUpIcon = ({ size = 16, color = COLORS.white, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="18 15 12 9 6 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronRightIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PlusIcon = ({ size = 16, color = COLORS.white, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const XIcon = ({ size = 14, color = COLORS.white, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const BackArrowIcon = ({ size = 24, color = COLORS.white, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 19l-7-7 7-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ShareIcon = ({ size = 24, color = COLORS.white, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 6 12 2 8 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="2" x2="12" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const DotsIcon = ({ size = 24, color = COLORS.white }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="1.5" fill={color} />
    <Circle cx="19" cy="12" r="1.5" fill={color} />
    <Circle cx="5" cy="12" r="1.5" fill={color} />
  </Svg>
);

export const FilterSlidersIcon = ({ size = 20, color = COLORS.white, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="21" x2="4" y2="14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4" y1="10" x2="4" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="21" x2="12" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="8" x2="12" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="20" y1="21" x2="20" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="20" y1="12" x2="20" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="1" y1="14" x2="7" y2="14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="9" y1="8" x2="15" y2="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="17" y1="16" x2="23" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const RefreshIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="23 4 23 10 17 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="1 20 1 14 7 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ShieldCheckIcon = ({ size = 18, color = COLORS.gold, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LockIcon = ({ size = 18, color = COLORS.gold, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const CheckCircleIcon = ({ size = 22, color = COLORS.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Circle cx="12" cy="12" r="12" fill={color} />
    <Polyline points="7 12 10 15 17 9" stroke={COLORS.black} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const HomeTabIcon = ({ size = 24, color = COLORS.gray, active = false }: IconProps & { active?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={active ? COLORS.black : color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const StarTabIcon = ({ size = 24, color = COLORS.gray, active = false }: IconProps & { active?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'}>
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const HandshakeIcon = ({ size = 24, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16 11l2 2-6 6-4-4 6-6 2 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 7L5 11l2 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13 5l2 2-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 3l4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M17 13l4-4-4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ShoppingBagIcon = ({ size = 24, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PersonIcon = ({ size = 24, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const RegionIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const GenreIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const BodyPartIconSvg = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM7 10l1 12h8l1-12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SubjectIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const WonIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4l4 12 4-8 4 8 4-12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="3" y1="11" x2="21" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const MatchingIcon = ({
  size = 24,
  color = COLORS.gray,
  strokeWidth = 1.8,
  active = false,
}: IconProps & { active?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'}>
    <Path
      d="M12 21C12 21 4 16 4 10a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 6-8 11-8 11z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowRightIcon = ({ size = 18, color = COLORS.white, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M12 5l7 7-7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CheckboxIcon = ({
  size = 22,
  checked = false,
}: {
  size?: number;
  checked?: boolean;
}) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    {checked ? (
      <>
        <Rect x="1" y="1" width="20" height="20" rx="5" fill={COLORS.gold} />
        <Polyline
          points="5.5 11 9 14.5 16.5 7"
          stroke={COLORS.black}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <Rect
        x="1"
        y="1"
        width="20"
        height="20"
        rx="5"
        stroke={COLORS.gray3}
        strokeWidth="1.5"
      />
    )}
  </Svg>
);

export const CameraAddIcon = ({ size = 36, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <Path
      d="M5 12h2.5l2.5-4h12l2.5 4H27a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="16" cy="20" r="4.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="28" y1="4" x2="28" y2="11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="24.5" y1="7.5" x2="31.5" y2="7.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const CalendarIcon = ({ size = 18, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ClockIcon = ({ size = 18, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const AreaIcon = ({ size = 14, color = COLORS.gray, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth={strokeWidth} strokeDasharray="2 3" />
    <Line x1="12" y1="3" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth} strokeDasharray="2 3" />
  </Svg>
);

export const BedIcon = ({ size = 14, color = COLORS.gray, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 17V6M22 17v-5a3 3 0 0 0-3-3H10v8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 14h20M2 20v-3M22 20v-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="6" cy="11" r="2" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const LightIcon = ({ size = 14, color = COLORS.gray, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c1 1 1 2 1 3v1h6v-1c0-1 0-2 1-3a7 7 0 0 0-4-12z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const DoorIcon = ({ size = 14, color = COLORS.gray, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="3" y1="21" x2="21" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="13" cy="12" r="1" fill={color} />
  </Svg>
);

export const PeopleIcon = ({ size = 14, color = COLORS.gray, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const StoreIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l2-5h14l2 5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FolderIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ListIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="8" y1="6" x2="20" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8" y1="12" x2="20" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8" y1="18" x2="20" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="4" cy="6" r="1" fill={color} />
    <Circle cx="4" cy="12" r="1" fill={color} />
    <Circle cx="4" cy="18" r="1" fill={color} />
  </Svg>
);

export const PaletteTabIcon = ({ size = 24, color = COLORS.gray, active = false }: IconProps & { active?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'}>
    <Path
      d="M12 3a9 9 0 0 0 0 18c1 0 1.5-.8 1.5-1.5 0-.4-.2-.7-.4-1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Circle cx="7.5" cy="10.5" r="1.2" fill={color} />
    <Circle cx="12" cy="7.5" r="1.2" fill={color} />
    <Circle cx="16.5" cy="10.5" r="1.2" fill={color} />
  </Svg>
);

export const PaletteIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3a9 9 0 0 0 0 18c1 0 1.5-.8 1.5-1.5 0-.4-.2-.7-.4-1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Circle cx="7.5" cy="10.5" r="1.2" fill={color} />
    <Circle cx="12" cy="7.5" r="1.2" fill={color} />
    <Circle cx="16.5" cy="10.5" r="1.2" fill={color} />
  </Svg>
);

export const CrownIcon = ({ size = 16, color = COLORS.gold, strokeWidth = 1.6 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 8l4 4 5-7 5 7 4-4-2 12H5L3 8z"
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Circle cx="3" cy="8" r="1.3" fill={color} />
    <Circle cx="12" cy="5" r="1.3" fill={color} />
    <Circle cx="21" cy="8" r="1.3" fill={color} />
  </Svg>
);

export const TagIcon = ({ size = 14, color = COLORS.gray, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="7" cy="7" r="1.3" fill={color} />
  </Svg>
);

export const BarChartIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="6" y1="20" x2="6" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="20" x2="12" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="18" y1="20" x2="18" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="3" y1="21" x2="21" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ChatBubbleIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12a8 8 0 0 1-8 8H8l-5 3v-4.5A8 8 0 1 1 21 12z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8.5" cy="12" r="1" fill={color} />
    <Circle cx="12" cy="12" r="1" fill={color} />
    <Circle cx="15.5" cy="12" r="1" fill={color} />
  </Svg>
);

export const EditPenIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 20h4l10-10-4-4L4 16v4z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="14" y1="6" x2="18" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const GearIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserOutlineIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const VerifiedBadgeIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1l2.6 2.1 3.3-.4 1.4 3 3 1.4-.4 3.3L24 12l-2.1 2.6.4 3.3-3 1.4-1.4 3-3.3-.4L12 24l-2.6-2.1-3.3.4-1.4-3-3-1.4.4-3.3L0 12l2.1-2.6-.4-3.3 3-1.4 1.4-3 3.3.4z"
      fill={COLORS.gold}
    />
    <Polyline
      points="7.5 12 10.5 15 16.5 9"
      stroke={COLORS.black}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PlayCircleIcon = ({ size = 32, color = COLORS.white }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx="20" cy="20" r="18" fill="rgba(0,0,0,0.55)" stroke={color} strokeWidth="1.6" />
    <Polygon points="16,13 16,27 28,20" fill={color} />
  </Svg>
);

export const InstagramIcon = ({ size = 16, color = COLORS.white, strokeWidth = 1.6 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="17.5" cy="6.5" r="1" fill={color} />
  </Svg>
);

export const InfoIcon = ({ size = 14, color = COLORS.gray, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="11" x2="12" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="7.5" r="1" fill={color} />
  </Svg>
);

export const ImageMountainIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="9" cy="9" r="1.8" stroke={color} strokeWidth={strokeWidth} />
    <Path d="m21 15-4-4-6 6-3-3-5 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const VideoFilmIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="14" height="12" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Polygon points="17,10 22,7 22,17 17,14" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
  </Svg>
);

export const CameraSolidIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 9h2l2-3h8l2 3h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <Circle cx="12" cy="14" r="3.5" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const VideoCameraIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="14" height="10" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Polygon points="16,10 22,6 22,18 16,14" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <Circle cx="6.5" cy="11.5" r="1" fill={color} />
  </Svg>
);

export const ClockOutlineIcon = ({ size = 14, color = COLORS.gold, strokeWidth = 1.6 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const StackIcon = ({ size = 14, color = COLORS.gold, strokeWidth = 1.6 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="12,3 22,8 12,13 2,8" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <Path d="M2 13l10 5 10-5M2 18l10 5 10-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const WarningTriangleIcon = ({ size = 18, color = COLORS.gold, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="17" r="0.9" fill={color} />
  </Svg>
);

export const CopyIcon = ({ size = 18, color = COLORS.black, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PenIcon = ({ size = 20, color = COLORS.black, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 20h9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const TattooPlaceholderIcon = ({ size = 60, color = '#3a3a3a' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <Circle cx="30" cy="20" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 52c0-10 8-18 18-18s18 8 18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M22 40l-4 8M38 40l4 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const PersonSilhouette = ({ size = 60, color = '#3a3a3a' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <Circle cx="30" cy="22" r="11" fill={color} />
    <Path d="M10 56c0-11 9-20 20-20s20 9 20 20" fill={color} />
  </Svg>
);

export const HeadNeckIcon = ({ size = 20, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ArmFlexIcon = ({ size = 20, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 4v6a4 4 0 0 0 4 4h3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13 14a5 5 0 0 1 5 5v1H9v-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 4h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const TorsoIcon = ({ size = 20, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 3l4 2 4-2 3 3-2 3v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9L5 6z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BackIcon = ({ size = 20, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 3l4 2 4-2 3 3-2 3v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9L5 6z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="7" x2="12" y2="20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const LegFootIcon = ({ size = 20, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 3h6l-1 9-1 5H11l-1-5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M11 17l-1 3h5l-1-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SpecialIcon = ({ size = 20, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const RootsPickBadge = ({ size = 72 }: { size?: number }) => {
  /*
   * viewBox 100x100, center 50,50
   * ROOT'S PICK 는 상단 아치 곡선(반경 ~36)을 따라 배치
   * 좌·우 대칭으로 laurel 잎 5쌍
   * 하단 중앙에 큰 별
   */
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* 상단 아치 path — 좌측 25,60 → 상단을 지나 우측 75,60. 반원. */}
        <Path
          id="rp-arc"
          d="M 20 55 A 30 30 0 0 1 80 55"
          fill="none"
        />
      </Defs>

      {/* Outer circle */}
      <Circle cx="50" cy="50" r="46" stroke={COLORS.gold} strokeWidth="1.6" fill="none" />

      {/* ROOT'S PICK on the arc */}
      <SvgText
        fill={COLORS.gold}
        fontSize="9"
        fontWeight="bold"
        letterSpacing="2.5"
      >
        <TextPath href="#rp-arc" startOffset="50%" textAnchor="middle">
          ROOT&apos;S PICK
        </TextPath>
      </SvgText>

      {/* ── Laurel wreath (양쪽 대칭, 아래로 뻗어 별 감쌈) ── */}
      {/* Left branch: base at bottom center → curves up-left */}
      <G>
        <Path d="M50 82 Q38 78 26 68" stroke={COLORS.gold} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* leaves on left branch */}
        <Path d="M44 82 Q40 76 35 76 Q40 79 43 82 Z" fill={COLORS.gold} />
        <Path d="M39 79 Q34 74 29 75 Q34 77 37 80 Z" fill={COLORS.gold} />
        <Path d="M34 75 Q29 71 24 73 Q29 74 32 77 Z" fill={COLORS.gold} />
        <Path d="M30 70 Q26 66 22 68 Q26 69 28 72 Z" fill={COLORS.gold} />
        <Path d="M27 65 Q24 61 21 63 Q24 64 26 67 Z" fill={COLORS.gold} />
      </G>

      {/* Right branch (mirror) */}
      <G>
        <Path d="M50 82 Q62 78 74 68" stroke={COLORS.gold} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Path d="M56 82 Q60 76 65 76 Q60 79 57 82 Z" fill={COLORS.gold} />
        <Path d="M61 79 Q66 74 71 75 Q66 77 63 80 Z" fill={COLORS.gold} />
        <Path d="M66 75 Q71 71 76 73 Q71 74 68 77 Z" fill={COLORS.gold} />
        <Path d="M70 70 Q74 66 78 68 Q74 69 72 72 Z" fill={COLORS.gold} />
        <Path d="M73 65 Q76 61 79 63 Q76 64 74 67 Z" fill={COLORS.gold} />
      </G>

      {/* Center star */}
      <Polygon
        points="50,54 53.1,63 62.5,63 55,68.5 57.6,77.5 50,72 42.4,77.5 45,68.5 37.5,63 46.9,63"
        fill={COLORS.gold}
      />
    </Svg>
  );
};

export const CheckIcon = ({ size = 18, color = COLORS.gold, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="20 6 9 17 4 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MailIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3" y="5" width="18" height="14" rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Polyline
      points="3 7 12 13 21 7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PhoneIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="6" y="2" width="12" height="20" rx="2.5"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Line
      x1="11" y1="18" x2="13" y2="18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const MenuIcon = ({ size = 24, color = COLORS.white, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const SlidersIcon = ({ size = 18, color = COLORS.white, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="9" cy="7" r="2.6" fill={COLORS.bg} stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="16" cy="17" r="2.6" fill={COLORS.bg} stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const ChevronLeftIcon = ({ size = 16, color = COLORS.gray, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="15 6 9 12 15 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CalendarPlusIcon = ({ size = 24, color = COLORS.black, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="16" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="8" y1="3" x2="8" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="16" y1="3" x2="16" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="13" x2="12" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="9.5" y1="15.5" x2="14.5" y2="15.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const HelpCircleIcon = ({ size = 18, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M9.2 9.2c.4-1.4 1.6-2.2 3-2.2 1.7 0 3 1.2 3 2.7 0 1.7-2 2-3 3.3v.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="17" r="0.9" fill={color} />
  </Svg>
);

export const AlertInfoIcon = ({ size = 20, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="7.5" x2="12" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="16.5" r="0.9" fill={color} />
  </Svg>
);

export const WalletIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="14" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M3 9V7.5C3 6.7 3.7 6 4.5 6H18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Circle cx="16.5" cy="13" r="1.4" fill={color} />
  </Svg>
);

export const DotsVerticalIcon = ({ size = 18, color = COLORS.gray, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.5" fill={color} />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
    <Circle cx="12" cy="19" r="1.5" fill={color} />
  </Svg>
);

export const UserPlusIcon = ({ size = 24, color = COLORS.black, strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="10" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M2 21c0-4.5 3.5-8 8-8s8 3.5 8 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Line x1="19" y1="6" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="16" y1="9" x2="22" y2="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const GlobeIcon = ({ size = 22, color = COLORS.gold, strokeWidth = 1.7 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="3.2" y1="9.2" x2="20.8" y2="9.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="3.2" y1="14.8" x2="20.8" y2="14.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// Selected Master 크라운 (텍스트 라벨 앞에 붙는 작은 심볼)
export const MasterCrownIcon = ({ size = 12, color = COLORS.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.5 7.5 L7 11 L12 4 L17 11 L21.5 7.5 L19.5 19 H4.5 L2.5 7.5 Z"
      fill={color}
      stroke={color}
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
    <Line x1="4.5" y1="19" x2="19.5" y2="19" stroke={COLORS.black} strokeWidth={1.4} strokeLinecap="round" />
    <Circle cx="2.5" cy="7.5" r="1.4" fill={color} />
    <Circle cx="12" cy="4" r="1.4" fill={color} />
    <Circle cx="21.5" cy="7.5" r="1.4" fill={color} />
  </Svg>
);

// Selected Master 원형 엠블럼 씰 (카드 코너용 · 월계관 + 크라운)
export const SelectedMasterSeal = ({ size = 30 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* 씰 배경 + 이중 링 */}
    <Circle cx="24" cy="24" r="22.2" fill="#141210" stroke={COLORS.gold} strokeWidth={1.6} />
    <Circle cx="24" cy="24" r="18.6" fill="none" stroke="rgba(212,168,67,0.5)" strokeWidth={0.9} />
    {/* 월계관 좌 */}
    <Path d="M15.5 34 C 9.5 30, 9.5 21.5, 13.5 16.5" stroke={COLORS.gold} strokeWidth={1.3} strokeLinecap="round" fill="none" />
    <Path d="M12.6 20 q -2.4 0.4 -3.2 2.6 q 2.3 0.3 3.4 -1.3 Z" fill={COLORS.gold} />
    <Path d="M11.8 24.4 q -2.3 0.7 -2.8 3 q 2.3 0 3.1 -1.8 Z" fill={COLORS.gold} />
    <Path d="M12.4 28.8 q -2 1 -2.1 3.3 q 2.2 -0.4 2.6 -2.4 Z" fill={COLORS.gold} />
    {/* 월계관 우 */}
    <Path d="M32.5 34 C 38.5 30, 38.5 21.5, 34.5 16.5" stroke={COLORS.gold} strokeWidth={1.3} strokeLinecap="round" fill="none" />
    <Path d="M35.4 20 q 2.4 0.4 3.2 2.6 q -2.3 0.3 -3.4 -1.3 Z" fill={COLORS.gold} />
    <Path d="M36.2 24.4 q 2.3 0.7 2.8 3 q -2.3 0 -3.1 -1.8 Z" fill={COLORS.gold} />
    <Path d="M35.6 28.8 q 2 1 2.1 3.3 q -2.2 -0.4 -2.6 -2.4 Z" fill={COLORS.gold} />
    {/* 크라운 */}
    <Path
      d="M16 25 L19.5 28 L24 21 L28.5 28 L32 25 L30.2 33.5 H17.8 L16 25 Z"
      fill={COLORS.gold}
      strokeLinejoin="round"
    />
    <Line x1="17.8" y1="33.5" x2="30.2" y2="33.5" stroke="#141210" strokeWidth={1.3} strokeLinecap="round" />
    {/* 상단 별 */}
    <Polygon
      points="24,9.5 25.15,12.55 28.4,12.7 25.85,14.75 26.75,17.9 24,16.05 21.25,17.9 22.15,14.75 19.6,12.7 22.85,12.55"
      fill={COLORS.gold}
    />
  </Svg>
);

