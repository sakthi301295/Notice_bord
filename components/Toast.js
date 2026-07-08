import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

// Auto-dismisses after `duration` ms. Renders fixed to the viewport, so it
// always sits above page content rather than inside any specific component.
export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-end px-4 sm:bottom-6">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-lg shadow-emerald-100/50 ring-1 ring-black/5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        <p className="text-sm font-medium text-gray-800">{message}</p>
        <button
          onClick={onClose}
          className="ml-1 shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
