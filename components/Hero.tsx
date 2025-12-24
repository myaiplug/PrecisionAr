
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { CommandLineIcon, RocketLaunchIcon, CurrencyDollarIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const FloatingOrb = ({ delay, x, y, size, color }: { delay: number, x: string, y: string, size: string, color: string }) => (
    <div 
        className={`absolute rounded-full blur-[160px] animate-pulse pointer-events-none z-0 ${color}`}
        style={{ 
            top: y, 
            left: x, 
            width: size, 
            height: size, 
            animationDelay: `${delay}ms`,
            animationDuration: '12s',
            opacity: 0.2
        }}
    />
);

export const Hero: React.FC = () => {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingOrb delay={0} x="-10%" y="-10%" size="800px" color="bg-teal-500/30" />
        <FloatingOrb delay={4000} x="60%" y="40%" size="900px" color="bg-indigo-600/30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        <div className="absolute inset-0 bg-dot-grid opacity-30"></div>
      </div>

      <div className="text-center relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-6">
        <div className="inline-flex items-center space-x-3 bg-zinc-900/40 backdrop-blur-3xl border border-white/5 px-5 py-2 rounded-full mb-12 animate-in fade-in slide-in-from-top-6 duration-1000 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <SparklesIcon className="w-4 h-4 text-teal-400" />
            <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-zinc-400 font-mono">MyAiPlug: Saasify v2.1 • Pro-GUI Suite</span>
        </div>
        
        <h1 className="text-7xl sm:text-9xl font-black tracking-[-0.05em] text-white mb-10 leading-[0.85] selection:bg-teal-500/30">
          Precision <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-300 via-blue-500 to-indigo-600">Architect.</span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-zinc-500 max-w-3xl mx-auto leading-relaxed font-medium mb-16 tracking-tight">
            Deploy high-fidelity SaaS MVPs from GitHub repositories or UI screenshots. 
            Automated sales loops and professional-grade GUI deconstruction.
        </p>

        <div className="flex flex-wrap justify-center gap-10 md:gap-16 max-w-4xl mx-auto text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em]">
            <div className="flex flex-col items-center gap-4 group cursor-help">
                <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-teal-500/50 group-hover:bg-teal-500/5 transition-all">
                    <CommandLineIcon className="w-5 h-5 text-zinc-700 group-hover:text-teal-400" />
                </div>
                <span>Repo_DNA</span>
            </div>
            <div className="flex flex-col items-center gap-4 group cursor-help">
                <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all">
                    <RocketLaunchIcon className="w-5 h-5 text-zinc-700 group-hover:text-blue-400" />
                </div>
                <span>SaaS_Deploy</span>
            </div>
            <div className="flex flex-col items-center gap-4 group cursor-help">
                <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all">
                    <CurrencyDollarIcon className="w-5 h-5 text-zinc-700 group-hover:text-indigo-400" />
                </div>
                <span>Profit_Loop</span>
            </div>
            <div className="flex flex-col items-center gap-4 group cursor-help">
                <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-teal-500/50 group-hover:bg-teal-500/5 transition-all">
                    <PresentationChartLineIcon className="w-5 h-5 text-zinc-700 group-hover:text-teal-400" />
                </div>
                <span>Roadmap_HUD</span>
            </div>
        </div>
      </div>
    </>
  );
};
