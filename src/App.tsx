import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductModal } from './components/ProductModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { RewardsModal } from './components/RewardsModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { StaffLoginModal } from './components/admin/StaffLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Gift,
  Dices,
  Lock,
  ArrowRight,
  Flame,
  Search,
  Leaf,
  HeartHandshake
} from 'lucide-react';

const StoreContent: React.FC = () => {
  const {
    products,
    isLoadingProducts,
    selectedCategory,
    selectedRarity,
    searchQuery,
    setIsRewardsModalOpen,
    content
  } = useStore();

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesRarity = selectedRarity === 'All' || p.rarity === selectedRarity;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRarity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Navbar with ticker, search, loyalty tracker, cart */}
      <Navbar />

      {/* Hero Banner with organic highlights & gamified triggers */}
      <HeroBanner />

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                {selectedCategory === 'All' ? 'ঘরের বাজারের সকল খাঁটি খাদ্য সম্ভার' : selectedCategory}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-xs font-bold text-emerald-400">
                {filteredProducts.length} টি আইটেম
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              ১০০% প্রিজারভেটিভ ও কেমিক্যালমুক্ত • প্রতিটি অর্ডারে খাঁটি রিওয়ার্ড পয়েন্ট লাভ
            </p>
          </div>

          {/* Gamified Live Activity Ticker */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-900/90 border border-stone-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-stone-300 font-medium">
              লাইভ স্টক সংযোগ: <span className="text-emerald-400 font-bold">সক্রিয়</span>
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {isLoadingProducts ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-stone-400">খাঁটি খাদ্য সম্ভার লোড হচ্ছে...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-stone-900/60 border border-stone-800 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-stone-800/80 flex items-center justify-center text-stone-500 mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-display font-black text-lg text-white">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
              আপনার ফিল্টারের সাথে মিলে এমন কোনো পণ্য মেলেনি। অনুগ্রহ করে ক্যাটাগরি বা সার্চ কিওয়ার্ড পরিবর্তন করে দেখুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Gamified Rewards Showcase Strip */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-amber-950/70 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                <Leaf className="w-3.5 h-3.5 text-amber-300" />
                ঘরের বাজার খাঁটি রিওয়ার্ডস ক্লাব
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                প্রতিটি খাঁটি খাবারের অর্ডারে অর্জন করুন ছাড়ের পয়েন্ট
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                ঘরের বাজারের হাজারো নিয়মিত পরিবারের মতো খাঁটি খাদ্য কিনুন এবং প্রতি অর্ডারে পয়েন্ট সংগ্রহ করুন। জমাকৃত পয়েন্ট দিয়ে পরবর্তী কেনাকাটায় পান নগদ মূল্যছাড় এবং স্পিন করুন দৈনিক ভাগ্যের চাকা।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsRewardsModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                <span>রিওয়ার্ডস ভল্ট খুলুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Value Proposition Badges */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white">সারাদেশে হোম ডেলিভারি</h4>
              <p className="text-stone-400 mt-0.5">ঢাকায় ২৪ ঘন্টা এবং সারাদেশে ৪৮ ঘন্টায় দ্রুত পৌঁছে দেওয়ার নিশ্চয়তা।</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white">১০০% ল্যাব টেস্টেড খাঁটি</h4>
              <p className="text-stone-400 mt-0.5">কোনো রকম ভেজাল বা প্রিজারভেটিভ নেই, সরাসরি প্রাকৃতিক উৎস থেকে সংগৃহীত।</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white">ক্যাশ অন ডেলিভারি (COD)</h4>
              <p className="text-stone-400 mt-0.5">পণ্য হাতে পেয়ে পুরোপুরি নিশ্চিত হয়ে মূল্য পরিশোধের সুযোগ।</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white">মানিব্যাক গ্যারান্টি</h4>
              <p className="text-stone-400 mt-0.5">কোনো কারণে সন্তুষ্ট না হলে বিনা প্রশ্নে সম্পূর্ণ মূল্য ফেরতের সুবিধা।</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-stone-800/80 bg-stone-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="font-display font-bold text-white text-sm">Ghorer Bazar (ঘরের বাজার)</span>
            <span>— সুস্থ জীবনের জন্য খাঁটি খাদ্য সম্ভার</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>বিকাশ ও নগদ সুরক্ষিত গেটওয়ে</span>
            <span>•</span>
            <span>ক্যাশ অন ডেলিভারি</span>
            <span>•</span>
            <span>আরব্যাক অ্যাডমিন কন্ট্রোল</span>
          </div>
        </div>
      </footer>

      {/* Interactive Overlays & Modals */}
      <ProductModal />
      <CartDrawer />
      <RewardsModal />
      <CheckoutModal />
      <StaffLoginModal />
      <AdminDashboard />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
