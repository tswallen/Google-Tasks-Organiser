export interface TaskItem {
  id: string;
  title: string;
  updated: string;
  starred: boolean;
  score: number;
  notes?: string;
  status?: string;
}

export type SortField = 'starred' | 'date' | 'score';
export type SortDir = 'asc' | 'desc';

export interface SortState {
  field: SortField | null;
  dir: SortDir;
}

export interface Settings {
  showBelow1: boolean;
  showAbove1: boolean;
}
