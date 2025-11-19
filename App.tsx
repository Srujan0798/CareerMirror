import React, { useState, useCallback, useEffect } from 'react';
import { AppState, FinalOutput, Message } from './types';
import { geminiService } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import ResumePreview from './components/ResumePreview';
import CareerInsightsView from './components/CareerInsights';
import LoadingScreen from './components/LoadingScreen';
import Button from './components/Button';

// Constants for Session Storage keys
const STORAGE_KEYS = {
  STATE: 'careerMirror_state',
  MESSAGES: 'careerMirror_messages',
  DATA: 'careerMirror_data',
};

const App: React.FC = () => {
  // Lazy initialization from Session Storage (FR-5.6)
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.STATE);
      return saved ? JSON.parse(saved) : AppState.Welcome;
    } catch {
      return AppState.Welcome;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [finalData, setFinalData] = useState<FinalOutput | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.DATA);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'insights'>('resume');
  const [showGenerateSuggestion, setShowGenerateSuggestion] = useState(false);

  // Persistence Effect: Save state whenever it changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
    sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    if (finalData) {
      sessionStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(finalData));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.DATA);
    }
  }, [state, messages, finalData]);

  // Initialize Chat Logic
  useEffect(() => {
    // Case 1: Starting fresh (User clicked Start Interview)
    if (state === AppState.Chat && messages.length === 0) {
      geminiService.initializeChat();
      const initialMsg: Message = { 
        id: 'init', 
        role: 'model', 
        text: "Hi there! I'm CareerMirror. I'm here to help you build a professional resume and discover your ideal career path. Let's start naturally. Tell me a bit about your current or most recent job—what did you do, and what did you like about it?" 
      };
      setMessages([initialMsg]);
    }
    // Case 2: Restoring session (Page reload with existing history)
    else if ((state === AppState.Chat || state === AppState.Results) && messages.length > 0) {
      // Re-hydrate Gemini Service with history so it knows context
      geminiService.initializeChat(messages);
    }
  }, [state, messages.length]); // removed 'messages' dependency to prevent loop, strictly check length

  // Smart File Naming for PDF Export (FR-4.4)
  useEffect(() => {
    if (state === AppState.Results && finalData?.professionalResume?.personalInfo?.name) {
      const safeName = finalData.professionalResume.personalInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
      document.title = `${safeName}_Professional_Resume`;
    } else {
      document.title = "CareerMirror AI";
    }
    return () => {
      document.title = "CareerMirror AI";
    };
  }, [state, finalData]);

  // Check for Generate Suggestion visibility on mount/update
  useEffect(() => {
    if (state === AppState.Chat && messages.length >= 6) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'model' && lastMsg.text.toLowerCase().includes('generate')) {
        setShowGenerateSuggestion(true);
      } else if (messages.length >= 10) {
        setShowGenerateSuggestion(true);
      }
    }
  }, [messages, state]);

  const handleStart = useCallback(() => {
    setState(AppState.Chat);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Optimistic update
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
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "I apologize, but I encountered a connection error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleGenerate = useCallback(async () => {
    if (messages.length < 3) {
      alert("Please continue the conversation a bit longer so I can gather enough details!");
      return;
    }
    
    setState(AppState.Generating);
    try {
      const data = await geminiService.generateOutput(messages);
      setFinalData(data);
      setState(AppState.Results);
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Something went wrong analyzing your data. Please try again.");
      setState(AppState.Chat);
    }
  }, [messages]);

  const handleReset = () => {
    const confirm = window.confirm("Are you sure? This will delete your current progress and start over.");
    if (confirm) {
      // Clear Storage (FR-5.5)
      sessionStorage.clear();
      
      // Reset State
      setMessages([]);
      setFinalData(null);
      setShowGenerateSuggestion(false);
      setActiveTab('resume');
      setState(AppState.Welcome);
    }
  };

  if (state === AppState.Generating) {
    return <LoadingScreen />;
  }

  if (state === AppState.Welcome) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

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
            Transform a simple conversation into a <span className="text-slate-200 font-medium">job-ready resume</span> and a <span className="text-slate-200 font-medium">strategic career map</span>.
          </p>
          
          <div className="pt-8">
            <Button onClick={handleStart} className="text-lg px-12 py-4 md:px-16 md:py-5 shadow-2xl shadow-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400 bg-slate-900 w-full md:w-auto">
              {messages.length > 0 ? "Resume Session" : "Start Interview"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === AppState.Results && finalData) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col overflow-hidden print:h-auto print:overflow-visible print:bg-white">
        {/* Header - Hidden in print */}
        <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-20 shrink-0 print:hidden">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="font-bold text-xl flex items-center gap-2 text-slate-200">
               <span className="text-indigo-400">Career</span>Mirror
            </div>
            <div className="flex gap-2 md:gap-4">
              <Button variant="ghost" onClick={handleReset} className="text-xs md:text-sm px-3 py-2 text-slate-400 hover:text-white">
                Start Over
              </Button>
              <Button onClick={() => window.print()} className="text-xs md:text-sm px-4 py-2 print:hidden bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20">
                Print / PDF
              </Button>
            </div>
          </div>
          
          {/* Neon Tabs - Hidden in print */}
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

  // Chat State
  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden relative">
      <div className="flex-1 w-full max-w-5xl mx-auto p-2 md:p-6 h-full overflow-hidden flex flex-col relative z-10">
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