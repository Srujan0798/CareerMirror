
import React, { useState } from 'react';
import { User } from '../types';
import Button from './Button';
import { X, Loader2, User as UserIcon, Mail, Crown, ArrowRight } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';

interface SettingsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  onOpenPricing: () => void; // New prop
}

const SettingsModal: React.FC<SettingsModalProps> = ({ user, isOpen, onClose, onUpdateUser, onOpenPricing }) => {
  const [name, setName] = useState(user.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updatedUser = await mockBackend.updateUser(user.id, { name });
      onUpdateUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(onClose, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Account Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
            <div className="relative group">
               <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400" />
               <input
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                 placeholder="Your Name"
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
            <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
               <input
                 type="email"
                 value={user.email}
                 disabled
                 className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-500 cursor-not-allowed"
               />
            </div>
            <p className="text-[10px] text-slate-600">Email cannot be changed.</p>
          </div>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center justify-between gap-3">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Crown className="w-5 h-5" />
               </div>
               <div>
                  <div className="text-sm font-bold text-indigo-300">Current Plan: {user.plan.toUpperCase()}</div>
                  {user.plan === 'free' && <div className="text-xs text-indigo-400/60">1 Active Resume Limit</div>}
               </div>
             </div>
             {user.plan === 'free' && (
               <button 
                 type="button"
                 onClick={() => { onClose(); onOpenPricing(); }}
                 className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
               >
                 Upgrade <ArrowRight className="w-3 h-3" />
               </button>
             )}
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-xs font-medium text-center ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
