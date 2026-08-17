import { Eyebrow } from '@/components/Eyebrow';
import { DayRow } from '@/components/DayRow';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n';
import { buildArchiveSections, type ArchiveSection } from '@/lib/dates/archive';
import { entryCountsByDay, firstEntryDayKey, listInRangeGroupedByDay, type Entry } from '@/lib/db/entries';
import { periodBounds } from '@/lib/dates/periods';
import { useArchiveViewStore } from '@/lib/stores/archiveViewStore';
import { startOfDay, subYears } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { SectionList, View } from 'react-native';

export default function ArchiveScreen() {
  const { lang } = useTranslation();
  const router = useRouter();
  const mode = useArchiveViewStore((s) => s.mode);
  const [sections, setSections] = React.useState<ArchiveSection[]>([]);
  const [entriesByDay, setEntriesByDay] = React.useState<Map<string, Entry[]>>(new Map());

  const refresh = React.useCallback(() => {
    const firstDayKey = firstEntryDayKey();
    setSections(buildArchiveSections(entryCountsByDay(), firstDayKey, lang));

    const todayStart = startOfDay(new Date());
    const start = firstDayKey ? periodBounds('day', firstDayKey).start : subYears(todayStart, 1);
    setEntriesByDay(listInRangeGroupedByDay(start.getTime(), todayStart.getTime() + 86400000));
  }, [lang]);

  useFocusEffect(refresh);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.dayKey}
      contentContainerStyle={{ paddingBottom: 40 }}
      stickySectionHeadersEnabled
      renderSectionHeader={({ section }) => (
        <View className="bg-background px-4 pb-2 pt-4">
          <Eyebrow>{section.title}</Eyebrow>
        </View>
      )}
      renderItem={({ item }) => (
        <DayRow
          dayKey={item.dayKey}
          count={item.count}
          mode={mode}
          entries={entriesByDay.get(item.dayKey)}
          onPress={() => router.push(`/archive/${item.dayKey}`)}
        />
      )}
      ItemSeparatorComponent={mode === 'compact' ? Separator : undefined}
    />
  );
}
