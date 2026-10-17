import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Sparkles, Dices, Gift, ArrowRight, ShieldCheck, Leaf, HeartHandshake, Truck } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const {
    content,
    selectedCategory,
    setSelectedCategory,
    selectedRarity,
    setSelectedRarity,
    setIsRewardsModalOpen,
    searchQuery,
    setSearchQuery
  } = useStore();

  const categories = [
    'All',
    'সরিষার তেল ও ঘি',
    'খাঁটি মধু',
    'খেজুর ও বাদাম',
    'মসলা ও চাল',
    'গুড় ও মিষ্টি',
    'স্বাস্থ্যকর বীজ ও হেলথ ফুড'
  ];

  const rarities = [
    { label: 'সব গ্রেড', value: 'All', color: 'border-stone-700 text-stone-300' },
    { label: 'Signature', value: 'Signature', color: 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' },
    { label: 'Premium Reserve', value: 'Premium Reserve', color: 'border-amber-500/50 text-amber-300 bg-amber-500/10' },
    { label: 'Heritage Drop', value: 'Heritage Drop', color: 'border-orange-500/50 text-orange-300 bg-orange-500/10' }
  ];

  return (
    <div className="relative overflow-hidden border-b border-stone-800/80 bg-stone-950 pb-8 pt-6 sm:pb-12 sm:pt-10">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Top Content */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900/90 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-emerald-500/10 animate-pulse">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>{content?.heroBadge || '১০০% খাঁটি ও প্রাকৃতিক পণ্যের নিশ্চয়তা'}</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
            {content?.heroHeadline || 'ঘরের বাজার — সুস্থ জীবনের জন্য খাঁটি খাবার'}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {content?.heroSubheadline ||
              'প্রকৃতির সেরা উপহার, সরাসরি গ্রাম ও সুন্দরবন থেকে আপনার দোরগোড়ায় পৌঁছে দিচ্ছে ঘরের বাজার।'}
          </p>

          {/* Interactive Gamified CTA cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mt-6">
            <button
              onClick={() => setIsRewardsModalOpen(true)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-amber-600/10 to-stone-900 border border-emerald-500/40 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Dices className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                    ভাগ্যের চাকা (Agro Wheel)
                  </div>
                  <div className="text-sm font-bold text-white">স্পিন করে জিতুন ১,০০০ পয়েন্ট</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => setIsRewardsModalOpen(true)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-600/10 to-stone-900 border border-amber-500/40 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <Gift className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    ম্যাজিক স্ক্র্যাচ কার্ড
                  </div>
                  <div className="text-sm font-bold text-white">স্ক্র্যাচ করে পান ১৫% ছাড়</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="block md:hidden mb-6">
          <input
            type="text"
            placeholder="সরিষার তেল, মধু, গাওয়া ঘি, খেজুর..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-stone-900 text-sm text-stone-100 placeholder-stone-500 rounded-xl border border-stone-800 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-md shadow-emerald-500/25 border-transparent'
                    : 'bg-stone-900/90 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {cat === 'All' ? 'সব পণ্য (All Items)' : cat}
              </button>
            );
          })}
        </div>

        {/* Quality Grade Sub-Bar */}
        <div className="mt-4 pt-4 border-t border-stone-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-semibold text-[11px] tracking-wider">
              গ্রেড ফিল্টার:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {rarities.map((r) => {
                const isActive = selectedRarity === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRarity(r.value)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${r.color} ${
                      isActive
                        ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-stone-950 font-black'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-stone-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Truck className="w-3.5 h-3.5" /> সারাদেশে ক্যাশ অন ডেলিভারি
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> ১০০% ল্যাব টেস্টেড খাঁটি পণ্য
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
