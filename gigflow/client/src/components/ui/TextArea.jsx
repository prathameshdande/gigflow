import { motion } from "framer-motion";
import clsx from "clsx";

const TextArea = ({
  label,
  value,
  onChange,
  name,
  placeholder,
  rows = 6,
  error,
  disabled = false,
  className,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <motion.div
        whileFocus={{ scale: 1.01 }}
        className={clsx(
          "rounded-2xl border bg-white/80 backdrop-blur-xl transition-all duration-300 dark:bg-white/5",
          error
            ? "border-red-500"
            : "border-slate-200 dark:border-white/10 focus-within:border-blue-500 dark:focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-blue-500/10",
          disabled && "opacity-60",
          className,
        )}>
        <textarea
          rows={rows}
          value={value}
          onChange={onChange}
          name={name}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full resize-none rounded-2xl bg-transparent p-5 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-500">
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default TextArea;
