import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { StaffRole } from '../../types.ts';
import { Shield, Lock, Mail, Eye, EyeOff, X, KeyRound, UserPlus, LogIn, User, Sparkles } from 'lucide-react';

export const StaffLoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginStaff, registerStaff } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state (pre-filled with bharin10mim@gmail.com and 1234 by default!)
  const [email, setEmail] = useState('bharin10mim@gmail.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);

  // Register new staff state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<StaffRole>('inventory_manager');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    const result = await loginStaff(email, password);
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'ভুল ইমেইল বা পাসওয়ার্ড। পুনরায় চেষ্টা করুন।');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম, ইমেইল এবং পাসওয়ার্ড পূরণ করুন।');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    const result = await registerStaff(regName, regEmail, regPassword, regRole);
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।');
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-2 rounded-xl hover:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-display font-black text-xl text-white">স্টাফ এক্সেস ও অ্যাডমিন পোর্টাল</h2>
          <p className="text-xs text-stone-400 mt-1">
            নিরাপদ রোলে-ভিত্তিক অ্যাডমিন স্টুডিওতে লগইন বা নতুন স্টাফ একাউন্ট তৈরি করুন।
          </p>
        </div>

        {/* Tab Switcher: Login vs New Staff Sign In/Registration */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-stone-950 border border-stone-800 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন (Sign In)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন স্টাফ সাইন ইন</span>
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 font-medium animate-in shake duration-200">
            {errorMessage}
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-300 font-bold mb-1.5">কর্মকর্তা ইমেইল (Staff Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bharin10mim@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1.5">পাসওয়ার্ড (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন (Authenticate Access)'}
            </button>
          </form>
        )}

        {/* MODE 2: NEW STAFF ACCESS REGISTRATION / SIGN IN */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-300 font-bold mb-1">পূর্ণ নাম (Staff Full Name)</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="যেমন: মো: আরিফুল ইসলাম"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1">ইমেইল (Staff Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="staff@ghorerbazar.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1">নতুন পাসওয়ার্ড (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="কমপক্ষে ৪ ডিজিট..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1">নিযুক্ত ভূমিকা ও দায়িত্ব (Role)</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as StaffRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="inventory_manager">ইনভেন্টরি ম্যানেজার (পণ্য ও স্টক)</option>
                <option value="orders_manager">ডেলিভারি ম্যানেজার (অর্ডার ও কুরিয়ার)</option>
                <option value="content_editor">ক্যাম্পেইন ও কুপন এডিটর</option>
                <option value="super_admin">সুপার অ্যাডমিন (সম্পূর্ণ এক্সেস)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'স্টাফ একাউন্ট তৈরি ও সাইন ইন'}
            </button>
          </form>
        )}

        {/* Quick Demo Pre-seed Logins for Testing RBAC */}
        <div className="mt-5 pt-4 border-t border-stone-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>১-ক্লিক দ্রুত স্টাফ এক্সেস</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-normal">ক্লিক করে স্বয়ংক্রিয় পূরণ করুন</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {/* Primary requested staff credentials */}
            <button
              type="button"
              onClick={() => handleDemoFill('bharin10mim@gmail.com', '1234')}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-stone-950 border border-emerald-500/50 hover:border-emerald-400 text-left transition group cursor-pointer flex items-center justify-between shadow-md"
            >
              <div>
                <div className="font-black text-emerald-300 group-hover:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  👑 Bharin Mim (Super Admin)
                </div>
                <div className="text-stone-400 text-[10px] font-mono mt-0.5">bharin10mim@gmail.com</div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                পাস: 1234
              </span>
            </button>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
              <button
                type="button"
                onClick={() => handleDemoFill('inventory@ghorerbazar.com', 'Inventory123!')}
                className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-500/50 text-left transition group cursor-pointer"
              >
                <div className="font-bold text-stone-300 group-hover:text-emerald-400">📦 ইনভেন্টরি লিড</div>
                <div className="text-stone-400 truncate">inventory@ghorerbazar.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('orders@ghorerbazar.com', 'Orders123!')}
                className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-500/50 text-left transition group cursor-pointer"
              >
                <div className="font-bold text-stone-300 group-hover:text-emerald-400">🚚 ডেলিভারি লিড</div>
                <div className="text-stone-400 truncate">orders@ghorerbazar.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
