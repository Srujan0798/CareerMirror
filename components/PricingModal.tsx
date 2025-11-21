
import React, { useState } from 'react';
import { User } from '../types';
import Button from './Button';
import { Check, X, Sparkles, Crown, ShieldCheck, Loader2 } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (user: User) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await mockBackend.upgradePlan(user.id, 'pro');
      onUpdateUser(updatedUser);
      onClose();
    } catch (error) {
      console.error("Upgrade failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        {/* Left Side: Value Prop */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-900 to-purple-900 p-8 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           
           <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/20">
                 <Crown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Unlock Your Career Potential</h2>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Join thousands of professionals who landed their dream jobs using CareerMirror Pro.
              </p>
           </div>
           
           <div className="relative z-10 mt-8 space-y-4">
              <div className="flex items-center gap-3 text-indigo-100 text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> 14-Day Money Back Guarantee
              </div>
              <div className="flex items-center gap-3 text-indigo-100 text-sm">
                <Sparkles className="w-5 h-5 text-amber-400" /> AI-Powered Insights
              </div>
           </div>
        </div>

        {/* Right Side: Comparison */}
        <div className="w-full md:w-3/5 p-8 bg-slate-900">
           <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h3>
              <p className="text-slate-400 text-sm">Simple pricing. Cancel anytime.</p>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Free Plan */}
              <div className="border border-slate-800 rounded-2xl p-4 opacity-70 hover:opacity-100 transition-opacity">
                 <h4 className="font-bold text-slate-400 mb-2">Free</h4>
                 <div className="text-2xl font-bold text-white mb-4">$0</div>
                 <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex gap-2"><Check className="w-3 h-3 text-emerald-500" /> 1 Saved Resume</li>
                    <li className="flex gap-2"><Check className="w-3 h-3 text-emerald-500" /> Basic Export</li>
                    <li className="flex gap-2"><X className="w-3 h-3 text-slate-600" /> No History</li>
                 </ul>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-indigo-500 bg-indigo-500/5 rounded-2xl p-4 relative transform scale-105 shadow-xl shadow-indigo-500/10">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Most Popular</div>
                 <h4 className="font-bold text-indigo-400 mb-2">Pro</h4>
                 <div className="text-2xl font-bold text-white mb-4">$12<span className="text-sm font-normal text-slate-500">/mo</span></div>
                 <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex gap-2"><Check className="w-3 h-3 text-indigo-400" /> Unlimited Resumes</li>
                    <li className="flex gap-2"><Check className="w-3 h-3 text-indigo-400" /> Advanced Templates</li>
                    <li className="flex gap-2"><Check className="w-3 h-3 text-indigo-400" /> AI Career Coach</li>
                    <li className="flex gap-2"><Check className="w-3 h-3 text-indigo-400" /> PDF & Word Export</li>
                 </ul>
              </div>
           </div>

           <div className="text-center">
              <Button 
                onClick={handleUpgrade} 
                fullWidth 
                disabled={isLoading || user.plan === 'pro'}
                className={user.plan === 'pro' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin" /> 
                ) : user.plan === 'pro' ? (
                   'Current Plan'
                ) : (
                   'Upgrade to Pro'
                )}
              </Button>
              <p className="text-[10px] text-slate-600 mt-4">
                Secure payment processing powered by Stripe.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
