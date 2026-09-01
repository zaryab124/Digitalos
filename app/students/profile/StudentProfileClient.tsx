"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Briefcase,
  Layers,
  BookOpen,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  Edit,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface StudentProfileClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
  initialProfile: any;
}

export default function StudentProfileClient({
  activeCity,
  user,
  initialProfile,
}: StudentProfileClientProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(!initialProfile);
  const [educationLevel, setEducationLevel] = useState(initialProfile?.educationLevel || "BACHELORS");
  const [institutionName, setInstitutionName] = useState(initialProfile?.institutionName || "Govt Post Graduate College Jampur");
  const [fieldOfStudy, setFieldOfStudy] = useState(initialProfile?.fieldOfStudy || "BS Computer Science");
  const [cgpaOrMarks, setCgpaOrMarks] = useState(initialProfile?.cgpaOrMarks || "3.70 CGPA");
  const [graduationYear, setGraduationYear] = useState(initialProfile?.graduationYear?.toString() || "2027");
  const [bio, setBio] = useState(initialProfile?.bio || "");

  // Skills and interests parsed from JSON string or defaults
  const parsedSkills = initialProfile?.skills ? JSON.parse(initialProfile.skills) : ["Web Development", "Python", "MS Office"];
  const parsedInterests = initialProfile?.interests ? JSON.parse(initialProfile.interests) : ["Freelancing", "Scholarships"];

  const [skillsStr, setSkillsStr] = useState(parsedSkills.join(", "));
  const [interestsStr, setInterestsStr] = useState(parsedInterests.join(", "));
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<any | null>(initialProfile);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first.");
      return;
    }

    setIsSaving(true);
    try {
      const skillsArr = skillsStr.split(",").map((s: string) => s.trim()).filter(Boolean);
      const interestsArr = interestsStr.split(",").map((s: string) => s.trim()).filter(Boolean);

      const res = await fetch("/api/v1/students/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          educationLevel,
          institutionName,
          fieldOfStudy,
          cgpaOrMarks,
          graduationYear,
          bio,
          skills: skillsArr,
          interests: interestsArr,
          cityId: activeCity.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data.profile);
        setIsEditing(false);
        router.refresh();
        alert("Student profile updated successfully.");
      } else {
        alert(data.error?.message || "Failed to save profile.");
      }
    } catch {
      alert("Error saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkSold = async (listingId: string) => {
    try {
      const res = await fetch(`/api/v1/students/marketplace/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SOLD" }),
      });
      if (res.ok) {
        setProfile((prev: any) => ({
          ...prev,
          listings: prev.listings.map((l: any) =>
            l.id === listingId ? { ...l, status: "SOLD" } : l
          ),
        }));
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile / Resume Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Academic Resume & Qualifications</span>
            </h2>
            <p className="text-xs text-slate-500 font-urdu">
              تعلیمی ادارہ، ڈگری، مہارتیں اور گریجویشن سال
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
          >
            {isEditing ? "Cancel" : "Edit Resume"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Education Level *</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="MATRIC">Matriculation (میٹرک)</option>
                  <option value="INTERMEDIATE">Intermediate / FSc (انٹر)</option>
                  <option value="BACHELORS">Bachelors / BS (گریجویشن)</option>
                  <option value="MASTERS">Masters / MPhil (ماسٹرز)</option>
                  <option value="DIPLOMA">Technical Diploma / DAE (ڈپلومہ)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">College / University Name *</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Govt Post Graduate College Jampur"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Field of Study / Major</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. BS Computer Science / Pre-Medical"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks / CGPA</label>
                  <input
                    type="text"
                    value={cgpaOrMarks}
                    onChange={(e) => setCgpaOrMarks(e.target.value)}
                    placeholder="e.g. 3.75 or 85%"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2027"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Skills (comma separated, e.g. Web Development, Python, Graphic Design)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Target Interests (e.g. Freelancing, Civil Services, Scholarships)
                </label>
                <input
                  type="text"
                  value={interestsStr}
                  onChange={(e) => setInterestsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Student Bio / Objective</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short summary about your educational background and career goals..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Digital Resume"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50">
                <span className="text-slate-400 block">Institution</span>
                <span className="font-extrabold text-slate-900">{profile?.institutionName || "N/A"}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50">
                <span className="text-slate-400 block">Degree & Major</span>
                <span className="font-extrabold text-slate-900">{profile?.fieldOfStudy || profile?.educationLevel}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50">
                <span className="text-slate-400 block">CGPA / Marks</span>
                <span className="font-extrabold text-slate-900">{profile?.cgpaOrMarks || "N/A"}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50">
                <span className="text-slate-400 block">Target Year</span>
                <span className="font-extrabold text-slate-900">{profile?.graduationYear || "N/A"}</span>
              </div>
            </div>

            {profile?.skills && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Verified Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {JSON.parse(profile.skills).map((sk: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-lg">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submitted Applications Tracker */}
      {profile?.applications && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>My Submitted Applications ({profile.applications.length})</span>
          </h3>

          {profile.applications.length === 0 ? (
            <p className="text-xs text-slate-400">You have not submitted any applications yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {profile.applications.map((app: any) => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{app.opportunity.title}</h4>
                    <span className="text-slate-500">{app.opportunity.organizationName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px]">
                      {app.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
