import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/lib/i18n';
import { formatTime } from '@/lib/i18n/format';
import type { Entry } from '@/lib/db/entries';
import * as Haptics from 'expo-haptics';
import { Trash2Icon } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

function DeleteAction({ progress, onPress }: { progress: SharedValue<number>; onPress: () => void }) {
  const style = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View style={style} className="w-20">
      <Pressable
        onPress={onPress}
        className="flex-1 items-center justify-center rounded-2xl bg-destructive">
        <Icon as={Trash2Icon} className="text-white" size={18} />
      </Pressable>
    </Animated.View>
  );
}

export function EntryListItem({
  entry,
  onDelete,
}: {
  entry: Entry;
  onDelete?: (id: string) => void;
}) {
  const { lang } = useTranslation();

  const content = (
    <View className="flex-row gap-3 py-3">
      <Text className="w-16 pt-0.5 text-xs text-muted-foreground">
        {formatTime(new Date(entry.createdAt), lang)}
      </Text>
      <Text className="flex-1 text-base leading-snug">{entry.text}</Text>
    </View>
  );

  if (!onDelete) return content;

  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={(progress) => (
        <DeleteAction
          progress={progress}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDelete(entry.id);
          }}
        />
      )}>
      {content}
    </Swipeable>
  );
}
