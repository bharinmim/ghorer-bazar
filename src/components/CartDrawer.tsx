import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Zap, Leaf } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    appliedPromo,
    promoDiscountPercent,
    applyPromoCode,
    removePromoCode,
    setIsCheckoutOpen,
    content
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isCartOpen) return null;

  // Free shipping on ৳ 1,500+
  const FREE_SHIPPING_THRESHOLD = 1500;
  const freeShippingProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const promoDiscountAmount = appliedPromo ? (cartSubtotal * promoDiscountPercent) / 100 : 0;
  const estimatedTotal = Math.max(0, cartSubtotal - promoDiscountAmount);

  // Projected XP
  const multiplier = content?.loyaltyMultiplier || 1;
  const projectedXp = Math.round((estimatedTotal / 10) * multiplier);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyPromoCode(couponInput);
    if (result.success) {
      setCouponFeedback({ type: 'success', message: result.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', message: result.message });
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-white">আপনার বাজারের থলে</h2>
                <p className="text-xs text-stone-400">{cart.length} টি খাঁটি পণ্য ব্যাগে আছে</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="p-4 bg-stone-950/40 border-b border-stone-800/80 text-xs">
            <div className="flex items-center justify-between font-bold mb-1.5">
              {amountToFreeShipping > 0 ? (
                <span className="text-stone-300">
                  আর মাত্র <span className="text-amber-400 font-mono">৳ {amountToFreeShipping}</span> এর অর্ডারে ফ্রি হোম ডেলিভারি!
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Check className="w-4 h-4" /> অভিনন্দন! আপনি ফ্রি হোম ডেলিভারি আনলক করেছেন!
                </span>
              )}
              <span className="text-stone-400">{freeShippingProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-800/60 flex items-center justify-center text-stone-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-base text-stone-300">আপনার থলে এখনো খালি</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  ঘানি ভাঙা খাঁটি সরিষার তেল, সুন্দরবনের মধু এবং ঐতিহ্যবাহী গাওয়া ঘি যোগ করুন!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  পণ্য তালিকা দেখুন
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-stone-950/70 border border-stone-800/80 hover:border-stone-700 transition"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-stone-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-display font-bold text-sm text-white truncate">{product.name}</h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-400 hover:text-rose-400 p-1 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-400">
                          {product.unit || product.rarity}
                        </span>
                        <span className="text-[10px] text-amber-400 font-medium">
                          +{product.xpReward * quantity} পয়েন্ট
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-base text-amber-400 font-display">
                        ৳ {product.price * quantity}
                      </span>
                      <div className="flex items-center border border-stone-800 rounded-lg bg-stone-900 px-1 py-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-stone-400 hover:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-6 h-6 flex items-center justify-center text-xs text-stone-400 hover:text-white disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-800 bg-stone-950/80 space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ডিসকাউন্ট কুপন (যেমন: GHOR20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-stone-700 transition cursor-pointer"
                  >
                    প্রয়োগ করুন
                  </button>
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between text-xs text-emerald-400 px-1">
                    <span className="font-semibold">কুপন '{appliedPromo}' ({promoDiscountPercent}% ছাড় সক্রিয়)</span>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-stone-400 hover:text-white underline text-[11px] cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
                {couponFeedback && !appliedPromo && (
                  <p className="text-[11px] text-rose-400 px-1">{couponFeedback.message}</p>
                )}
              </form>

              {/* Subtotal calculations */}
              <div className="space-y-1.5 text-xs text-stone-400 pt-2 border-t border-stone-800/80">
                <div className="flex justify-between">
                  <span>পণ্যের মূল্য (Subtotal)</span>
                  <span className="text-white font-medium">৳ {cartSubtotal}</span>
                </div>
                {promoDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>বিশেষ ছাড় ({promoDiscountPercent}%)</span>
                    <span>-৳ {promoDiscountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-white font-medium">
                    {amountToFreeShipping === 0 ? 'ফ্রি ডেলিভারি' : '৳ ৬০ (ঢাকা)'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-stone-800 text-sm">
                  <span className="font-bold text-white font-display">সর্বমোট পরিশোধযোগ্য</span>
                  <span className="font-black text-2xl text-amber-400 font-display">
                    ৳ {Math.round(estimatedTotal + (amountToFreeShipping === 0 ? 0 : 60))}
                  </span>
                </div>
              </div>

              {/* XP Surge Preview Pill */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-amber-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="font-bold text-stone-200">অর্ডারে অর্জিত পয়েন্ট:</span>
                </div>
                <span className="font-black text-amber-400 tracking-wide font-display">
                  +{projectedXp} পয়েন্ট
                </span>
              </div>

              {/* Launch Checkout button */}
              <button
                onClick={handleProceedCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>অর্ডারে এগিয়ে যান (চেকআউট)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
