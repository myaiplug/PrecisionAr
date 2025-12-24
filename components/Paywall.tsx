
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { RocketLaunchIcon, CurrencyDollarIcon, SparklesIcon, XMarkIcon, ShieldCheckIcon, CpuChipIcon, ChartBarIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { upgradeToPro } from '../services/backend';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  priceData: { price: number, complexity: string, breakdown: any };
  onSuccess: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ isOpen, onClose, priceData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isOpen) {
        const interval = setInterval(() => setPulse(p => !p), 2000);
        return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    // 1. Simulate Payment Gateway (e.g. Stripe)
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
        await upgradeToPro();
        onSuccess();
        onClose();
    } catch (e) {
        alert("Neural Transaction Interrupted. Please retry.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-xl bg-[#020617] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_120px_rgba(20,184,166,0.15)] relative">
        
        {/* Pro Aesthetic Header */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-600" />
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>

        <div className="p-12">
            <div className="flex flex-col items-center text-center mb-12">
                <div className="relative mb-8">
                    <div className={`w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center transition-all duration-1000 ${pulse ? 'scale-110 shadow-[0_0_30px_rgba(20,184,166,0.2)]' : 'scale-100'}`}>
                        <SparklesIcon className="w-10 h-10 text-teal-400" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-[8px] font-black text-white px-2 py-1 rounded-md uppercase tracking-tighter">PREMIUM</div>
                </div>
                
                <h2 className="text-4xl font-black text-white tracking-tighter mb-3 italic uppercase">Neural Pass Required</h2>
                <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-[0.4em] leading-loose max-w-xs">
                    Free Demo Cycle Complete. Authenticate the specialized price below.
                </p>
            </div>

            {/* Profit-logic HUD */}
            <div className="bg-[#050b1a] border border-white/5 rounded-3xl p-8 mb-8 relative group hover:border-teal-500/30 transition-all overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ChartBarIcon className="w-24 h-24 text-teal-500" />
                </div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <BeakerIcon className="w-4 h-4 text-teal-500" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Architectural Complexity</span>
                    </div>
                    <span className="bg-teal-500/10 text-teal-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-500/20">{priceData.complexity}</span>
                </div>
                
                <div className="flex items-end justify-between border-t border-white/5 pt-8 relative z-10">
                    <div className="space-y-2">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest block">Neural Value Authorization</span>
                        <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-black text-white tracking-tighter">${priceData.price}</span>
                            <span className="text-zinc-600 text-sm font-medium">USD</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end text-zinc-700 font-mono text-[9px] uppercase tracking-widest space-y-1">
                        <span className="text-teal-500/60 flex items-center gap-2"><ShieldCheckIcon className="w-3 h-3" /> Profit-Safe v3</span>
                        <span>Load: {priceData.breakdown.tokens.toLocaleString()} TKN</span>
                        <span>Margin: {priceData.breakdown.margin}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] transition-all">
                    <CpuChipIcon className="w-6 h-6 text-teal-500/70" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Priority</span>
                        <span className="text-[8px] text-zinc-600 uppercase">GPU Allocation</span>
                    </div>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] transition-all">
                    <ShieldCheckIcon className="w-6 h-6 text-blue-500/70" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Export</span>
                        <span className="text-[8px] text-zinc-600 uppercase">Source Unlocked</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-br from-teal-500 to-blue-600 text-white font-black py-6 rounded-2xl transition-all shadow-[0_20px_40px_rgba(20,184,166,0.3)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-5 group border border-white/10"
            >
                {loading ? (
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-[10px] uppercase tracking-[0.4em]">Linking Terminal...</span>
                    </div>
                ) : (
                    <>
                        <CurrencyDollarIcon className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                        <span className="text-sm uppercase tracking-[0.4em]">Authorize Neural Credits</span>
                    </>
                )}
            </button>

            <div className="mt-10 flex items-center justify-center gap-8 opacity-20 hover:opacity-40 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4 grayscale invert" alt="Stripe" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 grayscale invert" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5 grayscale invert" alt="Mastercard" />
            </div>

            <p className="mt-8 text-[8px] text-center text-zinc-700 font-mono uppercase tracking-widest leading-relaxed">
                By purchasing, you authorize MyAiPlug to allocate Neural cycles for your next generation. 
                All transactions are strictly non-refundable and profit-optimized.
            </p>
        </div>
      </div>
    </div>
  );
};
