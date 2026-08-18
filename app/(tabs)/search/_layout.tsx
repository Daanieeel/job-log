import { useTranslation } from '@/lib/i18n';
import { Stack } from 'expo-router';

export default function SearchLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('search.title'), headerLargeTitle: true }} />
    </Stack>
  );
}
