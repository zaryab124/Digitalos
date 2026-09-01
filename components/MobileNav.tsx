"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ShoppingBag, Sparkles, User, Wrench } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      nameUr: "ہوم",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
      isComingSoon: false,
    },
    {
      name: "Market",
      nameUr: "مارکیٹ",
      href: "/marketplace",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/marketplace"),
      isComingSoon: false,
    },
    {
      name: "Services",
      nameUr: "خدمات",
      href: "/services",
      icon: Wrench,
      isActive: pathname.startsWith("/services"),
      isComingSoon: false,
    },
    {
      name: "Kisan",
      nameUr: "کسان",
      href: "/farmer",
      icon: Sparkles,
      isActive: pathname.startsWith("/farmer"),
      isComingSoon: false,
    },
    {
      name: "Orders",
      nameUr: "آرڈرز",
      href: "/orders",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/orders"),
      isComingSoon: false,
    },
    {
      name: "Profile",
      nameUr: "پروفائل",
      href: "/profile",
      icon: User,
      isActive: pathname.startsWith("/profile") || pathname.startsWith("/auth"),
      isComingSoon: false,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NextLink
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors relative min-w-[55px] ${
                item.isActive
                  ? "text-emerald-700 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? "text-emerald-600 scale-110" : ""}`} />
              </div>
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </NextLink>
          );
        })}
      </div>
    </nav>
  );
}
