import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** Small uppercase eyebrow tag — e.g. TODAY, AUGUST 2026, AI SUMMARY. */
export function Eyebrow({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn('text-[11px] font-semibold uppercase text-muted-foreground', className)}
      {...props}
    />
  );
}
