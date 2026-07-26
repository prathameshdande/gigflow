import { motion } from "framer-motion";
import {
  IndianRupee,
  Clock3,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const getRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const created = new Date(date);
  const diff = Math.floor((now - created) / 1000);

  if (diff < 60) return "Just now";

  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;

  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

const skillColors = [
  "from-blue-500/20 to-cyan-500/20 text-cyan-600 dark:text-cyan-300",
  "from-violet-500/20 to-pink-500/20 text-violet-600 dark:text-violet-300",
  "from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-300",
  "from-orange-500/20 to-yellow-500/20 text-orange-600 dark:text-orange-300",
];

const GigCard = ({ gig }) => {
  const navigate = useNavigate();

  const skills =
    gig.skills?.length > 0
      ? gig.skills
      : gig.title
          ?.split(" ")
          .filter((s) => s.length > 3)
          .slice(0, 4) || [];

  return (
    <motion.article
      layout
      whileHover={{
        y: -10,
        scale: 1.02,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 18,
      }}
      onClick={() => navigate(`/gigs/${gig._id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-[30px] border border-slate-200/60 bg-white shadow-lg transition-all duration-500 hover:border-blue-400/40 hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 p-7">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 text-white shadow-lg">
              <Briefcase size={24} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="line-clamp-1 text-xl font-bold text-slate-900 transition group-hover:text-blue-600 dark:text-white">
                  {gig.title}
                </h2>

                <BadgeCheck size={16} className="text-blue-500" />
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Verified Client
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-2 text-xs font-bold tracking-wide ${
              gig.status === "open"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-500/15 text-slate-500"
            }`}>
            {(gig.status || "Open").toUpperCase()}
          </span>
        </div>

        <p className="line-clamp-4 text-[15px] leading-7 text-slate-600 dark:text-slate-300">
          {gig.desc}
        </p>

        {skills.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className={`rounded-full bg-gradient-to-r px-3 py-2 text-xs font-semibold ${
                  skillColors[index % skillColors.length]
                }`}>
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Fixed Budget
              </p>

              <div className="mt-2 flex items-center text-3xl font-black text-blue-600 dark:text-cyan-400">
                <IndianRupee size={24} />
                {gig.budget}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg">
              Open
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock3 size={16} />
              {getRelativeTime(gig.createdAt)}
            </div>

            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {gig.bidCount || 0} Proposals
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ x: 4 }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 px-6 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-blue-500/30">
          View Details
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.article>
  );
};

export default GigCard;
