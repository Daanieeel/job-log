import { Text } from '@/components/ui/text';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LANGUAGE_FLAG, useTranslation, type AppLanguage } from '@/lib/i18n';
import type { SummaryLanguage } from '@/lib/stores/summaryLanguageStore';
import * as Haptics from 'expo-haptics';

export function SummaryLanguageToggle({
  value,
  standard,
  onChange,
  disabled,
}: {
  value: SummaryLanguage;
  /** The app's current UI language — always rendered as the left/default option. */
  standard: AppLanguage;
  onChange: (language: SummaryLanguage) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const other: SummaryLanguage = standard === 'en' ? 'de' : 'en';
  const options: SummaryLanguage[] = [standard, other];

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (!next || disabled) return;
        Haptics.selectionAsync();
        onChange(next as SummaryLanguage);
      }}
      className="rounded-full bg-muted p-1"
      style={disabled ? { opacity: 0.4 } : undefined}>
      {options.map((option, index) => (
        <ToggleGroupItem
          key={option}
          value={option}
          disabled={disabled}
          isFirst={index === 0}
          isLast={index === options.length - 1}
          className="flex-1 rounded-full">
          <Text className="text-xs font-medium">
            {LANGUAGE_FLAG[option]} {t(`summary.language.${option}`)}
          </Text>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
