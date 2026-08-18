import { Icon } from '@/components/ui/icon';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from '@/lib/i18n';
import { useArchiveViewStore, type ArchiveViewMode } from '@/lib/stores/archiveViewStore';
import { cn } from '@/lib/utils';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LayoutGridIcon, ListIcon } from 'lucide-react-native';

const VIEW_OPTIONS: { value: ArchiveViewMode; icon: typeof ListIcon }[] = [
  { value: 'compact', icon: ListIcon },
  { value: 'extended', icon: LayoutGridIcon },
];

function ArchiveViewToggle() {
  const mode = useArchiveViewStore((s) => s.mode);
  const setMode = useArchiveViewStore((s) => s.setMode);
  const { t } = useTranslation();

  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(next) => {
        if (!next) return;
        Haptics.selectionAsync();
        setMode(next as ArchiveViewMode);
      }}
      className="rounded-full bg-muted p-1">
      {VIEW_OPTIONS.map((option, index) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          isFirst={index === 0}
          isLast={index === VIEW_OPTIONS.length - 1}
          accessibilityLabel={t(option.value === 'compact' ? 'archive.viewCompact' : 'archive.viewExtended')}
          className={cn(
            'rounded-full px-3',
            mode === option.value && 'bg-background shadow-sm shadow-black/10'
          )}>
          <Icon as={option.icon} size={16} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
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
