import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/lib/i18n';
import { useArchiveViewStore } from '@/lib/stores/archiveViewStore';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LayoutGridIcon, ListIcon } from 'lucide-react-native';

function ArchiveViewToggle() {
  const mode = useArchiveViewStore((s) => s.mode);
  const toggle = useArchiveViewStore((s) => s.toggle);
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      accessibilityLabel={mode === 'compact' ? t('archive.viewExtended') : t('archive.viewCompact')}
      onPress={() => {
        Haptics.selectionAsync();
        toggle();
      }}>
      <Icon as={mode === 'compact' ? LayoutGridIcon : ListIcon} />
    </Button>
  );
}

export default function ArchiveLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('archive.title'),
          headerLargeTitle: true,
          headerRight: () => <ArchiveViewToggle />,
        }}
      />
      <Stack.Screen name="[day]" options={{ headerBackTitle: t('archive.title') }} />
    </Stack>
  );
}
