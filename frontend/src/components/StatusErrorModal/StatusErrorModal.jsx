import { memo } from "react";
import { X, AlertCircle } from "lucide-react";

function StatusErrorModal({ isOpen, onClose, title, message, fallback }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative bg-geodude-950 border border-status-error/50 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top-Right Close Icon */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-paper-500 hover:text-foreground transition-colors focus:outline-none"
          aria-label="Close error message"
        >
          <X size={20} />
        </button>

        {/* Error Icon */}
        <div className="w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center mb-4 text-status-error">
          <AlertCircle size={24} />
        </div>

        <h3 className="text-foreground font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-paper-300 mb-6">
           {message || fallback}
        </p>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full bg-geodude-900 hover:bg-geodude-800 text-foreground py-2.5 rounded-xl border border-geodude-800 transition-colors font-semibold"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default memo(StatusErrorModal);