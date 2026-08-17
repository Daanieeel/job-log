import { useTranslation } from '@/lib/i18n';
import { Stack } from 'expo-router';

export default function SummaryLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('summary.title'), headerLargeTitle: true }} />
    </Stack>
  );
}
