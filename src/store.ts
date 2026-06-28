import type { TaskItem } from './types';

const STORAGE_KEY = 'gto_tasks';

export function loadTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: TaskItem[] = JSON.parse(raw);
    // Backfill read field for items persisted before this field existed
    return parsed.map((t) => ({ ...t, read: t.read ?? false }));
  } catch {
    return [];
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function importTasks(incoming: Partial<TaskItem>[], existing: TaskItem[]): TaskItem[] {
  const titles = new Set(existing.map((t) => t.title));
  const newItems: TaskItem[] = [];

  for (const item of incoming) {
    if (!item.title || titles.has(item.title)) continue;
    titles.add(item.title);
    newItems.push({
      id: crypto.randomUUID(),
      title: item.title,
      updated: item.updated ?? new Date().toISOString(),
      starred: item.starred ?? false,
      // Preserve existing score/read if present in the import, otherwise default
      score: item.score ?? 1,
      read: item.read ?? false,
      notes: item.notes,
      status: item.status,
    });
  }

  return [...existing, ...newItems];
}

export function updateTask(tasks: TaskItem[], id: string, patch: Partial<TaskItem>): TaskItem[] {
  return tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
}

export function markManyRead(tasks: TaskItem[], ids: string[]): TaskItem[] {
  const set = new Set(ids);
  return tasks.map((t) => (set.has(t.id) ? { ...t, read: true } : t));
}

const SCHEDULED_KEY = 'gto_scheduled';

export function loadScheduledIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SCHEDULED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function markScheduled(ids: string[]): void {
  const existing = loadScheduledIds();
  ids.forEach((id) => existing.add(id));
  localStorage.setItem(SCHEDULED_KEY, JSON.stringify([...existing]));
}
