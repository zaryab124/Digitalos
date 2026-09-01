"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sprout,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Droplets,
  MapPin,
  CheckCircle2,
  Edit,
  X,
} from "lucide-react";

interface FarmerCropsClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
  farmer: any;
}

export default function FarmerCropsClient({
  activeCity,
  user,
  farmer,
}: FarmerCropsClientProps) {
  const router = useRouter();

  // Farm profile states
  const [isEditingProfile, setIsEditingProfile] = useState(!farmer);
  const [farmName, setFarmName] = useState(farmer?.farmName || "My Farm");
  const [totalAcres, setTotalAcres] = useState(farmer?.totalAcres?.toString() || "10");
  const [irrigationType, setIrrigationType] = useState(farmer?.irrigationType || "SOLAR_TUBEWELL");
  const [soilType, setSoilType] = useState(farmer?.soilType || "CLAY_LOAM");
  const [villageMouza, setVillageMouza] = useState(farmer?.villageMouza || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // New crop modal states
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [cropName, setCropName] = useState("Cotton (Kapas)");
  const [variety, setVariety] = useState("BT BS-15");
  const [acresPlanted, setAcresPlanted] = useState("5");
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [stage, setStage] = useState("VEGETATIVE");
  const [estimatedYield, setEstimatedYield] = useState("");
  const [notes, setNotes] = useState("");
  const [isSavingCrop, setIsSavingCrop] = useState(false);

  const [cropsList, setCropsList] = useState<any[]>(farmer?.crops || []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/v1/farmer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmName,
          totalAcres: parseFloat(totalAcres),
          irrigationType,
          soilType,
          villageMouza,
          cityId: activeCity.id,
        }),
      });

      if (res.ok) {
        setIsEditingProfile(false);
        router.refresh();
      } else {
        alert("Failed to save farm profile.");
      }
    } catch {
      alert("Error saving profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCrop(true);

    try {
      const res = await fetch("/api/v1/farmer/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cropName,
          variety,
          acresPlanted: parseFloat(acresPlanted),
          sowingDate,
          expectedHarvestDate: expectedHarvestDate || undefined,
          stage,
          estimatedYieldMaunds: estimatedYield ? parseFloat(estimatedYield) : undefined,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCropsList((prev) => [data.data.crop, ...prev]);
        setIsAddCropOpen(false);
        router.refresh();
      } else {
        alert(data.error?.message || "Failed to add crop.");
      }
    } catch {
      alert("Error adding crop.");
    } finally {
      setIsSavingCrop(false);
    }
  };

  const handleUpdateStage = async (cropId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/v1/farmer/crops/${cropId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (res.ok) {
        setCropsList((prev) =>
          prev.map((c) => (c.id === cropId ? { ...c, stage: newStage } : c))
        );
      }
    } catch {
      alert("Failed to update crop stage.");
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (!confirm("Are you sure you want to delete this crop record?")) return;

    try {
      const res = await fetch(`/api/v1/farmer/crops/${cropId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCropsList((prev) => prev.filter((c) => c.id !== cropId));
      }
    } catch {
      alert("Failed to delete crop record.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Farm Information Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Farm Profile & Landholding (فارم معلومات)</span>
            </h2>
            <p className="text-xs text-slate-500 font-urdu">
              کل زرعی رقبہ، نظام آبپاشی اور زمین کی قسم
            </p>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
          >
            {isEditingProfile ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Farm Name *</label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Acres (رقبہ ایکڑ) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={totalAcres}
                onChange={(e) => setTotalAcres(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Irrigation Source (پانی کا ذریعہ)</label>
              <select
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
              >
                <option value="SOLAR_TUBEWELL">Solar Tubewell (سولر ٹیوب ویل)</option>
                <option value="TUBEWELL">Diesel / Electric Tubewell (ٹیوب ویل)</option>
                <option value="CANAL">Canal / Nehar (نہری پانی)</option>
                <option value="RAINFED">Rainfed / Barani (بارانی)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Soil Type (زمین کی قسم)</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
              >
                <option value="CLAY_LOAM">Clay Loam (زرخیز پکی زمین)</option>
                <option value="SANDY_LOAM">Sandy Loam (ریتلی میرا)</option>
                <option value="SILT">Silt / Riverbed (دریائی سلٹ)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Village / Mouza (موضع / چک)</label>
              <input
                type="text"
                placeholder="e.g. Mouza Kotla Dewan, Jampur"
                value={villageMouza}
                onChange={(e) => setVillageMouza(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isSavingProfile ? "Saving..." : "Save Farm Profile"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 block">Total Landholding</span>
              <span className="font-extrabold text-sm text-slate-900">{farmer?.totalAcres || 0} Acres</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 block">Irrigation System</span>
              <span className="font-extrabold text-sm text-slate-900">{farmer?.irrigationType || "N/A"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 block">Soil Classification</span>
              <span className="font-extrabold text-sm text-slate-900">{farmer?.soilType || "N/A"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 block">Location / Mouza</span>
              <span className="font-extrabold text-sm text-slate-900">{farmer?.villageMouza || "Jampur"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sown Crops Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Sown Crop Records ({cropsList.length})
            </h3>
            <p className="text-xs text-slate-500 font-urdu">
              کاشت شدہ فصلوں کا تفصیلی ریکارڈ اور موجودہ مرحلہ
            </p>
          </div>

          <button
            onClick={() => setIsAddCropOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sown Crop</span>
          </button>
        </div>

        {cropsList.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Sprout className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No crop records added yet.</p>
            <p className="text-[11px] text-slate-400">
              Add your wheat, cotton, or sugarcane crops to track growth and get customized AI disease alerts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cropsList.map((crop) => (
              <div
                key={crop.id}
                className="p-5 rounded-3xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{crop.name}</h4>
                      {crop.variety && (
                        <span className="text-xs text-emerald-800 font-semibold block">
                          Variety: {crop.variety}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteCrop(crop.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block">Area Planted:</span>
                      <span className="font-bold text-slate-900">{crop.acresPlanted} Acres</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Sowing Date:</span>
                      <span className="font-bold text-slate-900">
                        {new Date(crop.sowingDate).toLocaleDateString()}
                      </span>
                    </div>
                    {crop.estimatedYieldMaunds && (
                      <div>
                        <span className="text-slate-400 block">Est. Yield:</span>
                        <span className="font-bold text-slate-900">{crop.estimatedYieldMaunds} Maunds (من)</span>
                      </div>
                    )}
                  </div>

                  {crop.notes && (
                    <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-100">
                      "{crop.notes}"
                    </p>
                  )}
                </div>

                {/* Growth Stage Selector */}
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Stage:</span>
                  <select
                    value={crop.stage}
                    onChange={(e) => handleUpdateStage(crop.id, e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SOWING">Sowing (بوائی)</option>
                    <option value="VEGETATIVE">Vegetative (پودے کی بڑھوتری)</option>
                    <option value="FLOWERING">Flowering / Heading (پھول / سٹہ)</option>
                    <option value="MATURITY">Maturity / Ripening (پکائی)</option>
                    <option value="HARVESTED">Harvested (کٹائی مکمل)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      {isAddCropOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add Sown Crop Record</h3>
              <button onClick={() => setIsAddCropOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCrop} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Crop Type *</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="Cotton (Kapas)">Cotton (کپاس)</option>
                    <option value="Wheat (Gandum)">Wheat (گندم)</option>
                    <option value="Sugarcane (Kamad)">Sugarcane (کماد)</option>
                    <option value="Mango (Aam)">Mango (آم)</option>
                    <option value="Rice (Dhan)">Rice (دھان)</option>
                    <option value="Mustard (Sarson)">Mustard (سرسوں)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Variety / Seed Name</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Akbar-2019 / BS-15"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Acres Planted (رقبہ) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={acresPlanted}
                    onChange={(e) => setAcresPlanted(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sowing Date (بوائی کی تاریخ) *</label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="SOWING">Sowing (بوائی)</option>
                    <option value="VEGETATIVE">Vegetative (پودے کی بڑھوتری)</option>
                    <option value="FLOWERING">Flowering (پھول / سٹہ)</option>
                    <option value="MATURITY">Maturity (پکائی)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Yield (من)</label>
                  <input
                    type="number"
                    value={estimatedYield}
                    onChange={(e) => setEstimatedYield(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Notes / Fertilizer Applied</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 1 bag DAP + Nitrophos applied at first watering..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCropOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCrop}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                >
                  {isSavingCrop ? "Saving..." : "Add Crop Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
