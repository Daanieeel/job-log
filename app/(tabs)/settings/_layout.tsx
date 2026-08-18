import { useTranslation } from '@/lib/i18n';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="on-device-ai" options={{ title: t('settings.aiSectionTitle') }} />
    </Stack>
  );
}
