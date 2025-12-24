
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { LivePreview } from './components/LivePreview';
import { CreationHistory, Creation } from './components/CreationHistory';
import { TemplateGallery } from './components/TemplateGallery';
import { bringToLife, refineCode } from './services/gemini';
import { UserCircleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/solid';
import { AuthModal } from './components/AuthModal';
import { User, getCurrentUser, signOut, loadUserProjects, saveProjectToDB } from './services/backend';

const App: React.FC = () => {
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Creation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            const dbProjects = await loadUserProjects();
            setHistory(dbProjects.map(p => ({...p, timestamp: new Date(p.timestamp)})));
        } else {
            const saved = localStorage.getItem('gemini_app_history');
            if (saved) {
                const parsed = JSON.parse(saved);
                setHistory(parsed.map((i: any) => ({...i, timestamp: new Date(i.timestamp)})));
            }
        }
      } catch (e) {
        console.error("Init failed:", e);
      } finally {
        setIsReady(true);
      }
    };
    init();
  }, []);

  const pushToUndoStack = useCallback((html: string) => {
    setUndoStack(prev => [...prev.slice(-19), html]);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !activeCreation) return;
    const previousHtml = undoStack[undoStack.length - 1];
    const newStack = undoStack.slice(0, -1);
    
    setUndoStack(newStack);
    const updated = { ...activeCreation, html: previousHtml };
    setActiveCreation(updated);
    setHistory(prev => prev.map(h => h.id === activeCreation.id ? updated : h));
    
    setStatusMessage("Neural State Restored");
    setTimeout(() => setStatusMessage(""), 2000);
  }, [undoStack, activeCreation]);

  // Keyboard Support: Ctrl/Cmd + Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (!isGenerating) {
            e.preventDefault();
            handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, isGenerating]);

  const handleGenerate = async (promptText: string, image?: { data: string, mime: string }) => {
    setIsGenerating(true);
    setActiveCreation(null);
    setUndoStack([]);

    try {
      const html = await bringToLife(promptText, image?.data, image?.mime);
      
      if (html) {
        const newCreation: Creation = {
          id: crypto.randomUUID(),
          name: image ? 'Visual Blueprint' : (promptText.includes('github.com') ? 'GitHub MVP' : 'Neural Artifact'),
          html: html,
          timestamp: new Date(),
        };
        setActiveCreation(newCreation);
        setHistory(prev => {
          const updated = [newCreation, ...prev];
          if (!user) localStorage.setItem('gemini_app_history', JSON.stringify(updated.slice(0, 20)));
          return updated;
        });
        
        if (user) {
             saveProjectToDB({
                name: newCreation.name,
                html: html,
                userId: user.id
             }).catch(() => {});
        }
      }
    } catch (error) {
      alert("Neural link error.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertComponent = async (snippet: string) => {
    if (!activeCreation) return;
    setIsGenerating(true);
    pushToUndoStack(activeCreation.html);

    try {
      const instruction = `Intelligently integrate the following UI component snippet into the current application layout. 
      Place it where it makes the most sense (e.g., inside a grid, in the sidebar, or as a new section). 
      Maintain all existing logic but polish the design to match the theme.
      
      SNIPPET TO INJECT:
      ${snippet}`;

      const updatedHtml = await refineCode(activeCreation.html, instruction);
      const updatedCreation = { ...activeCreation, html: updatedHtml, timestamp: new Date() };
      setActiveCreation(updatedCreation);
      setHistory(prev => prev.map(h => h.id === activeCreation.id ? updatedCreation : h));
    } catch (e) {
      alert("Injection failed. The snippet was too complex for current context.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleArchiveAction = async (creation: Creation, actionType: string) => {
    if (activeCreation?.id !== creation.id) setUndoStack([]);
    setActiveCreation(creation);
    setIsGenerating(true);

    let prompt = "";
    let downloadMd = false;

    switch (actionType) {
      case 'remix': prompt = "Completely remix this application architecture. Use professional FabFilter pro-visual aesthetics."; break;
      case 'edit': prompt = "Enable 'High-Fidelity' mode. Add 10 new advanced UI components and functional widgets."; break;
      case 'analyze': prompt = "Perform a technical audit and display it in a WebGL-style overlay HUD."; break;
      case 'roadmap': prompt = "Build a pro-grade roadmap HUD with interactive milestones."; break;
      case 'md_download': downloadMd = true; break;
      default: prompt = `Perform ${actionType} optimization.`;
    }

    if (downloadMd) {
        const md = `# Pro Analysis: ${creation.name}\n\nBuilt with Saasify v2.1`;
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `pro_analysis_${creation.id.slice(0, 8)}.md`; a.click();
        setIsGenerating(false);
        return;
    }

    try {
      pushToUndoStack(creation.html);
      const updatedHtml = await refineCode(creation.html, prompt);
      const updatedCreation = { ...creation, html: updatedHtml, timestamp: new Date() };
      setActiveCreation(updatedCreation);
      setHistory(prev => {
          const updated = prev.map(h => h.id === creation.id ? updatedCreation : h);
          if (!user) localStorage.setItem('gemini_app_history', JSON.stringify(updated.slice(0, 20)));
          return updated;
      });
    } catch (e) { alert("Refinement failed."); } finally { setIsGenerating(false); }
  };

  if (!isReady) return <div className="h-screen bg-[#020617] flex items-center justify-center text-teal-500 font-mono text-xs tracking-[0.5em] animate-pulse uppercase">Link_Established_Initializing...</div>;

  const isFocused = !!activeCreation || isGenerating;

  return (
    <div className="h-[100dvh] bg-[#020617] bg-dot-grid text-zinc-50 selection:bg-teal-500/30 overflow-y-auto overflow-x-hidden relative flex flex-col">
      <div className={`fixed top-0 left-0 right-0 p-6 z-40 flex justify-between items-center transition-all duration-700 ${isFocused ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
         <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl shadow-2xl flex items-center justify-center font-black text-white italic ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-500">S</div>
            <div className="flex flex-col">
                <span className="font-black text-sm tracking-tighter text-white">MyAiPlug</span>
                <span className="text-[7px] font-mono text-teal-500 uppercase tracking-widest leading-none">Saasify v2.1</span>
            </div>
         </div>
         {user ? (
             <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full px-4 py-2">
                 <img src={user.avatar} alt="User" className="w-6 h-6 rounded-full ring-1 ring-teal-500/50" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{user.name}</span>
                 <button onClick={async () => { await signOut(); setUser(null); }} className="ml-2 text-zinc-600 hover:text-red-400 transition-colors">
                     <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                 </button>
             </div>
         ) : (
             <button onClick={() => setIsAuthOpen(true)} className="bg-white text-black px-6 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all shadow-2xl hover:bg-teal-400 active:scale-95">
                 Get Started
             </button>
         )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={setUser} />

      <div className={`min-h-full flex flex-col w-full relative z-10 transition-all duration-1000 ${isFocused ? 'opacity-0 scale-95 blur-3xl pointer-events-none' : 'opacity-100'}`}>
        <div className="flex-1 flex flex-col justify-center items-center w-full pt-32 pb-20 px-4">
          <Hero />
          <div className="w-full mt-16">
              <InputArea 
                onGenerate={handleGenerate} 
                onInsertComponent={handleInsertComponent}
                isGenerating={isGenerating} 
                hasActiveProject={!!activeCreation}
              />
          </div>
        </div>
        <TemplateGallery onSelect={(url) => handleGenerate(url)} />
        <div className="flex-shrink-0 pb-20 w-full">
            <CreationHistory history={history} onSelect={(c) => { setActiveCreation(c); setUndoStack([]); }} onAction={handleArchiveAction} />
        </div>
      </div>

      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        isFocused={isFocused}
        user={user}
        onReset={() => { setActiveCreation(null); setIsGenerating(false); }}
        onUndo={handleUndo}
        canUndo={undoStack.length > 0}
        undoCount={undoStack.length}
        status={statusMessage}
        onUpdate={(html) => {
            if (activeCreation) {
                pushToUndoStack(activeCreation.html);
                const updated = { ...activeCreation, html };
                setActiveCreation(updated);
                setHistory(prev => prev.map(h => h.id === activeCreation.id ? updated : h));
            }
        }}
      />
    </div>
  );
};

export default App;
