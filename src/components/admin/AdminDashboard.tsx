import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Product, Order, StaffRole, StaffUser, SiteContent, ProductCategory } from '../../types.ts';
import {
  Shield,
  Package,
  ShoppingBag,
  Sliders,
  Users,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Truck,
  Flame,
  ArrowLeft,
  Lock,
  Zap,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Eye,
  X,
  Leaf
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    currentStaff,
    staffToken,
    logoutStaff,
    hasRole,
    products,
    refreshProducts,
    orders,
    refreshOrders,
    content,
    updateSiteContent,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'content' | 'staff'>('overview');

  // Staff members list (Super Admin)
  const [allStaff, setAllStaff] = useState<StaffUser[]>([]);
  const [newStaffModal, setNewStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'inventory_manager' as StaffRole
  });

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    banglaName: '',
    slug: '',
    unit: '১ লিটার বোতল',
    tagline: '',
    description: '',
    category: 'সরিষার তেল ও ঘি' as ProductCategory,
    price: 380,
    compareAtPrice: 420,
    stock: 30,
    rarity: 'Signature' as Product['rarity'],
    badge: '১০০% খাঁটি 🌿',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    xpReward: 50
  });

  // Orders search & filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Content form
  const [contentForm, setContentForm] = useState<SiteContent>(() => {
    return (
      content || {
        announcementText: '🌿 খাঁটি ও কেমিক্যালমুক্ত খাবারের নিশ্চয়তা — সারা বাংলাদেশে হোম ডেলিভারি!',
        announcementLinkText: 'খাঁটি রিওয়ার্ডস দেখুন',
        heroHeadline: 'ঘরের বাজার — সুস্থ জীবনের জন্য খাঁটি খাবার',
        heroSubheadline: 'প্রকৃতির সেরা উপহার, সরাসরি গ্রাম ও সুন্দরবন থেকে আপনার দোরগোড়ায় পৌঁছে দিচ্ছে ঘরের বাজার।',
        heroBadge: '১০০% খাঁটি ও প্রাকৃতিক পণ্যের অঙ্গীকার',
        promoBannerActive: true,
        promoBannerText: 'কুপন "GHOR20" ব্যবহারে পান ২০% বিশেষ ছাড়!',
        promoCode: 'GHOR20',
        promoDiscountPercent: 20,
        loyaltyMultiplier: 2,
        featuredCategory: 'All Products'
      }
    );
  });

  useEffect(() => {
    if (content) {
      setContentForm(content);
    }
  }, [content]);

  const fetchStaff = async () => {
    if (!staffToken || currentStaff?.role !== 'super_admin') return;
    try {
      const res = await fetch('/api/auth/staff', {
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllStaff(data.staff);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (staffToken) {
      refreshOrders();
      if (currentStaff?.role === 'super_admin') {
        fetchStaff();
      }
    }
  }, [staffToken, currentStaff]);

  if (!isAdminOpen) return null;

  // Inventory Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      banglaName: '',
      slug: '',
      unit: '৫০০ গ্রাম জার',
      tagline: '',
      description: '',
      category: 'সরিষার তেল ও ঘি',
      price: 350,
      compareAtPrice: 400,
      stock: 30,
      rarity: 'Signature',
      badge: 'নতুন আগমন 🌿',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      xpReward: 50
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      banglaName: prod.banglaName || prod.name,
      slug: prod.slug,
      unit: prod.unit || '১ প্যাক',
      tagline: prod.tagline || '',
      description: prod.description,
      category: prod.category,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || 0,
      stock: prod.stock,
      rarity: prod.rarity,
      badge: prod.badge || '',
      image: prod.image,
      xpReward: prod.xpReward
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToken) return;

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${staffToken}`
          },
          body: JSON.stringify(productForm)
        });
        if (res.ok) {
          addToast({
            type: 'success',
            title: 'পণ্য আপডেট সম্পন্ন',
            message: `${productForm.name} তথ্য সফলভাবে সংরক্ষিত হয়েছে।`
          });
          refreshProducts();
          setIsProductModalOpen(false);
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${staffToken}`
          },
          body: JSON.stringify({
            ...productForm,
            slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            rating: 5.0,
            reviewsCount: 1,
            isFeatured: true
          })
        });
        if (res.ok) {
          addToast({
            type: 'success',
            title: 'নতুন পণ্য যুক্ত হয়েছে',
            message: `${productForm.name} ক্যাটালগে লাইভ হয়েছে!`
          });
          refreshProducts();
          setIsProductModalOpen(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!staffToken) return;
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${name}" পণ্যটি ক্যাটালগ থেকে মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      if (res.ok) {
        addToast({
          type: 'info',
          title: 'পণ্য মোছা হয়েছে',
          message: `${name} সরানো হয়েছে।`
        });
        refreshProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickStock = async (id: string, delta: number) => {
    if (!staffToken) return;
    try {
      await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`
        },
        body: JSON.stringify({ delta })
      });
      refreshProducts();
    } catch (e) {
      console.error(e);
    }
  };

  // Orders Actions
  const handleUpdateOrderStatus = async (id: string, status: Order['status'], trackingNumber?: string) => {
    if (!staffToken) return;
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`
        },
        body: JSON.stringify({ status, trackingNumber })
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'অর্ডারের স্ট্যাটাস পরিবর্তিত হয়েছে',
          message: `স্ট্যাটাস: ${status.toUpperCase()}`
        });
        refreshOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Staff & RBAC Actions
  const handleUpdateRole = async (staffId: string, newRole: StaffRole) => {
    if (!staffToken) return;
    try {
      const res = await fetch(`/api/auth/staff/${staffId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'কর্মকর্তার ভূমিকা আপডেট হয়েছে',
          message: `নতুন রোল: ${newRole}`
        });
        fetchStaff();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToken) return;
    try {
      const res = await fetch('/api/auth/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`
        },
        body: JSON.stringify(newStaffForm)
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'নতুন কর্মকর্তা যুক্ত হয়েছেন',
          message: `${newStaffForm.name} এখন লগইন করতে পারবেন!`
        });
        setNewStaffModal(false);
        setNewStaffForm({ name: '', email: '', password: '', role: 'inventory_manager' });
        fetchStaff();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick switch role for testing RBAC live in UI
  const handleSwitchTestingRole = async (targetRole: StaffRole) => {
    if (!currentStaff || !staffToken) return;
    await handleUpdateRole(currentStaff.id, targetRole);
    const updatedUser = { ...currentStaff, role: targetRole };
    localStorage.setItem('neon_staff_user', JSON.stringify(updatedUser));
    window.location.reload();
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 8).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950 flex flex-col text-stone-100">
      {/* Top Banner with Staff Profile & RBAC indicator */}
      <header className="border-b border-stone-800 bg-stone-900/90 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মূল শপ দেখুন</span>
          </button>

          <div className="h-6 w-px bg-stone-800" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-black text-sm text-white">ঘরের বাজার অ্যাডমিন স্টুডিও</h1>
              <p className="text-[10px] text-stone-400">নিরাপদ আরব্যাক (RBAC) ও ইনভেন্টরি কন্ট্রোল</p>
            </div>
          </div>
        </div>

        {/* Current Staff Badge & Role Testing switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs">
            <img
              src={currentStaff?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
              alt={currentStaff?.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className="text-left">
              <div className="font-bold text-white text-xs leading-none">{currentStaff?.name}</div>
              <div className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider mt-0.5">
                রোল: {currentStaff?.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Quick RBAC Switcher Dropdown */}
          <div className="hidden md:flex items-center gap-1.5 bg-stone-950 px-2 py-1 rounded-xl border border-stone-800 text-[11px]">
            <span className="text-stone-400 text-[10px] font-bold">টেস্ট রোল:</span>
            <select
              value={currentStaff?.role}
              onChange={(e) => handleSwitchTestingRole(e.target.value as StaffRole)}
              className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="super_admin" className="bg-stone-900 text-white">👑 সুপার অ্যাডমিন (Full Access)</option>
              <option value="inventory_manager" className="bg-stone-900 text-white">📦 ইনভেন্টরি লিড</option>
              <option value="orders_manager" className="bg-stone-900 text-white">🚚 ডেলিভারি ম্যানেজার</option>
              <option value="content_editor" className="bg-stone-900 text-white">🎨 কনটেন্ট এডিটর</option>
            </select>
          </div>

          <button
            onClick={logoutStaff}
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="লগ আউট করুন"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </div>
      </header>

      {/* Admin Tab Navigation */}
      <div className="border-b border-stone-800 bg-stone-900/50 px-4 sm:px-8 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'লাইভ মেট্রিক্স ও সারসংক্ষেপ', icon: TrendingUp },
          { id: 'inventory', label: 'ইনভেন্টরি ও পণ্য ব্যবস্থাপনা', icon: Package, roles: ['super_admin', 'inventory_manager'] as StaffRole[] },
          { id: 'orders', label: 'ডেলিভারি ও অর্ডার ট্র্যাকিং', icon: ShoppingBag, roles: ['super_admin', 'orders_manager', 'inventory_manager'] as StaffRole[] },
          { id: 'content', label: 'ব্যানার ও কুপন সিএমএস', icon: Sliders, roles: ['super_admin', 'content_editor'] as StaffRole[] },
          { id: 'staff', label: 'স্টাফ ও আরব্যাক (RBAC) ম্যানেজার', icon: Users, roles: ['super_admin'] as StaffRole[] }
        ].map((tab) => {
          const Icon = tab.icon;
          const isAllowed = !tab.roles || hasRole(tab.roles);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {!isAllowed && (
                <span title="রোল দ্বারা সীমাবদ্ধ">
                  <Lock className="w-3 h-3 text-amber-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Studio Body */}
      <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">মোট বিক্রয় (Revenue)</span>
                <div className="text-2xl font-black text-amber-400 font-display mt-1">
                  ৳ {totalRevenue.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                  ↑ বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">মোট অর্ডার সংখ্যা</span>
                <div className="text-2xl font-black text-white font-display mt-1">{orders.length} টি</div>
                <span className="text-[11px] text-cyan-400 font-semibold block mt-1">
                  {orders.filter((o) => o.status === 'processing').length} টি প্যাকেজিং চলমান
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">মোট পণ্য আইটেম</span>
                <div className="text-2xl font-black text-white font-display mt-1">{products.length} আইটেম</div>
                <span className="text-[11px] text-amber-400 font-semibold block mt-1">
                  {lowStockCount} টি পণ্যে স্টক অ্যালার্ট
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">সক্রিয় পয়েন্ট গুণক</span>
                <div className="text-2xl font-black text-emerald-400 font-display mt-1">
                  {content?.loyaltyMultiplier || 1}X বোনাস
                </div>
                <span className="text-[11px] text-amber-300 font-semibold block mt-1">
                  খাঁটি রিওয়ার্ডস ক্যাম্পেইন চলছে
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
                <h3 className="font-display font-bold text-sm text-white mb-2">স্টক ও খাদ্য ঘাটতি সতর্কতা</h3>
                {lowStockCount > 0 || outOfStockCount > 0 ? (
                  <div className="space-y-2 text-xs">
                    {products
                      .filter((p) => p.stock <= 8)
                      .slice(0, 4)
                      .map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-stone-800">
                          <span className="font-bold text-white truncate max-w-[180px]">{p.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.stock === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {p.stock === 0 ? 'স্টক শেষ' : `${p.stock} টি বাকি`}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">সকল পণ্যের পর্যাপ্ত স্টক রয়েছে।</p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 md:col-span-2">
                <h3 className="font-display font-bold text-sm text-white mb-2">সাম্প্রতিক ডেলিভারি ফিড</h3>
                <div className="space-y-2 text-xs">
                  {orders.slice(0, 4).map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">{ord.orderNumber}</span>
                        <span className="text-stone-300 font-medium truncate max-w-[150px]">{ord.customerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">৳ {ord.total}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : ord.status === 'shipped'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : ord.status === 'processing'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            {!hasRole(['super_admin', 'inventory_manager']) && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>
                  রিড-অনলি মোড: আপনার বর্তমান রোল হলো <strong>{currentStaff?.role}</strong>। শুধুমাত্র <strong>inventory_manager</strong> অথবা <strong>super_admin</strong> পণ্য যোগ বা সম্পাদনা করতে পারবেন।
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-black text-xl text-white">খাঁটি খাদ্য ইনভেন্টরি ম্যানেজমেন্ট</h2>
                <p className="text-xs text-stone-400">সরিষার তেল, মধু, গাওয়া ঘি ও খেজুরের স্টক পর্যবেক্ষণ ও রিস্টক করুন</p>
              </div>

              {hasRole(['super_admin', 'inventory_manager']) && (
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> নতুন খাঁটি পণ্য যোগ করুন
                </button>
              )}
            </div>

            {/* Inventory Table */}
            <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 uppercase font-semibold border-b border-stone-800">
                    <tr>
                      <th className="p-3.5">পণ্য (Product)</th>
                      <th className="p-3.5">ক্যাটাগরি</th>
                      <th className="p-3.5">প্যাক সাইজ</th>
                      <th className="p-3.5">মূল্য (Price)</th>
                      <th className="p-3.5">স্টক সংখ্যা</th>
                      <th className="p-3.5">রিওয়ার্ড পয়েন্ট</th>
                      <th className="p-3.5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-800/40 transition">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div>
                            <span className="font-bold text-white block">{p.name}</span>
                            <span className="text-[10px] text-emerald-400">{p.badge || 'খাঁটি পণ্য'}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-stone-300">{p.category}</td>
                        <td className="p-3.5 font-bold text-stone-400">{p.unit || '১ প্যাক'}</td>
                        <td className="p-3.5 font-mono font-bold text-amber-400">৳ {p.price}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold ${
                                p.stock === 0 ? 'text-rose-400' : p.stock <= 8 ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              {p.stock}
                            </span>
                            {hasRole(['super_admin', 'inventory_manager', 'orders_manager']) && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleQuickStock(p.id, -1)}
                                  className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                                  title="-১ স্টক"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleQuickStock(p.id, 1)}
                                  className="w-5 h-5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center font-bold text-[10px] cursor-pointer"
                                  title="+১ স্টক"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => handleQuickStock(p.id, 10)}
                                  className="px-1.5 h-5 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 flex items-center justify-center font-bold text-[9px] cursor-pointer"
                                  title="+১০ রিস্টক"
                                >
                                  +১০
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-amber-400 font-bold font-mono">+{p.xpReward} পয়েন্ট</td>
                        <td className="p-3.5 text-right">
                          {hasRole(['super_admin', 'inventory_manager']) ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
                                title="এডিট করুন"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400">লকড</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {!hasRole(['super_admin', 'orders_manager', 'inventory_manager']) && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>প্রবেশাধিকার সংরক্ষিত: শুধুমাত্র orders_manager অথবা super_admin দেখতে পারবেন।</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-black text-xl text-white">লাইভ গ্রাহক অর্ডার ট্র্যাকিং</h2>
                <p className="text-xs text-stone-400">ডেলিভারি স্ট্যাটাস পরিবর্তন করুন ও কুরিয়ার ট্র্যাকিং নম্বর ইনপুট দিন</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="অর্ডার # বা নাম দিয়ে খুঁজুন..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="All">সকল স্ট্যাটাস</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 uppercase font-semibold border-b border-stone-800">
                    <tr>
                      <th className="p-3.5">অর্ডার #</th>
                      <th className="p-3.5">গ্রাহক ও মোবাইল</th>
                      <th className="p-3.5">পণ্যসামগ্রী</th>
                      <th className="p-3.5">মূল্য ও পয়েন্ট</th>
                      <th className="p-3.5">পেমেন্ট মেথড</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5 text-right">স্ট্যাটাস আপডেট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-800/40 transition">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-amber-400 block">{ord.orderNumber}</span>
                          <span className="text-[10px] text-stone-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{ord.customerName}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">{ord.customerPhone || '০১৭xxxxxxxx'}</span>
                          <span className="text-[10px] text-stone-400 block truncate max-w-[140px]">
                            {ord.shippingAddress?.area || ord.shippingAddress?.city}, {ord.shippingAddress?.division}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="text-[11px] text-stone-300">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="truncate max-w-[160px]">
                                {it.quantity}x {it.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-white block">৳ {ord.total}</span>
                          <span className="text-[10px] text-amber-400 font-semibold">+{ord.xpEarned} পয়েন্ট</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-[10px] uppercase text-emerald-400 block font-bold">
                            {ord.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : ord.paymentMethod}
                          </span>
                          <span className="font-mono text-[9px] text-stone-400">{ord.paymentId}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : ord.status === 'shipped'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : ord.status === 'processing'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {ord.status}
                          </span>
                          {ord.trackingNumber && (
                            <span className="text-[9px] font-mono text-stone-400 block mt-0.5">
                              {ord.trackingNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {hasRole(['super_admin', 'orders_manager']) ? (
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                              className="px-2 py-1 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing (প্যাকেজিং)</option>
                              <option value="shipped">Shipped (কুরিয়ারে অর্পণ)</option>
                              <option value="delivered">Delivered (পৌঁছেছে)</option>
                              <option value="cancelled">Cancelled (বাতিল)</option>
                            </select>
                          ) : (
                            <span className="text-[10px] text-stone-400">লকড</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SITE CONTENT CMS TAB */}
        {activeTab === 'content' && (
          <div className="space-y-5">
            {!hasRole(['super_admin', 'content_editor']) && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>প্রবেশাধিকার সংরক্ষিত: শুধুমাত্র content_editor বা super_admin ব্যানার পরিবর্তন করতে পারবেন।</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-xl text-white">ওয়েবসাইট কনটেন্ট ও ব্যানার সিএমএস</h2>
                <p className="text-xs text-stone-400">মারকুই নোটিশ, হিরো ব্যানার ও ডিসকাউন্ট কুপন সহজেই আপডেট করুন</p>
              </div>

              {hasRole(['super_admin', 'content_editor']) && (
                <button
                  onClick={() => updateSiteContent(contentForm)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  সাইটে প্রকাশ করুন
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3.5 text-xs">
                <h3 className="font-display font-bold text-sm text-emerald-400">শীর্ষ মারকুই নোটিশ বার</h3>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">নোটিশ বার্তা</label>
                  <input
                    type="text"
                    value={contentForm.announcementText}
                    onChange={(e) => setContentForm({ ...contentForm, announcementText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">লিংক বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={contentForm.announcementLinkText}
                    onChange={(e) => setContentForm({ ...contentForm, announcementLinkText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="promoActive"
                    checked={contentForm.promoBannerActive}
                    onChange={(e) => setContentForm({ ...contentForm, promoBannerActive: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="promoActive" className="text-stone-200 font-semibold cursor-pointer">
                    টপ নোটিশ বার সক্রিয় রাখুন
                  </label>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3.5 text-xs">
                <h3 className="font-display font-bold text-sm text-amber-400">হিরো ব্যানার কনটেন্ট</h3>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">ব্যাজ ট্যাগ</label>
                  <input
                    type="text"
                    value={contentForm.heroBadge}
                    onChange={(e) => setContentForm({ ...contentForm, heroBadge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">হিরো মূল শিরোনাম (Headline)</label>
                  <input
                    type="text"
                    value={contentForm.heroHeadline}
                    onChange={(e) => setContentForm({ ...contentForm, heroHeadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">হিরো উপ-শিরোনাম (Subheadline)</label>
                  <textarea
                    rows={2}
                    value={contentForm.heroSubheadline}
                    onChange={(e) => setContentForm({ ...contentForm, heroSubheadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3.5 text-xs md:col-span-2">
                <h3 className="font-display font-bold text-sm text-emerald-400">ক্যাম্পেইন ও খাঁটি রিওয়ার্ড পয়েন্ট গুণক</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">সক্রিয় কুপন কোড</label>
                    <input
                      type="text"
                      value={contentForm.promoCode}
                      onChange={(e) => setContentForm({ ...contentForm, promoCode: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">মূল্যছাড়ের শতকরা হার (%)</label>
                    <input
                      type="number"
                      min="5"
                      max="90"
                      value={contentForm.promoDiscountPercent}
                      onChange={(e) => setContentForm({ ...contentForm, promoDiscountPercent: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">রিওয়ার্ড পয়েন্ট গুণক (Loyalty Multiplier)</label>
                    <select
                      value={contentForm.loyaltyMultiplier}
                      onChange={(e) => setContentForm({ ...contentForm, loyaltyMultiplier: parseInt(e.target.value, 10) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="1">1X রেগুলার পয়েন্ট</option>
                      <option value="2">2X ডাবল পয়েন্ট উইকেন্ড</option>
                      <option value="3">3X ট্রিপল পয়েন্ট ধামাকা</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAFF & RBAC TAB */}
        {activeTab === 'staff' && (
          <div className="space-y-5">
            {!hasRole(['super_admin']) ? (
              <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-2">
                <Lock className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="font-display font-bold text-white text-base">সুপার অ্যাডমিন এক্সেস প্রয়োজন</h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  কর্মকর্তাদের রোল পরিবর্তন ও নতুন স্টাফ অ্যাকাউন্ট যোগ করতে 'super_admin' রোল আবশ্যক।
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-white">রোল-ভিত্তিক অ্যাক্সেস নিয়ন্ত্রণ (RBAC)</h2>
                    <p className="text-xs text-stone-400">প্রতিটি কর্মকর্তার দায়িত্ব ও পারমিশন নিশ্চিত করুন</p>
                  </div>

                  <button
                    onClick={() => setNewStaffModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> নতুন কর্মকর্তা যোগ করুন
                  </button>
                </div>

                {/* Staff Table */}
                <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-950 text-stone-400 uppercase font-semibold border-b border-stone-800">
                        <tr>
                          <th className="p-3.5">কর্মকর্তা (Staff Name)</th>
                          <th className="p-3.5">অফিসিয়াল ইমেইল</th>
                          <th className="p-3.5">নিযুক্ত ভূমিকা (Role)</th>
                          <th className="p-3.5">যোগদানের তারিখ</th>
                          <th className="p-3.5 text-right">ভূমিকা পরিবর্তন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/80">
                        {allStaff.map((st) => (
                          <tr key={st.id} className="hover:bg-stone-800/40 transition">
                            <td className="p-3.5 flex items-center gap-3">
                              <img src={st.avatar} alt={st.name} className="w-9 h-9 rounded-full object-cover" />
                              <span className="font-bold text-white">{st.name}</span>
                            </td>
                            <td className="p-3.5 font-mono text-stone-300">{st.email}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                  st.role === 'super_admin'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : st.role === 'inventory_manager'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : st.role === 'orders_manager'
                                    ? 'bg-cyan-500/20 text-cyan-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {st.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-3.5 text-stone-400">{new Date(st.createdAt).toLocaleDateString()}</td>
                            <td className="p-3.5 text-right">
                              <select
                                value={st.role}
                                onChange={(e) => handleUpdateRole(st.id, e.target.value as StaffRole)}
                                className="px-2.5 py-1 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                              >
                                <option value="super_admin">Super Admin (সর্বোচ্চ)</option>
                                <option value="inventory_manager">Inventory Manager</option>
                                <option value="orders_manager">Orders Manager</option>
                                <option value="content_editor">Content Editor</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RBAC Matrix */}
                <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                  <h3 className="font-display font-bold text-sm text-white">আরব্যাক (RBAC) পারমিশন বিবরণী</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-stone-950 border border-amber-500/30">
                      <div className="font-bold text-amber-400 mb-1">👑 Super Admin</div>
                      <p className="text-stone-400">ইনভেন্টরি, অর্ডার, সিএমএস ও স্টাফ পারমিশন নিয়ন্ত্রণসহ সম্পূর্ণ এক্সেস।</p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950 border border-purple-500/30">
                      <div className="font-bold text-purple-400 mb-1">📦 Inventory Manager</div>
                      <p className="text-stone-400">নতুন পণ্য যোগ, মূল্য নির্ধারণ, প্যাক সাইজ ও স্টক রি-ফিলিং।</p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950 border border-cyan-500/30">
                      <div className="font-bold text-cyan-400 mb-1">🚚 Orders Manager</div>
                      <p className="text-stone-400">গ্রাহকের অর্ডার ও মোবাইল নম্বর যাচাই, কুরিয়ার ট্র্যাকিং ও ডেলিভারি স্ট্যাটাস।</p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950 border border-emerald-500/30">
                      <div className="font-bold text-emerald-400 mb-1">🎨 Content Editor</div>
                      <p className="text-stone-400">ওয়েবসাইটের নোটিশ বার, হিরো ব্যানার, কুপন ছাড় ও বোনাস পয়েন্ট ক্যাম্পেইন।</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-lg text-white mb-4">
              {editingProduct ? 'পণ্য সম্পাদনা (Edit Product)' : 'নতুন খাঁটি খাদ্য পণ্য যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">পণ্যের নাম (Product Name)</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="যেমন: ঘানি ভাঙা খাঁটি সরিষার তেল"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">ক্যাটাগরি</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="সরিষার তেল ও ঘি">সরিষার তেল ও ঘি</option>
                    <option value="খাঁটি মধু">খাঁটি মধু</option>
                    <option value="খেজুর ও বাদাম">খেজুর ও বাদাম</option>
                    <option value="মসলা ও চাল">মসলা ও চাল</option>
                    <option value="গুড় ও মিষ্টি">গুড় ও মিষ্টি</option>
                    <option value="স্বাস্থ্যকর বীজ ও হেলথ ফুড">স্বাস্থ্যকর বীজ ও হেলথ ফুড</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">প্যাক সাইজ / ইউনিট</label>
                  <input
                    type="text"
                    required
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="যেমন: ১ লিটার বোতল / ৫০০ গ্রাম জার"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">মূল্য (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">স্টক সংখ্যা</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">রিওয়ার্ড পয়েন্ট</label>
                  <input
                    type="number"
                    value={productForm.xpReward}
                    onChange={(e) => setProductForm({ ...productForm, xpReward: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">ছবির লিংক (Image URL)</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">পণ্যের বিবরণ (Description)</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  ক্যাটালগে সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {newStaffModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl">
            <button onClick={() => setNewStaffModal(false)} className="absolute top-5 right-5 text-stone-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-lg text-white mb-4">নতুন কর্মকর্তা নিয়োগ (Add Staff)</h3>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">পূর্ণ নাম</label>
                <input
                  type="text"
                  required
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">ইমেইল</label>
                <input
                  type="email"
                  required
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">নির্ধারিত ভূমিকা (Role)</label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value as StaffRole })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none cursor-pointer"
                >
                  <option value="inventory_manager">ইনভেন্টরি ম্যানেজার (Inventory)</option>
                  <option value="orders_manager">ডেলিভারি ম্যানেজার (Fulfillment)</option>
                  <option value="content_editor">কনটেন্ট ও ব্যানার এডিটর</option>
                  <option value="super_admin">সুপার অ্যাডমিন</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  অ্যাকাউন্ট তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
