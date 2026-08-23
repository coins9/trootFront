import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS } from '../../../theme/colors';
import { CalendarIcon, ClockIcon } from '../../icons';
import { TIME_SLOTS } from '../../../../domain/entities/bookingTypes';
import { useTranslation } from '../../../store/languageStore';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘',
};

LocaleConfig.locales['en'] = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'ko';

const CALENDAR_THEME = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  textSectionTitleColor: COLORS.gray,
  selectedDayBackgroundColor: COLORS.gold,
  selectedDayTextColor: COLORS.black,
  todayTextColor: COLORS.gold,
  todayBackgroundColor: 'transparent',
  dayTextColor: COLORS.white,
  textDisabledColor: COLORS.gray3,
  dotColor: COLORS.gold,
  selectedDotColor: COLORS.black,
  arrowColor: COLORS.gold,
  disabledArrowColor: COLORS.gray3,
  monthTextColor: COLORS.white,
  indicatorColor: COLORS.gold,
  textDayFontSize: 14,
  textMonthFontSize: 15,
  textDayHeaderFontSize: 12,
  textDayFontWeight: '400' as const,
  textMonthFontWeight: '700' as const,
  textDayHeaderFontWeight: '600' as const,
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: 8,
    },
  },
};

interface DatePickerStepProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const TODAY = new Date().toISOString().split('T')[0];

const TimeChip = memo(({
  slot, selected, onPress,
}: { slot: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.timeChip, selected && styles.timeChipActive]}
  >
    <Text style={[styles.timeChipText, selected && styles.timeChipTextActive]}>
      {slot}
    </Text>
  </TouchableOpacity>
));

TimeChip.displayName = 'TimeChip';

const DatePickerStep = memo(({
  selectedDate, selectedTime, onDateChange, onTimeChange,
}: DatePickerStepProps) => {
  const { t, language } = useTranslation();
  LocaleConfig.defaultLocale = language;
  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: COLORS.gold, selectedTextColor: COLORS.black } }
    : {};

  const handleDayPress = useCallback(
    (day: { dateString: string }) => onDateChange(day.dateString),
    [onDateChange],
  );

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLeft}>
          <Text style={styles.sectionNum}>01</Text>
          <CalendarIcon size={16} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>{t('booking.steps.dateTitle')}</Text>
        </View>
        <Text style={styles.required}>{t('common.required')}</Text>
      </View>
      <Text style={styles.sectionSub}>{t('booking.steps.dateSub')}</Text>

      {/* Calendar */}
      <View style={styles.calendarWrapper}>
        <Calendar
          theme={CALENDAR_THEME}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          minDate={TODAY}
          enableSwipeMonths
          hideExtraDays
        />
      </View>

      {/* Time slots */}
      {selectedDate && (
        <View style={styles.timeSection}>
          <View style={styles.timeLabelRow}>
            <ClockIcon size={15} color={COLORS.gray} />
            <Text style={styles.timeLabel}>{t('booking.steps.dateTimeLabel')}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeSlotsRow}
          >
            {TIME_SLOTS.map((slot) => (
              <TimeChip
                key={slot}
                slot={slot}
                selected={selectedTime === slot}
                onPress={() => onTimeChange(slot)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
});

DatePickerStep.displayName = 'DatePickerStep';
export default DatePickerStep;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionNum: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  required: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionSub: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  calendarWrapper: {
    backgroundColor: COLORS.elevated,
    borderRadius: 14,
    overflow: 'hidden',
    paddingBottom: 4,
  },
  timeSection: {
    marginTop: 16,
  },
  timeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  timeLabel: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  timeSlotsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.elevated,
  },
  timeChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212,168,67,0.12)',
  },
  timeChipText: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 18,
  },
  timeChipTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
