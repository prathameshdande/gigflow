import { motion } from "framer-motion";

const SkeletonCard = () => (
  <div className="space-y-3">
    <div className="h-4 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
    <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
    <div className="h-4 w-5/6 rounded-full bg-slate-200 dark:bg-slate-700" />
  </div>
);

const SkillSkeleton = () => (
  <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
);

const GigSkeleton = () => {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <motion.div
          key={index}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: index * 0.08,
          }}
          className="overflow-hidden rounded-[30px] border border-slate-200/60 bg-white p-7 shadow-lg dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-700" />

              <div className="space-y-3">
                <div className="h-5 w-40 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>

            <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="mt-8">
            <SkeletonCard />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <SkillSkeleton />
            <SkillSkeleton />
            <SkillSkeleton />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 p-5 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="mt-3 h-8 w-28 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="h-12 w-24 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/10">
              <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          <div className="mt-6 h-14 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
        </motion.div>
      ))}
    </div>
  );
};

export default GigSkeleton;
