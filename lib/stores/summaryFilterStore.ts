import { create } from 'zustand';
import type { PeriodType } from '@/lib/dates/periods';

type SummaryFilterStore = {
  granularity: PeriodType;
  setGranularity: (granularity: PeriodType) => void;
};

export const useSummaryFilterStore = create<SummaryFilterStore>()((set) => ({
  granularity: 'day',
  setGranularity: (granularity) => set({ granularity }),
}));
