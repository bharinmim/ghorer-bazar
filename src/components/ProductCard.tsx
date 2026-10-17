import React from 'react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { Star, ShoppingBag, Eye, Zap, Flame, AlertCircle, Leaf } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setActiveQuickProduct } = useStore();

  const getRarityConfig = (rarity: Product['rarity']) => {
    switch (rarity) {
      case 'Heritage Drop':
        return {
          border: 'border-orange-500/40 hover:border-orange-400',
          glow: 'hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]',
          badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-600 text-stone-950 font-black',
          textColor: 'text-orange-400'
        };
      case 'Premium Reserve':
        return {
          border: 'border-amber-500/40 hover:border-amber-400',
          glow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]',
          badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 font-black',
          textColor: 'text-amber-400'
        };
      case 'Signature':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400',
          glow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]',
          badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold',
          textColor: 'text-emerald-400'
        };
      default:
        return {
          border: 'border-stone-800 hover:border-stone-700',
          glow: 'hover:shadow-lg',
          badgeBg: 'bg-stone-800 text-stone-300 font-bold',
          textColor: 'text-stone-400'
        };
    }
  };

  const rarityConfig = getRarityConfig(product.rarity);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 8;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-stone-900/90 border ${rarityConfig.border} ${rarityConfig.glow} overflow-hidden transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Top Banner / Tags */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <span className={`px-2.5 py-1 rounded-full text-[10px] tracking-widest shadow-md ${rarityConfig.badgeBg}`}>
          {product.rarity}
        </span>

        {product.badge && (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white font-bold text-[10px] tracking-wide shadow-lg flex items-center gap-1 backdrop-blur-md">
            <Leaf className="w-3 h-3 text-amber-300" />
            {product.badge}
          </span>
        )}
      </div>

      {/* Image Container */}
      <div
        className="relative aspect-4/3 w-full bg-stone-950 overflow-hidden cursor-pointer"
        onClick={() => setActiveQuickProduct(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/20" />

        {/* Hover Inspect Overlay */}
        <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveQuickProduct(product);
            }}
            className="px-3.5 py-2 rounded-xl bg-stone-800/90 text-white text-xs font-bold border border-stone-700 hover:bg-stone-700 flex items-center gap-1.5 shadow-xl transition"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            বিস্তারিত দেখুন
          </button>
        </div>

        {/* Unit / Pack Size Tag */}
        {product.unit && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-md text-[10px] font-bold text-stone-300 border border-stone-800">
            {product.unit}
          </div>
        )}

        {/* XP Reward Floating Tag */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-amber-500/30 text-[11px] font-black text-amber-400 flex items-center gap-1 shadow-lg">
          <Zap className="w-3 h-3 text-amber-400" />
          +{product.xpReward} পয়েন্ট
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
            <span className="font-semibold text-emerald-400 text-[11px]">{product.category}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-stone-200">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => setActiveQuickProduct(product)}
            className="font-display font-bold text-base text-white group-hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
            {product.tagline || product.description}
          </p>
        </div>

        {/* Stock status indicator */}
        <div className="mt-3 pt-2.5 border-t border-stone-800/80">
          <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
            {isOutOfStock ? (
              <span className="text-rose-400 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> স্টক শেষ (Sold Out)
              </span>
            ) : isLowStock ? (
              <span className="text-amber-400 flex items-center gap-1 font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5" /> দ্রুত শেষ হচ্ছে: মাত্র {product.stock} টি বাকি!
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                স্টকে আছে ({product.stock} টি)
              </span>
            )}
          </div>

          {/* Price & Action Button */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-amber-400 font-display">
                  ৳ {product.price}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs text-stone-400 line-through">
                    ৳ {product.compareAtPrice}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                isOutOfStock
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700/50'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-102 active:scale-98 cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {isOutOfStock ? 'স্টক শেষ' : 'অর্ডার করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
