import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, Order, StaffUser, StaffRole, SiteContent, LoyaltyAccount, OrderItem } from '../types.ts';
import { sounds } from '../utils/sound.ts';
import confetti from 'canvas-confetti';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'loot';
  title: string;
  message: string;
  timestamp: string;
}

interface StoreContextType {
  // Products
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRarity: string;
  setSelectedRarity: (rarity: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  
  // Gamified Loyalty & Discounts
  loyaltyAccount: LoyaltyAccount | null;
  refreshLoyalty: () => Promise<void>;
  pointsToRedeem: number;
  setPointsToRedeem: (pts: number) => void;
  appliedPromo: string;
  promoDiscountPercent: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  spinWheelPrize: any;
  isSpinningWheel: boolean;
  triggerSpinWheel: () => Promise<any>;
  triggerClaimScratch: () => Promise<any>;
  
  // Site Content
  content: SiteContent | null;
  refreshContent: () => Promise<void>;
  updateSiteContent: (updates: Partial<SiteContent>) => Promise<boolean>;

  // Admin Auth & RBAC
  staffToken: string | null;
  currentStaff: StaffUser | null;
  loginStaff: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerStaff: (name: string, email: string, pass: string, role?: StaffRole) => Promise<{ success: boolean; error?: string }>;
  logoutStaff: () => void;
  hasRole: (roles: StaffRole[]) => boolean;
  
  // Modals & Panels
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isRewardsModalOpen: boolean;
  setIsRewardsModalOpen: (open: boolean) => void;
  activeQuickProduct: Product | null;
  setActiveQuickProduct: (p: Product | null) => void;

  // Real-time & Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('neon_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Loyalty
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0);
  const [isSpinningWheel, setIsSpinningWheel] = useState(false);
  const [spinWheelPrize, setSpinWheelPrize] = useState<any>(null);

  // Content
  const [content, setContent] = useState<SiteContent | null>(null);

