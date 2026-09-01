"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { Bell, Check, ExternalLink, Sparkles } from "lucide-react";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.notifications || []);
          setUnreadCount(data.data.unreadCount || 0);
        }
      }
    } catch {
      // Ignore background fetch error
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/v1/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore error
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 text-xs hover:bg-slate-50 transition-colors ${
                      !n.isRead ? "bg-emerald-50/40" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 leading-snug">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      )}
                    </div>
                    {n.titleUr && (
                      <p className="text-[11px] text-emerald-800 font-urdu mt-0.5">
                        {n.titleUr}
                      </p>
                    )}
                    <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    {n.link && (
                      <NextLink
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 mt-2"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </NextLink>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
