import { Eyebrow } from '@/components/Eyebrow';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { checkAvailability, type AvailabilityStatus } from '@/lib/ai/appleIntelligence';
import { clearAll, listAllForExport } from '@/lib/db/entries';
import { exportAllDataAsJson } from '@/lib/export/exportAll';
import { importAllDataFromJson } from '@/lib/export/importAll';
import { LANGUAGE_FLAG, useTranslation, type TranslationKey } from '@/lib/i18n';
import { formatTimestamp } from '@/lib/i18n/format';
import { useLanguageStore, type LanguagePreference } from '@/lib/stores/languageStore';
import { useThemeStore, type ThemePreference } from '@/lib/stores/themeStore';
import { cn } from '@/lib/utils';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  FileJsonIcon,
  FileUpIcon,
  InfoIcon,
  MoonIcon,
  Share2Icon,
  SparklesIcon,
  SunIcon,
  SunMoonIcon,
  Trash2Icon,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];
const LANGUAGE_OPTIONS: LanguagePreference[] = ['system', 'en', 'de'];

const THEME_ICON: Record<ThemePreference, typeof SunIcon> = {
  system: SunMoonIcon,
  light: SunIcon,
  dark: MoonIcon,
};

function languageOptionLabel(
  option: LanguagePreference,
  t: (key: TranslationKey) => string
): string {
  if (option === 'system') return t('settings.language.system');
  return `${LANGUAGE_FLAG[option]} ${t(`settings.language.${option}`)}`;
}

function AIStatusCard({ availability }: { availability: AvailabilityStatus | null }) {
  const { t } = useTranslation();
  const checking = !availability;
  const isAvailable = availability?.isAvailable ?? false;

  return (
    <View
      className={cn(
        'flex-row items-center gap-4 rounded-2xl border p-4',
        checking && 'border-border bg-card',
        !checking && isAvailable && 'border-primary/30 bg-primary/10',
        !checking && !isAvailable && 'border-amber/30 bg-amber/10'
      )}>
      <View
        className={cn(
          'h-11 w-11 items-center justify-center rounded-full',
          checking && 'bg-muted',
          !checking && isAvailable && 'bg-primary',
          !checking && !isAvailable && 'bg-amber'
        )}>
        {checking ? (
          <ActivityIndicator />
        ) : (
          <Icon as={isAvailable ? SparklesIcon : InfoIcon} className="text-white" size={20} />
        )}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-semibold">
          {checking
            ? t('settings.aiChecking')
            : isAvailable
              ? t('settings.aiAvailable')
              : t('settings.aiUnavailable')}
        </Text>
        {availability && !isAvailable ? (
          <Text className="text-sm text-muted-foreground">{availability.message}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { t, lang } = useTranslation();
  const insets = useSafeAreaInsets();
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const languagePreference = useLanguageStore((s) => s.preference);
  const setLanguagePreference = useLanguageStore((s) => s.setPreference);
  const [availability, setAvailability] = React.useState<AvailabilityStatus | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      checkAvailability()
        .then(setAvailability)
        .catch(() =>
          setAvailability({
            status: 'unknown',
            isAvailable: false,
            message: 'Unable to determine on-device AI status.',
          })
        );
    }, [])
  );

  async function handleExport() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const entries = listAllForExport();
    if (entries.length === 0) return;
    const text = entries
      .map((e) => `${formatTimestamp(new Date(e.createdAt), lang)}  ${e.text}`)
      .join('\n');
    await Share.share({ message: text });
  }

  function handleClearAll() {
    Alert.alert(
      t('settings.clearAllConfirmTitle'),
      t('settings.clearAllConfirmDescription'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.clearAllConfirm'),
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            clearAll();
          },
        },
      ]
    );
  }

  async function handleExportAll() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await exportAllDataAsJson();
  }

  async function handleImport() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await importAllDataFromJson();
    if (result.status === 'cancelled') return;
    if (result.status === 'invalid') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('settings.importErrorTitle'), t('settings.importInvalid'));
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      t('settings.importTitle'),
      t('settings.importSuccess', { entries: result.entryCount, summaries: result.summaryCount })
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, gap: 28 }}>
      <Text variant="h1" className="text-left text-3xl">
        {t('settings.title')}
      </Text>

      <View className="gap-3">
        <Eyebrow>{t('settings.appearance')}</Eyebrow>
        <ToggleGroup
          type="single"
          value={themePreference}
          onValueChange={(next) => {
            if (!next) return;
            Haptics.selectionAsync();
            setThemePreference(next as ThemePreference);
          }}
          className="rounded-full bg-muted p-1">
          {THEME_OPTIONS.map((option, index) => (
            <ToggleGroupItem
              key={option}
              value={option}
              isFirst={index === 0}
              isLast={index === THEME_OPTIONS.length - 1}
              className="flex-1 rounded-full">
              <Icon as={THEME_ICON[option]} size={14} />
              <Text className="text-xs font-medium">{t(`settings.theme.${option}`)}</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </View>

      <View className="gap-3">
        <Eyebrow>{t('settings.language')}</Eyebrow>
        <ToggleGroup
          type="single"
          value={languagePreference}
          onValueChange={(next) => {
            if (!next) return;
            Haptics.selectionAsync();
            setLanguagePreference(next as LanguagePreference);
          }}
          className="rounded-full bg-muted p-1">
          {LANGUAGE_OPTIONS.map((option, index) => (
            <ToggleGroupItem
              key={option}
              value={option}
              isFirst={index === 0}
              isLast={index === LANGUAGE_OPTIONS.length - 1}
              className="flex-1 rounded-full">
              <Text className="text-xs font-medium">{languageOptionLabel(option, t)}</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </View>

      <View className="gap-3">
        <Eyebrow>{t('settings.aiSectionTitle')}</Eyebrow>
        <AIStatusCard availability={availability} />
      </View>

      <View className="gap-3">
        <Eyebrow>{t('settings.dataSectionTitle')}</Eyebrow>
        <View className="gap-2">
          <Button variant="outline" onPress={handleExport}>
            <Icon as={Share2Icon} />
            <Text>{t('settings.exportText')}</Text>
          </Button>

          <Button variant="outline" onPress={handleExportAll}>
            <Icon as={FileJsonIcon} />
            <Text>{t('settings.exportAll')}</Text>
          </Button>

          <Button variant="outline" onPress={handleImport}>
            <Icon as={FileUpIcon} />
            <Text>{t('settings.importData')}</Text>
          </Button>

          <Button variant="destructive" onPress={handleClearAll}>
            <Icon as={Trash2Icon} />
            <Text>{t('settings.clearAll')}</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