  // Admin Auth
  const [staffToken, setStaffToken] = useState<string | null>(() => localStorage.getItem('neon_staff_token'));
  const [currentStaff, setCurrentStaff] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem('neon_staff_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [activeQuickProduct, setActiveQuickProduct] = useState<Product | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id, timestamp: new Date().toLocaleTimeString() };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem('neon_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Fetch initial data
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const refreshContent = async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      }
    } catch (e) {
      console.error('Failed to load site content:', e);
    }
  };

  const refreshLoyalty = async () => {
    try {
      const userId = 'demo-user';
      const res = await fetch(`/api/loyalty/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLoyaltyAccount(data.account);
      }
    } catch (e) {
      console.error('Failed to load loyalty:', e);
    }
  };

  const refreshOrders = async () => {
    if (!staffToken) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshContent();
    refreshLoyalty();
  }, []);

  useEffect(() => {
    if (staffToken) {
      refreshOrders();
    }
  }, [staffToken]);

  // Real-time SSE listener
  useEffect(() => {
    const es = new EventSource('/api/realtime/stream');

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'order_created') {
          sounds.playCoin();
          addToast({
            type: 'loot',
            title: '🔥 Live Order Placed!',
            message: `Order #${data.data.order.orderNumber} placed for $${data.data.order.total.toFixed(2)}!`
          });
          refreshProducts(); // stock changed
          refreshLoyalty();
          refreshOrders();
        } else if (data.type === 'inventory_updated') {
          refreshProducts();
          if (data.data.action === 'stock_change') {
            addToast({
              type: 'info',
              title: 'Inventory Stock Updated',
              message: `${data.data.product?.name} stock is now ${data.data.product?.stock} pcs.`
            });
          }
        } else if (data.type === 'order_status_updated') {
          refreshOrders();
          addToast({
            type: 'success',
            title: 'Order Status Changed',
            message: `Order #${data.data.order?.orderNumber} is now ${data.data.order?.status?.toUpperCase()}`
          });
        } else if (data.type === 'content_updated') {
          setContent(data.data.content);
        }
      } catch (e) {
        // ping or comment
      }
    };

    return () => {
      es.close();
    };
  }, [addToast, staffToken]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      sounds.playDecline();
      addToast({
        type: 'warning',
        title: 'Out of Stock',
        message: `Sorry, ${product.name} is currently sold out!`
      });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });

    sounds.playCoin();
    addToast({
      type: 'success',
      title: 'Loot Bag Updated',
      message: `Added ${product.name} (+${product.xpReward * quantity} XP Reward)`
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(item.product.stock, quantity) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setPointsToRedeem(0);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Promo code verification
  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!content) return { success: false, message: 'Could not verify coupon' };

    if (clean === content.promoCode.toUpperCase()) {
      setAppliedPromo(clean);
      setPromoDiscountPercent(content.promoDiscountPercent);
      sounds.playPowerUp();
      return { success: true, message: `Awesome! ${content.promoDiscountPercent}% promo discount applied!` };
    } else if (clean === 'SCRATCH15') {
      setAppliedPromo('SCRATCH15');
      setPromoDiscountPercent(15);
      sounds.playPowerUp();
      return { success: true, message: 'Scratch reward applied: 15% OFF entire order!' };
    } else if (clean === 'CYBER50') {
      setAppliedPromo('CYBER50');
      setPromoDiscountPercent(50);
      sounds.playPowerUp();
      return { success: true, message: 'CYBER SPECIAL: 50% discount activated!' };
    }

    sounds.playDecline();
    return { success: false, message: 'Invalid or expired promotional code' };
  };

  const removePromoCode = () => {
    setAppliedPromo('');
    setPromoDiscountPercent(0);
  };

  // Gamification Wheel & Scratch
  const triggerSpinWheel = async () => {
    if (isSpinningWheel) return;
    setIsSpinningWheel(true);
    try {
      const res = await fetch('/api/loyalty/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loyaltyAccount?.userId || 'demo-user' })
      });
      if (res.ok) {
        const data = await res.json();
        setSpinWheelPrize(data.prize);
        setLoyaltyAccount(data.updatedAccount);
        sounds.playLevelUp();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        return data;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpinningWheel(false);
    }
  };

  const triggerClaimScratch = async () => {
    try {
      const res = await fetch('/api/loyalty/scratch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loyaltyAccount?.userId || 'demo-user' })
      });
      if (res.ok) {
        const data = await res.json();
        setLoyaltyAccount(data.updatedAccount);
        sounds.playLevelUp();
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
        return data;
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Auth & RBAC
  const loginStaff = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setStaffToken(data.token);
        setCurrentStaff(data.user);
        localStorage.setItem('neon_staff_token', data.token);
        localStorage.setItem('neon_staff_user', JSON.stringify(data.user));
        sounds.playLevelUp();
        addToast({
          type: 'success',
          title: 'Admin Session Authenticated',
          message: `Welcome back, ${data.user.name} (${data.user.role.toUpperCase()})`
        });
        setIsLoginModalOpen(false);
        setIsAdminOpen(true);
        return { success: true };
      } else {
        sounds.playDecline();
        return { success: false, error: data.error || 'Authentication failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error communicating with auth server' };
    }
  };

  const registerStaff = async (name: string, email: string, pass: string, role: StaffRole = 'inventory_manager') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, role })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setStaffToken(data.token);
        setCurrentStaff(data.user);
        localStorage.setItem('neon_staff_token', data.token);
        localStorage.setItem('neon_staff_user', JSON.stringify(data.user));
        sounds.playLevelUp();
        addToast({
          type: 'success',
          title: 'স্টাফ একাউন্ট তৈরি সম্পন্ন',
          message: `স্বাগতম, ${data.user.name}! আপনি সফলভাবে যুক্ত হয়েছেন।`
        });
        setIsLoginModalOpen(false);
        setIsAdminOpen(true);
        return { success: true };
      } else {
        sounds.playDecline();
        return { success: false, error: data.error || 'রেজিস্ট্রেশন সম্পন্ন হয়নি।' };
      }
    } catch (err) {
      return { success: false, error: 'সার্ভার সংযোগে ত্রুটি হয়েছে।' };
    }
  };

  const logoutStaff = () => {
    if (staffToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${staffToken}` }
      }).catch(() => {});
    }
    setStaffToken(null);
    setCurrentStaff(null);
    localStorage.removeItem('neon_staff_token');
    localStorage.removeItem('neon_staff_user');
    setIsAdminOpen(false);
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'Staff session closed securely.'
    });
  };

  const hasRole = (roles: StaffRole[]) => {
    if (!currentStaff) return false;
    if (currentStaff.role === 'super_admin') return true;
    return roles.includes(currentStaff.role);
  };

  const updateSiteContent = async (updates: Partial<SiteContent>): Promise<boolean> => {
    if (!staffToken) return false;
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffToken}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
        addToast({
          type: 'success',
          title: 'CMS Updated',
          message: 'Site banners and configuration published live!'
        });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        isLoadingProducts,
        refreshProducts,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedRarity,
        setSelectedRarity,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        loyaltyAccount,
        refreshLoyalty,
        pointsToRedeem,
        setPointsToRedeem,
        appliedPromo,
        promoDiscountPercent,
        applyPromoCode,
        removePromoCode,
        spinWheelPrize,
        isSpinningWheel,
        triggerSpinWheel,
        triggerClaimScratch,
        content,
        refreshContent,
        updateSiteContent,
        staffToken,
        currentStaff,
        loginStaff,
        registerStaff,
        logoutStaff,
        hasRole,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAdminOpen,
        setIsAdminOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isRewardsModalOpen,
        setIsRewardsModalOpen,
        activeQuickProduct,
        setActiveQuickProduct,
        toasts,
        addToast,
        removeToast,
        orders,
        refreshOrders,
        soundEnabled,
        toggleSound
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
