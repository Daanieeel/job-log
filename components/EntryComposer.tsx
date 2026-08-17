import { Eyebrow } from '@/components/Eyebrow';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/lib/i18n';
import { formatTimestamp } from '@/lib/i18n/format';
import { THEME } from '@/lib/theme/tokens';
import DateTimePicker from '@react-native-community/datetimepicker';
import { isToday } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { ArrowUpIcon, SettingsIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Modal, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function EntryComposer({ onSubmit }: { onSubmit: (text: string, at: Date) => void }) {
  const { t, lang } = useTranslation();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [text, setText] = React.useState('');
  const [selectedAt, setSelectedAt] = React.useState(() => new Date());
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState(selectedAt);

  const canSubmit = text.trim().length > 0;
  const backfilling = !isToday(selectedAt);

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(text.trim(), selectedAt);
    setText('');
    setSelectedAt(new Date());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function openPicker() {
    Haptics.selectionAsync();
    setDraftDate(selectedAt);
    setPickerOpen(true);
  }

  function confirmPicker() {
    setSelectedAt(draftDate);
    setPickerOpen(false);
  }

  return (
    <View className="gap-1.5">
      {backfilling ? (
        <Text className="px-1 text-xs text-primary">
          {t('home.loggingForDate', { date: formatTimestamp(selectedAt, lang) })}
        </Text>
      ) : null}

      <View className="flex-row items-end gap-2 rounded-full border border-border bg-card pl-2.5 pr-2 py-2 shadow-sm shadow-black/5">
        <Button variant="ghost" size="icon" className="rounded-full" onPress={openPicker}>
          <Icon as={SettingsIcon} size={18} className={backfilling ? 'text-primary' : undefined} />
        </Button>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('home.composerPlaceholder')}
          placeholderTextColor={theme.mutedForeground}
          multiline
          className="max-h-28 flex-1 px-1 py-2.5 text-sm text-foreground"
        />
        <Button size="icon" className="rounded-full" onPress={handleSubmit} disabled={!canSubmit}>
          <Icon as={ArrowUpIcon} />
        </Button>
      </View>

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}>
        <View
          className="flex-1 bg-background px-5"
          style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}>
          <Text variant="h3" className="pb-4 text-left">
            {t('home.datePickerTitle')}
          </Text>
          <DateTimePicker
            value={draftDate}
            mode="datetime"
            display="inline"
            themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
            accentColor={theme.primary}
            onValueChange={(_event, date) => setDraftDate(date)}
          />
          <View className="mt-auto gap-2 pt-4">
            <Button
              variant="outline"
              onPress={() => {
                setSelectedAt(new Date());
                setPickerOpen(false);
              }}>
              <Text>{t('home.datePickerReset')}</Text>
            </Button>
            <Button onPress={confirmPicker}>
              <Text>{t('home.datePickerDone')}</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
