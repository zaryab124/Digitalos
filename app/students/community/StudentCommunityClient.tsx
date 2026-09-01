"use client";

import React, { useState } from "react";
import {
  Users,
  Calendar,
  Phone,
  MessageSquare,
  Plus,
  Search,
  BookOpen,
  X,
  CheckCircle2,
} from "lucide-react";

interface StudentCommunityClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
  initialGroups: any[];
}

export default function StudentCommunityClient({
  activeCity,
  user,
  initialGroups,
}: StudentCommunityClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<any[]>(initialGroups);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameUr, setNameUr] = useState("");
  const [topicCategory, setTopicCategory] = useState("MDCAT");
  const [description, setDescription] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("Weekly Online / Campus Library");
  const [organizerContact, setOrganizerContact] = useState(user?.phoneNumber || "");
  const [isCreating, setIsCreating] = useState(false);

  const filteredGroups = groups.filter((grp) => {
    const matchesCat = selectedCategory === "ALL" || grp.topicCategory === selectedCategory;
    const matchesSearch =
      grp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to create a study circle.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/v1/students/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nameUr: nameUr || undefined,
          topicCategory,
          description,
          meetingSchedule,
          organizerContact,
          cityId: activeCity.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGroups((prev) => [data.data.group, ...prev]);
        setIsCreateOpen(false);
        setName("");
        setDescription("");
        alert("Study circle created successfully!");
      } else {
        alert(data.error?.message || "Failed to create group.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study circles (e.g. MDCAT, Freelancing, CSS)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "MDCAT", "ECAT", "FREELANCING", "CSS_PMS", "GENERAL"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-md shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Circle</span>
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-600">No study groups found in this category.</p>
            <p className="text-[11px] text-slate-400">Start a new study circle for your college or cohort!</p>
          </div>
        ) : (
          filteredGroups.map((grp) => (
            <div
              key={grp.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-purple-300 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">
                    {grp.topicCategory.replace("_", " ")}
                  </span>

                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    <Users className="w-3 h-3 text-purple-600" />
                    <span>{grp.memberCount} Members</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {grp.name}
                </h3>
                {grp.nameUr && (
                  <p className="text-xs text-purple-900 font-urdu">{grp.nameUr}</p>
                )}

                <p className="text-xs text-slate-600 leading-relaxed">
                  {grp.description}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-purple-900 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>{grp.meetingSchedule}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {grp.organizerContact ? (
                  <a
                    href={`https://wa.me/${grp.organizerContact.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Join Group / Contact Lead</span>
                  </a>
                ) : (
                  <div className="w-full text-center py-2 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl">
                    Open Community Group
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Create Peer Study Circle
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topic Category *</label>
                  <select
                    value={topicCategory}
                    onChange={(e) => setTopicCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="MDCAT">MDCAT Preparation (میڈیکل)</option>
                    <option value="ECAT">ECAT / Engineering (انجینئرنگ)</option>
                    <option value="FREELANCING">Tech & Freelancing (آئی ٹی)</option>
                    <option value="CSS_PMS">CSS / PMS Competitive Exams (سی ایس ایس)</option>
                    <option value="GENERAL">General Academic Circle (عمومی تعلیم)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organizer Contact *</label>
                  <input
                    type="tel"
                    required
                    value={organizerContact}
                    onChange={(e) => setOrganizerContact(e.target.value)}
                    placeholder="03001234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jampur MDCAT Aspirants 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Meeting Schedule / Location *</label>
                <input
                  type="text"
                  required
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  placeholder="e.g. Daily Online & Saturday 3:00 PM at College"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Goals *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain group topics, study resources shared, and target exams..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Circle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
