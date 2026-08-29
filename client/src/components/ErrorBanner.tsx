import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "../store/useStore";

export default function ErrorBanner() {
  const errorMessage = useStore((s) => s.errorMessage);
  const setErrorMessage = useStore((s) => s.setErrorMessage);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = window.setTimeout(() => setErrorMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [errorMessage, setErrorMessage]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-cream shadow-xl"
            role="alert"
          >
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setErrorMessage(null)}
              className="ml-1 rounded-full p-0.5 hover:bg-white/10"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
