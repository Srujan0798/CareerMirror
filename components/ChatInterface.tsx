import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import Button from './Button';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

// Typewriter Component for Natural AI Effect
const Typewriter: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset if text changes
    setDisplayedText('');
    indexRef.current = 0;
  }, [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15); // Speed of typing

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <>{displayedText}</>;
};

// Icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, onGenerate, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Special effect to keep scrolling while typing
  const handleTyping = () => {
    scrollToBottom();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-slate-900/50 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-slate-800/50 relative">
      {/* Decorative gradient blob in background */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      {/* Header - z-50 ensures it's always on top */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-200">Interview Session</h2>
            <p className="text-xs text-slate-400">CareerMirror AI • Online</p>
          </div>
        </div>
        {/* Generate button visible on MD screens in header */}
        <Button onClick={onGenerate} variant="secondary" className="text-xs md:text-sm py-2 px-3 md:px-4 !rounded-lg border-slate-700 hover:border-indigo-500/50 hidden md:flex">
          Finish & Generate
        </Button>
      </div>

      {/* Messages - z-10 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 relative z-10 scroll-smooth">
        {messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1;
          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                 <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 mt-1 shrink-0 text-indigo-400">
                    <SparklesIcon />
                 </div>
              )}
              <div 
                className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-2xl text-[15px] leading-relaxed shadow-md backdrop-blur-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-none shadow-indigo-500/20 border border-indigo-500/20' 
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-bl-none'
                }`}
              >
                {msg.role === 'model' && isLast ? (
                   /* Apply typewriter effect ONLY to the very last AI message */
                   <Typewriter text={msg.text} onComplete={handleTyping} />
                ) : (
                   msg.text
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start items-end">
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 shrink-0 text-indigo-400">
                <SparklesIcon />
             </div>
             <div className="bg-slate-800/80 p-4 rounded-2xl rounded-bl-none border border-slate-700/50 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Glowing Input UI - z-20 */}
      <div className="p-3 md:p-6 pt-2 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent z-20">
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* The Chat Input */}
          <div className="relative group flex-1">
            {/* GLOW EFFECT */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
            
            {/* MAIN BAR */}
            <form 
              onSubmit={handleSubmit} 
              className="relative bg-slate-950 border border-slate-800 rounded-2xl flex items-center p-1.5 md:p-2 shadow-2xl"
            >
              <div className="p-2 md:p-3 text-indigo-400 hidden md:block">
                <SparklesIcon />
              </div>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..." 
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none font-medium text-sm px-3 md:px-0 py-2"
                disabled={isLoading}
                autoFocus
              />
              
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 md:p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center shadow-lg shadow-indigo-900/20 shrink-0"
              >
                <SendIcon />
              </button>
            </form>
          </div>

          {/* Bottom 'Finish' Button for accessibility on mobile */}
          <div>
             <button 
               onClick={onGenerate}
               className="h-[48px] w-[48px] md:h-[52px] md:w-auto md:px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-slate-300 hover:text-white transition-all hover:scale-105 shadow-lg group"
               title="Finish & Generate Resume"
             >
                <CheckIcon />
                <span className="font-medium text-sm hidden md:inline">Done</span>
             </button>
          </div>

        </div>
        <p className="text-center text-xs text-slate-500 mt-3 md:mt-4 font-medium">CareerMirror AI analyzes your input to build your profile.</p>
      </div>
    </div>
  );
};

export default ChatInterface;