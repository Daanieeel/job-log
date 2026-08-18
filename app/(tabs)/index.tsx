import { Eyebrow } from '@/components/Eyebrow';
import { EmptyState } from '@/components/EmptyState';
import { EntryComposer } from '@/components/EntryComposer';
import { EntryListItem } from '@/components/EntryListItem';
import { GlowBackground } from '@/components/GlowBackground';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/lib/i18n';
import { createEntry, dayKeyFor, deleteEntry, listByDay, type Entry } from '@/lib/db/entries';
import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import * as React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t, dateLocale } = useTranslation();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = React.useState<Entry[]>([]);

  const refresh = React.useCallback(() => {
    setEntries(listByDay(dayKeyFor(new Date())));
  }, []);

  useFocusEffect(refresh);

  function handleSubmit(text: string, at: Date) {
    createEntry(text, at);
    refresh();
  }

  function handleDelete(id: string) {
    deleteEntry(id);
    refresh();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GlowBackground className="absolute inset-x-0 bottom-0" />

      <View className="gap-1 px-5" style={{ paddingTop: insets.top + 16, paddingBottom: 12 }}>
        <Eyebrow>{format(new Date(), 'EEEE, MMM d', { locale: dateLocale })}</Eyebrow>
        <Text variant="h1" className="text-left text-4xl">
          {t('app.title')}
        </Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          entries.length > 0 ? (
            <View className="flex-row items-center justify-between pb-2">
              <Eyebrow>{t('home.today')}</Eyebrow>
              <Text className="text-xs text-muted-foreground">
                {t(entries.length === 1 ? 'home.entryCount.one' : 'home.entryCount.other', {
                  count: entries.length,
                })}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <EntryListItem entry={item} onDelete={handleDelete} />}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <EmptyState title={t('home.emptyTitle')} description={t('home.emptyDescription')} />
        }
      />

      <View className="px-5 pt-3" style={{ paddingBottom: insets.bottom + 10 }}>
        <EntryComposer onSubmit={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
