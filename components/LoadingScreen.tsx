import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, BrainCircuit } from 'lucide-react';

const LOADING_STAGES = [
  "Analyzing conversation patterns...",
  "Extracting professional experience...",
  "Identifying core strengths & skills...",
  "Constructing personality profile...",
  "Finalizing resume documents..."
];

const LoadingScreen: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500); // Advance stage every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      
      <div className="relative mb-10">
        {/* Central AI Brain Icon with Rings */}
        <div className="relative z-10 bg-slate-900 p-6 rounded-full border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
          <BrainCircuit className="w-12 h-12 text-indigo-400 animate-pulse" />
        </div>
        
        {/* Spinning Rings */}
        <div className="absolute inset-0 -m-2 border-2 border-indigo-500/30 rounded-full border-t-transparent animate-spin duration-[3000ms]"></div>
        <div className="absolute inset-0 -m-6 border border-purple-500/20 rounded-full border-b-transparent animate-[spin_4s_linear_infinite_reverse]"></div>
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-8 tracking-tight text-center">
        Building Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Profile</span>
      </h2>

      {/* Stages List */}
      <div className="w-full max-w-sm space-y-4">
        {LOADING_STAGES.map((stage, index) => {
          const isActive = index === currentStage;
          const isCompleted = index < currentStage;
          const isPending = index > currentStage;

          return (
            <div 
              key={index} 
              className={`flex items-center gap-3 transition-all duration-500 ${
                isActive ? 'scale-105 opacity-100' : 
                isCompleted ? 'opacity-50 blur-[0.5px]' : 
                'opacity-30'
              }`}
            >
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                isActive ? 'text-indigo-300' : 
                isCompleted ? 'text-slate-400' : 
                'text-slate-600'
              }`}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-900 w-full">
         <div 
           className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ease-out"
           style={{ width: `${((currentStage + 1) / LOADING_STAGES.length) * 100}%` }}
         />
      </div>
    </div>
  );
};

export default LoadingScreen;