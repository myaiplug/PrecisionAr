
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SparklesIcon, FireIcon, CursorArrowRaysIcon, BeakerIcon } from '@heroicons/react/24/solid';

const TEMPLATES = [
  {
    id: 't1',
    name: 'AI Audio Engine',
    url: 'https://github.com/lucidrains/voicebox-pytorch',
    description: 'Transform voice synthesis code into a premium B2B Audio SaaS.',
    icon: SparklesIcon,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 't2',
    name: 'Real-time Analytics',
    url: 'https://github.com/tinybirdco/analytics-starter-kit',
    description: 'Convert raw data pipelines into a high-conversion Dashboard product.',
    icon: FireIcon,
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 't3',
    name: 'Growth CRM',
    url: 'https://github.com/twentyhq/twenty',
    description: 'Architect a sales-optimized CRM MVP with proven growth loops.',
    icon: CursorArrowRaysIcon,
    color: 'from-emerald-500 to-teal-600'
  }
];

interface TemplateGalleryProps {
  onSelect: (url: string) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 mb-16">
      <div className="flex items-center space-x-3 mb-8">
        <BeakerIcon className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-500">Accelerated Blueprints</h2>
        <div className="h-px flex-1 bg-zinc-800/50"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.url)}
            className="group relative text-left bg-zinc-900/40 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
          >
            <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${t.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-4 shadow-lg`}>
              <t.icon className="w-5 h-5 text-white" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{t.name}</h3>
            <p className="text-zinc-500 text-xs leading-relaxed mb-4">{t.description}</p>
            
            <div className="flex items-center text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">
              <span className="truncate max-w-[180px]">{t.url.replace('https://github.com/', '')}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
