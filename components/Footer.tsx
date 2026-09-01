import React from "react";
import NextLink from "next/link";
import { Store, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-24 md:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">
                JAMPUR <span className="text-emerald-400">OS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-world AI-powered Local Economic & Community Operating System for Jampur, Rajanpur, D.G. Khan, and South Punjab.
            </p>
            <p className="text-xs text-emerald-400 font-urdu">
              جام پور، راجن پور اور ڈیرہ غازی خان کی مقامی معیشت کا ڈیجیٹل نظام
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              City Directory / بازار
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <NextLink href="/explore?category=pharmacies" className="hover:text-emerald-400">
                  Pharmacies & Health (میڈیکل)
                </NextLink>
              </li>
              <li>
                <NextLink href="/explore?category=electronics" className="hover:text-emerald-400">
                  Solar & Electronics (سولر)
                </NextLink>
              </li>
              <li>
                <NextLink href="/explore?category=textiles" className="hover:text-emerald-400">
                  Cloth & Bazaars (کپڑا)
                </NextLink>
              </li>
              <li>
                <NextLink href="/explore?category=agriculture" className="hover:text-emerald-400">
                  Agri & Fertilizers (کھاد و بیج)
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Business Owners */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              For Merchants / دکانداروں کیلئے
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <NextLink href="/business/register" className="hover:text-emerald-400">
                  Register Your Shop (دکان درج کریں)
                </NextLink>
              </li>
              <li>
                <NextLink href="/merchant/dashboard" className="hover:text-emerald-400">
                  Merchant Dashboard
                </NextLink>
              </li>
              <li>
                <NextLink href="/auth/login" className="hover:text-emerald-400">
                  Merchant Login
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Civic & System */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Governance & Safety
            </h4>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Local Businesses</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              All listed merchants and service providers are verified by local municipal administration. Zero spam listings.
            </p>
            <NextLink
              href="/admin"
              className="inline-block mt-3 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Admin Console Login &rarr;
            </NextLink>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Jampur Digital OS. Built for local prosperity in Pakistan.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Jampur
          </p>
        </div>
      </div>
    </footer>
  );
}
