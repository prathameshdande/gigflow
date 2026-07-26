import { motion } from "framer-motion";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-white shadow-xl hover:shadow-blue-500/30",

  secondary:
    "border border-slate-200 bg-white/80 text-slate-900 shadow-lg backdrop-blur-xl hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",

  success:
    "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl hover:shadow-emerald-500/30",

  warning:
    "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-xl hover:shadow-yellow-500/30",

  danger:
    "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xl hover:shadow-red-500/30",

  ghost:
    "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",

  glass:
    "border border-white/20 bg-white/30 text-slate-900 shadow-xl backdrop-blur-xl hover:bg-white/40 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
};

const sizes = {
  sm: "h-10 px-4 text-sm rounded-xl",

  md: "h-12 px-6 text-base rounded-2xl",

  lg: "h-14 px-8 text-lg rounded-2xl",
};

const Button = ({
  children,
  type = "button",
  onClick,
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
}) => {
  return (
    <motion.button
      whileHover={
        disabled || loading
          ? {}
          : {
              y: -2,
              scale: 1.02,
            }
      }
      whileTap={
        disabled || loading
          ? {}
          : {
              scale: 0.98,
            }
      }
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 18,
      }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth ? "w-full" : "w-auto",
        variants[variant],
        sizes[size],
        className,
      )}>
      {!disabled && variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition duration-700 group-hover:translate-x-full" />
      )}

      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="flex items-center">{leftIcon}</span>}

          <span>{children}</span>

          {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
