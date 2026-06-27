import type { TaskItem } from './types';

const STORAGE_KEY = 'gto_tasks';

export function loadTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
      title: item.title ?? '',
      updated: item.updated ?? new Date().toISOString(),
      starred: item.starred ?? false,
      score: 1,
      notes: item.notes,
      status: item.status,
    });
  }

  return [...existing, ...newItems];
}

export function updateTask(tasks: TaskItem[], id: string, patch: Partial<TaskItem>): TaskItem[] {
  return tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
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
