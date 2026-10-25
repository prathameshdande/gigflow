import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Sparkles,
  Briefcase,
  TrendingUp,
  Users,
  ArrowRight,
  X,
  Globe,
  Smartphone,
  Palette,
  Bot,
  Blocks,
  Cloud,
  RefreshCw,
} from "lucide-react";
import { API_URL } from "../api/config";
import { fetchWithRetry } from "../utils/fetchWithRetry";
import GigCard from "./GigCard";
import GigSkeleton from "./GigSkeleton";

const categories = [
  {
    label: "All",
    icon: Sparkles,
  },
  {
    label: "Web",
    icon: Globe,
  },
  {
    label: "Mobile",
    icon: Smartphone,
  },
  {
    label: "UI/UX",
    icon: Palette,
  },
  {
    label: "AI",
    icon: Bot,
  },
  {
    label: "Blockchain",
    icon: Blocks,
  },
  {
    label: "Cloud",
    icon: Cloud,
  },
];

const PAGE_SIZE = 9;
const GIG_CACHE_KEY = "gigflow:public-gigs:v2";
const GIG_CACHE_MAX_AGE = 15 * 60 * 1000; // 15 minutes cache for instant first render

const readGigCache = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      window.localStorage.getItem(GIG_CACHE_KEY) ||
      window.sessionStorage.getItem(GIG_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (
      !cached ||
      !Array.isArray(cached.gigs) ||
      cached.gigs.length === 0 ||
      Date.now() - cached.savedAt > GIG_CACHE_MAX_AGE
    ) {
      return null;
    }
    return cached;
  } catch {
    return null;
  }
};

const saveGigCache = (data) => {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify({ ...data, savedAt: Date.now() });
    window.localStorage.setItem(GIG_CACHE_KEY, payload);
    window.sessionStorage.setItem(GIG_CACHE_KEY, payload);
  } catch {
    // The list still works when browser storage is disabled or full.
  }
};

