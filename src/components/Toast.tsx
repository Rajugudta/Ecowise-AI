import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      id="toast-notification-banner"
      role="status"
      aria-live="polite"
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm max-w-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
        toast.type === 'success'
          ? 'bg-slate-900 text-white border-[#3DCD58]/50 shadow-[0_4px_20px_rgba(61,205,88,0.25)]'
          : toast.type === 'error'
          ? 'bg-red-950 text-red-100 border-red-800/80 shadow-[0_4px_20px_rgba(239,68,68,0.2)]'
          : 'bg-slate-900 text-slate-100 border-slate-700 shadow-xl'
      }`}
    >
      <div className="shrink-0">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#3DCD58]" />}
        {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
      </div>
      <div className="flex-1 leading-snug">{toast.message}</div>
      <button
        id="btn-toast-dismiss"
        onClick={onDismiss}
        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
