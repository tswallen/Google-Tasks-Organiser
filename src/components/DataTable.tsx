import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { TaskItem, SortField, SortDir, Settings } from '../types';
import { formatDate, sampleN } from '../utils';

interface Props {
  tasks: TaskItem[];
  onPatch: (id: string, patch: Partial<TaskItem>) => void;
  settings: Settings;
  shuffleKey: number;
}

function filterBySettings(tasks: TaskItem[], settings: Settings): TaskItem[] {
  return tasks.filter((t) => {
    if (t.score < 1 && !settings.showBelow1) return false;
    if (t.score > 1 && !settings.showAbove1) return false;
    return true;
  });
}

const ROW_HEIGHT = 40;

export function DataTable({ tasks, onPatch, settings, shuffleKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(20);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [sort, setSort] = useState<{ field: SortField | null; dir: SortDir }>({
    field: null,
    dir: 'desc',
  });

  // Measure capacity
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      const h = containerRef.current!.clientHeight - 40; // subtract header
      setCapacity(Math.max(1, Math.floor(h / ROW_HEIGHT)));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const eligible = filterBySettings(tasks, settings);

  // Full re-randomise on shuffle
  useEffect(() => {
    setVisibleIds(sampleN(eligible, capacity).map((t) => t.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleKey]);

  // Adjust to capacity without discarding current items
  useEffect(() => {
    setVisibleIds((prev) => {
      const eligibleIds = new Set(eligible.map((t) => t.id));
      const kept = prev.filter((id) => eligibleIds.has(id)).slice(0, capacity);
      if (kept.length >= capacity) return kept;
      const pool = eligible.filter((t) => !new Set(kept).has(t.id));
      return [...kept, ...sampleN(pool, capacity - kept.length).map((t) => t.id)];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capacity]);

  // When eligible set changes (score/settings change), remove ineligible and refill
  useEffect(() => {
    setVisibleIds((prev) => {
      const eligibleMap = new Map(eligible.map((t) => [t.id, t]));
      const kept = prev.filter((id) => eligibleMap.has(id));
      if (kept.length === prev.length && kept.length >= Math.min(capacity, eligible.length))
        return prev;
      const pool = eligible.filter((t) => !new Set(kept).has(t.id));
      const added = sampleN(pool, capacity - kept.length).map((t) => t.id);
      return [...kept, ...added];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, settings, capacity]);

  const visibleMap = new Map(tasks.map((t) => [t.id, t]));
  let rows = visibleIds.map((id) => visibleMap.get(id)).filter(Boolean) as TaskItem[];

  // Sort
  if (sort.field) {
    rows = [...rows].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sort.field === 'starred') {
        av = a.starred ? 1 : 0;
        bv = b.starred ? 1 : 0;
      } else if (sort.field === 'date') {
        av = a.updated;
        bv = b.updated;
      } else {
        av = a.score;
        bv = b.score;
      }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const toggleSort = (field: SortField) => {
    setSort((s) =>
      s.field === field
        ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'desc' }
    );
  };

  return (
    <div ref={containerRef} className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <table className="w-full text-sm table-fixed border-collapse">
        <colgroup>
          <col style={{ width: 60 }} />
          <col />
          <col style={{ width: 100 }} />
          <col style={{ width: 44 }} />
          <col style={{ width: 70 }} />
          <col style={{ width: 44 }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-800 border-b border-gray-700 h-10">
            <SortTh label="Starred" field="starred" sort={sort} onSort={toggleSort} />
            <th className="px-3 text-left text-gray-400 font-medium">Title</th>
            <SortTh label="Date" field="date" sort={sort} onSort={toggleSort} />
            <th />
            <SortTh label="Score" field="score" sort={sort} onSort={toggleSort} />
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((task) => (
            <DataRow key={task.id} task={task} onPatch={onPatch} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortTh({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field: SortField;
  sort: { field: SortField | null; dir: SortDir };
  onSort: (f: SortField) => void;
}) {
  const active = sort.field === field;
  return (
    <th
      className="px-3 text-left text-gray-400 font-medium cursor-pointer select-none hover:text-gray-200"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          sort.dir === 'asc' ? (
            <ChevronUp size={13} />
          ) : (
            <ChevronDown size={13} />
          )
        ) : (
          <ChevronsUpDown size={13} className="opacity-40" />
        )}
      </span>
    </th>
  );
}

function DataRow({ task, onPatch }: { task: TaskItem; onPatch: (id: string, patch: Partial<TaskItem>) => void }) {
  const [editing, setEditing] = useState(false);
  const [titleVal, setTitleVal] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleVal(task.title);
  }, [task.title]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitTitle = () => {
    setEditing(false);
    if (titleVal.trim() && titleVal !== task.title) {
      onPatch(task.id, { title: titleVal.trim() });
    } else {
      setTitleVal(task.title);
    }
  };

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50 h-10">
      {/* Starred */}
      <td className="px-3 text-center">
        <input
          type="checkbox"
          checked={task.starred}
          onChange={(e) => onPatch(task.id, { starred: e.target.checked })}
          className="accent-yellow-400 cursor-pointer"
        />
      </td>

      {/* Title */}
      <td className="px-3 max-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') {
                setTitleVal(task.title);
                setEditing(false);
              }
            }}
            className="w-full bg-gray-700 border border-blue-500 rounded px-1 text-gray-100 outline-none text-sm"
          />
        ) : (
          <span
            title={task.title}
            onClick={() => setEditing(true)}
            className="block truncate cursor-text hover:text-white"
          >
            {task.title}
          </span>
        )}
      </td>

      {/* Date */}
      <td className="px-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(task.updated)}</td>

      {/* Upvote */}
      <td className="text-center">
        <button
          onClick={() => onPatch(task.id, { score: task.score + 1 })}
          title="Upvote"
          className="p-1 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded"
        >
          <ThumbsUp size={14} />
        </button>
      </td>

      {/* Score */}
      <td className="px-3 text-center text-gray-300">{task.score}</td>

      {/* Downvote */}
      <td className="text-center">
        <button
          onClick={() => onPatch(task.id, { score: task.score - 1 })}
          title="Downvote"
          className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded"
        >
          <ThumbsDown size={14} />
        </button>
      </td>
    </tr>
  );
}
