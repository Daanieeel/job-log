import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** App UI language preference. 'system' follows the device locale. */
export type LanguagePreference = 'system' | 'en' | 'de';

type LanguageStore = {
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'joblog.language-preference',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
