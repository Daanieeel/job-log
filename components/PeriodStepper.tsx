import { Eyebrow } from '@/components/Eyebrow';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/lib/i18n';
import {
  currentPeriodKey,
  periodEyebrowKey,
  periodLabel,
  type PeriodType,
} from '@/lib/dates/periods';
import * as Haptics from 'expo-haptics';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
import { View } from 'react-native';

export function PeriodStepper({
  type,
  periodKey,
  onStep,
}: {
  type: PeriodType;
  periodKey: string;
  onStep: (direction: 1 | -1) => void;
}) {
  const { t, lang } = useTranslation();
  const label = periodLabel(type, periodKey, lang);
  const eyebrowKey = periodEyebrowKey(type, periodKey);
  const isCurrent = periodKey === currentPeriodKey(type);

  function step(direction: 1 | -1) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStep(direction);
  }

  return (
    <View className="flex-row items-center justify-between">
      <Button variant="ghost" size="icon" className="rounded-full" onPress={() => step(-1)}>
        <Icon as={ChevronLeftIcon} size={20} />
      </Button>
      <View className="items-center gap-0.5">
        {eyebrowKey ? <Eyebrow>{t(`eyebrow.${eyebrowKey}`)}</Eyebrow> : null}
        <Text className="text-base font-semibold">{label}</Text>
      </View>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onPress={() => step(1)}
        disabled={isCurrent}>
        <Icon as={ChevronRightIcon} size={20} />
      </Button>
    </View>
  );
}
