
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { XMarkIcon, UserIcon, AtSymbolIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { signIn, signUp } from '../services/backend';

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
      <div className="relative w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
                {isLogin ? 'Sign in to access your projects' : 'Join MyAiPlug to save your creations'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase ml-1">Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500 uppercase ml-1">Email Address</label>
                <div className="relative">
                    <AtSymbolIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="you@example.com"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500 uppercase ml-1">Password</label>
                <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg mt-6 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRightOnRectangleIcon className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-zinc-500 text-sm hover:text-white transition-colors"
            >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
        </div>
      </div>
    </div>
  );
};
