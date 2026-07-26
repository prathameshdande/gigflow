import { motion } from "framer-motion";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const Input = ({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  error,
  disabled = false,
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

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
          "group flex items-center rounded-2xl border bg-white/80 backdrop-blur-xl transition-all duration-300 dark:bg-white/5",
          error
            ? "border-red-500"
            : "border-slate-200 dark:border-white/10 focus-within:border-blue-500 dark:focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-blue-500/10",
          disabled && "opacity-60",
          className,
        )}>
        {Icon && (
          <div className="pl-5 text-slate-400 transition group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400">
            <Icon size={20} />
          </div>
        )}

        <input
          {...props}
          type={inputType}
          value={value}
          onChange={onChange}
          name={name}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-transparent px-5 py-4 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-5 text-slate-400 transition hover:text-blue-600 dark:hover:text-cyan-400">
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
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

export default Input;
