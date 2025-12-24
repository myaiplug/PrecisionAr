
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { XMarkIcon, UserIcon, AtSymbolIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { signIn, signUp, signInWithGoogle } from '../services/backend';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
        const user = await signInWithGoogle();
        onLoginSuccess(user);
        onClose();
    } catch (err: any) {
        setError("Google authentication failed");
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await signIn(email, password);
      } else {
        if (!name) throw new Error("Name is required");
        user = await signUp(email, password, name);
      }
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#020617] border border-white/10 rounded-2xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200 p-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center justify-center mb-4">
                <UserIcon className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
                {isLogin ? 'Neural Link' : 'Initialize Identity'}
            </h2>
            <p className="text-zinc-500 text-[11px] mt-1 font-mono uppercase tracking-widest text-center">
                {isLogin ? 'Authorize Access to Saasify v2.1' : 'Create unique architect credentials'}
            </p>
        </div>

        <div className="space-y-4">
            <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 bg-white text-black py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                <span>Sign in with Google</span>
            </button>

            <div className="flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">or neural id</span>
                <div className="h-px flex-1 bg-white/5" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Architect Name</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black border border-white/5 rounded-xl py-3 pl-4 pr-4 text-white focus:outline-none focus:border-teal-500/50 transition-colors text-xs"
                                placeholder="Full Identity"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Terminal</label>
                    <div className="relative">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-white/5 rounded-xl py-3 pl-4 pr-4 text-white focus:outline-none focus:border-teal-500/50 transition-colors text-xs"
                            placeholder="architect@nexus.io"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Neural Key</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-white/5 rounded-xl py-3 pl-4 pr-4 text-white focus:outline-none focus:border-teal-500/50 transition-colors text-xs"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-mono text-center uppercase tracking-widest">
                        ERROR: {error}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-br from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-black py-4 rounded-xl mt-6 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase text-[10px] tracking-[0.3em] shadow-2xl"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            {isLogin ? 'Initiate Link' : 'Register Identity'}
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(null); }}
                    className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                    {isLogin ? "Generate New Neural ID" : "Return to Link Terminal"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
