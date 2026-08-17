import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/lib/i18n';
import { formatTimestamp } from '@/lib/i18n/format';
import type { SummarySource } from '@/lib/db/summaries';
import { RefreshCwIcon } from 'lucide-react-native';
import { View } from 'react-native';

export function BulletSummary({
  bullets,
  source,
  generatedAt,
  isFinal,
  onRegenerate,
  regenerating,
}: {
  bullets: string[];
  source: SummarySource;
  generatedAt: number;
  isFinal: boolean;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  const { t, lang } = useTranslation();

  return (
    <View className="gap-5">
      <View className="flex-row items-center justify-between">
        <Badge variant={source === 'ai' ? 'default' : 'secondary'}>
          <Text>{source === 'ai' ? t('summary.aiTag') : t('summary.basicTag')}</Text>
        </Badge>
        <Text className="text-xs text-muted-foreground">
          {t('summary.generatedAt', { date: formatTimestamp(new Date(generatedAt), lang) })}
        </Text>
      </View>

      <View className="gap-3.5">
        {bullets.map((bullet, index) => (
          <View key={index} className="flex-row gap-3">
            <View className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <Text className="flex-1 text-base leading-relaxed">{bullet}</Text>
          </View>
        ))}
      </View>

      {!isFinal && onRegenerate ? (
        <Button variant="outline" onPress={onRegenerate} disabled={regenerating}>
          <Icon as={RefreshCwIcon} />
          <Text>{regenerating ? t('summary.regenerating') : t('summary.regenerate')}</Text>
        </Button>
      ) : null}
    </View>
  );
}
