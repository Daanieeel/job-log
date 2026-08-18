import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme/tokens';
import { searchEntries, type Entry } from '@/lib/db/entries';
import { useTranslation } from '@/lib/i18n';
import { formatTimestamp } from '@/lib/i18n/format';
import { useRouter } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';

export default function SearchScreen() {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const [query, setQuery] = React.useState('');

  const results: Entry[] = React.useMemo(() => searchEntries(query), [query]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pb-3 pt-4">
        <View className="flex-row items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5">
          <Icon as={SearchIcon} size={16} className="text-muted-foreground" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={theme.mutedForeground}
            className="flex-1 text-base text-foreground"
          />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/archive/${item.dayKey}`)}
            className="gap-1 py-3 active:opacity-60">
            <Text className="text-base leading-snug">{item.text}</Text>
            <Text className="text-xs text-muted-foreground">
              {formatTimestamp(new Date(item.createdAt), lang)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            title={query.trim() ? t('search.emptyTitle') : t('search.promptTitle')}
            description={query.trim() ? t('search.emptyDescription') : t('search.promptDescription')}
          />
        }
      />
    </View>
  );
}
