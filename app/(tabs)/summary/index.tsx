import { CustomRangePicker, type CustomRange } from '@/components/CustomRangePicker';
import { EmptyState } from '@/components/EmptyState';
import { GranularitySegmentedControl } from '@/components/GranularitySegmentedControl';
import { SummaryLanguageToggle } from '@/components/SummaryLanguageToggle';
import { SummaryPeriodCard } from '@/components/SummaryPeriodCard';
import { Eyebrow } from '@/components/Eyebrow';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  currentPeriodKey,
  customPeriodKey,
  historyFloorKey,
  periodBounds,
  periodKeysBetween,
  periodLabel,
  type ExtendedPeriodType,
  type PeriodType,
} from '@/lib/dates/periods';
import { firstEntryDayKey } from '@/lib/db/entries';
import { useTranslation } from '@/lib/i18n';
import { formatShortDate } from '@/lib/i18n/format';
import { useSummaryFilterStore } from '@/lib/stores/summaryFilterStore';
import { useSummaryLanguageStore } from '@/lib/stores/summaryLanguageStore';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CalendarRangeIcon, XIcon } from 'lucide-react-native';
import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** How many of the newest periods auto-generate on mount; older ones need a manual "Generate summary" tap. */
const EAGER_WINDOW = 5;

type SummaryItem = { type: ExtendedPeriodType; key: string };

export default function SummaryScreen() {
  const { t, lang } = useTranslation();
  const granularity = useSummaryFilterStore((s) => s.granularity);
  const setGranularity = useSummaryFilterStore((s) => s.setGranularity);

  const storedSummaryLanguage = useSummaryLanguageStore((s) => s.language);
  const setSummaryLanguage = useSummaryLanguageStore((s) => s.setLanguage);
  const summaryLanguage = storedSummaryLanguage ?? lang;

  const [customRange, setCustomRange] = React.useState<CustomRange | null>(null);
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [floorDayKey, setFloorDayKey] = React.useState<string | null>(() => firstEntryDayKey());

  useFocusEffect(
    React.useCallback(() => {
      setFloorDayKey(firstEntryDayKey());
    }, [])
  );

  const effectiveKey: string = customRange
    ? customPeriodKey(customRange.start, customRange.end)
    : currentPeriodKey(granularity);

  function handleGranularityChange(next: PeriodType) {
    setCustomRange(null);
    setGranularity(next);
  }

  const items: SummaryItem[] = React.useMemo(() => {
    if (customRange) {
      return [{ type: 'custom', key: effectiveKey }];
    }
    if (!floorDayKey) return [];
    const floorKey = historyFloorKey(granularity, floorDayKey);
    const keys = periodKeysBetween(granularity, currentPeriodKey(granularity), floorKey);
    return keys.map((key) => ({ type: granularity, key }));
  }, [customRange, effectiveKey, floorDayKey, granularity]);

  const insets = useSafeAreaInsets();

  const rangeLabel = React.useMemo(() => {
    if (customRange || !floorDayKey) return null;
    const firstDate = periodBounds('day', floorDayKey).start;
    return `${formatShortDate(firstDate, lang)} – ${t('summary.rangeToday')}`;
  }, [customRange, floorDayKey, lang, t]);

  return (
    <View className="flex-1">
      <View
        className="gap-4 border-b border-border"
        style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text variant="h1" className="text-left text-3xl">
          {t('summary.title')}
        </Text>

        {rangeLabel ? <Eyebrow>{rangeLabel}</Eyebrow> : null}

        <View className="flex-row items-center gap-2">
          {customRange ? (
            <View className="flex-1 flex-row items-center justify-between rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5">
              <Text className="text-sm font-medium text-primary" numberOfLines={1}>
                {periodLabel('custom', effectiveKey, lang)}
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCustomRange(null);
                }}
                className="p-1">
                <Icon as={XIcon} size={16} className="text-primary" />
              </Pressable>
            </View>
          ) : (
            <View className="flex-1">
              <GranularitySegmentedControl value={granularity} onChange={handleGranularityChange} />
            </View>
          )}
          <Pressable
            onPress={() => setPickerVisible(true)}
            className="h-10 w-10 items-center justify-center rounded-full border border-border active:bg-muted">
            <Icon as={CalendarRangeIcon} size={18} className="text-muted-foreground" />
          </Pressable>
        </View>

        <View className="gap-2">
          <Eyebrow>{t('summary.language')}</Eyebrow>
          <SummaryLanguageToggle value={summaryLanguage} standard={lang} onChange={setSummaryLanguage} />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.type}:${item.key}`}
        renderItem={({ item, index }) => (
          <SummaryPeriodCard
            type={item.type}
            periodKey={item.key}
            lang={lang}
            summaryLanguage={summaryLanguage}
            eager={index < EAGER_WINDOW}
          />
        )}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 60, flexGrow: 1 }}
        initialNumToRender={EAGER_WINDOW + 2}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState title={t('summary.emptyTitle')} description={t('summary.emptyDescription')} />
        }
      />

      <CustomRangePicker
        visible={pickerVisible}
        initialRange={customRange}
        onApply={(range) => {
          setCustomRange(range);
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}
