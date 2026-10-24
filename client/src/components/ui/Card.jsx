import { motion } from "framer-motion";
import clsx from "clsx";

const Card = ({
  children,
  className,
  hover = true,
  glow = true,
  padding = "p-6",
}) => {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -6,
              scale: 1.01,
            }
          : {}
      }
      transition={{
        duration: 0.25,
      }}
      className={clsx(
        "relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-md shadow-xl dark:border-white/10 dark:bg-white/5",
        padding,
        className,
      )}>
      {glow && (
        <>
          <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-blue-500/10 blur-2xl dark:bg-cyan-400/10" />

          <div className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-violet-500/10 blur-2xl dark:bg-indigo-500/10" />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default Card;
