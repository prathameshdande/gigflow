import { motion } from "framer-motion";
import Button from "./Button";

const EmptyState = ({
  icon: Icon,
  title = "Nothing here yet",
  description = "There is no data to display.",
  actionText,
  onAction,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 px-8 py-16 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      {Icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-500/10">
          <Icon size={42} className="text-blue-600 dark:text-cyan-400" />
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>

      <p className="mt-3 max-w-md text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {actionText && (
        <div className="mt-8 w-full max-w-xs">
          <Button onClick={onAction}>{actionText}</Button>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
