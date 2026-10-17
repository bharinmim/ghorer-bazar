import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { sounds } from '../utils/sound.ts';
import { X, Sparkles, Award, Dices, Gift, CheckCircle, Zap, Shield, Leaf } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RewardsModal: React.FC = () => {
  const {
    isRewardsModalOpen,
    setIsRewardsModalOpen,
    loyaltyAccount,
    triggerSpinWheel,
    triggerClaimScratch,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'wheel' | 'scratch'>('overview');

  // Lucky Wheel state
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<any>(null);

  // Scratch Card state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const isDrawing = useRef(false);

  const wheelPrizes = [
    { label: '৫০ পয়েন্ট', points: 50, color: '#059669' },
    { label: '১০০ পয়েন্ট', points: 100, color: '#d97706' },
    { label: '২৫০ পয়েন্ট', points: 250, color: '#0d9488' },
    { label: '৫০০ পয়েন্ট ধামাকা!', points: 500, color: '#b45309' },
    { label: '৭৫ পয়েন্ট', points: 75, color: '#10b981' },
    { label: '১,০০০ পয়েন্ট জ্যাকপট 🔥', points: 1000, color: '#ea580c' }
  ];

  // Initialize scratch canvas
  useEffect(() => {
    if (activeTab === 'scratch' && canvasRef.current && !isScratched) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw metallic gold/amber scratch cover
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(0.5, '#b45309');
      grad.addColorStop(1, '#92400e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Add agro pattern
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1;
      for (let i = -width; i < width * 2; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }

      ctx.fillStyle = '#fffbeb';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌿 স্ক্র্যাচ করে উপহার জানুন 🌿', width / 2, height / 2 + 5);
    }
  }, [activeTab, isScratched]);

  if (!isRewardsModalOpen) return null;

  const currentPoints = loyaltyAccount?.pointsBalance || 0;
  const lifetimePoints = loyaltyAccount?.lifetimePoints || 0;
  const currentTier = loyaltyAccount?.tier || 'ব্রোঞ্জ কাস্টমার';

  // Tier progress calculations
  let nextTier = 'সিলভার সদস্য';
  let tierMin = 0;
  let tierMax = 1000;

  if (lifetimePoints >= 5000) {
    nextTier = 'রয়েল মেম্বার (সর্বোচ্চ)';
    tierMin = 5000;
    tierMax = 5000;
  } else if (lifetimePoints >= 2500) {
    nextTier = 'রয়েল মেম্বার';
    tierMin = 2500;
    tierMax = 5000;
  } else if (lifetimePoints >= 1000) {
    nextTier = 'গোল্ড প্রিমিয়াম';
    tierMin = 1000;
    tierMax = 2500;
  }

  const progressPercent = tierMax === tierMin ? 100 : Math.min(100, Math.max(0, ((lifetimePoints - tierMin) / (tierMax - tierMin)) * 100));

  // Handle Lucky Wheel Spin
  const handleSpinClick = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelResult(null);

    const spinData = await triggerSpinWheel();
    const prizeIdx = spinData?.prizeIndex ?? Math.floor(Math.random() * wheelPrizes.length);
    const segmentAngle = 360 / wheelPrizes.length;
    const targetAngle = 360 * 6 + (360 - (prizeIdx * segmentAngle + segmentAngle / 2));

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sounds.playTick();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 120);

    setRotation(targetAngle);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWheelResult(spinData?.prize || wheelPrizes[prizeIdx]);
    }, 3800);
  };

  // Scratch handler
  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    sounds.playCoin();

    setScratchProgress((prev) => {
      const next = prev + 3;
      if (next >= 45 && !isScratched) {
        setIsScratched(true);
        triggerClaimScratch();
        addToast({
          type: 'loot',
          title: 'অভিনন্দন! বিশেষ রিওয়ার্ড আনলকড!',
          message: '+১৫০ বোনাস পয়েন্ট ও SCRATCH15 কুপন যুক্ত হয়েছে!'
        });
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-stone-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-600 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl text-white">খাঁটি রিওয়ার্ডস ভল্ট</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-[11px] tracking-wider border border-amber-400/40">
                  {currentTier}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                প্রতিটি অর্ডারে পয়েন্ট অর্জন করুন • প্রতি ১০০ পয়েন্টে ৳ ৫০ টাকা মূল্যছাড়!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRewardsModalOpen(false)}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            পয়েন্ট ও স্তর সুবিধা
          </button>
          <button
            onClick={() => setActiveTab('wheel')}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition border-b-2 cursor-pointer ${
              activeTab === 'wheel'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Dices className="w-4 h-4 text-emerald-400" />
            দৈনিক ভাগ্যের চাকা (Agro Wheel)
          </button>
          <button
            onClick={() => setActiveTab('scratch')}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition border-b-2 cursor-pointer ${
              activeTab === 'scratch'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-400" />
            ম্যাজিক স্ক্র্যাচ কার্ড
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Balance Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-emerald-950/40 border border-emerald-500/30 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-stone-800/80">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      ব্যবহারযোগ্য পয়েন্ট
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-black text-amber-400 font-display">
                        {currentPoints.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-stone-400">পয়েন্ট</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                      ≈ ৳ {(currentPoints / 2).toFixed(0)} টাকা চেকআউট মূল্যছাড়
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      সদস্যপদ ক্যাটাগরি
                    </span>
                    <div className="text-xl font-black text-emerald-400 font-display mt-1">
                      {currentTier}
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      লাইফটাইম পয়েন্ট: {lifetimePoints.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      দৈনিক ভিজিট স্ট্রিক
                    </span>
                    <div className="flex items-center gap-1.5 text-xl font-black text-white font-display mt-1">
                      <Leaf className="w-5 h-5 text-emerald-400" />
                      <span>{loyaltyAccount?.streakDays || 5} দিন</span>
                    </div>
                    <span className="text-[11px] text-amber-400 block mt-0.5">
                      ৭ম দিনে ১০০ বোনাস পয়েন্ট!
                    </span>
                  </div>
                </div>

                {/* Progress bar to next tier */}
                <div className="pt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-stone-300">
                      পরবর্তী স্তর: <span className="text-amber-400">{nextTier}</span>
                    </span>
                    <span className="text-stone-400 font-semibold">
                      অগ্রগতি ({progressPercent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-stone-800 overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tier Perk Hierarchy */}
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
                  সদস্যপদ স্তর ও বিশেষ সুবিধাসমূহ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-300">ব্রোঞ্জ কাস্টমার (০ - ৯৯৯ পয়েন্ট)</span>
                      <span className="text-[10px] text-stone-400 font-mono">1.0X</span>
                    </div>
                    <p className="text-stone-400">প্রতি অর্ডারে রিওয়ার্ড পয়েন্ট • দৈনিক ভাগ্যের চাকা স্পিন</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-300">সিলভার সদস্য (১,০০০ - ২,৪৯৯ পয়েন্ট)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">1.25X</span>
                    </div>
                    <p className="text-stone-400">১.২৫ গুণ বেশি পয়েন্ট • ১,২০০ টাকার অর্ডারে ফ্রি ডেলিভারি</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-300">গোল্ড প্রিমিয়াম (২,৫০০ - ৪,৯৯৯ পয়েন্ট)</span>
                      <span className="text-[10px] text-amber-400 font-mono">1.5X</span>
                    </div>
                    <p className="text-stone-400">১.৫ গুণ বেশি পয়েন্ট • স্পেশাল গিফট বক্স • ভিআইপি সাপোর্ট</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950 border border-orange-500/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-orange-300">রয়েল মেম্বার (৫,০০০+ পয়েন্ট)</span>
                      <span className="text-[10px] text-orange-400 font-mono">2.0X</span>
                    </div>
                    <p className="text-stone-400">দ্বিগুণ পয়েন্ট • সারা বছর আনলিমিটেড ফ্রি হোম ডেলিভারি</p>
                  </div>
                </div>
              </div>

              {/* Unlocked Badges */}
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
                  অর্জিত মেডেল ও ব্যাজ
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { id: 'MEMBER_SIGNUP', name: 'নবাগত ক্রেতা', desc: 'অ্যাকাউন্ট ভেরিফাইড' },
                    { id: 'FIRST_ORDER', name: 'প্রথম খাঁটি অর্ডার', desc: 'প্রথম কেনাকাটা সম্পন্ন' },
                    { id: 'ORGANIC_LOVER', name: 'প্রকৃতিপ্রেমী', desc: 'খাঁটি মধুর ক্রেতা' },
                    { id: 'MUSTARD_CONNOISSEUR', name: 'সরিষার মাস্টার', desc: 'ঘানি ভাঙা সরিষার তেল' },
                    { id: 'WHEEL_SPINNER', name: 'লাকি স্পিনার', desc: 'দৈনিক চাকা ঘুরিয়েছেন' },
                    { id: 'MYSTERY_SCRATCHER', name: 'ম্যাজিক স্ক্র্যাচার', desc: 'স্ক্র্যাচ কার্ড রিভিল' }
                  ].map((b) => {
                    const isUnlocked = loyaltyAccount?.unlockedBadges.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                          isUnlocked
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-stone-950/40 border-stone-800 text-stone-500 opacity-60'
                        }`}
                      >
                        <Shield className={`w-3.5 h-3.5 ${isUnlocked ? 'text-emerald-400' : 'text-stone-600'}`} />
                        <div>
                          <div className="font-bold">{b.name}</div>
                          <div className="text-[10px] text-stone-400">{b.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wheel' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-center max-w-sm mb-6">
                <h3 className="font-display font-black text-xl text-white">দৈনিক ভাগ্যের চাকা (Agro Wheel)</h3>
                <p className="text-xs text-stone-400 mt-1">
                  প্রতি ২৪ ঘন্টায় একবার ঘুরিয়ে জিতুন ১,০০০ পর্যন্ত খাঁটি পয়েন্ট!
                </p>
              </div>

              {/* The Spinning Wheel */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                {/* Pointer indicator */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" />

                {/* Rotating Wheel body */}
                <div
                  className="w-full h-full rounded-full border-4 border-stone-700 shadow-2xl relative overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
                  }}
                >
                  {wheelPrizes.map((p, idx) => {
                    const rot = idx * 60;
                    return (
                      <div
                        key={idx}
                        className="absolute w-full h-full"
                        style={{
                          transform: `rotate(${rot}deg)`,
                          transformOrigin: '50% 50%'
                        }}
                      >
                        <div
                          className="w-1/2 h-full absolute right-0 top-0 origin-left flex items-center justify-center pr-3"
                          style={{
                            backgroundColor: p.color,
                            clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)'
                          }}
                        >
                          <span className="font-display font-black text-xs text-white drop-shadow-md rotate-90 ml-6">
                            {p.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-stone-950 border-2 border-amber-400 flex items-center justify-center shadow-lg z-10">
                    <Leaf className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </div>

              {wheelResult && !isSpinning && (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center animate-in zoom-in-90 duration-300">
                  <div className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
                    🎉 অভিনন্দন!
                  </div>
                  <div className="text-lg font-black text-white font-display mt-0.5">
                    আপনি পেয়েছেন {wheelResult.label}!
                  </div>
                  <p className="text-xs text-stone-300 mt-1">
                    আপনার বর্তমান ব্যালেন্স: {loyaltyAccount?.pointsBalance} পয়েন্ট
                  </p>
                </div>
              )}

              <button
                onClick={handleSpinClick}
                disabled={isSpinning}
                className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                {isSpinning ? 'চাকা ঘুরছে...' : 'চাকা ঘুরান (Spin Wheel)'}
              </button>
            </div>
          )}

          {activeTab === 'scratch' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-center max-w-sm mb-6">
                <h3 className="font-display font-black text-xl text-white">ম্যাজিক স্ক্র্যাচ কার্ড</h3>
                <p className="text-xs text-stone-400 mt-1">
                  আঙুল বা কার্সর দিয়ে সোনালী ফয়েল ঘষে বের করুন বিশেষ ডিসকাউন্ট কুপন ও পয়েন্ট!
                </p>
              </div>

              <div className="relative w-72 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-stone-700 select-none">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-stone-900 to-amber-950 p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                    রিভিল্ড অফার
                  </span>
                  <div className="text-2xl font-black text-white font-display mt-1">
                    ১৫% ছাড় + ১৫০ পয়েন্ট
                  </div>
                  <div className="mt-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 font-mono font-black text-sm text-emerald-300">
                    SCRATCH15
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1">
                    কুপন কোডটি চেকআউটে ব্যবহার করুন!
                  </span>
                </div>

                <canvas
                  ref={canvasRef}
                  width={288}
                  height={176}
                  className={`absolute inset-0 cursor-crosshair transition-opacity duration-500 ${
                    isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                  onMouseDown={() => (isDrawing.current = true)}
                  onMouseUp={() => (isDrawing.current = false)}
                  onMouseLeave={() => (isDrawing.current = false)}
                  onMouseMove={scratch}
                  onTouchStart={() => (isDrawing.current = true)}
                  onTouchEnd={() => (isDrawing.current = false)}
                  onTouchMove={scratch}
                />
              </div>

              <div className="mt-4 text-xs text-stone-400">
                {isScratched ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> স্ক্র্যাচ সম্পন্ন! ১৫০ পয়েন্ট ব্যালেন্সে যোগ হয়েছে।
                  </span>
                ) : (
                  <span>পুরস্কার জিততে অন্তত ৪৫% স্ক্র্যাচ করুন</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
