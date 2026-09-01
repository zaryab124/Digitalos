"use client";

import React, { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  Search,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

interface OpportunitiesClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
  initialOpportunities: any[];
  studentProfile: any;
}

export default function OpportunitiesClient({
  activeCity,
  user,
  initialOpportunities,
  studentProfile,
}: OpportunitiesClientProps) {
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunities, setOpportunities] = useState<any[]>(initialOpportunities);

  // Apply Modal state
  const [selectedOppForApply, setSelectedOppForApply] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedIds, setAppliedIds] = useState<string[]>(
    initialOpportunities
      .filter((o) => o.applications && o.applications.length > 0)
      .map((o) => o.id)
  );

  // Post Opportunity Modal state
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postTitleUr, setPostTitleUr] = useState("");
  const [postType, setPostType] = useState("JOB");
  const [postOrgName, setPostOrgName] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postEligibility, setPostEligibility] = useState("");
  const [postStipend, setPostStipend] = useState("");
  const [postDeadline, setPostDeadline] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesType = selectedType === "ALL" || opp.type === selectedType;
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOppForApply || isApplying) return;

    if (!user) {
      alert("Please login to submit an application.");
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch(`/api/v1/students/opportunities/${selectedOppForApply.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter, resumeUrl }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedIds((prev) => [...prev, selectedOppForApply.id]);
        setSelectedOppForApply(null);
        setCoverLetter("");
        alert("Application submitted successfully!");
      } else {
        alert(data.error?.message || "Failed to submit application.");
      }
    } catch {
      alert("Error submitting application.");
    } finally {
      setIsApplying(false);
    }
  };

  const handlePostOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to post an opportunity.");
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch("/api/v1/students/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          titleUr: postTitleUr || undefined,
          type: postType,
          organizationName: postOrgName,
          description: postDesc,
          eligibilityCriteria: postEligibility || undefined,
          stipendOrSalary: postStipend || undefined,
          applicationDeadline: postDeadline || undefined,
          cityId: activeCity.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOpportunities((prev) => [data.data.opportunity, ...prev]);
        setIsPostOpen(false);
        setPostTitle("");
        setPostDesc("");
        alert("Opportunity posted successfully.");
      } else {
        alert(data.error?.message || "Failed to post opportunity.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Type Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, organization or skill..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "SCHOLARSHIP", "JOB", "INTERNSHIP", "TRAINING"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  selectedType === type
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPostOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opportunity</span>
          </button>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpportunities.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-600">No opportunities match your filter.</p>
            <p className="text-[11px] text-slate-400">Try selecting a different category or search term.</p>
          </div>
        ) : (
          filteredOpportunities.map((opp) => {
            const isApplied = appliedIds.includes(opp.id);

            return (
              <div
                key={opp.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            opp.type === "SCHOLARSHIP"
                              ? "bg-amber-100 text-amber-800"
                              : opp.type === "JOB"
                              ? "bg-emerald-100 text-emerald-800"
                              : opp.type === "TRAINING"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {opp.type}
                        </span>

                        {opp.isVerified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {opp.title}
                      </h3>
                      {opp.titleUr && (
                        <p className="text-xs text-blue-900 font-urdu">{opp.titleUr}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-700">
                    🏢 {opp.organizationName}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {opp.description}
                  </p>

                  {opp.eligibilityCriteria && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block">Eligibility Criteria:</span>
                      <p>{opp.eligibilityCriteria}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-emerald-800">
                      💰 {opp.stipendOrSalary || "Free Program"}
                    </span>

                    {opp.applicationDeadline && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Deadline: {new Date(opp.applicationDeadline).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isApplied ? (
                      <div className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Application Submitted</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedOppForApply(opp)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>Apply / Submit Details →</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Apply Modal */}
      {selectedOppForApply && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Apply: {selectedOppForApply.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedOppForApply.organizationName}</p>
              </div>
              <button
                onClick={() => setSelectedOppForApply(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cover Note / Pitch (تعارف اور دلچسپی) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself, your degree, relevant skills, and why you are applying for this opportunity..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Portfolio / Online Resume Link (اختیاری)
                </label>
                <input
                  type="text"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="e.g. LinkedIn, GitHub, Google Drive link"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 text-[11px] text-blue-900">
                🛡️ Your verified student profile data (institution, field of study, skills) will be securely transmitted to the organizer.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOppForApply(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying || !coverLetter.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
                >
                  {isApplying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Opportunity Modal */}
      {isPostOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Post New Student Opportunity / Vacancy
              </h3>
              <button onClick={() => setIsPostOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostOpportunity} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opportunity Type *</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="JOB">Job Vacancy (ملازمت)</option>
                    <option value="INTERNSHIP">Internship (انٹرن شپ)</option>
                    <option value="SCHOLARSHIP">Scholarship (وظیفہ)</option>
                    <option value="TRAINING">Vocational / IT Training (تربیت)</option>
                    <option value="COMPETITION">Student Competition (مقابلہ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organization / Employer Name *</label>
                  <input
                    type="text"
                    required
                    value={postOrgName}
                    onChange={(e) => setPostOrgName(e.target.value)}
                    placeholder="e.g. Al-Razi Medicos / Govt College"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Accounts Assistant / PEEF Scholarship 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder="Provide responsibilities, eligibility and program overview..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stipend / Salary / Fee</label>
                  <input
                    type="text"
                    value={postStipend}
                    onChange={(e) => setPostStipend(e.target.value)}
                    placeholder="e.g. PKR 30,000 / month or Full Grant"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={postDeadline}
                    onChange={(e) => setPostDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
                >
                  {isPosting ? "Posting..." : "Publish Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
