import { useEffect, useState } from "react";
import { Search, Loader2, DollarSign, Clock, IndianRupee } from "lucide-react";
import { API_URL } from "../api/config";
import { useNavigate } from "react-router-dom";

const GigList = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/gigs`)
      .then((res) => res.json())
      .then(setGigs)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetch(`${API_URL}/gigs?search=${search}`)
        .then((res) => res.json())
        .then(setGigs);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Available Gigs
          </h1>
          <p className="text-slate-500 mt-1">
            Browse projects and start earning today
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search gigs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {gigs.length === 0 ? (
        <div className="text-center text-slate-500 py-20">No gigs found.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              onClick={() => navigate(`/gigs/${gig._id}`)}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      gig.status === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {(gig.status || "open").toUpperCase()}
                  </span>

                  {gig.createdAt && (
                    <span className="flex items-center text-xs text-slate-400">
                      <Clock size={12} className="mr-1" />
                      {new Date(gig.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition">
                  {gig.title}
                </h3>

                <p className="text-sm text-slate-500 line-clamp-3">
                  {gig.desc}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center font-bold text-emerald-700">
                  <IndianRupee size={16} />
                  <span className="ml-1">{gig.budget}</span>
                </div>

                <span className="text-sm font-medium text-emerald-600 group-hover:underline">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GigList;
