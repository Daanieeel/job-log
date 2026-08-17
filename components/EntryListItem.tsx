import { Text } from '@/components/ui/text';
import { useTranslation } from '@/lib/i18n';
import { formatTime } from '@/lib/i18n/format';
import type { Entry } from '@/lib/db/entries';
import { View } from 'react-native';

export function EntryListItem({ entry }: { entry: Entry }) {
  const { lang } = useTranslation();

  return (
    <View className="flex-row gap-3 py-3">
      <Text className="w-16 pt-0.5 text-xs text-muted-foreground">
        {formatTime(new Date(entry.createdAt), lang)}
      </Text>
      <Text className="flex-1 text-base leading-snug">{entry.text}</Text>
    </View>
  );
}
