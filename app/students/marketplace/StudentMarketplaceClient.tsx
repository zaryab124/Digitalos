"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Laptop,
  FileText,
  HelpCircle,
  Search,
  Plus,
  Phone,
  MessageSquare,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface StudentMarketplaceClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
  initialListings: any[];
  studentProfile: any;
}

export default function StudentMarketplaceClient({
  activeCity,
  user,
  initialListings,
  studentProfile,
}: StudentMarketplaceClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<any[]>(initialListings);

  // Post Modal state
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [category, setCategory] = useState("BOOKS");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("LIKE_NEW");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState(user?.phoneNumber || "");
  const [isPosting, setIsPosting] = useState(false);

  const filteredListings = listings.filter((item) => {
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.titleUr && item.titleUr.includes(searchQuery)) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to list an item.");
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch("/api/v1/students/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          titleUr: titleUr || undefined,
          category,
          price: parseFloat(price),
          condition,
          description,
          contactPhone,
          cityId: activeCity.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setListings((prev) => [data.data.listing, ...prev]);
        setIsPostOpen(false);
        setTitle("");
        setPrice("");
        setDescription("");
        alert("Listing posted successfully on Student Marketplace!");
      } else {
        alert(data.error?.message || "Failed to post listing.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, calculators, notes (e.g. MDCAT, KIPS, Casio)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "BOOKS", "DEVICES", "STUDY_MATERIALS", "STUDENT_SERVICES"].map((cat) => (
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
            onClick={() => setIsPostOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Sell Book / Device</span>
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-600">No student listings found in this category.</p>
            <p className="text-[11px] text-slate-400">Be the first to list your used books or study notes!</p>
          </div>
        ) : (
          filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                    {item.category.replace("_", " ")}
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                    Condition: {item.condition}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2">
                  {item.title}
                </h3>
                {item.titleUr && (
                  <p className="text-xs text-emerald-800 font-urdu">{item.titleUr}</p>
                )}

                <p className="text-xs text-slate-600 line-clamp-3">
                  {item.description}
                </p>

                <div className="text-[11px] text-slate-400">
                  Seller: <strong>{item.student?.user?.fullName || "Student"}</strong> ({item.student?.institutionName || "Jampur"})
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Price</span>
                  <span className="font-black text-base text-emerald-800">
                    {item.price === 0 ? "Free / Donation" : formatPKR(item.price)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.contactPhone && (
                    <a
                      href={`tel:${item.contactPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}

                  {item.contactPhone && (
                    <a
                      href={`https://wa.me/${item.contactPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Item Modal */}
      {isPostOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                List Item on Student Marketplace
              </h3>
              <button onClick={() => setIsPostOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="BOOKS">Used Books & Guides (کتب)</option>
                    <option value="DEVICES">Calculators & Devices (آلات)</option>
                    <option value="STUDY_MATERIALS">Handwritten Notes (نوٹس)</option>
                    <option value="STUDENT_SERVICES">Student Tutoring / Typing (خدمات)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="LIKE_NEW">Like New (بالکل نیا جیسا)</option>
                    <option value="GOOD">Good (اچھی حالت)</option>
                    <option value="FAIR">Fair / Readable (قابل استعمال)</option>
                    <option value="NEW">Brand New (نیا)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. KIPS MDCAT Physics & Chem Books Bundle"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (PKR) * (0 = Free)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide edition, pages condition, and pickup location in Jampur..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                >
                  {isPosting ? "Listing..." : "Post to Marketplace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
