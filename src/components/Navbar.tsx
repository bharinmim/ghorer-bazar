import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import {
  ShoppingBag,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Search,
  Award,
  CheckCircle2,
  Leaf
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    content,
    loyaltyAccount,
    cartTotalCount,
    setIsCartOpen,
    setIsRewardsModalOpen,
    setIsAdminOpen,
    setIsLoginModalOpen,
    currentStaff,
    soundEnabled,
    toggleSound,
    searchQuery,
    setSearchQuery
  } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-stone-950/90 border-b border-stone-800/80">
      {/* Top Notice Marquee Bar */}
      {content?.promoBannerActive && (
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 py-1.5 px-4 text-xs font-semibold text-white tracking-wide shadow-inner flex items-center justify-center gap-2 overflow-hidden">
          <Leaf className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
          <span className="truncate">{content.announcementText}</span>
          <button
            onClick={() => setIsRewardsModalOpen(true)}
            className="underline underline-offset-2 hover:text-amber-200 transition text-[11px] font-bold uppercase tracking-wider shrink-0 ml-1"
          >
            {content.announcementLinkText || 'রিওয়ার্ডস দেখুন'}
          </button>
          {content.loyaltyMultiplier > 1 && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-black text-amber-300 uppercase tracking-widest border border-amber-300/40">
              {content.loyaltyMultiplier}X বোনাস পয়েন্ট
            </span>
          )}
        </div>
      )}

      {/* Main Brand Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Leaf className="w-5 h-5 fill-emerald-500/30 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl tracking-tight text-white">
                ঘরের <span className="text-emerald-400">বাজার</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                ১০০% খাঁটি
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-medium hidden sm:block">
              সুস্থ জীবনের জন্য খাঁটি খাদ্য সম্ভার
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="সরিষার তেল, সুন্দরবনের মধু, গাওয়া ঘি, আজওয়া খেজুর খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-900/90 text-sm text-stone-100 placeholder-stone-500 rounded-xl border border-stone-800 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200"
              >
                মুছুন
              </button>
            )}
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'সাউন্ড অফ করুন' : 'সাউন্ড অন করুন'}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {/* Loyalty Level & Points Tracker Pill */}
          <button
            onClick={() => setIsRewardsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-stone-900 to-amber-950/80 border border-emerald-500/30 hover:border-amber-500/50 shadow-sm transition group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-left hidden xs:block">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-stone-200">
                  {loyaltyAccount?.tier || 'ব্রোঞ্জ কাস্টমার'}
                </span>
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              </div>
              <span className="text-[10px] font-extrabold text-amber-400 block leading-tight">
                {loyaltyAccount?.pointsBalance?.toLocaleString() || 500} পয়েন্ট
              </span>
            </div>
          </button>

          {/* Shopping Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 hover:border-stone-700 transition flex items-center justify-center group"
          >
            <ShoppingBag className="w-5 h-5 text-stone-300 group-hover:text-emerald-400 transition" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[11px] flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce">
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* Staff Access / Admin Studio Trigger */}
          {currentStaff ? (
            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-sm transition"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">অ্যাডমিন প্যানেল</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 uppercase font-black">
                {currentStaff.role.replace('_', ' ')}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs font-medium transition"
              title="কর্মকর্তা ও অ্যাডমিন লগইন"
            >
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">স্টাফ এক্সেস</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
