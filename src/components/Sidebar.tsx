import { useState, useEffect, useRef, useCallback } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { TaskItem } from '../types';

interface Props {
  tasks: TaskItem[];
  onPatch: (id: string, patch: Partial<TaskItem>) => void;
}

const PAGE_SIZE = 30;

export function Sidebar({ tasks, onPatch }: Props) {
  const [tab, setTab] = useState<'scoreboard' | 'starred'>('scoreboard');

  const sorted = [...tasks].sort((a, b) => b.score - a.score);
  const scoreboardItems = sorted;
  const starredItems = sorted.filter((t) => t.starred);

  return (
    <div
      className="flex flex-col w-64 border-l border-gray-700 flex-shrink-0 min-h-0"
      style={{ background: '#161b22' }}
    >
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <TabBtn active={tab === 'scoreboard'} onClick={() => setTab('scoreboard')}>
          Scoreboard
        </TabBtn>
        <TabBtn active={tab === 'starred'} onClick={() => setTab('starred')}>
          Starred
        </TabBtn>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === 'scoreboard' ? (
          <InfiniteScoreboardList items={scoreboardItems} onPatch={onPatch} />
        ) : (
          <InfiniteStarredList items={starredItems} onPatch={onPatch} />
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

function useInfiniteList<T>(items: T[]) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when items change (e.g. tab switch)
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [items]);

  const loadMore = useCallback(() => {
    setLimit((l) => Math.min(l + PAGE_SIZE, items.length));
  }, [items.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return { visible: items.slice(0, limit), sentinelRef, hasMore: limit < items.length };
}

function InfiniteScoreboardList({
  items,
  onPatch,
}: {
  items: TaskItem[];
  onPatch: (id: string, patch: Partial<TaskItem>) => void;
}) {
  const { visible, sentinelRef, hasMore } = useInfiniteList(items);

  return (
    <>
      <table className="w-full text-xs table-fixed border-collapse">
        <colgroup>
          <col />
          <col style={{ width: 28 }} />
          <col style={{ width: 36 }} />
          <col style={{ width: 28 }} />
        </colgroup>
        <tbody>
          {visible.map((task) => (
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
      {hasMore && (
        <div ref={sentinelRef} className="h-8 flex items-center justify-center text-xs text-gray-600">
          Loading…
        </div>
      )}
    </>
  );
}

function InfiniteStarredList({
  items,
  onPatch,
}: {
  items: TaskItem[];
  onPatch: (id: string, patch: Partial<TaskItem>) => void;
}) {
  const { visible, sentinelRef, hasMore } = useInfiniteList(items);

  return (
    <>
      <table className="w-full text-xs table-fixed border-collapse">
        <colgroup>
          <col style={{ width: 36 }} />
          <col />
        </colgroup>
        <tbody>
          {visible.map((task) => (
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
      {hasMore && (
        <div ref={sentinelRef} className="h-8 flex items-center justify-center text-xs text-gray-600">
          Loading…
        </div>
      )}
    </>
  );
}
