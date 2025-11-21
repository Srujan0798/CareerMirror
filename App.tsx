
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, FinalOutput, Message, User, Resume, AppView } from './types';
import { geminiService } from './services/geminiService';
import { mockBackend } from './services/mockBackend';
import ChatInterface from './components/ChatInterface';
import ResumePreview from './components/ResumePreview';
import CareerInsightsView from './components/CareerInsights';
import LoadingScreen from './components/LoadingScreen';
import Button from './components/Button';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { ArrowLeft, Save, LogIn } from 'lucide-react';

const App: React.FC = () => {
  // ==========================================
  // GLOBAL STATE
  // ==========================================
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('landing');
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [finalData, setFinalData] = useState<FinalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateSuggestion, setShowGenerateSuggestion] = useState(false);
  
  // Result View State
  const [activeTab, setActiveTab] = useState<'resume' | 'insights'>('resume');
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);

  // ==========================================
  // INITIALIZATION
  // ==========================================
  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await mockBackend.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Only go to dashboard if we aren't deep in a flow
        if (view === 'landing') {
          setView('dashboard');
        }
      }
    };
    initAuth();
  }, []);

  // Title Management
  useEffect(() => {
    if (view === 'results' && finalData?.professionalResume?.personalInfo?.name) {
      const safeName = finalData.professionalResume.personalInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
      document.title = `${safeName}_Resume`;
    } else {
      document.title = "CareerMirror AI";
    }
  }, [view, finalData]);

  // Suggest Generation
  useEffect(() => {
    if (view === 'chat' && messages.length >= 6) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'model' && lastMsg.text.toLowerCase().includes('generate')) {
        setShowGenerateSuggestion(true);
      } else if (messages.length >= 10) {
        setShowGenerateSuggestion(true);
      }
    }
  }, [messages, view]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // CRITICAL: Guest-to-User Persistence
    // If we have generated data but no user previously, save it now!
    if (finalData && messages.length > 0) {
      try {
        const saved = await mockBackend.saveResume(loggedInUser.id, finalData, messages);
        setActiveResumeId(saved.id);
        // Stay on results view so they can see what they just saved
        setView('results');
      } catch (e) {
        console.error("Failed to auto-save guest resume", e);
        setView('dashboard');
      }
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = async () => {
    await mockBackend.logout();
    setUser(null);
    setMessages([]);
    setFinalData(null);
    setActiveResumeId(null);
    setView('landing');
  };

  const handleStartInterview = () => {
    // We allow guests to start interviews now
    startNewSession();
  };

  const startNewSession = () => {
    setMessages([]);
    setFinalData(null);
    setActiveResumeId(null);
    geminiService.initializeChat();
    const initialMsg: Message = { 
      id: 'init', 
      role: 'model', 
      text: "Hi there! I'm CareerMirror. I'm here to help you build a professional resume and discover your ideal career path. Let's start naturally. Tell me a bit about your current or most recent job—what did you do, and what did you like about it?" 
    };
    setMessages([initialMsg]);
    setView('chat');
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setShowGenerateSuggestion(false); 

    try {
      const responseText = await geminiService.sendMessage(text);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Connection error. Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleGenerate = useCallback(async () => {
    if (messages.length < 2) {
      alert("We need a bit more information before generating your profile!");
      return;
    }
    
    setView('generating');
    try {
      const data = await geminiService.generateOutput(messages);
      setFinalData(data);
      
      // AUTO-SAVE TO DB if logged in
      if (user) {
        const saved = await mockBackend.saveResume(user.id, data, messages);
        setActiveResumeId(saved.id);
      }
      
      setView('results');
    } catch (error) {
      console.error("Generation Error:", error);
      alert("Failed to generate. Please try again.");
      setView('chat');
    }
  }, [messages, user]);

  const handleOpenResume = async (resume: Resume) => {
    // Try to fetch fresh data to ensure we have latest version
    try {
      const freshResume = await mockBackend.getResumeById(resume.id);
      const target = freshResume || resume;
      
      setFinalData({
        professionalResume: target.professionalResumeData,
        careerInsights: target.careerInsightsData
      });
      setActiveResumeId(target.id);
      
      // Restore chat history context if needed for future editing
      if (target.conversationHistory && target.conversationHistory.length > 0) {
         setMessages(target.conversationHistory);
         geminiService.initializeChat(target.conversationHistory);
      }

      setView('results');
    } catch (e) {
      console.error("Failed to load resume details", e);
      // Fallback to the data we have
      setFinalData({
        professionalResume: resume.professionalResumeData,
        careerInsights: resume.careerInsightsData
      });
      setView('results');
    }
  };

  const handleBackToDashboard = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('landing');
    }
  };

  const handleAuthRequest = () => {
    // Save current state implicit in finalData/messages
    setView('auth');
  }

  // ==========================================
  // RENDER
  // ==========================================

  if (view === 'generating') return <LoadingScreen />;

  if (view === 'auth') {
    return (
      <AuthScreen 
        onAuthSuccess={handleLoginSuccess} 
        onCancel={() => {
          // If we have data, go back to results, else landing
          if (finalData) setView('results');
          else setView('landing');
        }} 
      />
    );
  }

  if (view === 'dashboard' && user) {
    return (
      <Dashboard 
        user={user} 
        onOpenResume={handleOpenResume} 
        onNewResume={startNewSession} 
        onLogout={handleLogout}
        onUserUpdate={(updated) => setUser(updated)}
      />
    );
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Mock Header for Login */}
        <div className="absolute top-6 right-6 z-20">
           <Button variant="ghost" onClick={() => setView('auth')} className="text-slate-400 hover:text-white">
             Log In
           </Button>
        </div>

        <div className="max-w-3xl w-full text-center space-y-8 relative z-10">
          <div className="inline-flex items-center justify-center p-5 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-2xl shadow-indigo-500/10 relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
             <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-2">
            Career<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Mirror</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto px-4">
            The AI-powered career architect. Build a <span className="text-slate-200 font-medium">job-ready resume</span> and discover your <span className="text-slate-200 font-medium">strategic path</span> in minutes.
          </p>
          
          <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
            <Button onClick={handleStartInterview} className="text-lg px-10 py-4 shadow-2xl shadow-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400 bg-slate-900">
              Start Interview
            </Button>
          </div>
          <p className="text-xs text-slate-600 mt-4">Free Plan • No Credit Card Required</p>
        </div>
      </div>
    );
  }

  if (view === 'results' && finalData) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col overflow-hidden print:h-auto print:overflow-visible print:bg-white">
        <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-20 shrink-0 print:hidden">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                 onClick={handleBackToDashboard}
                 className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                 title="Back to Dashboard"
              >
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="font-bold text-xl flex items-center gap-2 text-slate-200">
                 <span className="text-indigo-400">Career</span>Mirror
              </div>
            </div>
            <div className="flex gap-2 md:gap-4">
              {/* CTA for Guest Users to Save */}
              {!user && (
                <Button onClick={handleAuthRequest} variant="secondary" className="text-xs md:text-sm px-4 py-2 border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/20">
                  <LogIn className="w-4 h-4" /> Save to Account
                </Button>
              )}

              {user && activeResumeId && (
                 <div className="hidden md:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg border border-emerald-400/20">
                    <Save className="w-3 h-3" /> Auto-Saved
                 </div>
              )}

              <Button onClick={() => window.print()} className="text-xs md:text-sm px-4 py-2 print:hidden bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20">
                Print / PDF
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 md:gap-12 pt-2 pb-0 print:hidden overflow-x-auto">
             <button 
               onClick={() => setActiveTab('resume')}
               className={`pb-4 px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-b-2 relative whitespace-nowrap ${
                 activeTab === 'resume' 
                   ? 'border-indigo-500 text-white' 
                   : 'border-transparent text-slate-500 hover:text-slate-300'
               }`}
             >
                {activeTab === 'resume' && <span className="absolute inset-0 bg-indigo-500/20 blur-lg -z-10"></span>}
                Professional Resume
             </button>
             <button 
               onClick={() => setActiveTab('insights')}
               className={`pb-4 px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-b-2 relative whitespace-nowrap ${
                 activeTab === 'insights' 
                   ? 'border-purple-500 text-white' 
                   : 'border-transparent text-slate-500 hover:text-slate-300'
               }`}
             >
                {activeTab === 'insights' && <span className="absolute inset-0 bg-purple-500/20 blur-lg -z-10"></span>}
                Career Insights
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible scroll-smooth">
          {activeTab === 'resume' ? (
             <ResumePreview data={finalData.professionalResume} />
          ) : (
             <div className="print:hidden">
               <CareerInsightsView data={finalData.careerInsights} />
             </div>
          )}
        </main>
      </div>
    );
  }

  // Chat View
  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden relative">
      <div className="flex-1 w-full max-w-5xl mx-auto p-2 md:p-6 h-full overflow-hidden flex flex-col relative z-10">
         <div className="mb-4 flex items-center gap-2 md:hidden">
            <button onClick={handleBackToDashboard} className="text-slate-400 text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
         </div>
         <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onGenerate={handleGenerate}
            isLoading={isLoading} 
         />
      </div>

      {showGenerateSuggestion && !isLoading && (
         <div className="absolute bottom-24 left-0 right-0 flex justify-center z-50 animate-bounce pointer-events-none">
            <button 
               onClick={handleGenerate}
               className="pointer-events-auto bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl shadow-indigo-600/40 font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all hover:scale-105"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
               </svg>
               Ready to Generate Resumes?
            </button>
         </div>
      )}
    </div>
  );
};

export default App;
