import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../api/config";
import { Briefcase, ArrowLeft, IndianRupee } from "lucide-react";

const EditGig = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", desc: "", budget: "" });

  useEffect(() => {
    fetch(`${API_URL}/gigs/${id}`)
      .then((res) => res.json())
      .then((data) =>
        setForm({ title: data.title, desc: data.desc, budget: data.budget }),
      )
      .catch(() => navigate("/"));
  }, [id, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/gigs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (res.ok) navigate(`/gigs/${id}`);
    else alert(await res.text());
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4">
      <div className="relative w-full max-w-xl">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 blur opacity-20"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200">
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Briefcase className="text-emerald-600" size={20} />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit Gig</h2>
                <p className="text-sm text-slate-500">Update details</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
          <form onSubmit={submit} className="px-8 py-6 space-y-5">
            <input
              name="title"
              placeholder="Gig Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <textarea
              name="desc"
              rows={4}
              placeholder="Description"
              required
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 resize-none"
            />
            <div className="relative">
              <IndianRupee
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="number"
                name="budget"
                placeholder="Budget"
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full border rounded-lg pl-10 pr-4 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700"
            >
              Update Gig
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGig;
