import { useState } from "react";
import { API_URL } from "../api/config";
import { useNavigate } from "react-router-dom";
import { Briefcase, FileText, IndianRupee, ArrowLeft } from "lucide-react";

const CreateGig = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    desc: "",
    budget: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/gigs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: form.title,
        desc: form.desc,
        budget: Number(form.budget),
      }),
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4">
      <div className="relative w-full max-w-xl">
        {/* Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 blur opacity-20"></div>

        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Briefcase className="text-emerald-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Post a New Gig
                </h2>
                <p className="text-sm text-slate-500">
                  Describe your work & budget
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <ArrowLeft size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="px-8 py-6 space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Gig Title
              </label>
              <div className="relative mt-1">
                <input
                  name="title"
                  placeholder="Enter Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Description
              </label>
              <div className="relative mt-1">
                <textarea
                  name="desc"
                  rows={4}
                  placeholder="Description"
                  value={form.desc}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Budget
              </label>
              <div className="relative mt-1">
                <IndianRupee
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="budget"
                  type="number"
                  placeholder="Enter Budget"
                  value={form.budget}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Post Gig
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGig;
