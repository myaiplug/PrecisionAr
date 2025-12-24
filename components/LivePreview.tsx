
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowDownTrayIcon, 
  ViewColumnsIcon, 
  CodeBracketIcon, 
  XMarkIcon, 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  ArrowsRightLeftIcon,
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChevronDownIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { Creation } from './CreationHistory';
// @ts-ignore
import JSZip from 'jszip';
import { refineCode, convertToFlutter } from '../services/gemini';
import { User } from '../services/backend';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  user: User | null;
  onReset: () => void;
  onUpdate: (updatedHtml: string) => void;
  onUndo: () => void;
  canUndo: boolean;
  undoCount?: number;
  status?: string;
}

const TelemetryLoader = ({ status }: { status?: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] relative">
        <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none"></div>
        <div className="w-full max-w-xl p-12 relative z-10">
            <div className="flex items-end justify-center space-x-1 h-20 mb-12">
                {[...Array(24)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1.5 bg-teal-500 rounded-full animate-wave" 
                        style={{ 
                            animationDelay: `${i * 0.05}s`,
                            height: `${20 + Math.random() * 80}%`
                        }}
                    />
                ))}
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[24px] shadow-2xl">
                <div className="space-y-6 font-mono">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 tracking-widest uppercase mb-4 border-b border-white/5 pb-2">
                        <span>Saasify HUD</span>
                        <span>v2.1.0-Pro</span>
                    </div>
                    <LoadingStep text={status || "Neural Link: Active"} active={true} />
                </div>
            </div>
        </div>
    </div>
);

const LoadingStep = ({ text, active }: { text: string, active: boolean }) => (
    <div className={`flex items-center space-x-4 transition-all duration-700 ${active ? 'opacity-100' : 'opacity-20'}`}>
        <div className={`w-3 h-3 rounded-full ${active ? 'bg-teal-400 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-zinc-800'}`}></div>
        <span className="text-[10px] font-bold text-zinc-300 tracking-[0.3em] uppercase">{text}</span>
    </div>
);

