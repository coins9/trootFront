import React, { useCallback } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

/** 숫자 문자열에 천 단위 콤마 삽입. 저장값(숫자)은 그대로 두고 표시만 포맷 */
export const formatThousands = (digits: string): string => {
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

interface Props extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  /** 콤마 없는 숫자 문자열 (실제 저장값) */
  value: string;
  /** 콤마·비숫자 제거된 순수 숫자 문자열을 돌려준다 */
  onChangeValue: (digits: string) => void;
}

/**
 * 금액 입력 공통 컴포넌트.
 * - 화면에는 "30,000,000" 처럼 천 단위 콤마로 표시
 * - 콜백으로는 "30000000" 처럼 숫자형 저장값을 전달 (저장은 숫자로 유지)
 */
const MoneyInput = ({ value, onChangeValue, ...rest }: Props) => {
  const handleChange = useCallback(
    (text: string) => onChangeValue(text.replace(/[^0-9]/g, '')),
    [onChangeValue],
  );
  return (
    <TextInput
      {...rest}
      value={formatThousands(value)}
      onChangeText={handleChange}
      keyboardType="numeric"
    />
  );
};

export default MoneyInput;
