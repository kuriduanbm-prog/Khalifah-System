import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ConfirmDialogModal: React.FC = () => {
  const { confirmDialog, closeConfirm } = useApp();

  if (!confirmDialog.isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-scale-up">
        <div className="flex items-center gap-3.5 mb-4">
          <div
            className={`p-3 rounded-2xl ${
              confirmDialog.type === 'danger'
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                : confirmDialog.type === 'warning'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            }`}
          >
            {confirmDialog.type === 'danger' ? (
              <AlertCircle className="w-6 h-6" />
            ) : confirmDialog.type === 'warning' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Info className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{confirmDialog.title}</h3>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
          {confirmDialog.message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={closeConfirm}
            className="px-4 py-2.5 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {confirmDialog.cancelText || 'ยกเลิก'}
          </button>
          <button
            onClick={() => {
              confirmDialog.onConfirm();
              closeConfirm();
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${
              confirmDialog.type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {confirmDialog.confirmText || 'ยืนยัน'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
