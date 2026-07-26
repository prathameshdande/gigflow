import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import { API_URL } from "../api/config";

import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import TextArea from "./ui/TextArea";

const CreateGig = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    desc: "",
    budget: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const res = await fetch(`${API_URL}/gigs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: form.title,
        desc: form.desc,
        budget: Number(form.budget),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    navigate("/");
  };

  return (
    <div className="relative overflow-hidden px-5 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/20 blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-white/50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-cyan-400">
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_420px]">
          <Card padding="p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-cyan-400">
              <Sparkles size={16} />
              Publish New Project
            </div>

            <div className="mt-8 flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-white shadow-2xl">
                <Briefcase size={34} />
              </div>

              <div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white">
                  Create Gig
                </h1>

                <p className="mt-3 max-w-xl text-slate-500 dark:text-slate-400">
                  Describe your project clearly to attract experienced
                  freelancers and receive high-quality proposals.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/60 p-5 dark:bg-white/5">
                <Clock3 className="mb-3 text-blue-600" />
                <h3 className="font-bold dark:text-white">Quick Publish</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Post your project within minutes.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/60 p-5 dark:bg-white/5">
                <ShieldCheck className="mb-3 text-violet-600" />
                <h3 className="font-bold dark:text-white">Secure Hiring</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Connect only with verified freelancers.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/60 p-5 dark:bg-white/5">
                <CheckCircle2 className="mb-3 text-emerald-600" />
                <h3 className="font-bold dark:text-white">Better Matches</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Detailed projects receive more proposals.
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-10 space-y-8">
              <Input
                label="Project Title"
                icon={Briefcase}
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Build a Modern MERN Dashboard"
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Project Description
                  </label>

                  <span
                    className={`text-xs ${
                      form.desc.length > 250
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }`}>
                    {form.desc.length} Characters
                  </span>
                </div>

                <TextArea
                  name="desc"
                  rows={8}
                  value={form.desc}
                  onChange={handleChange}
                  placeholder="Explain your project, technologies required, expected timeline, features, deliverables and any additional requirements..."
                />

                <p className="mt-2 text-xs text-slate-500">
                  Detailed descriptions usually receive better proposals.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Project Budget"
                  icon={IndianRupee}
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="10000"
                />

                <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Estimated Budget
                  </p>

                  <div className="mt-3 flex items-center text-4xl font-black text-blue-600 dark:text-cyan-400">
                    <IndianRupee size={28} />
                    {form.budget || "0"}
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    A realistic budget attracts higher quality freelancers.
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ y: -3 }}
                className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-50 to-violet-50 p-7 dark:border-cyan-500/20 dark:bg-gradient-to-br dark:from-cyan-500/10 dark:to-violet-500/10">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-blue-500 p-3 text-white">
                    <FileText size={22} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Tips for Better Proposals
                    </h3>

                    <div className="mt-5 space-y-4">
                      <div className="flex gap-3">
                        <CheckCircle2
                          size={18}
                          className="mt-1 text-emerald-500"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Use a descriptive project title.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <CheckCircle2
                          size={18}
                          className="mt-1 text-emerald-500"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Mention technologies and expected deliverables.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <CheckCircle2
                          size={18}
                          className="mt-1 text-emerald-500"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Mention your preferred timeline.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <CheckCircle2
                          size={18}
                          className="mt-1 text-emerald-500"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Set a realistic budget to attract skilled freelancers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <Button type="submit" disabled={loading}>
                {loading ? "Publishing Project..." : "Publish Gig"}
              </Button>
            </form>
          </Card>
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-white">
                  <Sparkles size={24} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Project Preview
                  </h3>

                  <p className="text-sm text-slate-500">Live summary</p>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Title
                  </p>

                  <h4 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {form.title || "Untitled Project"}
                  </h4>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Budget
                  </p>

                  <div className="mt-2 flex items-center text-3xl font-black text-blue-600 dark:text-cyan-400">
                    <IndianRupee size={24} />
                    {form.budget || "0"}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Description
                  </p>

                  <p className="mt-2 line-clamp-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {form.desc ||
                      "Your project description will appear here as you type."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold">Why GigFlow?</h3>

              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span>Verified Freelancers</span>
                  <span className="text-2xl font-black">100%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Projects Posted</span>
                  <span className="text-2xl font-black">2K+</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Average Response</span>
                  <span className="text-2xl font-black">&lt; 1 Hour</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Successful Hiring</span>
                  <span className="text-2xl font-black">95%</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-7">
              <div className="flex gap-4">
                <CheckCircle2 size={24} className="mt-1 text-emerald-500" />

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Before Publishing
                  </h3>

                  <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li>✓ Review your project title.</li>
                    <li>✓ Verify the project budget.</li>
                    <li>✓ Include all required deliverables.</li>
                    <li>✓ Mention technologies if required.</li>
                    <li>✓ Add timeline expectations.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateGig;
