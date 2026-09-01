"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  FileText,
  Megaphone,
  TrendingUp,
  Copy,
  Check,
  Tag,
} from "lucide-react";

interface MerchantAiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessCategory: string;
}

export default function MerchantAiCopilotModal({
  isOpen,
  onClose,
  businessName,
  businessCategory,
}: MerchantAiCopilotModalProps) {
  const [tool, setTool] = useState<"DESCRIPTION" | "MARKETING" | "DEAL">("DESCRIPTION");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [dealText, setDealText] = useState("Flat 10% discount this week");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    let action = "PRODUCT_DESCRIPTION";
    if (tool === "MARKETING") action = "MARKETING_POST";
    if (tool === "DEAL") action = "OFFER_STRATEGY";

    try {
      const res = await fetch("/api/v1/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          name: productName || undefined,
          category: businessCategory,
          price: productPrice ? parseFloat(productPrice) : undefined,
          businessName,
          dealText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data.result);
      }
    } catch {
      alert("Failed to generate AI content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-base">AI Merchant Copilot</h3>
              <p className="text-[11px] text-slate-300">
                Generate marketing copy, product descriptions and deals for {businessName}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tool Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100 text-xs font-bold">
            <button
              onClick={() => {
                setTool("DESCRIPTION");
                setResult(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                tool === "DESCRIPTION" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => {
                setTool("MARKETING");
                setResult(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                tool === "MARKETING" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Social Post
            </button>
            <button
              onClick={() => {
                setTool("DEAL");
                setResult(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                tool === "DEAL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Deal Strategy
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} className="space-y-4">
            {tool === "DESCRIPTION" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Longi Solar 585W"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="26000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {tool === "MARKETING" && (
              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">
                  What is your deal or announcement?
                </label>
                <input
                  type="text"
                  required
                  value={dealText}
                  onChange={(e) => setDealText(e.target.value)}
                  placeholder="e.g. Ramadan Sale 15% OFF on all solar inverters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Generating with AI..." : "Generate Content"}</span>
            </button>
          </form>

          {/* Output Results */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Roman Urdu Version
                  </span>
                  <button
                    onClick={() => handleCopy(result.romanUrdu, "roman")}
                    className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold hover:underline"
                  >
                    {copiedKey === "roman" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "roman" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {result.romanUrdu}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                    اردو ورژن (Urdu Script)
                  </span>
                  <button
                    onClick={() => handleCopy(result.urdu, "ur")}
                    className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold hover:underline"
                  >
                    {copiedKey === "ur" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "ur" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-xs text-emerald-950 font-urdu leading-loose">
                  {result.urdu}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    English Version
                  </span>
                  <button
                    onClick={() => handleCopy(result.english, "en")}
                    className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold hover:underline"
                  >
                    {copiedKey === "en" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "en" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {result.english}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
