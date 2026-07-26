import clsx from "clsx";

const variants = {
  primary: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",

  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",

  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",

  danger: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",

  purple:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",

  gray: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
};

const Badge = ({ children, variant = "primary", className }) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all",
        variants[variant],
        className,
      )}>
      {children}
    </span>
  );
};

export default Badge;