export default function GigList() {
  const [initialCache] = useState(readGigCache);
  const [gigs, setGigs] = useState(() => initialCache?.gigs || []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(() => !initialCache);
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(() => Boolean(initialCache?.hasMore));
  const [totalGigs, setTotalGigs] = useState(() => initialCache?.total || 0);
  const [activeCategory, setActiveCategory] = useState("All");

  const loadMoreController = useRef(null);
  const searchRef = useRef(search);
  const gigsRef = useRef(gigs);
  searchRef.current = search;
  gigsRef.current = gigs;

  // Countdown timer for automatic retry when server/DB is warming up
  useEffect(() => {
    if (retryCountdown <= 0) return;
    const timer = setTimeout(() => {
      setRetryCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [retryCountdown]);

  const loadInitialGigs = useCallback(
    async (signal) => {
    const hasCachedData = gigsRef.current.length > 0;
    if (hasCachedData) {
      setIsBackgroundUpdating(true);
    } else {
      setLoading(true);
    }
    setConnectionError(null);

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: String(PAGE_SIZE),
        search: search.trim(),
      });

      // Automatically retry up to 4 times with exponential backoff if backend/DB is spinning up
      const res = await fetchWithRetry(
        `${API_URL}/gigs?${params}`,
        { signal },
        4,
        1200,
      );

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setGigs(data.gigs || []);
      setTotalGigs(data.total || 0);
      setPage(1);
      setHasMore(data.page < data.pages);
      setConnectionError(null);

      if (!search.trim()) {
        saveGigCache({
          gigs: data.gigs || [],
          total: data.total || 0,
          hasMore: data.page < data.pages,
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Unable to load projects:", error);
        // If we don't have any cached data to display, show a polite auto-retry notice
        if (gigsRef.current.length === 0) {
          setConnectionError("Connecting to database...");
          setRetryCountdown(5);
        }
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
        setIsBackgroundUpdating(false);
      }
    }
  },
  [search]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadMoreController.current?.abort();
    loadMoreController.current = null;
    setLoadingMore(false);

    // If search is active, do not use cache
    const cached = search.trim() ? null : readGigCache();
    if (cached) {
      setGigs(cached.gigs || []);
      setTotalGigs(cached.total || 0);
      setHasMore(Boolean(cached.hasMore));
      setPage(1);
      setLoading(false);
    } else if (gigsRef.current.length === 0) {
      setLoading(true);
    }

    // Debounce 300ms when user is typing, but execute immediately on initial mount
    const isTyping = search.trim().length > 0;
    const timer = setTimeout(
      () => {
        loadInitialGigs(controller.signal);
      },
      isTyping ? 300 : 0,
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
      loadMoreController.current?.abort();
    };
  }, [search, loadInitialGigs]);

  // Handle countdown reaching 0 by auto-retrying
  useEffect(() => {
    if (retryCountdown === 0 && connectionError && gigs.length === 0) {
      const controller = new AbortController();
      loadInitialGigs(controller.signal, true);
      return () => controller.abort();
    }
  }, [retryCountdown, connectionError, gigs.length, loadInitialGigs]);

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
      const res = await fetchWithRetry(
        `${API_URL}/gigs?${params}`,
        { signal: controller.signal },
        3,
        1000,
      );
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
        value: loading && !totalGigs ? "…" : totalGigs,
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
    [loading, totalGigs],
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/80 p-10 shadow-2xl dark:bg-slate-950/60">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15 dark:opacity-25"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        <div className="absolute -left-40 -top-40 h-96 w-96 bg-[radial-gradient(circle,rgba(59,130,246,0.16)_0%,transparent_70%)]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 bg-[radial-gradient(circle,rgba(139,92,246,0.16)_0%,transparent_70%)]" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-600 dark:text-cyan-400">
            <Sparkles size={16} />
            Premium Freelance Marketplace
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-tight text-slate-900 dark:text-white lg:text-6xl">
            Find Your Next
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              {" "}
              Dream Project
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Discover high-quality freelance opportunities from startups,
            agencies and enterprise clients. Build your portfolio, grow your
            income and work from anywhere.
          </p>

          <div className="mt-10 flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search React, MERN, Blockchain..."
                className="w-full rounded-2xl border border-white/20 bg-white/80 py-4 pl-14 pr-14 text-slate-800 shadow-lg outline-none transition focus:border-blue-500 dark:bg-white/10 dark:text-white"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-red-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <button className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-xl transition hover:scale-105">
              Browse Projects
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 dark:bg-white/5"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
                  >
                    <Icon size={26} />
                  </div>

                  <h2 className="mt-6 text-4xl font-black text-slate-900 dark:text-white">
                    {item.value}
                  </h2>

                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.label;

                  return (
                    <button
                      key={category.label}
                      onClick={() => setActiveCategory(category.label)}
                      className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                          : "border border-white/20 bg-white/70 text-slate-700 hover:bg-blue-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={
                          isActive
                            ? "text-white"
                            : "text-blue-500 dark:text-cyan-400"
                        }
                      />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {isBackgroundUpdating && (
                  <div className="flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-600 dark:text-cyan-400">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Syncing latest...</span>
                  </div>
                )}

                <div className="rounded-2xl border border-white/20 bg-white/80 px-5 py-3 dark:bg-white/5">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Showing
                  </span>

                  <span className="ml-2 font-bold text-slate-900 dark:text-white">
                    {loading && !filtered.length ? "…" : filtered.length}
                  </span>

                  <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                    Projects
                  </span>
                </div>
              </div>
            </div>

            {loading && gigs.length === 0 ? (
              <div
                key="loading"
                className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
              >
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <GigSkeleton key={index} />
                ))}
              </div>
            ) : connectionError && gigs.length === 0 ? (
              <div
                key="error"
                className="rounded-[36px] border border-blue-500/20 bg-white/80 p-16 text-center dark:border-white/10 dark:bg-white/5"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400">
                  <RefreshCw size={42} className="animate-spin" />
                </div>

                <h2 className="mt-8 text-3xl font-black text-slate-900 dark:text-white">
                  Connecting to Database...
                </h2>

                <p className="mx-auto mt-4 max-w-lg text-lg text-slate-500 dark:text-slate-400">
                  The database is waking up. Loading projects automatically in{" "}
                  <span className="font-bold text-blue-600 dark:text-cyan-400">
                    {retryCountdown}s
                  </span>
                  ...
                </p>

                <button
                  onClick={() => {
                    setRetryCountdown(0);
                    const controller = new AbortController();
                    loadInitialGigs(controller.signal, true);
                  }}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-xl transition hover:scale-105"
                >
                  <RefreshCw size={18} />
                  Connect Now
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div
                key="empty"
                className="rounded-[36px] border border-dashed border-slate-300 bg-white/80 p-16 text-center dark:border-white/10 dark:bg-white/5"
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
                  {search
                    ? `We couldn't find any projects matching "${search}". Try another keyword or clear your filters.`
                    : "There are currently no active projects listed in this category. Check back soon!"}
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
              </div>
            ) : (
              <div
                key="grid"
                className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
              >
                {filtered.map((gig) => (
                  <GigCard key={gig._id} gig={gig} />
                ))}
              </div>
            )}

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
      </section>

      <section className="mt-20 overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-600 p-10 text-white shadow-2xl">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
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

            <button className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-bold transition hover:bg-white/20">
              Post a Project
            </button>
          </div>
        </div>
      </section>

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
