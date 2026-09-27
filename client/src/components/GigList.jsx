import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Sparkles,
  Briefcase,
  TrendingUp,
  Users,
  ArrowRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../api/config";
import GigCard from "./GigCard";
import GigSkeleton from "./GigSkeleton";

const categories = [
  {
    label: "All",
    icon: "✨",
  },
  {
    label: "Web",
    icon: "🌐",
  },
  {
    label: "Mobile",
    icon: "📱",
  },
  {
    label: "UI/UX",
    icon: "🎨",
  },
  {
    label: "AI",
    icon: "🤖",
  },
  {
    label: "Blockchain",
    icon: "⛓️",
  },
  {
    label: "Cloud",
    icon: "☁️",
  },
];
const PAGE_SIZE = 12;

export default function GigList() {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalGigs, setTotalGigs] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const loadMoreController = useRef(null);
  const searchRef = useRef(search);
  searchRef.current = search;

  useEffect(() => {
    const controller = new AbortController();
    loadMoreController.current?.abort();
    loadMoreController.current = null;
    setLoadingMore(false);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: String(PAGE_SIZE),
          search: search.trim(),
        });
        const res = await fetch(`${API_URL}/gigs?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Unable to load projects");

        const data = await res.json();
        setGigs(data.gigs || []);
        setTotalGigs(data.total || 0);
        setPage(1);
        setHasMore(data.page < data.pages);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load projects:", error);
          setGigs([]);
          setHasMore(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
      loadMoreController.current?.abort();
    };
  }, [search]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return gigs;

    return gigs.filter((gig) =>
      gig.title?.toLowerCase().includes(activeCategory.toLowerCase()),
    );
  }, [activeCategory, gigs]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    const requestedSearch = search;
    const controller = new AbortController();
    loadMoreController.current = controller;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(PAGE_SIZE),
        search: search.trim(),
      });
      const res = await fetch(`${API_URL}/gigs?${params}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Unable to load more projects");

      const data = await res.json();
      if (searchRef.current !== requestedSearch) return;
      setGigs((current) => [...current, ...(data.gigs || [])]);
      setTotalGigs(data.total || 0);
      setPage(nextPage);
      setHasMore(data.page < data.pages);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Unable to load more projects:", error);
      }
    } finally {
      if (loadMoreController.current === controller) {
        loadMoreController.current = null;
        setLoadingMore(false);
      }
    }
  };

  const stats = useMemo(
    () => [
      {
        icon: Briefcase,
        value: totalGigs,
        label: "Live Projects",
        color: "from-blue-500 to-cyan-500",
      },
      {
        icon: TrendingUp,
        value: "98%",
        label: "Success Rate",
        color: "from-violet-500 to-pink-500",
      },
      {
        icon: Users,
        value: "20K+",
        label: "Developers",
        color: "from-emerald-500 to-green-500",
      },
      {
        icon: Sparkles,
        value: "24/7",
        label: "Remote Jobs",
        color: "from-orange-500 to-yellow-500",
      },
    ],
    [totalGigs]
  );

  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <GigSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">

      <motion.section
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .6 }}
        className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/70 p-10 shadow-2xl backdrop-blur-3xl dark:bg-white/5"
      >

        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />

        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]" />

        <div className="relative z-10">

          <motion.div
            initial={{ opacity:0,y:15 }}
            animate={{ opacity:1,y:0 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-600 dark:text-cyan-400"
          >
            <Sparkles size={16}/>
            Premium Freelance Marketplace
          </motion.div>

          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-tight text-slate-900 dark:text-white lg:text-6xl">
            Find Your Next
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              {" "}
              Dream Project
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Discover high-quality freelance opportunities from startups,
            agencies and enterprise clients. Build your portfolio,
            grow your income and work from anywhere.
          </p>

          <div className="mt-10 flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search React, MERN, Blockchain..."
                className="w-full rounded-2xl border border-white/20 bg-white/80 py-4 pl-14 pr-14 text-slate-800 shadow-lg outline-none transition focus:border-blue-500 dark:bg-white/10 dark:text-white"
              />

              <AnimatePresence>

                {search && (

                  <motion.button
                    initial={{ scale:0 }}
                    animate={{ scale:1 }}
                    exit={{ scale:0 }}
                    onClick={()=>setSearch("")}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                  >
                    <X size={18}/>
                  </motion.button>

                )}

              </AnimatePresence>

            </div>

            <button className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-xl transition hover:scale-105">
              Browse Projects
              <ArrowRight size={18}/>
            </button>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item)=>{

              const Icon=item.icon;

              return(

                <motion.div
                  whileHover={{
                    y:-8,
                    scale:1.03
                  }}
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/60 p-6 backdrop-blur-xl dark:bg-white/5"
                >

                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>

                    <Icon size={24}/>

                  </div>

                  <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                    {item.value}
                  </h2>

                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>

                </motion.div>

              )

            })}

          </div>
                    <div className="mt-12">

            <div className="mb-8 flex flex-wrap items-center justify-between gap-5">

              <div className="flex flex-wrap gap-3">

                {categories.map((category) => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    key={category.label}
                    onClick={() => setActiveCategory(category.label)}
                    className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                      activeCategory === category.label
                        ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                        : "border border-white/20 bg-white/70 text-slate-700 hover:bg-blue-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    }`}
                  >
                    <span>{category.icon}</span>
                    {category.label}
                  </motion.button>
                ))}

              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-2xl border border-white/20 bg-white/70 px-5 py-3 backdrop-blur-xl dark:bg-white/5">

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Showing
                  </span>

                  <span className="ml-2 font-bold text-slate-900 dark:text-white">
                    {filtered.length}
                  </span>

                  <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                    Projects
                  </span>

                </div>

              </div>

            </div>

            <AnimatePresence mode="wait">

              {filtered.length === 0 ? (

                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[36px] border border-dashed border-slate-300 bg-white/60 p-16 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                >

                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10">

                    <Search
                      size={42}
                      className="text-blue-600 dark:text-cyan-400"
                    />

                  </div>

                  <h2 className="mt-8 text-4xl font-black text-slate-900 dark:text-white">
                    No Projects Found
                  </h2>

                  <p className="mx-auto mt-5 max-w-lg text-lg text-slate-500 dark:text-slate-400">
                    We couldn't find any projects matching your search.
                    Try another keyword or clear your filters.
                  </p>

                  <button
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All");
                    }}
                    className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-xl transition hover:scale-105"
                  >
                    Reset Filters
                  </button>

                </motion.div>

              ) : (

                <motion.div
                  key="grid"
                  className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
                >

                  {filtered.map((gig) => (

                    <motion.div
                      key={gig._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: 20,
                      }}
                      transition={{ duration: 0.2 }}
                    >

                      <GigCard gig={gig} />

                    </motion.div>

                  ))}

                </motion.div>

              )}

            </AnimatePresence>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-xl transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70"
                >
                  {loadingMore ? "Loading projects..." : "Load more projects"}
                </button>
              </div>
            )}

          </div>

        </div>

      </motion.section>
            <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-20 overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-600 p-10 text-white shadow-2xl"
      >
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-xl">
              <Sparkles size={16} />
              Ready to Start?
            </div>

            <h2 className="mt-6 text-4xl font-black leading-tight">
              Find Your Perfect
              <br />
              Freelance Opportunity
            </h2>

            <p className="mt-5 max-w-2xl text-lg text-blue-100">
              Thousands of companies are hiring developers, designers,
              blockchain engineers, AI specialists and freelancers every day.
              Build your career with premium remote opportunities.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button className="rounded-2xl bg-white px-8 py-4 font-bold text-slate-900 shadow-xl transition hover:scale-105">
              Browse Projects
            </button>

            <button className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-bold backdrop-blur-xl transition hover:bg-white/20">
              Post a Project
            </button>
          </div>
        </div>
      </motion.section>

      <footer className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-sm text-slate-500 dark:text-slate-400 lg:flex-row">
        <p>
          © {new Date().getFullYear()} GigFlow. Built for modern freelancers.
        </p>

        <div className="flex items-center gap-6">
          <span className="transition hover:text-blue-600 cursor-pointer">
            Privacy
          </span>

          <span className="transition hover:text-blue-600 cursor-pointer">
            Terms
          </span>

          <span className="transition hover:text-blue-600 cursor-pointer">
            Support
          </span>
        </div>
      </footer>

    </div>
  );
}
