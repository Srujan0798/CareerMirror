import React from 'react';
import { CareerInsights } from '../types';

interface CareerInsightsProps {
  data: CareerInsights;
}

// Dark Mode Card Component
const InsightCard: React.FC<{ title: string; children: React.ReactNode; colorClass: string; borderColor: string }> = ({ title, children, colorClass, borderColor }) => (
  <div className={`bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-xl border ${borderColor} h-full hover:bg-slate-900/70 transition-colors duration-300`}>
    <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${colorClass} flex items-center gap-2`}>
      {title}
    </h3>
    {children}
  </div>
);

const CareerInsightsView: React.FC<CareerInsightsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>No career insights data found.</p>
      </div>
    );
  }

  const { personalityProfile, idealRoles, environments, redFlags, careerPath, recommendations } = data;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      
      {/* Hero Section - Cyberpunk Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-1 shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="bg-slate-950/50 backdrop-blur-sm rounded-[22px] p-8 md:p-12 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                    <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">Career Identity Map</h2>
                    <p className="text-indigo-200 text-lg mb-8 font-light">A data-driven mirror to your professional soul.</p>
                    
                    <div className="inline-block">
                        <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Work Style Archetype</div>
                        <div className="text-3xl font-bold text-white mb-2 tracking-tight">{personalityProfile?.workStyle || "Pending Analysis..."}</div>
                    </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-6 border border-white/10 w-full">
                     <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Core Strengths</h4>
                     <div className="flex flex-wrap gap-2">
                        {personalityProfile?.strengths?.map((s, i) => (
                           <span key={i} className="text-xs font-medium px-3 py-1.5 bg-white/10 text-white rounded-full border border-white/5 hover:bg-white/20 transition-colors">
                             {s}
                           </span>
                        ))}
                     </div>
                     {personalityProfile?.preferences && (
                       <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Preferences</h4>
                           <div className="text-sm text-slate-300 flex flex-wrap gap-x-2">
                              {personalityProfile.preferences.map((p, i) => (
                                <span key={i}>• {p}</span>
                              ))}
                           </div>
                       </div>
                     )}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Roles - Violet Neon */}
        <InsightCard title="Recommended Roles" colorClass="text-violet-400" borderColor="border-violet-500/20">
            <div className="space-y-4">
               {idealRoles && idealRoles.length > 0 ? (
                 idealRoles.map((role, idx) => (
                    <div key={idx} className="p-4 bg-violet-500/5 rounded-xl border border-violet-500/10 hover:border-violet-500/30 transition-colors">
                       <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-violet-100 text-lg">{role.title}</span>
                          <span className="text-xs font-mono font-bold text-violet-300 bg-violet-500/10 px-2 py-1 rounded">{role.matchScore}% Match</span>
                       </div>
                       
                       {/* Visual Match Score Bar */}
                       <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                          <div 
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${role.matchScore}%` }}
                          />
                       </div>

                       <p className="text-xs text-slate-400 leading-relaxed">{role.reasoning}</p>
                    </div>
                 ))
               ) : (
                 <span className="text-slate-500 italic text-sm">No roles suggested.</span>
               )}
            </div>
        </InsightCard>

        {/* Environment - Blue Neon */}
        <InsightCard title="Optimal Environment" colorClass="text-cyan-400" borderColor="border-cyan-500/20">
          <div className="space-y-6">
             <div>
                <span className="text-xs font-bold text-cyan-500 block mb-3 uppercase">You Thrive In</span>
                <ul className="space-y-2">
                  {environments?.preferred?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm bg-cyan-900/10 p-2 rounded-lg border border-cyan-500/5">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 shrink-0 shadow-[0_0_5px_rgba(34,211,238,0.5)]"></span> 
                      {item}
                    </li>
                  ))}
                </ul>
             </div>
             <div className="pt-4 border-t border-dashed border-slate-700">
                <span className="text-xs font-bold text-slate-400 block mb-3 uppercase">Environments to Avoid</span>
                <ul className="space-y-2">
                  {environments?.toAvoid?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-400 text-sm opacity-80">
                       <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 shrink-0"></span> 
                       {item}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </InsightCard>

        {/* Red Flags - Rose Neon */}
        <InsightCard title="Red Flags & Warning Signs" colorClass="text-rose-400" borderColor="border-rose-500/20">
           <div className="mb-4 text-xs text-slate-500">Warning signs in job descriptions that align with your dislikes:</div>
           <ul className="space-y-3">
              {redFlags && redFlags.length > 0 ? (
                 redFlags.map((item, idx) => (
                   <li key={idx} className="flex items-start gap-3 text-rose-200/80 text-sm group p-2 hover:bg-rose-900/10 rounded-lg transition-colors">
                      <span className="mt-0.5 p-1 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20 shrink-0">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                         </svg>
                      </span>
                      {item}
                   </li>
                 ))
              ) : (
                <li className="text-slate-500 italic text-sm">No red flags identified.</li>
              )}
           </ul>
        </InsightCard>

        {/* Career Path - Emerald Neon */}
        <InsightCard title="Strategic Roadmap" colorClass="text-emerald-400" borderColor="border-emerald-500/20">
           <div className="space-y-6 relative">
              {/* Connecting Line */}
              <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500/30 to-transparent"></div>

              <div className="relative">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs z-10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">1-2y</div>
                    <h4 className="text-sm text-emerald-400 font-bold uppercase tracking-wider">Short Term</h4>
                 </div>
                 <ul className="pl-14 list-disc list-outside text-sm text-slate-300 space-y-2 marker:text-emerald-500/50">
                    {careerPath?.shortTerm?.map((step, i) => <li key={i}>{step}</li>)}
                 </ul>
              </div>
              
              <div className="relative">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-900/20 border border-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs z-10">3-5y</div>
                    <h4 className="text-sm text-emerald-600 font-bold uppercase tracking-wider">Long Term</h4>
                 </div>
                 <ul className="pl-14 list-disc list-outside text-sm text-slate-400 space-y-2 marker:text-emerald-800">
                    {careerPath?.longTerm?.map((step, i) => <li key={i}>{step}</li>)}
                 </ul>
              </div>
           </div>
        </InsightCard>
      </div>

      {/* Recommendations - Amber Neon */}
      <div className="bg-amber-950/30 border border-amber-500/20 p-8 rounded-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
         
         <h3 className="text-lg font-bold text-amber-400 mb-6 uppercase tracking-wide flex items-center gap-3 relative z-10">
            <span className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </span>
            Actionable Recommendations
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {recommendations?.map((rec, idx) => (
               <div key={idx} className="flex items-start gap-4 p-3 hover:bg-amber-500/5 rounded-xl transition-colors border border-transparent hover:border-amber-500/10">
                  <span className="text-amber-500/40 font-bold text-xl font-mono">0{idx + 1}</span>
                  <p className="text-slate-300 text-sm leading-relaxed pt-1.5">{rec}</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default CareerInsightsView;