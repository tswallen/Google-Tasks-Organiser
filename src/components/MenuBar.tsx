import { useRef, useState } from 'react';
import {
  Upload,
  Download,
  Shuffle,
  CalendarDays,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  BookOpen,
  BookMarked,
} from 'lucide-react';
import type { Settings as SettingsType, ReadFilter } from '../types';

interface Props {
  onImport: (file: File) => void;
  onExport: () => void;
  onShuffle: () => void;
  onSchedule: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  settings: SettingsType;
  onSettingsChange: (s: SettingsType) => void;
  readFilter: ReadFilter;
  onReadFilterChange: (f: ReadFilter) => void;
  counts: { total: number; read: number; unread: number };
}

export function MenuBar({
  onImport,
  onExport,
  onShuffle,
  onSchedule,
  sidebarOpen,
  onToggleSidebar,
  settings,
  onSettingsChange,
  readFilter,
  onReadFilterChange,
  counts,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = '';
  };

  return (
    <div className="relative flex items-center justify-between h-12 px-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
      {/* Left group */}
      <div className="flex items-center gap-1">
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
        <IconBtn title="Import JSON" onClick={() => fileRef.current?.click()}>
          <Upload size={18} />
        </IconBtn>
        <IconBtn title="Export JSON" onClick={onExport}>
          <Download size={18} />
        </IconBtn>
        <IconBtn title="Shuffle" onClick={onShuffle}>
          <Shuffle size={18} />
        </IconBtn>
        <IconBtn title="Quick Schedule" onClick={onSchedule}>
          <CalendarDays size={18} />
        </IconBtn>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        {/* Read/Unread toggle */}
        <button
          title={readFilter === 'unread' ? 'Showing unread — click to show read' : 'Showing read — click to show unread'}
          onClick={() => onReadFilterChange(readFilter === 'unread' ? 'read' : 'unread')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            readFilter === 'unread'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-600/40 hover:bg-blue-600/30'
              : 'bg-amber-600/20 text-amber-400 border border-amber-600/40 hover:bg-amber-600/30'
          }`}
        >
          {readFilter === 'unread' ? <BookMarked size={13} /> : <BookOpen size={13} />}
          {readFilter === 'unread' ? 'Unread' : 'Read'}
        </button>

        {/* Counts */}
        <span className="text-xs text-gray-500 ml-2 select-none">
          {counts.unread} unread · {counts.read} read · {counts.total} total
        </span>
      </div>

      {/* Right group */}
      <div className="flex items-center gap-1">
        <IconBtn title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'} onClick={onToggleSidebar}>
          {sidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </IconBtn>

        <div
          className="relative"
          onMouseEnter={() => setSettingsOpen(true)}
          onMouseLeave={() => setSettingsOpen(false)}
        >
          <IconBtn title="Settings">
            <Settings size={18} />
          </IconBtn>
          {settingsOpen && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-xl z-50 w-44 py-2 px-3">
              <label className="flex items-center gap-2 text-sm py-1 cursor-pointer select-none hover:text-white">
                <input
                  type="checkbox"
                  checked={settings.showBelow1}
                  onChange={(e) => onSettingsChange({ ...settings, showBelow1: e.target.checked })}
                  className="accent-blue-500"
                />
                Show &lt; 1
              </label>
              <label className="flex items-center gap-2 text-sm py-1 cursor-pointer select-none hover:text-white">
                <input
                  type="checkbox"
                  checked={settings.showAbove1}
                  onChange={(e) => onSettingsChange({ ...settings, showAbove1: e.target.checked })}
                  className="accent-blue-500"
                />
                Show &gt; 1
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-100 transition-colors"
    >
      {children}
    </button>
  );
}
