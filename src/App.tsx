import { useState, useCallback } from 'react';
import type { TaskItem, Settings } from './types';
import { loadTasks, saveTasks, importTasks, updateTask, loadScheduledIds, markScheduled } from './store';
import { MenuBar } from './components/MenuBar';
import { DataTable } from './components/DataTable';
import { Sidebar } from './components/Sidebar';
import { ScheduleModal, buildSchedule } from './components/ScheduleModal';
import type { DaySchedule } from './components/ScheduleModal';
import './index.css';

const initialTasks = loadTasks();

export default function App() {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<Settings>({ showBelow1: true, showAbove1: true });
  const [shuffleKey, setShuffleKey] = useState(0);
  const [schedule, setSchedule] = useState<DaySchedule[] | null>(null);

  const setAndSave = useCallback((updater: (prev: TaskItem[]) => TaskItem[]) => {
    setTasks((prev) => {
      const next = updater(prev);
      saveTasks(next);
      return next;
    });
  }, []);

  const handleImport = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const rawItems =
            json?.items?.[0]?.items ?? json?.items ?? (Array.isArray(json) ? json : []);
          setAndSave((prev) => importTasks(rawItems, prev));
        } catch {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    },
    [setAndSave]
  );

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google-tasks-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks]);

  const handleShuffle = useCallback(() => {
    setShuffleKey((k) => k + 1);
  }, []);

  const handleSchedule = useCallback(() => {
    const scheduledIds = loadScheduledIds();
    const result = buildSchedule(tasks, scheduledIds);
    if (!result) {
      alert(
        'Not enough unscheduled tasks to fill a week (need 21). Import more tasks or all tasks have already been scheduled.'
      );
      return;
    }
    const usedIds = result.flatMap((d) => d.tasks.map((t) => t.id));
    markScheduled(usedIds);
    setSchedule(result);
  }, [tasks]);

  const handlePatch = useCallback(
    (id: string, patch: Partial<TaskItem>) => {
      setAndSave((prev) => updateTask(prev, id, patch));
    },
    [setAndSave]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      <MenuBar
        onImport={handleImport}
        onExport={handleExport}
        onShuffle={handleShuffle}
        onSchedule={handleSchedule}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        settings={settings}
        onSettingsChange={setSettings}
      />
      <div className="flex flex-1 min-h-0">
        <DataTable
          tasks={tasks}
          onPatch={handlePatch}
          settings={settings}
          shuffleKey={shuffleKey}
        />
        {sidebarOpen && <Sidebar tasks={tasks} onPatch={handlePatch} />}
      </div>
      {schedule && (
        <ScheduleModal schedule={schedule} onClose={() => setSchedule(null)} />
      )}
    </div>
  );
}
