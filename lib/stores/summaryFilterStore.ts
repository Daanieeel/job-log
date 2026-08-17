import { create } from 'zustand';
import { currentPeriodKey, stepPeriod, type PeriodType } from '@/lib/dates/periods';

type SummaryFilterStore = {
  granularity: PeriodType;
  /** Last-viewed period key per granularity, so switching tabs remembers your place. */
  periodKeyByGranularity: Record<PeriodType, string>;
  setGranularity: (granularity: PeriodType) => void;
  step: (direction: 1 | -1) => void;
  jumpToCurrent: () => void;
};

const initialKeys: Record<PeriodType, string> = {
  day: currentPeriodKey('day'),
  week: currentPeriodKey('week'),
  month: currentPeriodKey('month'),
  quarter: currentPeriodKey('quarter'),
  year: currentPeriodKey('year'),
};

export const useSummaryFilterStore = create<SummaryFilterStore>()((set, get) => ({
  granularity: 'day',
  periodKeyByGranularity: initialKeys,
  setGranularity: (granularity) => set({ granularity }),
  step: (direction) => {
    const { granularity, periodKeyByGranularity } = get();
    const nextKey = stepPeriod(granularity, periodKeyByGranularity[granularity], direction);
    set({ periodKeyByGranularity: { ...periodKeyByGranularity, [granularity]: nextKey } });
  },
  jumpToCurrent: () => {
    const { granularity, periodKeyByGranularity } = get();
    set({
      periodKeyByGranularity: {
        ...periodKeyByGranularity,
        [granularity]: currentPeriodKey(granularity),
      },
    });
  },
}));
