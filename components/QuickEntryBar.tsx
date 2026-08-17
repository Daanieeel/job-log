import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/lib/i18n';
import { THEME } from '@/lib/theme/tokens';
import * as Haptics from 'expo-haptics';
import { ArrowUpIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { TextInput, View } from 'react-native';

/** Minimal composer bar for adding an entry to a specific (often historical) day. */
export function QuickEntryBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const [text, setText] = React.useState('');
  const canSubmit = text.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(text.trim());
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View className="flex-row items-end gap-1 rounded-full border border-border bg-card py-1.5 pl-4 pr-1.5 shadow-sm shadow-black/5">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('archive.addEntryPlaceholder')}
        placeholderTextColor={theme.mutedForeground}
        multiline
        className="max-h-24 flex-1 py-2 text-base text-foreground"
      />
      <Button size="icon" className="rounded-full" onPress={handleSubmit} disabled={!canSubmit}>
        <Icon as={ArrowUpIcon} />
      </Button>
    </View>
  );
}
