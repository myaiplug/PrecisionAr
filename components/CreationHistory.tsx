
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { 
  ClockIcon, 
  EllipsisHorizontalIcon, 
  ArrowPathIcon, 
  DocumentTextIcon, 
  PencilSquareIcon, 
  SwatchIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  MapIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string; 
  timestamp: Date;
}

interface CreationHistoryProps {
  history: Creation[];
  onSelect: (creation: Creation) => void;
  onAction: (creation: Creation, action: string) => void;
}

const LiveThumbnail = ({ html }: { html: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#09090b] pointer-events-none">
      <div 
        className="w-[1280px] h-[850px] scale-[0.2] sm:scale-[0.24] origin-top-left opacity-70 group-hover:opacity-100 transition-opacity duration-1000 ease-out"
      >
        <iframe
          ref={iframeRef}
          srcDoc={html}
          className="w-full h-full border-none pointer-events-none"
          title="preview"
          loading="lazy"
        />
      </div>
      {/* High-end glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
      <div className="absolute inset-0 border-[0.5px] border-white/5 rounded-2xl z-15 pointer-events-none" />
    </div>
  );
};

export const CreationHistory: React.FC<CreationHistoryProps> = ({ history, onSelect, onAction }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    { id: 'remix', label: 'Remix Project', icon: ArrowPathIcon },
    { id: 'blog', label: 'Turn Into Blog', icon: DocumentTextIcon },
    { id: 'edit', label: 'Edit Architecture', icon: PencilSquareIcon },
    { id: 'theme', label: 'Switch Theme', icon: SwatchIcon },
    { id: 'analyze', label: 'Strategic Analysis', icon: MagnifyingGlassIcon },
    { id: 'seo', label: 'Generate SEO Pack', icon: ChartBarIcon },
    { id: 'roadmap', label: 'Generate Roadmap', icon: MapIcon },
    { id: 'md_download', label: 'Download Analysis .md', icon: ArrowDownTrayIcon },
  ];

  if (history.length === 0) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-7xl mx-auto px-6 mt-12">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center space-x-3">
          <ClockIcon className="w-4 h-4 text-indigo-500" />
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500">Creation Archive</h2>
        </div>
        <div className="h-px flex-1 mx-8 bg-zinc-800/50"></div>
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{history.length} Artifacts</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col w-full h-64 bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 rounded-3xl transition-all duration-700 overflow-hidden shadow-2xl hover:shadow-indigo-500/10"
          >
            {/* Screenshot Visualization */}
            <div 
              className="flex-1 cursor-pointer overflow-hidden relative" 
              onClick={() => onSelect(item)}
            >
               <LiveThumbnail html={item.html} />
               <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-indigo-600/90 backdrop-blur px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircleIcon className="w-3 h-3" /> Live Artifact
                  </div>
               </div>
            </div>

            {/* Context Menu Action */}
            <div className="absolute top-4 right-4 z-40">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === item.id ? null : item.id);
                }}
                className="w-9 h-9 flex items-center justify-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-zinc-400 hover:text-white hover:border-indigo-500 transition-all shadow-xl"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>

              {openMenuId === item.id && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 mt-3 w-64 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
                >
                  <div className="p-2.5 grid grid-cols-1 gap-1">
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(item, action.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-indigo-600/20 rounded-xl transition-all text-left group/btn"
                      >
                        <action.icon className="w-4 h-4 text-zinc-600 group-hover/btn:text-indigo-400 transition-colors" />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Footer */}
            <div className="relative z-20 p-5 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pointer-events-none">
              <div className="flex justify-between items-end">
                <div className="flex flex-col space-y-1">
                  <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                    {item.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors truncate max-w-[150px]">
                    {item.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end opacity-40">
                    <span className="text-[8px] text-zinc-500 font-mono">MVP_{item.id.slice(0, 6)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
