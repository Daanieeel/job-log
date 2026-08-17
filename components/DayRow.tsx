import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { ArchiveViewMode } from '@/lib/stores/archiveViewStore';
import { useTranslation } from '@/lib/i18n';
import { periodBounds } from '@/lib/dates/periods';
import type { Entry } from '@/lib/db/entries';
import { cn } from '@/lib/utils';
import { format, isToday } from 'date-fns';
import { ChevronRightIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

const EXTENDED_PREVIEW_COUNT = 3;

export function DayRow({
  dayKey,
  count,
  mode,
  entries,
  onPress,
}: {
  dayKey: string;
  count: number;
  mode: ArchiveViewMode;
  entries?: Entry[];
  onPress: () => void;
}) {
  const { t, dateLocale } = useTranslation();
  const date = periodBounds('day', dayKey).start;
  const hasEntries = count > 0;
  const extended = mode === 'extended';

  const dayLabel = isToday(date) ? t('archive.today') : format(date, 'EEEE d', { locale: dateLocale });

  if (!extended) {
    return (
      <Pressable
        onPress={onPress}
        className={cn(
          'flex-row items-center justify-between px-4 py-3 active:bg-accent/10',
          !hasEntries && 'opacity-40'
        )}>
        <Text className="text-base font-medium">{dayLabel}</Text>
        <View className="flex-row items-center gap-2">
          {hasEntries ? (
            <Badge variant="secondary">
              <Text>{count}</Text>
            </Badge>
          ) : null}
          <Icon as={ChevronRightIcon} size={16} className="text-muted-foreground" />
        </View>
      </Pressable>
    );
  }

  const preview = entries?.slice(0, EXTENDED_PREVIEW_COUNT) ?? [];
  const remaining = count - preview.length;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mx-4 my-1.5 gap-2 rounded-2xl border border-border bg-card p-4 active:bg-accent/10',
        !hasEntries && 'opacity-40'
      )}>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold">{dayLabel}</Text>
        <Icon as={ChevronRightIcon} size={16} className="text-muted-foreground" />
      </View>
      {hasEntries ? (
        <View className="gap-1.5">
          {preview.map((entry) => (
            <View key={entry.id} className="flex-row items-start gap-2">
              <View className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <Text numberOfLines={1} className="flex-1 text-sm text-foreground/80">
                {entry.text}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-sm text-muted-foreground">{t('archive.dayEmptyTitle')}</Text>
      )}
      {remaining > 0 ? (
        <Badge variant="secondary" className="self-start">
          <Text>{t('archive.moreCount', { count: remaining })}</Text>
        </Badge>
      ) : null}
    </Pressable>
  );
}
