import clsx from "clsx";

const Skeleton = ({ className }) => (
  <div
    className={clsx(
      "animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700",
      className,
    )}
  />
);

export const GigCardSkeleton = () => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 backdrop-blur-xl">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-6" />

      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 backdrop-blur-xl">
      <Skeleton className="mx-auto h-24 w-24 rounded-full" />

      <Skeleton className="mx-auto mt-5 h-5 w-40" />

      <Skeleton className="mx-auto mt-3 h-4 w-56" />

      <Skeleton className="mt-8 h-12 w-full" />

      <Skeleton className="mt-4 h-12 w-full" />
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <div className="grid grid-cols-4 gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
    </div>
  );
};

export default Skeleton;
