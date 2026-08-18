import { EmptyState } from '@/components/EmptyState';
import { Eyebrow } from '@/components/Eyebrow';
import { SummarySkeleton } from '@/components/SummarySkeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getSummaryForPeriod, type SummaryResult } from '@/lib/ai/summarize';
import {
  periodEyebrowKey,
  periodLabel,
  type ExtendedPeriodType,
  type PeriodType,
} from '@/lib/dates/periods';
import { useTranslation, type AppLanguage } from '@/lib/i18n';
import { formatTimestamp } from '@/lib/i18n/format';
import * as Haptics from 'expo-haptics';
import { RefreshCwIcon, SparklesIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

type CardStatus = 'loading' | 'ready' | 'empty' | 'error' | 'uncached';

export function SummaryPeriodCard({
  type,
  periodKey,
  lang,
  summaryLanguage,
  eager,
}: {
  type: ExtendedPeriodType;
  periodKey: string;
  lang: AppLanguage;
  /** The language AI summaries should be generated in — independent from the UI language. */
  summaryLanguage: AppLanguage;
  /** Eager items auto-generate on mount; the rest only show a cached result or a manual "Generate" prompt. */
  eager: boolean;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = React.useState<CardStatus>('loading');
  const [result, setResult] = React.useState<SummaryResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const fetchNow = React.useCallback(
    async (options: { force?: boolean; dryRun?: boolean } = {}) => {
      setStatus('loading');
      try {
        const summary = options.dryRun
          ? await getSummaryForPeriod(type, periodKey, summaryLanguage, { dryRun: true })
          : await getSummaryForPeriod(type, periodKey, summaryLanguage, { force: options.force });
        if (summary === null) {
          setStatus('uncached');
          return;
        }
        setResult(summary);
        setStatus(summary.entryCount === 0 ? 'empty' : 'ready');
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Something went wrong generating this summary.'
        );
        setStatus('error');
      }
    },
    [type, periodKey, summaryLanguage]
  );

  React.useEffect(() => {
    fetchNow({ dryRun: !eager });
  }, [fetchNow, eager]);

  function handleGenerate() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchNow();
  }

  function handleRegenerate() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchNow({ force: true });
  }

  const busy = status === 'loading';
  const eyebrowKey = type === 'custom' ? null : periodEyebrowKey(type as PeriodType, periodKey);
  const label = periodLabel(type, periodKey, lang);
  const showRegenerateIcon = status === 'ready' && result && !result.isFinal;

  return (
    <View className="gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-base font-semibold" numberOfLines={1}>
            {label}
          </Text>
          {eyebrowKey ? <Eyebrow>{t(`eyebrow.${eyebrowKey}`)}</Eyebrow> : null}
        </View>
        {showRegenerateIcon ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onPress={handleRegenerate}
            disabled={busy}>
            <Icon as={RefreshCwIcon} size={16} />
          </Button>
        ) : null}
      </View>

      {status === 'ready' && result ? (
        <Text className="text-[11px] text-muted-foreground/70">
          {result.source === 'ai' ? t('summary.aiTag') : t('summary.basicTag')} ·{' '}
          {formatTimestamp(new Date(result.generatedAt), lang)}
        </Text>
      ) : null}

      {busy ? <SummarySkeleton /> : null}

      {status === 'empty' ? (
        <EmptyState
          title={t('summary.emptyTitle')}
          description={t('summary.emptyDescription')}
          className="py-4"
        />
      ) : null}

      {status === 'uncached' ? (
        <View className="gap-3">
          <Text className="text-sm text-muted-foreground">{t('summary.notGenerated')}</Text>
          <Button variant="outline" onPress={handleGenerate}>
            <Icon as={SparklesIcon} />
            <Text>{t('summary.generate')}</Text>
          </Button>
        </View>
      ) : null}

      {status === 'error' ? (
        <View className="gap-3">
          <Text className="text-sm text-muted-foreground">{errorMessage}</Text>
          <Button variant="outline" onPress={() => fetchNow({ dryRun: !eager })}>
            <Icon as={RefreshCwIcon} />
            <Text>{t('summary.errorRetry')}</Text>
          </Button>
        </View>
      ) : null}

      {status === 'ready' && result && result.bullets.length > 0 ? (
        <View className="gap-3">
          {result.bullets.map((bullet, index) => (
            <View key={index} className="flex-row gap-3">
              <View className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <Text className="flex-1 text-base leading-relaxed">{bullet}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
