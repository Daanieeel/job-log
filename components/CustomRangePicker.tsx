import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/lib/i18n';
import { THEME } from '@/lib/theme/tokens';
import DateTimePicker from '@react-native-community/datetimepicker';
import { startOfDay } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type CustomRange = { start: Date; end: Date };

export function CustomRangePicker({
  visible,
  initialRange,
  onApply,
  onClose,
}: {
  visible: boolean;
  initialRange: CustomRange | null;
  onApply: (range: CustomRange) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [start, setStart] = React.useState(() => initialRange?.start ?? startOfDay(new Date()));
  const [end, setEnd] = React.useState(() => initialRange?.end ?? startOfDay(new Date()));

  React.useEffect(() => {
    if (visible) {
      setStart(initialRange?.start ?? startOfDay(new Date()));
      setEnd(initialRange?.end ?? startOfDay(new Date()));
    }
  }, [visible, initialRange]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View
        className="flex-1 bg-background px-5"
        style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}>
        <Text variant="h3" className="pb-4 text-left">
          {t('summary.customRangeTitle')}
        </Text>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-1">
            <Text className="text-sm font-medium text-muted-foreground">
              {t('summary.customRangeStart')}
            </Text>
            <DateTimePicker
              value={start}
              mode="date"
              display="inline"
              maximumDate={end}
              themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
              accentColor={theme.primary}
              onValueChange={(_event, date) => setStart(startOfDay(date))}
            />
          </View>

          <View className="gap-1 pt-4">
            <Text className="text-sm font-medium text-muted-foreground">
              {t('summary.customRangeEnd')}
            </Text>
            <DateTimePicker
              value={end}
              mode="date"
              display="inline"
              minimumDate={start}
              maximumDate={new Date()}
              themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
              accentColor={theme.primary}
              onValueChange={(_event, date) => setEnd(startOfDay(date))}
            />
          </View>
        </ScrollView>

        <View className="gap-2 pt-4">
          <Button
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onApply({ start, end });
            }}>
            <Text>{t('summary.customRangeApply')}</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
