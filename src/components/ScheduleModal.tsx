import { useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import type { TaskItem } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TASKS_PER_DAY = 3;

export interface DaySchedule {
  day: string;
  tasks: TaskItem[];
}

interface Props {
  schedule: DaySchedule[];
  onClose: () => void;
}

export function buildSchedule(tasks: TaskItem[], scheduledIds: Set<string>): DaySchedule[] | null {
  const pool = [...tasks]
    .filter((t) => !scheduledIds.has(t.id))
    .sort((a, b) => b.score - a.score);

  const needed = DAYS.length * TASKS_PER_DAY;
  if (pool.length < needed) return null;

  return DAYS.map((day, i) => ({
    day,
    tasks: pool.slice(i * TASKS_PER_DAY, i * TASKS_PER_DAY + TASKS_PER_DAY),
  }));
}

export function ScheduleModal({ schedule, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePrint = () => window.print();

  return (
    <>
      {/* Print styles injected into head */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #schedule-print-root { display: block !important; }
          #schedule-print-root .no-print { display: none !important; }
        }
        #schedule-print-root { display: none; }
      `}</style>

      {/* Overlay (screen only) */}
      <div
        className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center no-print"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          ref={modalRef}
          className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-base font-semibold text-gray-100">Weekly Schedule</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                title="Print"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              >
                <Printer size={14} />
                Print
              </button>
              <button
                onClick={onClose}
                title="Close"
                className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
            {schedule.map(({ day, tasks }) => (
              <DayBlock key={day} day={day} tasks={tasks} />
            ))}
          </div>
        </div>
      </div>

      {/* Print-only version rendered outside the modal overlay */}
      <div id="schedule-print-root">
        <PrintLayout schedule={schedule} />
      </div>
    </>
  );
}

function DayBlock({ day, tasks }: { day: string; tasks: TaskItem[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-blue-400 mb-1 uppercase tracking-wide">{day}</h3>
      <table className="w-full text-sm border-collapse">
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-gray-800">
              <td className="py-1.5 w-7 text-center">
                <input type="checkbox" className="accent-blue-500 cursor-pointer" />
              </td>
              <td className="py-1.5 text-gray-200">{task.title}</td>
              <td className="py-1.5 w-12 text-right text-xs text-gray-500">{task.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrintLayout({ schedule }: { schedule: DaySchedule[] }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '24px', color: '#000' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '20px' }}>Weekly Schedule</h1>
      {schedule.map(({ day, tasks }) => (
        <div key={day} style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', borderBottom: '1px solid #ccc', paddingBottom: '2px' }}>
            {day}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '5px 4px', width: '20px' }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: '5px 4px' }}>{task.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
