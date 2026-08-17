import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from '@/lib/i18n';
import { GRANULARITIES, type PeriodType } from '@/lib/dates/periods';
import * as Haptics from 'expo-haptics';

export function GranularitySegmentedControl({
  value,
  onChange,
}: {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
}) {
  const { t } = useTranslation();

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (!next) return;
        Haptics.selectionAsync();
        onChange(next as PeriodType);
      }}
      className="w-full rounded-full bg-muted p-1">
      {GRANULARITIES.map((type, index) => (
        <ToggleGroupItem
          key={type}
          value={type}
          isFirst={index === 0}
          isLast={index === GRANULARITIES.length - 1}
          className="flex-1 rounded-full">
          <Text className="text-xs font-medium">{t(`granularity.${type}`)}</Text>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
