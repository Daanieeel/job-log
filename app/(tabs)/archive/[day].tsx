import { EmptyState } from '@/components/EmptyState';
import { EntryListItem } from '@/components/EntryListItem';
import { QuickEntryBar } from '@/components/QuickEntryBar';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n';
import { createEntry, deleteEntry, listByDay, type Entry } from '@/lib/db/entries';
import { periodBounds, periodLabel } from '@/lib/dates/periods';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DayDetailScreen() {
  const { t, lang } = useTranslation();
  const insets = useSafeAreaInsets();
  const { day } = useLocalSearchParams<{ day: string }>();
  const [entries, setEntries] = React.useState<Entry[]>([]);

  const refresh = React.useCallback(() => {
    setEntries(listByDay(day));
  }, [day]);

  useFocusEffect(refresh);

  function handleAddEntry(text: string) {
    const dayStart = periodBounds('day', day).start;
    const now = new Date();
    const at = new Date(
      dayStart.getFullYear(),
      dayStart.getMonth(),
      dayStart.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );
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
      <Stack.Screen options={{ title: periodLabel('day', day, lang) }} />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        renderItem={({ item }) => <EntryListItem entry={item} onDelete={handleDelete} />}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <EmptyState title={t('archive.dayEmptyTitle')} description={t('archive.dayEmptyDescription')} />
        }
      />
      <View className="px-5 pt-3" style={{ paddingBottom: insets.bottom + 10 }}>
        <QuickEntryBar onSubmit={handleAddEntry} />
      </View>
    </KeyboardAvoidingView>
  );
}
