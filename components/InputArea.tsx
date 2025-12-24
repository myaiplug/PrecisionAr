
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, LinkIcon, PhotoIcon, XMarkIcon, BeakerIcon, SparklesIcon, Square3Stack3DIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { generateComponent } from '../services/gemini';

interface InputAreaProps {
  onGenerate: (prompt: string, image?: { data: string, mime: string }) => void;
  onInsertComponent: (snippet: string) => void;
  isGenerating: boolean;
  hasActiveProject: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, onInsertComponent, isGenerating, hasActiveProject, disabled = false }) => {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<'project' | 'component'>('project');
  const [image, setImage] = useState<{ data: string, mime: string, preview: string } | null>(null);
  const [snippetPreview, setSnippetPreview] = useState<string | null>(null);
  const [isGeneratingSnippet, setIsGeneratingSnippet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage({
          data: base64,
          mime: file.type,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !image) return;

    if (mode === 'project') {
      onGenerate(prompt, image ? { data: image.data, mime: image.mime } : undefined);
    } else {
      setIsGeneratingSnippet(true);
      try {
        const snippet = await generateComponent(prompt);
        setSnippetPreview(snippet);
      } catch (err) {
        alert("Snippet generation failed.");
      } finally {
        setIsGeneratingSnippet(false);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 relative z-20">
      
      {/* Mode Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#020617] border border-white/10 p-1 rounded-2xl flex items-center shadow-2xl">
          <button 
            onClick={() => setMode('project')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'project' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            <RocketLaunchIcon className="w-3.5 h-3.5" />
            Full Project
          </button>
          <button 
            onClick={() => setMode('component')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'component' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            <Square3Stack3DIcon className="w-3.5 h-3.5" />
            Component Lab
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className={`absolute -inset-[2px] bg-gradient-to-r ${mode === 'project' ? 'from-teal-500/40 via-blue-600/40 to-indigo-600/40' : 'from-fuchsia-500/40 via-purple-600/40 to-pink-600/40'} rounded-[24px] blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000`}></div>
        
        <form onSubmit={handleSubmit} className="relative bg-[#020617]/95 backdrop-blur-3xl border border-white/10 rounded-[22px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
          <div className="flex flex-col md:flex-row items-stretch p-2 gap-2">
            <div className="flex-1 flex flex-col min-h-[70px] justify-center relative bg-white/[0.02] rounded-xl border border-white/5 focus-within:bg-white/[0.04] transition-all">
              <div className="flex items-center">
                <div className="pl-5 pr-4 flex items-center text-zinc-500">
                  {mode === 'project' ? <LinkIcon className="w-5 h-5 opacity-40" /> : <Square3Stack3DIcon className="w-5 h-5 opacity-40 text-fuchsia-500" />}
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'project' ? "Paste GitHub URL or describe Pro UI concepts..." : "Describe a specific UI component (e.g., 'A premium dark analytics card')..."}
                  disabled={isGenerating || isGeneratingSnippet || disabled}
                  className="w-full bg-transparent border-none py-5 px-1 text-zinc-100 placeholder-zinc-700 focus:ring-0 text-sm font-medium tracking-tight"
                />
              </div>

              {image && mode === 'project' && (
                <div className="px-5 pb-4 flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                    <div className="relative w-24 h-14 rounded-lg overflow-hidden border border-white/20 group/img shadow-2xl">
                        <img src={image.preview} alt="Blueprint" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setImage(null)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"><XMarkIcon className="w-5 h-5 text-white" /></button>
                    </div>
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Blueprint Active</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
                {mode === 'project' && (
                  <>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isGenerating} className="h-full px-5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-3"><PhotoIcon className="w-5 h-5" /><span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden lg:inline">Blueprint</span></button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </>
                )}

                <button
                    type="submit"
                    disabled={isGenerating || isGeneratingSnippet || (!prompt.trim() && !image)}
                    className={`
                        h-full min-w-[180px] px-8 rounded-xl font-black transition-all flex items-center justify-center gap-3
                        ${mode === 'project' 
                          ? 'bg-gradient-to-br from-teal-500 to-blue-600' 
                          : 'bg-gradient-to-br from-fuchsia-500 to-purple-600'
                        } text-white shadow-xl active:scale-95 border border-white/10 disabled:opacity-50
                    `}
                >
                  {(isGenerating || isGeneratingSnippet) ? (
                      <div className="flex items-center gap-3 font-mono text-[10px] tracking-widest uppercase"><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Working</span></div>
                  ) : (
                      <>
                        {mode === 'project' ? <SparklesIcon className="w-5 h-5" /> : <BeakerIcon className="w-5 h-5" />}
                        <span className="text-xs uppercase tracking-[0.3em]">{mode === 'project' ? 'Architect' : 'Hallucinate'}</span>
                      </>
                  )}
                </button>
            </div>
          </div>

          {/* Snippet Preview Hudson */}
          {snippetPreview && mode === 'component' && (
            <div className="p-6 bg-black/40 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                      <BeakerIcon className="w-4 h-4 text-fuchsia-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Snippet Laboratory Preview</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <button onClick={() => setSnippetPreview(null)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Discard</button>
                      <button 
                        onClick={() => { onInsertComponent(snippetPreview); setSnippetPreview(null); }}
                        disabled={!hasActiveProject}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${hasActiveProject ? 'bg-fuchsia-500 text-white border-white/10 shadow-lg hover:scale-105' : 'bg-zinc-800 text-zinc-600 border-transparent cursor-not-allowed'}`}
                      >
                         Inject into Artifact
                      </button>
                  </div>
               </div>
               <div className="relative min-h-[150px] bg-[#050b1a] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-8 bg-dot-grid">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
                  <div className="relative z-10 w-full flex justify-center" dangerouslySetInnerHTML={{ __html: snippetPreview }} />
                  {/* Styling injection for preview */}
                  <script src="https://cdn.tailwindcss.com"></script>
               </div>
               {!hasActiveProject && <p className="mt-3 text-[9px] text-zinc-700 font-mono text-center uppercase tracking-widest">Load an artifact to enable neural injection</p>}
            </div>
          )}
          
          <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-600 font-mono uppercase tracking-[0.3em]">
            <div className="flex items-center gap-6">
                <span className="flex items-center gap-2"><BeakerIcon className="w-4 h-4 text-teal-500" /> MyAiPlug: Saasify v2.1</span>
                <span className="opacity-20 hidden sm:inline">|</span>
                <span className="hidden sm:inline">{mode === 'project' ? 'Enterprise Deployment' : 'Neural Snippet Engine'}</span>
            </div>
            <div className="flex items-center gap-2 text-teal-500/50">
                <div className="flex space-x-0.5">
                    {[1,2,3,4].map(i => <div key={i} className={`w-1 h-3 rounded-full bg-teal-500 animate-pulse`} style={{ animationDelay: `${i*0.1}s` }} />)}
                </div>
                <span>Session Active</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
