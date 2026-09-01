"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  MapPin,
  Search,
  User,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Wrench,
  ShoppingBag,
  Truck,
  Car,
  Bike,
  Sparkles,
  Sprout,
  GraduationCap,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

interface City {
  id: string;
  name: string;
  nameUr: string | null;
  slug: string;
  district: string;
}

interface UserSession {
  id: string;
  fullName: string;
  fullNameUr: string | null;
  phoneNumber: string;
  roles: string[];
  cityId: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("jampur");
  const [user, setUser] = useState<UserSession | null>(null);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch active cities
    fetch("/api/v1/cities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.cities) {
          setCities(data.data.cities);
        }
      })
      .catch(() => {});

    // Read active city from cookie
    const match = document.cookie.match(/jdos_city_slug=([^;]+)/);
    if (match && match[1]) {
      setSelectedCity(match[1]);
    }

    // Fetch current user
    fetch("/api/v1/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setUser(data.data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleCityChange = (slug: string) => {
    setSelectedCity(slug);
    document.cookie = `jdos_city_slug=${slug}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    setIsCityDropdownOpen(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    setUser(null);
    setIsUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentCityObj = cities.find((c) => c.slug === selectedCity);
  const isAdmin = user?.roles.includes("ADMIN") || user?.roles.includes("SUPER_ADMIN");
  const isMerchant = user?.roles.includes("BUSINESS_OWNER");
  const isProvider = user?.roles.includes("SERVICE_PROVIDER");
  const isRider = user?.roles.includes("RIDER");

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <NextLink href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                  JAMPUR <span className="text-emerald-600 font-extrabold">OS</span>
                </span>
                <span className="text-[11px] text-emerald-800 font-urdu tracking-normal">
                  جام پور ڈیجیٹل نظام
                </span>
              </div>
            </NextLink>

            {/* City Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Change active city"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentCityObj?.name || "Jampur"}</span>
                {currentCityObj?.nameUr && (
                  <span className="text-[11px] text-emerald-700 font-urdu hidden sm:inline">
                    ({currentCityObj.nameUr})
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-emerald-700" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Your City / شہر منتخب کریں
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCityChange(city.slug)}
                      className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        selectedCity === city.slug
                          ? "font-bold text-emerald-700 bg-emerald-50/70"
                          : "text-slate-700"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{city.name}</span>
                        <span className="text-[10px] text-slate-400">{city.district}</span>
                      </div>
                      {city.nameUr && (
                        <span className="font-urdu text-xs text-slate-500">
                          {city.nameUr}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm items-center relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, shops, services..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </form>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-semibold text-slate-600">
            <NextLink
              href="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === "/" ? "text-emerald-700 bg-emerald-50" : "hover:text-slate-900"
              }`}
            >
              Home
            </NextLink>

            <NextLink
              href="/marketplace"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith("/marketplace")
                  ? "text-emerald-700 bg-emerald-50 font-bold"
                  : "text-emerald-700 hover:bg-emerald-50/50"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Marketplace (مارکیٹ)</span>
            </NextLink>

            <NextLink
              href="/services"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith("/services")
                  ? "text-emerald-700 bg-emerald-50 font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Wrench className="w-4 h-4 text-slate-500" />
              <span>Services (خدمات)</span>
            </NextLink>

            <NextLink
              href="/rides"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith("/rides")
                  ? "text-emerald-700 bg-emerald-50 font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Rides & Loaders (سواری)</span>
            </NextLink>

            <NextLink
              href="/explore"
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === "/explore" ? "text-emerald-700 bg-emerald-50" : "hover:text-slate-900"
              }`}
            >
              Shops
            </NextLink>

            <NextLink
              href="/farmer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith("/farmer") ? "text-emerald-700 bg-emerald-50 font-bold" : "hover:text-slate-900"
              }`}
            >
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Kisan (کسان)</span>
            </NextLink>

            <NextLink
              href="/students"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith("/students") ? "text-blue-700 bg-blue-50 font-bold" : "hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Students (طلباء)</span>
            </NextLink>

            <NextLink
              href="/assistant"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                pathname === "/assistant" ? "text-emerald-700 bg-emerald-50 font-bold" : "hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Assistant</span>
            </NextLink>
          </nav>

          {/* Right Action Icons & User Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user && <NotificationDropdown />}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] sm:max-w-[140px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-slate-400">{user.phoneNumber}</p>
                    </div>

                    <NextLink
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </NextLink>

                    <NextLink
                      href="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      My Orders
                    </NextLink>

                    <NextLink
                      href="/services/requests"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Wrench className="w-4 h-4 text-slate-400" />
                      My Service Requests
                    </NextLink>

                    <NextLink
                      href="/rides/my-rides"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Car className="w-4 h-4 text-emerald-600" />
                      My Rides & Bookings
                    </NextLink>

                    {isRider ? (
                      <NextLink
                        href="/rider/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 font-bold hover:bg-emerald-50"
                      >
                        <Truck className="w-4 h-4 text-emerald-600" />
                        Driver Operations Dashboard
                      </NextLink>
                    ) : (
                      <NextLink
                        href="/rider/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Car className="w-4 h-4 text-slate-400" />
                        Register as Driver (ڈرائیور بنیں)
                      </NextLink>
                    )}

                    {isProvider && (
                      <NextLink
                        href="/provider/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 font-medium hover:bg-amber-50"
                      >
                        <Wrench className="w-4 h-4 text-amber-600" />
                        Technician Workspace
                      </NextLink>
                    )}

                    {isMerchant && (
                      <NextLink
                        href="/merchant/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 font-medium hover:bg-emerald-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                        Merchant Dashboard
                      </NextLink>
                    )}

                    {isAdmin && (
                      <>
                        <NextLink
                          href="/admin/riders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 font-medium hover:bg-emerald-50"
                        >
                          <Truck className="w-4 h-4 text-emerald-600" />
                          Fleet Management
                        </NextLink>
                        <NextLink
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-700 font-medium hover:bg-indigo-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          Admin Console
                        </NextLink>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NextLink
                  href="/auth/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </NextLink>
                <NextLink
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  Sign Up
                </NextLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, shops, services..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 border border-slate-200"
            />
          </form>

          <div className="flex flex-col gap-1 pt-1">
            <NextLink
              href="/marketplace"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center justify-between"
            >
              <span>Marketplace (مارکیٹ)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100">Live</span>
            </NextLink>

            <NextLink
              href="/services"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Services Marketplace (خدمات)
            </NextLink>

            <NextLink
              href="/rides"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center justify-between"
            >
              <span>🚖 Rides & Loaders (سواری و لوڈر)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 font-black">Book</span>
            </NextLink>

            <NextLink
              href="/rides/my-rides"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              My Rides & Bookings
            </NextLink>

            <NextLink
              href="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Shops Directory
            </NextLink>

            <NextLink
              href="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              My Orders & Deliveries
            </NextLink>

            <NextLink
              href="/rides"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
            >
              <Car className="w-4 h-4 text-emerald-600" />
              <span>🚖 Rides & Loaders (سواری و لوڈر)</span>
            </NextLink>

            <NextLink
              href="/rider/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
            >
              <span>🔑 Driver Login (ڈرائیور لاگ ان)</span>
            </NextLink>

            <NextLink
              href="/rider/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
            >
              <span>🚀 Drive & Earn (ڈرائیور رجسٹریشن)</span>
            </NextLink>

            {user ? (
              <>
                <NextLink
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  My Profile ({user.fullName})
                </NextLink>
                {isRider && (
                  <NextLink
                    href="/rider/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg"
                  >
                    Rider Dashboard
                  </NextLink>
                )}
                {isProvider && (
                  <NextLink
                    href="/provider/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg"
                  >
                    Technician Dashboard
                  </NextLink>
                )}
                {isMerchant && (
                  <NextLink
                    href="/merchant/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg"
                  >
                    Merchant Dashboard
                  </NextLink>
                )}
                {isAdmin && (
                  <NextLink
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 rounded-lg"
                  >
                    Admin Console
                  </NextLink>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <NextLink
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium border border-slate-200 rounded-lg"
                >
                  Log In
                </NextLink>
                <NextLink
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg"
                >
                  Sign Up
                </NextLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
