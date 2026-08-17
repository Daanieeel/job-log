import { BulletSummary } from '@/components/BulletSummary';
import { CustomRangePicker, type CustomRange } from '@/components/CustomRangePicker';
import { EmptyState } from '@/components/EmptyState';
import { GranularitySegmentedControl } from '@/components/GranularitySegmentedControl';
import { Eyebrow } from '@/components/Eyebrow';
import { PeriodStepper } from '@/components/PeriodStepper';
import { SummaryLanguageToggle } from '@/components/SummaryLanguageToggle';
import { SummarySkeleton } from '@/components/SummarySkeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { getSummaryForPeriod, type SummaryResult } from '@/lib/ai/summarize';
import {
  customPeriodKey,
  periodBounds,
  periodLabel,
  type ExtendedPeriodType,
  type PeriodType,
} from '@/lib/dates/periods';
import { countByRange } from '@/lib/db/entries';
import { useTranslation } from '@/lib/i18n';
import { useSummaryFilterStore } from '@/lib/stores/summaryFilterStore';
import { useSummaryLanguageStore } from '@/lib/stores/summaryLanguageStore';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CalendarRangeIcon, RefreshCwIcon, XIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Status = 'loading' | 'empty' | 'error' | 'ready';

export default function SummaryScreen() {
  const { t, lang } = useTranslation();
  const granularity = useSummaryFilterStore((s) => s.granularity);
  const periodKey = useSummaryFilterStore((s) => s.periodKeyByGranularity[granularity]);
  const setGranularity = useSummaryFilterStore((s) => s.setGranularity);
  const step = useSummaryFilterStore((s) => s.step);

  const storedSummaryLanguage = useSummaryLanguageStore((s) => s.language);
  const setSummaryLanguage = useSummaryLanguageStore((s) => s.setLanguage);
  const summaryLanguage = storedSummaryLanguage ?? lang;

  const [customRange, setCustomRange] = React.useState<CustomRange | null>(null);
  const [pickerVisible, setPickerVisible] = React.useState(false);

  const effectiveType: ExtendedPeriodType = customRange ? 'custom' : granularity;
  const effectiveKey: string = customRange
    ? customPeriodKey(customRange.start, customRange.end)
    : periodKey;

  function handleGranularityChange(next: PeriodType) {
    setCustomRange(null);
    setGranularity(next);
  }

  const [status, setStatus] = React.useState<Status>('loading');
  const [result, setResult] = React.useState<SummaryResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [regenerating, setRegenerating] = React.useState(false);

  const load = React.useCallback(async () => {
    setStatus('loading');
    const bounds = periodBounds(effectiveType, effectiveKey);
    const liveCount = countByRange(bounds.start.getTime(), bounds.end.getTime());

    if (liveCount === 0) {
      setResult(null);
      setStatus('empty');
      return;
    }

    try {
      const summary = await getSummaryForPeriod(effectiveType, effectiveKey, summaryLanguage);
      setResult(summary);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong generating this summary.'
      );
      setStatus('error');
    }
  }, [effectiveType, effectiveKey, summaryLanguage]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  async function handleRegenerate() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRegenerating(true);
    try {
      const summary = await getSummaryForPeriod(effectiveType, effectiveKey, summaryLanguage, {
        force: true,
      });
      setResult(summary);
      setStatus('ready');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong generating this summary.'
      );
      setStatus('error');
    } finally {
      setRegenerating(false);
    }
  }

  const languageToggleDisabled = status === 'ready' && result?.source === 'basic';
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 24, paddingBottom: 60 }}>
        <GranularitySegmentedControl value={granularity} onChange={handleGranularityChange} />

        {customRange ? (
          <View className="flex-row items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
            <Text className="text-sm font-medium text-primary">
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
          <PeriodStepper type={granularity} periodKey={periodKey} onStep={step} />
        )}

        <Pressable
          onPress={() => setPickerVisible(true)}
          className="flex-row items-center justify-center gap-2 rounded-full border border-border py-2.5 active:bg-accent/10">
          <Icon as={CalendarRangeIcon} size={16} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">{t('summary.customRange')}</Text>
        </Pressable>

        <Separator />

        <View className="gap-2">
          <Eyebrow>{t('summary.language')}</Eyebrow>
          <SummaryLanguageToggle
            value={summaryLanguage}
            standard={lang}
            onChange={setSummaryLanguage}
            disabled={languageToggleDisabled}
          />
          {languageToggleDisabled ? (
            <Text className="text-xs text-muted-foreground">{t('summary.language.basicNote')}</Text>
          ) : null}
        </View>

        {status === 'loading' ? <SummarySkeleton /> : null}

        {status === 'empty' ? (
          <EmptyState title={t('summary.emptyTitle')} description={t('summary.emptyDescription')} />
        ) : null}

        {status === 'error' ? (
          <View className="gap-4">
            <Text className="text-sm text-muted-foreground">{errorMessage}</Text>
            <Button variant="outline" onPress={load}>
              <Icon as={RefreshCwIcon} />
              <Text>{t('summary.errorRetry')}</Text>
            </Button>
          </View>
        ) : null}

        {status === 'ready' && result ? (
          <BulletSummary
            bullets={result.bullets}
            source={result.source}
            generatedAt={result.generatedAt}
            isFinal={result.isFinal}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
          />
        ) : null}
      </ScrollView>

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
