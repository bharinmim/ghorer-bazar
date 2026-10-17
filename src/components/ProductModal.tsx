import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { X, Star, ShoppingBag, ShieldCheck, Zap, Truck, RotateCcw, Leaf } from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { activeQuickProduct, setActiveQuickProduct, addToCart } = useStore();
  const [qty, setQty] = useState(1);

  if (!activeQuickProduct) return null;

  const product = activeQuickProduct;
  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    addToCart(product, qty);
    setActiveQuickProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setActiveQuickProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-950/60 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Side */}
        <div className="md:w-1/2 bg-stone-950 relative min-h-[260px] md:min-h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent md:hidden" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white font-extrabold text-[11px] tracking-wider uppercase shadow-md">
              {product.rarity}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-bold text-[11px] border border-amber-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> +{product.xpReward} পয়েন্ট
            </span>
          </div>
        </div>

        {/* Details Side */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span className="text-emerald-400 font-semibold">{product.category}</span>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 font-normal">({product.reviewsCount} রিভিউ)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-1">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-amber-400 font-display">
                ৳ {product.price}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-stone-400 line-through">
                  ৳ {product.compareAtPrice}
                </span>
              )}
              {product.unit && (
                <span className="text-xs text-stone-400 ml-1">/ {product.unit}</span>
              )}
            </div>

            <p className="text-sm text-stone-300 mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* Quality & Trust Highlights */}
            <div className="mt-4 pt-4 border-t border-stone-800 space-y-2 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ঢাকায় ২৪ ঘন্টা ও সারাদেশে ৪৮ ঘন্টায় হোম ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-amber-400 shrink-0" />
                <span>১০০% প্রিজারভেটিভ ও কেমিক্যালমুক্ত সম্পূর্ণ খাঁটি পণ্য</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের নিশ্চয়তা</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-stone-800">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-stone-700 rounded-xl bg-stone-950 p-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded-lg hover:bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-sm"
                  disabled={isOutOfStock}
                >
                  -
                </button>
                <span className="w-9 text-center font-bold text-sm text-white">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-8 h-8 rounded-lg hover:bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-sm"
                  disabled={isOutOfStock || qty >= product.stock}
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                  isOutOfStock
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? 'স্টক শেষ' : `ব্যাগে যোগ করুন • ৳ ${product.price * qty}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
