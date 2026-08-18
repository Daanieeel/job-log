import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { checkAvailability, type AvailabilityStatus } from '@/lib/ai/appleIntelligence';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useFocusEffect } from 'expo-router';
import { InfoIcon, SparklesIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnDeviceAIScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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

  const checking = !availability;
  const isAvailable = availability?.isAvailable ?? false;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20, gap: 20 }}>
      <View className="items-center gap-3 py-4">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Icon as={SparklesIcon} className="text-primary-foreground" size={28} />
        </View>
        <View className="flex-row items-center gap-1.5">
          {checking ? (
            <ActivityIndicator size="small" />
          ) : (
            <View
              className={cn('h-2 w-2 rounded-full', isAvailable ? 'bg-emerald-500' : 'bg-amber')}
            />
          )}
          <Text className="text-sm font-medium text-muted-foreground">
            {checking
              ? t('settings.aiChecking')
              : isAvailable
                ? t('settings.aiStatusAvailable')
                : t('settings.aiStatusUnavailable')}
          </Text>
        </View>
      </View>

      {!checking && !isAvailable && availability.message ? (
        <View className="flex-row items-start gap-3 rounded-2xl border border-amber/30 bg-amber/10 p-4">
          <Icon as={InfoIcon} size={18} className="mt-0.5 text-amber" />
          <Text className="flex-1 text-sm text-foreground">{availability.message}</Text>
        </View>
      ) : null}

      <Text className="text-base leading-relaxed text-foreground">{t('settings.aiDetailBody')}</Text>
    </ScrollView>
  );
}
