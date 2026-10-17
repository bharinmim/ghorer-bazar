import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { sounds } from '../utils/sound.ts';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Truck,
  Sparkles,
  ShoppingBag,
  Smartphone,
  Sliders,
  Gift,
  Phone,
  MapPin,
  Check
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    clearCart,
    appliedPromo,
    promoDiscountPercent,
    loyaltyAccount,
    content,
    addToast
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Loyalty Points Slider (100 points = ৳ 50 Taka discount)
  const maxAvailablePoints = loyaltyAccount?.pointsBalance || 0;
  const maxRedeemablePoints = Math.min(maxAvailablePoints, Math.floor(cartSubtotal * 1.5));
  const [pointsSlider, setPointsSlider] = useState<number>(Math.min(maxRedeemablePoints, 200));

  // Customer & Bangladeshi Shipping Form
  const [formData, setFormData] = useState({
    name: 'তানভীর আহমেদ',
    phone: '01712-345678',
    email: 'tanvir.ahmed@gmail.com',
    street: 'বাড়ি ১২, রোড ৪, ব্লক সি, ধানমন্ডি',
    city: 'Dhaka',
    area: 'Dhanmondi',
    postalCode: '1205',
    division: 'Dhaka',
    notes: 'কল দিয়ে ডেলিভারি করার অনুরোধ রইল'
  });

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'cod' | 'card'>('bkash');
  const [bkashNumber, setBkashNumber] = useState('01712345678');
  const [bkashPin, setBkashPin] = useState('12345');
  const [isBkashOtpVerified, setIsBkashOtpVerified] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    rawNumber: '4242424242424242',
    cardHolder: 'TANVIR AHMED',
    expiry: '12/28',
    cvv: '888'
  });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  if (!isCheckoutOpen) return null;

  // Math Calculations in BDT
  const promoDiscountAmount = appliedPromo ? (cartSubtotal * promoDiscountPercent) / 100 : 0;
  const pointsDiscountAmount = Math.round(pointsSlider / 2); // 100 pts = ৳ 50
  const shippingFee = cartSubtotal >= 1500 ? 0 : 60;
  const finalTotal = Math.max(0, cartSubtotal - promoDiscountAmount - pointsDiscountAmount + shippingFee);

  const multiplier = content?.loyaltyMultiplier || 1;
  const earnedXp = Math.round((finalTotal / 10) * multiplier);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthorizePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            area: formData.area,
            postalCode: formData.postalCode,
            division: formData.division
          },
          items: cart.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            unit: item.product.unit,
            image: item.product.image,
            rarity: item.product.rarity
          })),
          subtotal: cartSubtotal,
          discount: promoDiscountAmount,
          pointsDiscountAmount,
          pointsRedeemed: pointsSlider,
          shippingFee,
          total: finalTotal,
          paymentMethod,
          cardDetails: paymentMethod === 'card' ? cardDetails : undefined
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrderResult(data.order);
        sounds.playLevelUp();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
        clearCart();
        setStep(4);
      } else {
        sounds.playDecline();
        addToast({
          type: 'warning',
          title: 'পেমেন্ট সম্পন্ন হয়নি',
          message: data.error || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
        });
      }
    } catch (err) {
      sounds.playDecline();
      addToast({
        type: 'warning',
        title: 'নেটওয়ার্ক ত্রুটি',
        message: 'পেমেন্ট গেটওয়ের সাথে সংযোগ করা সম্ভব হয়নি।'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with 4-Step Stepper */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950/40 border-b border-stone-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-white">নিরাপদ চেকআউট ও অর্ডার কনফার্মেশন</h2>
                <p className="text-xs text-stone-400">খাঁটি খাদ্য সম্ভার • দ্রুত হোম ডেলিভারি</p>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
            {[
              { num: 1, title: 'ব্যাগ ও পয়েন্ট' },
              { num: 2, title: 'ডেলিভারি ঠিকানা' },
              { num: 3, title: 'পেমেন্ট পদ্ধতি' },
              { num: 4, title: 'অর্ডার সম্পন্ন!' }
            ].map((s) => (
              <div
                key={s.num}
                className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  step === s.num
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/15'
                    : step > s.num
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                    : 'bg-stone-950/40 border-stone-800 text-stone-400'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-stone-800 flex items-center justify-center text-[9px]">
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: BAG & LOYALTY SLIDER */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-base text-white">অর্ডারের বিবরণ ও খাঁটি পয়েন্ট ছাড়</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  পয়েন্ট রিডিম স্লাইডার ব্যবহার করে মূল্যের ওপর তাৎক্ষণিক ক্যাশ ডিসকাউন্ট নিন!
                </p>
              </div>

              {/* Items summary */}
              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2 max-h-48 overflow-y-auto">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={product.image} alt={product.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{product.name}</span>
                        <span className="text-[10px] text-stone-400">
                          {quantity} টি • {product.unit || 'প্যাকেট'}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 shrink-0 ml-3">
                      ৳ {product.price * quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Loyalty Points Redemption Slider */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-950 to-amber-950/40 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">খাঁটি পয়েন্ট ব্যবহার করুন</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    -৳ {pointsDiscountAmount} টাকা ছাড়
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                  <span>ব্যবহার করছেন: {pointsSlider} পয়েন্ট</span>
                  <span>সর্বোচ্চ ছাড়: {maxRedeemablePoints} পয়েন্ট</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={maxRedeemablePoints}
                  step="20"
                  value={pointsSlider}
                  onChange={(e) => setPointsSlider(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2">
                  <span>অর্ডারের পর অবশিষ্ট পয়েন্ট: {(maxAvailablePoints - pointsSlider).toLocaleString()}</span>
                  <span className="text-amber-400 font-bold">১০০ পয়েন্ট = ৳ ৫০ টাকা মূল্যছাড়</span>
                </div>
              </div>

              {/* Order Math Breakdown */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80 space-y-2 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>পণ্যের মোট মূল্য</span>
                  <span className="text-white font-medium">৳ {cartSubtotal}</span>
                </div>
                {promoDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>কুপন ছাড় ({appliedPromo})</span>
                    <span>-৳ {promoDiscountAmount.toFixed(0)}</span>
                  </div>
                )}
                {pointsDiscountAmount > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>পয়েন্ট রিডিম ডিসকাউন্ট ({pointsSlider} পয়েন্ট)</span>
                    <span>-৳ {pointsDiscountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-white font-medium">
                    {shippingFee === 0 ? 'ফ্রি হোম ডেলিভারি' : `৳ ${shippingFee} (ঢাকা)`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-stone-800 text-sm font-bold">
                  <span className="text-white font-display">সর্বমোট প্রদেয় টাকা</span>
                  <span className="text-2xl font-black text-amber-400 font-display">
                    ৳ {Math.round(finalTotal)}
                  </span>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> অর্ডারে রিওয়ার্ড ক্রেডিট:
                  </span>
                  <span>+{earnedXp} পয়েন্ট যুক্ত হবে</span>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <span>ডেলিভারি ঠিকানায় এগিয়ে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BANGLADESH SHIPPING ADDRESS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-white">ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  আপনার সম্পূর্ণ ঠিকানা ও সচল মোবাইল নম্বর প্রদান করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">আপনার পূর্ণ নাম</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">মোবাইল নম্বর (বিকাশ/কল)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="017xxxxxxxx"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-bold mb-1">সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা)</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="বাড়ি নং, রোড নং, সেক্টর/ব্লক..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">বিভাগ (Division)</label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Dhaka">ঢাকা (Dhaka)</option>
                    <option value="Chittagong">চট্টগ্রাম (Chittagong)</option>
                    <option value="Sylhet">সিলেট (Sylhet)</option>
                    <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                    <option value="Khulna">খুলনা (Khulna)</option>
                    <option value="Barisal">বরিশাল (Barisal)</option>
                    <option value="Rangpur">রংপুর (Rangpur)</option>
                    <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">এলাকা / থানা</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="ধানমন্ডি / উত্তরা / গুলশান..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-bold mb-1">রাইডারকে বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500 transition text-xs resize-none"
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> ব্যাগে ফিরে যান
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <span>পেমেন্ট পদ্ধতিতে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BANGLADESH PAYMENT GATEWAYS */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display font-bold text-base text-white">পেমেন্ট গেটওয়ে ও পদ্ধতি নির্বাচন</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  সর্বমোট পরিশোধযোগ্য: <span className="font-bold text-amber-400">৳ {Math.round(finalTotal)}</span>
                </p>
              </div>

              {/* Payment Method Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {/* bKash */}
                <button
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-950/40 border-pink-500 text-white shadow-md shadow-pink-500/20 font-bold'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-pink-600 flex items-center justify-center text-white font-black text-xs">
                    ৳
                  </div>
                  <span>বিকাশ (bKash)</span>
                </button>

                {/* Nagad */}
                <button
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'bg-orange-950/40 border-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs">
                    ন
                  </div>
                  <span>নগদ (Nagad)</span>
                </button>

                {/* Cash on Delivery (COD) */}
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <Truck className="w-5 h-5 text-emerald-400" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </button>

                {/* Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-md shadow-amber-500/20 font-bold'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>কার্ড পেমেন্ট</span>
                </button>
              </div>

              {/* BKASH VIEW */}
              {paymentMethod === 'bkash' && (
                <div className="p-5 rounded-2xl bg-stone-950 border border-pink-500/30 space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white font-black text-sm">
                        bK
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">বিকাশ অনলাইন পেমেন্ট গেটওয়ে</div>
                        <div className="text-[10px] text-pink-400">মার্চেন্ট অ্যাকাউন্ট: 01712-345678 (Ghorer Bazar)</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-white text-sm">
                      ৳ {Math.round(finalTotal)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">আপনার বিকাশ ওয়ালেট নম্বর</label>
                      <input
                        type="tel"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold mb-1">বিকাশ ৫-ডিজিট পিন (সিমুলেশন)</label>
                      <input
                        type="password"
                        maxLength={5}
                        value={bkashPin}
                        onChange={(e) => setBkashPin(e.target.value)}
                        placeholder="•••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>বিকাশ সিকিউর ওটিপি ভেরিফিকেশন দ্বারা সুরক্ষিত। কোনো অতিরিক্ত চার্জ নেই।</span>
                  </div>
                </div>
              )}

              {/* NAGAD VIEW */}
              {paymentMethod === 'nagad' && (
                <div className="p-5 rounded-2xl bg-stone-950 border border-orange-500/30 space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm">
                        ন
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">নগদ পেমেন্ট গেটওয়ে</div>
                        <div className="text-[10px] text-orange-400">ডাক বিভাগের ডিজিটাল লেনদেন</div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-white text-sm">
                      ৳ {Math.round(finalTotal)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1 text-xs">আপনার নগদ অ্যাকাউন্ট নম্বর</label>
                    <input
                      type="tel"
                      defaultValue="01812-998877"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* CASH ON DELIVERY VIEW */}
              {paymentMethod === 'cod' && (
                <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-500/30 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-bold text-white text-sm">ক্যাশ অন ডেলিভারি (Cash on Delivery)</h4>
                  <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                    পণ্যটি হাতে পেয়ে সম্পূর্ণ নিশ্চিত হয়ে ডেলিভারি রাইডারের কাছে নগদ মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের ঝামেলা নেই!
                  </p>
                  <div className="text-xs text-emerald-400 font-bold">
                    ✓ নিশ্চিত ক্যাশ অন ডেলিভারি সার্ভিস সক্রিয়
                  </div>
                </div>
              )}

              {/* CARD PROTOCOL */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="block text-stone-300 font-bold mb-1">কার্ড নম্বর</label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">কার্ডহোল্ডার নাম</label>
                      <input
                        type="text"
                        value={cardDetails.cardHolder}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white uppercase focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-stone-300 font-bold mb-1">মেয়াদ</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-center focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-300 font-bold mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-center focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> ঠিকানায় ফিরে যান
                </button>

                <button
                  onClick={handleAuthorizePayment}
                  disabled={isProcessing}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>অর্ডার কনফার্ম করুন (৳ {Math.round(finalTotal)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VICTORY & CONFIRMATION */}
          {step === 4 && orderResult && (
            <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-400 p-1 mx-auto shadow-2xl shadow-emerald-500/30 animate-bounce">
                <div className="w-full h-full bg-stone-950 rounded-[22px] flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
              </div>

              <div>
                <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
                  অর্ডার সফলভাবে গৃহীত হয়েছে • ঘরের বাজার
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
                  ধন্যবাদ! আপনার খাঁটি পণ্যের অর্ডার কনফার্ম হয়েছে
                </h3>
                <p className="text-xs text-stone-300 mt-1 max-w-md mx-auto">
                  আমাদের প্রতিনিধি শীঘ্রই প্যাকেজিং সম্পন্ন করে আপনার দেওয়া ঠিকানায় হোম ডেলিভারির ব্যবস্থা করবেন।
                </p>
              </div>

              {/* Order Receipt Card */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-stone-950 border border-stone-800 text-left text-xs space-y-2.5 shadow-xl">
                <div className="flex justify-between items-center pb-2 border-b border-stone-800">
                  <span className="text-stone-400">অর্ডার নম্বর</span>
                  <span className="font-mono font-bold text-amber-400">{orderResult.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">পেমেন্ট মেথড</span>
                  <span className="font-mono font-bold text-stone-200 uppercase">
                    {orderResult.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : orderResult.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">সর্বমোট পরিশোধযোগ্য</span>
                  <span className="font-mono font-bold text-white text-base">৳ {orderResult.total}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> অর্জিত খাঁটি রিওয়ার্ড পয়েন্ট
                  </span>
                  <span className="font-mono font-black text-amber-400 text-sm">+{orderResult.xpEarned} পয়েন্ট</span>
                </div>
              </div>

              {/* Bonus Scratch Card Perk */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-amber-950/60 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-amber-400">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">পরবর্তী অর্ডারের জন্য স্পেশাল ছাড়</div>
                    <div className="text-[11px] text-stone-400">কুপন কোড SCRATCH15 আপনার অ্যাকাউন্টে প্রস্তুত</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40">
                  SCRATCH15
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                >
                  আরও কেনাকাটা করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
