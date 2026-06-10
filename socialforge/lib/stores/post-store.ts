'use client';

import { create } from 'zustand';

const PLATFORMS = ['twitter', 'linkedin', 'facebook', 'instagram', 'bluesky'] as const;
export type Platform = (typeof PLATFORMS)[number];

interface PostEditorState {
  draftContent: string;
  setDraftContent: (content: string) => void;
  selectedPlatforms: Platform[];
  togglePlatform: (platform: Platform) => void;
  setPlatforms: (platforms: Platform[]) => void;
  isDirty: boolean;
  markDirty: () => void;
  reset: () => void;
}

export const usePostStore = create<PostEditorState>((set) => ({
  draftContent: '',
  setDraftContent: (content) => set({ draftContent: content, isDirty: true }),
  selectedPlatforms: [],
  togglePlatform: (platform) =>
    set((s) => ({
      selectedPlatforms: s.selectedPlatforms.includes(platform)
        ? s.selectedPlatforms.filter((p) => p !== platform)
        : [...s.selectedPlatforms, platform],
      isDirty: true,
    })),
  setPlatforms: (platforms) => set({ selectedPlatforms: platforms, isDirty: true }),
  isDirty: false,
  markDirty: () => set({ isDirty: true }),
  reset: () => set({ draftContent: '', selectedPlatforms: [], isDirty: false }),
}));
