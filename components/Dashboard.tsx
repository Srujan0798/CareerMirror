
import React, { useEffect, useState } from 'react';
import { Resume, User } from '../types';
import { mockBackend } from '../services/mockBackend';
import Button from './Button';
import SettingsModal from './SettingsModal';
import PricingModal from './PricingModal';
import { FileText, Plus, Trash2, Clock, ChevronRight, Loader2, LogOut, Settings, Edit2, Crown, Lock } from 'lucide-react';

interface DashboardProps {
  user: User;
  onOpenResume: (resume: Resume) => void;
  onNewResume: () => void;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onOpenResume, onNewResume, onLogout, onUserUpdate }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  
  // Rename State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadResumes();
  }, [user.id]);

  const loadResumes = async () => {
    setIsLoading(true);
    try {
      const data = await mockBackend.getResumes(user.id);
      setResumes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    // Enforce Limits
    if (user.plan === 'free' && resumes.length >= 1) {
      setIsPricingOpen(true);
      return;
    }
    onNewResume();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this resume?')) {
      await mockBackend.deleteResume(user.id, id);
      loadResumes();
    }
  };

  const startRename = (e: React.MouseEvent, resume: Resume) => {
    e.stopPropagation();
    setEditingId(resume.id);
    setEditTitle(resume.title);
  };

  const saveRename = async (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!editingId || !editTitle.trim()) return;
    
    try {
      await mockBackend.updateResume(user.id, editingId, { title: editTitle });
      setResumes(prev => prev.map(r => r.id === editingId ? { ...r, title: editTitle } : r));
      setEditingId(null);
    } catch (error) {
      console.error("Failed to rename", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user} 
        onUpdateUser={onUserUpdate}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <PricingModal 
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        user={user}
        onUpdateUser={onUserUpdate}
      />

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
             <span className="text-indigo-500">Career</span>Mirror
          </div>
          <div className="flex items-center gap-3 md:gap-4">
             {user.plan === 'free' && (
               <Button 
                 variant="primary" 
                 className="!py-1.5 !px-3 text-xs hidden md:flex !rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105"
                 onClick={() => setIsPricingOpen(true)}
               >
                 <Crown className="w-3 h-3" /> Upgrade to Pro
               </Button>
             )}

             <div className="hidden md:flex items-center gap-3 mr-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-sm text-slate-300">
                  {user.name || user.email}
                  <span className="block text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    {user.plan} Plan
                    {user.plan === 'pro' && <Crown className="w-3 h-3 text-amber-400" />}
                  </span>
                </div>
             </div>
             
             <div className="flex items-center border-l border-slate-800 pl-4 gap-2">
               <Button variant="ghost" onClick={() => setIsSettingsOpen(true)} className="!p-2" title="Settings">
                 <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
               </Button>
               <Button variant="secondary" onClick={onLogout} className="!py-2 !px-3 text-xs">
                 <LogOut className="w-4 h-4 md:hidden" />
                 <span className="hidden md:inline">Sign Out</span>
               </Button>
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Resumes</h1>
            <p className="text-slate-400">
              Manage your career documents and insights.
              {user.plan === 'free' && (
                <span className="ml-2 text-amber-500 text-xs font-bold uppercase tracking-wide">
                   {resumes.length} / 1 Free Limit
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleCreateNew} className="shadow-xl shadow-indigo-900/20">
             {user.plan === 'free' && resumes.length >= 1 ? <Lock className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
             Create New
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                <FileText className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No resumes yet</h3>
             <p className="text-slate-400 mb-8 max-w-md mx-auto">Start a conversation with our AI to build your first professional resume and career map.</p>
             <Button onClick={onNewResume} variant="outline">Start First Interview</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div 
                key={resume.id}
                onClick={() => onOpenResume(resume)}
                className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-2xl hover:shadow-indigo-900/20 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Actions (Rename/Delete) */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={(e) => startRename(e, resume)}
                    className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Rename"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, resume.id)}
                    className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <FileText className="w-6 h-6" />
                </div>
                
                {editingId === resume.id ? (
                  <div className="mb-2 pr-16" onClick={e => e.stopPropagation()}>
                     <input 
                        type="text" 
                        value={editTitle} 
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveRename(e)}
                        className="w-full bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-white text-lg font-bold focus:outline-none"
                        autoFocus
                        onBlur={saveRename}
                     />
                  </div>
                ) : (
                  <h3 className="text-lg font-bold text-white mb-2 pr-16 truncate">{resume.title}</h3>
                )}
                
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                   <span className="flex items-center gap-1">
                     <Clock className="w-3 h-3" />
                     {new Date(resume.updatedAt).toLocaleDateString()}
                   </span>
                   <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400">v{resume.version}</span>
                </div>

                <div className="flex items-center text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                   View Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}

            {/* Upsell Card for Free Users */}
            {user.plan === 'free' && resumes.length >= 1 && (
               <div 
                 onClick={() => setIsPricingOpen(true)}
                 className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-6 cursor-pointer hover:bg-slate-900/50 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center text-center min-h-[240px]"
               >
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
                     <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Unlock Unlimited</h3>
                  <p className="text-slate-400 text-sm mb-4">Upgrade to Pro to create more resumes.</p>
                  <Button variant="secondary" className="text-xs">View Plans</Button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
