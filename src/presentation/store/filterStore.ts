import { create } from 'zustand';
import { FilterState, FilterType } from '../../domain/entities/types';

interface FilterStore extends FilterState {
  activeSheet: FilterType | null;
  totalCount: number;

  setActiveSheet: (sheet: FilterType | null) => void;
  setRegion: (city: string | null, district: string | null) => void;
  toggleGenre: (genre: string) => void;
  toggleBodyPart: (part: string) => void;
  toggleSubject: (subject: string) => void;
  toggleMood: (mood: string) => void;
  setBudget: (min: number, max: number) => void;
  resetAll: () => void;
  resetRegion: () => void;
  resetGenres: () => void;
  resetBodyParts: () => void;
  resetSubjectsMoods: () => void;
  resetBudget: () => void;
  getActiveFilterChips: () => { label: string; type: string }[];
  removeFilterChip: (label: string, type: string) => void;
}

const DEFAULT_STATE: FilterState = {
  region: { city: '서울', district: '강남' },
  genres: ['블랙앤그레이'],
  bodyParts: ['팔'],
  subjects: [],
  moods: [],
  budgetMin: 0,
  budgetMax: 500000,
};

const EMPTY_STATE: FilterState = {
  region: { city: null, district: null },
  genres: [],
  bodyParts: [],
  subjects: [],
  moods: [],
  budgetMin: 0,
  budgetMax: 500000,
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...DEFAULT_STATE,
  activeSheet: null,
  totalCount: 142,

  setActiveSheet: (sheet) => set({ activeSheet: sheet }),

  setRegion: (city, district) =>
    set({ region: { city, district } }),

  toggleGenre: (genre) =>
    set((state) => ({
      genres: state.genres.includes(genre)
        ? state.genres.filter((g) => g !== genre)
        : [...state.genres, genre],
    })),

  toggleBodyPart: (part) =>
    set((state) => ({
      bodyParts: state.bodyParts.includes(part)
        ? state.bodyParts.filter((p) => p !== part)
        : [...state.bodyParts, part],
    })),

  toggleSubject: (subject) =>
    set((state) => ({
      subjects: state.subjects.includes(subject)
        ? state.subjects.filter((s) => s !== subject)
        : [...state.subjects, subject],
    })),

  toggleMood: (mood) =>
    set((state) => ({
      moods: state.moods.includes(mood)
        ? state.moods.filter((m) => m !== mood)
        : [...state.moods, mood],
    })),

  setBudget: (min, max) => set({ budgetMin: min, budgetMax: max }),

  resetAll: () => set({ ...EMPTY_STATE }),
  resetRegion: () => set({ region: { city: null, district: null } }),
  resetGenres: () => set({ genres: [] }),
  resetBodyParts: () => set({ bodyParts: [] }),
  resetSubjectsMoods: () => set({ subjects: [], moods: [] }),
  resetBudget: () => set({ budgetMin: 0, budgetMax: 500000 }),

  getActiveFilterChips: () => {
    const state = get();
    const chips: { label: string; type: string }[] = [];
    if (state.region.district) chips.push({ label: state.region.district, type: 'region' });
    else if (state.region.city) chips.push({ label: state.region.city, type: 'region' });
    state.genres.forEach((g) => chips.push({ label: g, type: 'genre' }));
    state.bodyParts.forEach((b) => chips.push({ label: b, type: 'bodyPart' }));
    state.subjects.forEach((s) => chips.push({ label: s, type: 'subject' }));
    state.moods.forEach((m) => chips.push({ label: m, type: 'mood' }));
    return chips;
  },

  removeFilterChip: (label, type) => {
    const state = get();
    switch (type) {
      case 'region':
        set({ region: { city: null, district: null } });
        break;
      case 'genre':
        set({ genres: state.genres.filter((g) => g !== label) });
        break;
      case 'bodyPart':
        set({ bodyParts: state.bodyParts.filter((b) => b !== label) });
        break;
      case 'subject':
        set({ subjects: state.subjects.filter((s) => s !== label) });
        break;
      case 'mood':
        set({ moods: state.moods.filter((m) => m !== label) });
        break;
    }
  },
}));
