import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const SnackbarContainer: React.FC = () => {
  const { snackbars, removeSnackbar } = useApp();

  if (snackbars.length === 0) return null;

  return (
    <div
      id="snackbar-container"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 flex flex-col gap-2 pointer-events-none"
    >
      {snackbars.map((s) => {
        let bgClass = 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900';
        let icon = <Info className="w-5 h-5 text-sky-400 dark:text-sky-600 shrink-0" />;

        if (s.type === 'success') {
          bgClass = 'bg-emerald-900 text-emerald-50 dark:bg-emerald-100 dark:text-emerald-950 border border-emerald-700/50';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-700 shrink-0" />;
        } else if (s.type === 'error') {
          bgClass = 'bg-rose-900 text-rose-50 dark:bg-rose-100 dark:text-rose-950 border border-rose-700/50';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 dark:text-rose-700 shrink-0" />;
        } else if (s.type === 'warning') {
          bgClass = 'bg-amber-900 text-amber-50 dark:bg-amber-100 dark:text-amber-950 border border-amber-700/50';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 dark:text-amber-700 shrink-0" />;
        }

        return (
          <div
            key={s.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-lg transition-all animate-slide-up ${bgClass}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span className="text-sm font-medium leading-snug">{s.text}</span>
            </div>
            <button
              onClick={() => removeSnackbar(s.id)}
              className="p-1 hover:opacity-75 rounded-full transition-opacity ml-2 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
