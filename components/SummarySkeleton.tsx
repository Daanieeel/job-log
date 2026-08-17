import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

const WIDTHS = ['w-[92%]', 'w-[78%]', 'w-[85%]', 'w-[65%]', 'w-[70%]'];

export function SummarySkeleton() {
  return (
    <View className="gap-3.5">
      {WIDTHS.map((width, index) => (
        <View key={index} className="flex-row gap-3">
          <Skeleton className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
          <Skeleton className={cn('h-4 rounded-full', width)} />
        </View>
      ))}
    </View>
  );
}
