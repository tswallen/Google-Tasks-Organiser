export interface TaskItem {
  id: string;
  title: string;
  updated: string;
  starred: boolean;
  score: number;
  read: boolean;
  notes?: string;
  status?: string;
}

export type SortField = 'starred' | 'date' | 'score';
export type SortDir = 'asc' | 'desc';

export interface Settings {
  showBelow1: boolean;
  showAbove1: boolean;
}

export type ReadFilter = 'unread' | 'read';
