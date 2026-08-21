import type { SprintDataset } from '../types';

// Data-access layer for the sprint dataset. Today this reads the static
// mock-data.json; swapping this for a real backend later means changing
// only this file — nothing above it (stores, hooks, components) knows or
// cares where the data actually comes from.
export const taskApi = {
  fetchDataset: async (): Promise<SprintDataset> => {
    const res = await fetch('/mock-data.json');
    if (!res.ok) throw new Error('Failed to load sprint dataset');
    const data: SprintDataset = await res.json();
    return { ...data, tasks: data.tasks.slice(0, 30) };
  },
};
