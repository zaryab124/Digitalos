"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock,
  Send,
  HelpCircle,
} from "lucide-react";

interface CropDoctorClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
  farmer: any;
}

export default function CropDoctorClient({
  activeCity,
  user,
  farmer,
}: CropDoctorClientProps) {
  const [cropName, setCropName] = useState("Cotton (Kapas)");
  const [symptoms, setSymptoms] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCropId, setSelectedCropId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>(farmer?.diagnoses || []);

  const symptomPresets = [
    {
      crop: "Cotton (Kapas)",
      text: "Leaves curling upwards, yellow mosaic spots, and tiny white flying insects under leaf surface.",
    },
    {
      crop: "Cotton (Kapas)",
      text: "Rose-like flower buds (rosette flowers) and small pink caterpillars burrowing into green bolls.",
    },
    {
      crop: "Wheat (Gandum)",
      text: "Bright yellow stripe powder and pustules appearing along the veins of wheat flag leaves.",
    },
    {
      crop: "Wheat (Gandum)",
      text: "Small green aphids clustering on wheat ears and flag leaves during heading stage.",
    },
    {
      crop: "Sugarcane (Kamad)",
      text: "Leaves turning yellow and withering. Internal cane stalk shows red discolouration with sour alcoholic smell.",
    },
    {
      crop: "Mango (Aam)",
      text: "Dark black sunken spots on young fruitlets and powdery white fungal coating on blossom panicles.",
    },
  ];

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || isLoading) return;

    setIsLoading(true);
    setDiagnosisResult(null);

    try {
      const res = await fetch("/api/v1/farmer/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName,
          symptoms,
          imageUrl: imageUrl || undefined,
          cropId: selectedCropId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDiagnosisResult(data.data.diagnosis);
        if (data.data.savedRecord) {
          setHistory((prev) => [data.data.savedRecord, ...prev]);
        }
      } else {
        alert(data.error?.message || "Diagnosis failed.");
      }
    } catch {
      alert("Network error processing crop diagnosis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Diagnosis Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleDiagnose} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Crop (فصل منتخب کریں) *
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cotton (Kapas)">Cotton / Kapas (کپاس)</option>
                <option value="Wheat (Gandum)">Wheat / Gandum (گندم)</option>
                <option value="Sugarcane (Kamad)">Sugarcane / Kamad (کماد)</option>
                <option value="Mango (Aam)">Mango / Aam (آم)</option>
                <option value="Rice (Dhan)">Rice / Dhan (دھان)</option>
                <option value="Mustard (Sarson)">Mustard / Sarson (سرسوں)</option>
                <option value="Other / General">Other Crop (دیگر فصل)</option>
              </select>
            </div>

            {farmer?.crops?.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link to Registered Field (اختیاری)
                </label>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- General Field --</option>
                  {farmer.crops.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.acresPlanted} Acres - Sown {new Date(c.sowingDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Common South Punjab Pest Symptoms:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {symptomPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCropName(preset.crop);
                    setSymptoms(preset.text);
                  }}
                  className="px-3 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 rounded-full text-[11px] font-medium transition-colors"
                >
                  {preset.crop}: {preset.text.slice(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Describe Crop Symptoms, Leaf Color & Pest Appearance *
            </label>
            <textarea
              required
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Leaves turning yellow, sticky coating under leaves, small white flying insects observed..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Optional Crop Photo (تصویر)</h4>
                <p className="text-[11px] text-slate-500">
                  Upload leaf or field photo for visual symptom correlation.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste photo URL / path..."
              className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !symptoms.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? "Analyzing Crop Pathology with AI..." : "Diagnose Crop Disease & Get Treatment"}</span>
          </button>
        </form>
      </div>

      {/* Diagnosis Prescription Output Card */}
      {diagnosisResult && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-lg overflow-hidden space-y-5 p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase">
                  Diagnosis Result
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {diagnosisResult.cropName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {diagnosisResult.diseaseDetected}
              </h2>
              {diagnosisResult.diseaseDetectedUr && (
                <p className="text-sm font-bold text-emerald-800 font-urdu mt-0.5">
                  {diagnosisResult.diseaseDetectedUr}
                </p>
              )}
            </div>

            <div className="text-right shrink-0 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-extrabold block uppercase tracking-wider">
                AI Confidence Score
              </span>
              <span className="text-2xl font-black text-emerald-800">
                {Math.round(diagnosisResult.confidenceScore * 100)}%
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Pathology & Disease Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {diagnosisResult.explanation}
            </p>
            {diagnosisResult.explanationUr && (
              <p className="text-xs sm:text-sm text-emerald-950 font-urdu leading-loose">
                {diagnosisResult.explanationUr}
              </p>
            )}
          </div>

          {/* Treatment Recommendations */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <h3 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Spray & Chemical Treatment (علاج اور سپرے)</span>
            </h3>

            <ul className="space-y-2 text-xs text-slate-800">
              {diagnosisResult.treatmentRecommendations.map((t: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preventive Measures */}
          {diagnosisResult.preventiveMeasures && (
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Preventive Cultural Practices (احتیاطی تدابیر)
              </h3>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                {diagnosisResult.preventiveMeasures.map((pm: string, idx: number) => (
                  <li key={idx}>{pm}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Warning & Safety Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold">Agricultural Advisory Notice (زرعی مشاورتی نوٹ)</p>
              <p className="text-[11px] leading-relaxed text-amber-900">
                {diagnosisResult.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis History */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Previous Diagnoses History ({history.length})</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {history.map((rec: any) => (
              <div key={rec.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">
                    {rec.cropName}: {rec.diseaseDetected}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">
                  Symptoms: {rec.symptoms}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
