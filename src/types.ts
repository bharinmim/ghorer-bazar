export type StaffRole = 'super_admin' | 'inventory_manager' | 'orders_manager' | 'content_editor';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  avatar: string;
  createdAt: string;
}

export type ProductRarity = 'Classic' | 'Signature' | 'Premium Reserve' | 'Heritage Drop';

export type ProductCategory =
  | 'সরিষার তেল ও ঘি'
  | 'খাঁটি মধু'
  | 'খেজুর ও বাদাম'
  | 'মসলা ও চাল'
  | 'গুড় ও মিষ্টি'
  | 'স্বাস্থ্যকর বীজ ও হেলথ ফুড';

export interface Product {
  id: string;
  name: string;
  banglaName?: string;
  slug: string;
  unit: string; // e.g. "১ লিটার বোতল", "৫০০ গ্রাম জার"
  tagline: string;
  description: string;
  category: ProductCategory;
  price: number; // in ৳ BDT
  compareAtPrice?: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  rarity: ProductRarity;
  image: string;
  gallery?: string[];
  xpReward: number;
  isFeatured?: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  image: string;
  rarity: ProductRarity;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    area: string;
    postalCode: string;
    division: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  pointsDiscountAmount: number;
  pointsRedeemed: number;
  shippingFee: number;
  total: number;
  xpEarned: number;
  status: OrderStatus;
  paymentMethod: 'bkash' | 'nagad' | 'cod' | 'card';
  paymentId: string;
  trackingNumber?: string;
  notes?: string;
}

export interface SiteContent {
  announcementText: string;
  announcementLinkText: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroBadge: string;
  promoBannerActive: boolean;
  promoBannerText: string;
  promoCode: string;
  promoDiscountPercent: number;
  loyaltyMultiplier: number;
  featuredCategory: string;
}

export type LoyaltyTier = 'ব্রোঞ্জ কাস্টমার' | 'সিলভার সদস্য' | 'গোল্ড প্রিমিয়াম' | 'রয়েল মেম্বার';

export interface LoyaltyAccount {
  userId: string;
  email: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  streakDays: number;
  lastSpinDate?: string;
  unlockedBadges: string[];
}

export interface RealtimeEvent {
  type: 'order_created' | 'order_status_updated' | 'inventory_updated' | 'content_updated' | 'ping';
  data: any;
  timestamp: string;
}
