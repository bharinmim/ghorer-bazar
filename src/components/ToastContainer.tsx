import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Sparkles, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => {
        let Icon = Info;
        let borderClass = 'border-cyan-500/30 text-cyan-400';
        let bgGlow = 'rgba(6, 182, 212, 0.15)';

        if (toast.type === 'success') {
          Icon = CheckCircle;
          borderClass = 'border-emerald-500/40 text-emerald-400';
          bgGlow = 'rgba(16, 185, 129, 0.15)';
        } else if (toast.type === 'loot') {
          Icon = Sparkles;
          borderClass = 'border-pink-500/40 text-pink-400';
          bgGlow = 'rgba(236, 72, 153, 0.2)';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/40 text-amber-400';
          bgGlow = 'rgba(245, 158, 11, 0.15)';
        }

        return (
          <div
            key={toast.id}
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.92)', boxShadow: `0 8px 24px ${bgGlow}` }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${borderClass} backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100 tracking-wide font-display">{toast.title}</h4>
                <span className="text-[10px] text-slate-400">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