export const LivePreview: React.FC<LivePreviewProps> = ({ 
    creation, 
    isLoading, 
    isFocused, 
    user, 
    onReset, 
    onUpdate, 
    onUndo, 
    canUndo,
    undoCount = 0,
    status = ""
}) => {
    const [showSplitView, setShowSplitView] = useState(true);
    const [splitPos, setSplitPos] = useState(30);
    const [isResizing, setIsResizing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [isRefining, setIsRefining] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'assistant' | 'system', text: string}[]>([]);
    const [telemetryStatus, setTelemetryStatus] = useState("");

    const chatEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
                setExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;
            const containerWidth = containerRef.current.offsetWidth;
            const newPos = (e.clientX / containerWidth) * 100;
            if (newPos > 10 && newPos < 90) setSplitPos(newPos);
        };
        const handleMouseUp = () => setIsResizing(false);
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !creation || isRefining) return;
        const userMsg = chatInput;
        setChatInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setMessages(prev => [...prev, { role: 'system', text: "Analyzing GUI Delta..." }]);
        setIsRefining(true);
        
        try {
            const updatedHtml = await refineCode(creation.html, userMsg);
            onUpdate(updatedHtml);
            setMessages(prev => [
                ...prev.filter(m => m.role !== 'system'), 
                { role: 'assistant', text: "Code refinement successful. Architected new GUI modules." }
            ]);
        } catch (e: any) {
            setMessages(prev => [
                ...prev.filter(m => m.role !== 'system'), 
                { role: 'system', text: `ERROR: ${e.message || "Engine disconnected. Retry link."}` }
            ]);
        } finally {
            setIsRefining(false);
        }
    };

    const handleExportWeb = async () => {
        if (!creation) return;
        setExportMenuOpen(false);
        try {
            const zip = new JSZip();
            // Simple extraction logic for package
            const styleMatch = creation.html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
            const scriptMatch = creation.html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
            
            const styles = styleMatch ? styleMatch[1] : "";
            const scripts = scriptMatch ? scriptMatch[1] : "";
            const bodyMatch = creation.html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
            const body = bodyMatch ? bodyMatch[1] : creation.html;

            const cleanHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${creation.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${body}
    <script src="main.js"></script>
</body>
</html>`;

            zip.file("index.html", cleanHtml);
            zip.file("style.css", styles);
            zip.file("main.js", scripts);
            zip.file("manifest.json", JSON.stringify({ name: creation.name, version: "1.0.0" }));

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${creation.name.replace(/\s+/g, '_').toLowerCase()}_web.zip`;
            a.click();
        } catch (e) {
            alert("Export failed.");
        }
    };

    const handleExportFlutter = async () => {
        if (!creation) return;
        setExportMenuOpen(false);
        setIsRefining(true);
        setTelemetryStatus("Translating to Dart/Flutter...");
        
        try {
            const dartCode = await convertToFlutter(creation.html);
            const zip = new JSZip();
            
            const pubspec = `name: ${creation.name.replace(/\s+/g, '_').toLowerCase()}
description: A MyAiPlug Generated Flutter Project.
version: 1.0.0+1
environment:
  sdk: '>=3.0.0 <4.0.0'
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
flutter:
  uses-material-design: true`;

            zip.file("lib/main.dart", dartCode);
            zip.file("pubspec.yaml", pubspec);
            zip.file("README.md", `# ${creation.name} Mobile\nTranslated from Saasify v2.1 artifact.`);

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${creation.name.replace(/\s+/g, '_').toLowerCase()}_flutter.zip`;
            a.click();
        } catch (e) {
            alert("Flutter conversion failed.");
        } finally {
            setIsRefining(false);
            setTelemetryStatus("");
        }
    };

    return (
        <div
            ref={containerRef}
            className={`
                fixed z-50 flex flex-col
                bg-[#020617] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1)
                ${isFocused ? 'inset-3 md:inset-5 opacity-100 scale-100 rounded-[28px]' : 'top-1/2 left-1/2 w-0 h-0 opacity-0 pointer-events-none'}
            `}
        >
            {/* Pro Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/60 backdrop-blur-3xl shrink-0 rounded-t-[28px]">
                <div className="flex items-center space-x-6">
                    <button onClick={onReset} className="w-3.5 h-3.5 rounded-full bg-red-500/30 hover:bg-red-500 transition-all border border-red-500/50" />
                    <div className="h-5 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500 leading-none mb-1">
                            {isLoading || isRefining ? 'Architecting Environment' : (status || 'Production Preview')}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{creation?.name || 'INITIALIZING_SESSION'}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {(!isLoading && !isRefining) && (
                        <>
                            <button 
                                onClick={onUndo}
                                disabled={!canUndo}
                                title="Undo Neural Step (Ctrl+Z)"
                                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border group/undo relative ${canUndo ? 'text-zinc-300 border-white/5 hover:bg-white/5 hover:border-teal-500/30' : 'text-zinc-800 border-transparent cursor-not-allowed'}`}
                            >
                                <ArrowUturnLeftIcon className={`w-3.5 h-3.5 ${canUndo ? 'group-hover/undo:-rotate-45 transition-transform' : ''}`} />
                                <span>Undo</span>
                                {canUndo && (
                                    <span className="bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded-md text-[8px] font-mono ml-1">
                                        {undoCount}
                                    </span>
                                )}
                            </button>
                            <div className="h-6 w-px bg-white/10 mx-2" />
                            <button 
                                onClick={() => setShowSplitView(!showSplitView)}
                                className={`p-2.5 rounded-xl border transition-all ${showSplitView ? 'border-teal-500/50 bg-teal-500/10 text-teal-400' : 'border-white/5 text-zinc-500 hover:text-white'}`}
                            >
                                <ViewColumnsIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setShowChat(!showChat)}
                                className={`p-2.5 rounded-xl border transition-all ${showChat ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-white/5 text-zinc-500 hover:text-white'}`}
                            >
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            </button>
                            
                            {/* Pro Export Menu */}
                            <div className="relative" ref={exportMenuRef}>
                                <button 
                                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                                    className="bg-gradient-to-br from-teal-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-teal-500/20 active:scale-95 border border-white/10 ml-2 flex items-center gap-2"
                                >
                                    <span>Export Suite</span>
                                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {exportMenuOpen && (
                                    <div className="absolute top-full right-0 mt-3 w-64 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-3xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 space-y-1">
                                            <button 
                                                onClick={() => {
                                                    const blob = new Blob([creation?.html || ""], { type: 'text/html' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = 'index.html';
                                                    a.click();
                                                    setExportMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-teal-400 hover:bg-teal-500/5 rounded-xl transition-all group"
                                            >
                                                <CodeBracketIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span>Standalone HTML</span>
                                            </button>
                                            <button 
                                                onClick={handleExportWeb}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-400 hover:bg-blue-500/5 rounded-xl transition-all group"
                                            >
                                                <GlobeAltIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span>Web Package (ZIP)</span>
                                            </button>
                                            <button 
                                                onClick={handleExportFlutter}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/5 rounded-xl transition-all group"
                                            >
                                                <DevicePhoneMobileIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span>Flutter Mobile</span>
                                            </button>
                                            <div className="h-px bg-white/5 my-1" />
                                            <button 
                                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-800 cursor-not-allowed rounded-xl transition-all group"
                                            >
                                                <Square3Stack3DIcon className="w-4 h-4" />
                                                <span>Asset Library (WIP)</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex overflow-hidden relative">
                {(isLoading || isRefining) ? <TelemetryLoader status={telemetryStatus} /> : (
                    <>
                        {showSplitView && (
                            <div 
                                style={{ width: `${splitPos}%` }} 
                                className="h-full border-r border-white/5 bg-zinc-950 relative flex flex-col"
                            >
                                <div className="absolute top-6 left-8 z-10 px-3 py-1 bg-black/50 border border-white/10 rounded-lg text-[9px] font-mono text-teal-500 uppercase tracking-widest">
                                    Strategic HUD
                                </div>
                                <div className="p-10 h-full overflow-y-auto">
                                    <div className="prose prose-invert prose-sm">
                                        <h4 className="text-teal-400 font-black tracking-tighter uppercase mb-2">Roadmap Alpha</h4>
                                        <p className="text-zinc-500 text-[11px] leading-relaxed mb-8">The engine has successfully deconstructed the input DNA. Use the Growth Editor to trigger design refinements.</p>
                                        <div className="space-y-4">
                                            {[1,2,3,4,5,6].map(i => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 group hover:bg-white/[0.04] transition-all">
                                                    <div className="w-5 h-5 rounded-lg border border-teal-500/30 flex items-center justify-center text-[9px] text-teal-500 font-black">{i}</div>
                                                    <div className="flex-1">
                                                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                            <div className="h-full bg-teal-500/40 w-0 group-hover:w-full transition-all duration-1000" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div onMouseDown={handleMouseDown} className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-30 group">
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 bg-white/10 group-hover:bg-teal-500 transition-colors" />
                                </div>
                            </div>
                        )}

                        <div className="flex-1 bg-white h-full relative">
                            <iframe 
                                key={creation?.html.length}
                                srcDoc={creation?.html}
                                className="w-full h-full border-none"
                                sandbox="allow-scripts allow-modals allow-same-origin allow-popups allow-forms"
                            />
                        </div>

                        {/* Growth Editor - Pro Panel */}
                        <div className={`absolute top-0 right-0 bottom-0 w-[380px] bg-zinc-950 border-l border-white/5 flex flex-col transition-transform duration-700 cubic-bezier(0.19, 1, 0.22, 1) z-40 ${showChat ? 'translate-x-0 shadow-[-50px_0_100px_rgba(0,0,0,0.5)]' : 'translate-x-full'}`}>
                            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-900/60">
                                <div className="flex items-center gap-3">
                                    <SparklesIcon className="w-4 h-4 text-teal-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Growth Editor</span>
                                </div>
                                <button onClick={() => setShowChat(false)} className="text-zinc-600 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-95">
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-8 space-y-4 opacity-30">
                                        <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                            <SparklesIcon className="w-8 h-8 text-teal-500" />
                                        </div>
                                        <p className="text-[10px] font-mono uppercase tracking-[0.3em] leading-relaxed text-zinc-400">Growth Engine Online. Describe UI changes, business logic, or conversion strategies.</p>
                                    </div>
                                )}
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                                            max-w-[85%] px-4 py-3 rounded-2xl text-[11px] leading-relaxed font-medium shadow-2xl
                                            ${m.role === 'user' ? 'bg-teal-600 text-white' : 
                                              m.role === 'system' ? 'bg-zinc-900/80 border border-teal-500/30 text-teal-400 font-mono italic text-center w-full' :
                                              'bg-zinc-900 border border-white/5 text-zinc-300'}
                                        `}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-6 border-t border-white/5 bg-zinc-900/60">
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={chatInput}
                                        disabled={isRefining}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={isRefining ? "Architecting..." : "Analyze and refine GUI..."}
                                        className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-white placeholder-zinc-700 focus:border-teal-500 outline-none transition-all disabled:opacity-50 font-medium"
                                    />
                                    <button 
                                        onClick={handleSendMessage} 
                                        disabled={isRefining || !chatInput.trim()}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-teal-500 hover:text-teal-400 disabled:opacity-20 transition-all"
                                    >
                                        {isRefining ? (
                                            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <PaperAirplaneIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <style>{`
                @keyframes wave {
                    0%, 100% { height: 20%; opacity: 0.2; transform: scaleY(0.8); }
                    50% { height: 100%; opacity: 1; transform: scaleY(1.2); }
                }
                .animate-wave {
                    animation: wave 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                }
            `}</style>
        </div>
    );
};
