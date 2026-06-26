import { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { TaskItem } from '../types';

interface Props {
  tasks: TaskItem[];
  onPatch: (id: string, patch: Partial<TaskItem>) => void;
}

const ROW_HEIGHT = 36;

export function Sidebar({ tasks, onPatch }: Props) {
  const [tab, setTab] = useState<'scoreboard' | 'starred'>('scoreboard');
  const bodyRef = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(20);

  useEffect(() => {
    if (!bodyRef.current) return;
    const ro = new ResizeObserver(() => {
      setCapacity(Math.max(1, Math.floor(bodyRef.current!.clientHeight / ROW_HEIGHT)));
    });
    ro.observe(bodyRef.current);
    return () => ro.disconnect();
  }, []);

  const sorted = [...tasks].sort((a, b) => b.score - a.score);

  const scoreboardItems = sorted.slice(0, capacity);
  const starredItems = sorted.filter((t) => t.starred).slice(0, capacity);

  return (
    <div className="flex flex-col w-64 border-l border-gray-700 bg-gray-850 flex-shrink-0 min-h-0" style={{ background: '#161b22' }}>
      {/* Tab bar */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <TabBtn active={tab === 'scoreboard'} onClick={() => setTab('scoreboard')}>
          Scoreboard
        </TabBtn>
        <TabBtn active={tab === 'starred'} onClick={() => setTab('starred')}>
          Starred
        </TabBtn>
      </div>

      {/* Content */}
      <div ref={bodyRef} className="flex-1 overflow-hidden min-h-0">
        {tab === 'scoreboard' ? (
          <ScoreboardList items={scoreboardItems} onPatch={onPatch} />
        ) : (
          <StarredList items={starredItems} onPatch={onPatch} />
        )}
      </div>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-xs font-medium transition-colors ${
        active
          ? 'text-blue-400 border-b-2 border-blue-400'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function ScoreboardList({
  items,
  onPatch,
}: {
  items: TaskItem[];
  onPatch: (id: string, patch: Partial<TaskItem>) => void;
}) {
  return (
    <table className="w-full text-xs table-fixed border-collapse">
      <colgroup>
        <col />
        <col style={{ width: 28 }} />
        <col style={{ width: 36 }} />
        <col style={{ width: 28 }} />
      </colgroup>
      <tbody>
        {items.map((task) => (
          <tr key={task.id} className="border-b border-gray-800 hover:bg-gray-800/50 h-9">
            <td className="px-2 max-w-0">
              <span title={task.title} className="block truncate text-gray-300">
                {task.title}
              </span>
            </td>
            <td className="text-center">
              <button
                onClick={() => onPatch(task.id, { score: task.score + 1 })}
                title="Upvote"
                className="p-0.5 text-green-500 hover:text-green-400"
              >
                <ThumbsUp size={12} />
              </button>
            </td>
            <td className="text-center text-gray-400">{task.score}</td>
            <td className="text-center">
              <button
                onClick={() => onPatch(task.id, { score: task.score - 1 })}
                title="Downvote"
                className="p-0.5 text-red-500 hover:text-red-400"
              >
                <ThumbsDown size={12} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StarredList({
  items,
  onPatch,
}: {
  items: TaskItem[];
  onPatch: (id: string, patch: Partial<TaskItem>) => void;
}) {
  return (
    <table className="w-full text-xs table-fixed border-collapse">
      <colgroup>
        <col style={{ width: 36 }} />
        <col />
      </colgroup>
      <tbody>
        {items.map((task) => (
          <tr key={task.id} className="border-b border-gray-800 hover:bg-gray-800/50 h-9">
            <td className="px-2 text-center">
              <input
                type="checkbox"
                checked={task.starred}
                onChange={(e) => onPatch(task.id, { starred: e.target.checked })}
                className="accent-yellow-400 cursor-pointer"
              />
            </td>
            <td className="px-2 max-w-0">
              <span title={task.title} className="block truncate text-gray-300">
                {task.title}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
