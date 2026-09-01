"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  Sparkles,
  Send,
  Store,
  Wrench,
  ShoppingBag,
  ShieldCheck,
  Phone,
  ArrowRight,
  AlertTriangle,
  Tag,
  Plus,
  HelpCircle,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface AssistantClientProps {
  activeCity: { id: string; name: string; slug: string };
  user: any;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  textUr?: string;
  source?: "VERIFIED_DATABASE" | "NO_DATA_AVAILABLE" | "SYSTEM_DISCLAIMER";
  intent?: any;
  entities?: any[];
  serviceRequestPreFill?: any;
  disclaimer?: string;
  timestamp: string;
}

export default function AssistantClient({ activeCity, user }: AssistantClientProps) {
  const { addItem } = useCart();
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "bot",
      text: `Hello! I am your AI Local Assistant for ${activeCity.name}. Ask me in English, Urdu, or Roman Urdu about local electricians, medicines, dinner options, solar inverters, or shop timings.`,
      textUr: `السلام علیکم! میں جام پور ڈیجیٹل اسسٹنٹ ہوں۔ آپ مجھ سے کسی بھی کاریگر، دکان، ادویات یا قیمت کے بارے میں پوچھ سکتے ہیں۔`,
      source: "VERIFIED_DATABASE",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const promptSuggestions = [
    "Mujhe Jampur mein electrician chahiye.",
    "500 rupees ke andar dinner kaha mil sakta hai?",
    "Mere ghar ka fan kharab hai aur mujhe aaj electrician chahiye.",
    "Mujhe AC wala banda chahiye.",
    "Mujhe scholarship chahiye.",
    "سولر پینل کی دکانیں کہاں ہیں؟",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          citySlug: activeCity.slug,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: "bot",
            text: "Sorry, I couldn't process your request. Please try asking again.",
            source: "NO_DATA_AVAILABLE",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsLoading(false);
        return;
      }

      const botResp = data.data.response;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botResp.message,
          textUr: botResp.messageUr,
          source: botResp.source,
          intent: data.data.intent,
          entities: botResp.entities || [],
          serviceRequestPreFill: botResp.serviceRequestPreFill,
          disclaimer: botResp.disclaimer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "Network error connecting to AI service. Please check your connection.",
          source: "NO_DATA_AVAILABLE",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
      {/* Top Suggestions Bar */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Suggestions:</span>
        </span>
        {promptSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(suggestion)}
            className="px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-semibold shrink-0 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            } space-y-2`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-2xl rounded-3xl p-4 sm:p-5 space-y-3 ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white rounded-br-none"
                  : "bg-slate-50 border border-slate-200/80 text-slate-900 rounded-bl-none shadow-sm"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {msg.source === "VERIFIED_DATABASE"
                        ? "Verified Database Grounded"
                        : msg.source === "SYSTEM_DISCLAIMER"
                        ? "Official System Notice"
                        : "Platform Search Result"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                {msg.text}
              </p>

              {msg.textUr && (
                <p className="text-xs sm:text-sm text-emerald-950 font-urdu leading-loose pt-1 border-t border-slate-200/40">
                  {msg.textUr}
                </p>
              )}

              {/* Service Request 1-Click Pre-fill Action */}
              {msg.serviceRequestPreFill && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Need to post this repair request?</span>
                  </div>
                  <p className="text-[11px] text-amber-900">
                    Category: <strong>{msg.serviceRequestPreFill.categorySlug}</strong> • Urgency: <strong>{msg.serviceRequestPreFill.urgency}</strong>
                  </p>
                  <NextLink
                    href={`/services/request?category=${msg.serviceRequestPreFill.categorySlug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95"
                  >
                    <span>Post Service Request Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NextLink>
                </div>
              )}

              {/* Safety Disclaimers */}
              {msg.disclaimer && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{msg.disclaimer}</span>
                </div>
              )}

              {/* Entities Cards Grid */}
              {msg.entities && msg.entities.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {msg.entities.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-xs text-slate-900 truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {item.titleUr && (
                          <p className="text-[11px] text-emerald-800 font-urdu truncate">
                            {item.titleUr}
                          </p>
                        )}

                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {item.subtitle}
                          </p>
                        )}

                        {item.price !== undefined && (
                          <p className="text-xs font-black text-emerald-800">
                            {formatPKR(item.price)}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Call directly"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <NextLink
                          href={item.link}
                          className="flex-1 text-center py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-colors"
                        >
                          View Details →
                        </NextLink>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Querying verified database in {activeCity.name}...</span>
          </div>
        )}
      </div>

      {/* Input Box Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask in Urdu, Roman Urdu or English (e.g. AC theek karne wala banda)..."
          className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />

        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-transform active:scale-95 disabled:opacity-50"
        >
          <span>Ask AI</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
