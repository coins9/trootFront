import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { useLanguageStore } from '../../store/languageStore';

interface Props { children: React.ReactNode }
interface State { hasError: boolean; message: string }

/**
 * 전역 에러 경계.
 * 어느 화면이든 렌더/라이프사이클에서 예외가 나도 앱 전체가 하얗게 멈추지(freeze) 않도록
 * 폴백 화면 + "다시 시도" 를 제공한다. (중첩 Modal/데이터 이상 등으로 인한 화면 크래시 방어)
 * + 원인 파악을 위해 실제 에러 메시지를 화면에 노출한다(사용자가 캡처해 전달 가능).
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: unknown): void {
    console.warn('[ErrorBoundary]', error, info);
  }

  private reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    const ko = useLanguageStore.getState().language === 'ko';
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{ko ? '일시적인 오류가 발생했어요' : 'Something went wrong'}</Text>
        <Text style={styles.desc}>
          {ko ? '잠시 후 다시 시도해 주세요.' : 'Please try again in a moment.'}
        </Text>
        {!!this.state.message && (
          <Text style={styles.code} numberOfLines={4} selectable>{this.state.message}</Text>
        )}
        <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.85}>
          <Text style={styles.btnText}>{ko ? '다시 시도' : 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default ErrorBoundary;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '800', lineHeight: 24, textAlign: 'center' },
  desc: { color: COLORS.gray, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 12 },
  code: {
    color: COLORS.gray2, fontSize: 11, lineHeight: 16, textAlign: 'center',
    marginBottom: 16, paddingHorizontal: 8,
  },
  btn: {
    backgroundColor: COLORS.gold, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14,
  },
  btnText: { color: COLORS.black, fontSize: 15, fontWeight: '800', lineHeight: 20 },
});
