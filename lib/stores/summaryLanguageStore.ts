import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SummaryLanguage = 'en' | 'de';

type SummaryLanguageStore = {
  /** null = not yet explicitly chosen — follow the app's UI language until the user picks one. */
  language: SummaryLanguage | null;
  setLanguage: (language: SummaryLanguage) => void;
};

/** Language the AI writes summary bullets in — independent of the app's UI language. */
export const useSummaryLanguageStore = create<SummaryLanguageStore>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'joblog.summary-language',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
