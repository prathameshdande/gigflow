import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 10,
            }}
            transition={{
              duration: 0.25,
            }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${width} overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/90`}>
            <div className="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl dark:bg-cyan-400/10" />

            <div className="relative z-10 flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h2>

              <button
                onClick={onClose}
                className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-white/10">
                <X size={18} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <div className="relative z-10 p-6">{children}</div>

            {footer && (
              <div className="relative z-10 border-t border-slate-200 px-6 py-4 dark:border-white/10">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
