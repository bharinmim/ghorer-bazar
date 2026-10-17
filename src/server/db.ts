import fs from 'fs';
import path from 'path';
import { Product, Order, StaffUser, SiteContent, LoyaltyAccount } from '../types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

interface StoredStaffUser extends StaffUser {
  passwordHash: string;
}

interface DatabaseSchema {
  staff: StoredStaffUser[];
  products: Product[];
  orders: Order[];
  content: SiteContent;
  loyalty: Record<string, LoyaltyAccount>;
}

// Authentic Ghorer Bazar Product Catalog with precise matching images
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'ঘানি ভাঙা খাঁটি সরিষার তেল (Kachi Ghani Mustard Oil)',
    banglaName: 'ঘানি ভাঙা খাঁটি সরিষার তেল',
    slug: 'kachi-ghani-mustard-oil',
    unit: '১ লিটার প্লাস্টিক বোতল',
    tagline: 'কাঠের ঘানিতে ভাঙা তীব্র ঝাঁঝালো ও ১০০% রাসায়নিকমুক্ত খাঁটি সরিষার তেল',
    description: 'দেশি মাঘী সরিষা রোদে শুকিয়ে কাঠের ঘানিতে কম তাপে ভাঙা হয়। কোনো ফিল্টারিং কেমিক্যাল বা প্রিজারভেটিভ নেই। আসল সরিষার তীব্র ঝাঁঝ এবং ঘ্রাণ রান্নায় আনবে সোনালী খাঁটি স্বাদ।',
    category: 'সরিষার তেল ও ঘি',
    price: 380,
    compareAtPrice: 420,
    stock: 45,
    rating: 5.0,
    reviewsCount: 420,
    badge: 'সেরা বিক্রিত 🌿',
    rarity: 'Signature',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    xpReward: 50,
    isFeatured: true
  },
  {
    id: 'prod-2',
    name: 'সুন্দরবনের প্রাকৃতিক খলিশা ফুলের মধু (Raw Sundarban Honey)',
    banglaName: 'সুন্দরবনের খলিশা ফুলের খাঁটি মধু',
    slug: 'raw-sundarban-honey',
    unit: '৫০০ গ্রাম ফুড গ্রেড জার',
    tagline: 'সুন্দরবনের গভীর অরণ্য থেকে মৌয়ালদের সংগৃহীত প্রাকৃতিক কাঁচা মধু',
    description: 'সুন্দরবনের প্রাকৃতিক চাক থেকে সরাসরি সংগৃহীত। কোনো হিট বা প্রসেসিং ছাড়া অপরিশোধিত ও এনজাইম সমৃদ্ধ কাঁচা মধু। সর্দি-কাশি উপশমে ও রোগ প্রতিরোধ ক্ষমতা বাড়াতে অতুলনীয়।',
    category: 'খাঁটি মধু',
    price: 650,
    compareAtPrice: 750,
    stock: 28,
    rating: 4.9,
    reviewsCount: 310,
    badge: 'সুন্দরবনের চাক 🍯',
    rarity: 'Premium Reserve',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    xpReward: 80,
    isFeatured: true
  },
  {
    id: 'prod-3',
    name: 'সিরাজগঞ্জের খাঁটি দানাদার গাওয়া ঘি (Grass-Fed Cow Ghee)',
    banglaName: 'সিরাজগঞ্জের খাঁটি গাওয়া ঘি',
    slug: 'sirajganj-cow-ghee',
    unit: '৫০০ গ্রাম গ্লাস জার',
    tagline: 'সিরাজগঞ্জের দেশি বাথানের গাভীর দুধের মালাই থেকে প্রস্তুত সুগন্ধি ঘি',
    description: 'ঘরোয়া সনাতন পদ্ধতিতে মাখন গলিয়ে তৈরি হয় এই সোনালী দানাদার ঘি। খিচুড়ি, গরম ভাত বা পোলাওয়ের সাথে অতুলনীয় ঘ্রাণ ও আসল স্বাদ এনে দেয়।',
    category: 'সরিষার তেল ও ঘি',
    price: 790,
    compareAtPrice: 890,
    stock: 19,
    rating: 5.0,
    reviewsCount: 280,
    badge: '১০০% দানাদার ✨',
    rarity: 'Premium Reserve',
    image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80',
    xpReward: 100,
    isFeatured: true
  },
  {
    id: 'prod-4',
    name: 'মদিনার ভিআইপি আজওয়া খেজুর (Madinah VIP Ajwa Dates)',
    banglaName: 'মদিনার ভিআইপি আজওয়া খেজুর',
    slug: 'madinah-ajwa-dates',
    unit: '৫০০ গ্রাম সিল্ড প্যাক',
    tagline: 'সৌদি আরবের মদিনা শরিফের বরকতময় নরম, কালো ও রসাল আজওয়া',
    description: 'রাসুলুল্লাহ (সাঃ) এর প্রিয় আজওয়া খেজুর। নরম মাংসল টেক্সচার, প্রাকৃতিক মিষ্টতা এবং হার্ট ও রক্তচাপ নিয়ন্ত্রণে অত্যন্ত উপকারী পুষ্টিকর সুপারফুড।',
    category: 'খেজুর ও বাদাম',
    price: 750,
    compareAtPrice: 850,
    stock: 35,
    rating: 4.9,
    reviewsCount: 190,
    badge: 'মদিনার আমদানি 🌴',
    rarity: 'Heritage Drop',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=800&q=80',
    xpReward: 90,
    isFeatured: true
  },
  {
    id: 'prod-5',
    name: 'যশোরের নলেন খেজুরের পাটালি গুড় (Jessore Date Palm Jaggery)',
    banglaName: 'যশোরের নলেন খেজুরের পাটালি গুড়',
    slug: 'jessore-date-jaggery',
    unit: '১ কেজি খাঁটি পাটালি',
    tagline: 'শীতের ভোরে সংগৃহীত খেজুরের রস দিয়ে সনাতন কাঠের আগুনে জ্বাল দেওয়া গুড়',
    description: 'চিনি বা হাইড্রোজ মুক্ত আসল খেজুরের পাটালি গুড়। পায়েস, পিঠা-পুলি এবং দৈনন্দিন মিষ্টি রান্নায় খাঁটি খেজুরের অতুলনীয় মৌতাত এনে দেয়।',
    category: 'গুড় ও মিষ্টি',
    price: 360,
    compareAtPrice: 420,
    stock: 22,
    rating: 4.8,
    reviewsCount: 160,
    badge: 'মৌসুমি ড্রপ 🍁',
    rarity: 'Signature',
    image: 'https://images.unsplash.com/photo-1606913084603-3e7702b01627?auto=format&fit=crop&w=800&q=80',
    xpReward: 45,
    isFeatured: false
  },
  {
    id: 'prod-6',
    name: 'ঘানি ভাঙা ১০০% খাঁটি কালোজিরা তেল (Cold Pressed Black Seed Oil)',
    banglaName: 'খাঁটি কালোজিরা তেল',
    slug: 'cold-pressed-kalijira-oil',
    unit: '২০০ মিলি ড্রপার ক্যাপ বোতল',
    tagline: 'কালোহীরা কালোজিরার সম্পূর্ণ প্রাকৃতিক নির্যাস — মৃত্যু ছাড়া সকল রোগের শেফা',
    description: 'দেশি সেরা জাতের কালোজিরা থেকে নির্ভেজালভাবে কোল্ড প্রেসড পদ্ধতিতে সংগৃহীত তেল। প্রতিদিন ১ চামচ সকালে খেলে ক্লান্তি দূর হয় ও ইমিউনিটি বহুগুণ বৃদ্ধি পায়।',
    category: 'স্বাস্থ্যকর বীজ ও হেলথ ফুড',
    price: 450,
    compareAtPrice: 520,
    stock: 30,
    rating: 4.9,
    reviewsCount: 145,
    badge: 'প্রাকৃতিক শেফা 🖤',
    rarity: 'Premium Reserve',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    xpReward: 60,
    isFeatured: false
  },
  {
    id: 'prod-7',
    name: 'আমদানী করা প্রিমিয়াম অর্গানিক চিয়া সিড (Organic Chia Seeds)',
    banglaName: 'অর্গানিক চিয়া সিড',
    slug: 'premium-organic-chia-seeds',
    unit: '২৫০ গ্রাম জিপলক পাউচ',
    tagline: 'ওমেগা-৩ ও উচ্চ ফাইবার সমৃদ্ধ প্রাকৃতিক ডায়েট সুপারফুড',
    description: 'মেক্সিকোর প্রত্যয়িত অর্গানিক ফার্ম থেকে আমদানিকৃত। ওজন নিয়ন্ত্রণ, পেটের স্বাস্থ্য ভালো রাখতে এবং সারাদিন প্রাণবন্ত শক্তি যোগাতে অত্যন্ত কার্যকর।',
    category: 'স্বাস্থ্যকর বীজ ও হেলথ ফুড',
    price: 320,
    compareAtPrice: 380,
    stock: 50,
    rating: 4.8,
    reviewsCount: 230,
    badge: 'সুপারফুড ⚡',
    rarity: 'Classic',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    xpReward: 40,
    isFeatured: false
  },
  {
    id: 'prod-8',
    name: 'ঢেঁকি ছাঁটা সুগন্ধি বালাম চাল (Traditional Dheki Balam Rice)',
    banglaName: 'ঢেঁকি ছাঁটা বালাম চাল',
    slug: 'dheki-chhata-balam-rice',
    unit: '৫ কেজি ইকো জুট ব্যাগ',
    tagline: 'পলিশবিহীন পুষ্টিকর লাল চাল — ডায়াবেটিস ফ্রেন্ডলি ও ভিটামিন বি কমপ্লেক্স সমৃদ্ধ',
    description: 'গ্রামের মা-বোনদের হাতে তৈরি কাঠের ঢেঁকিতে ছাঁটা লালচে চাল। কোনো কেমিক্যাল ওয়াশ বা রাসায়নিক ছাড়াই সম্পূর্ণ প্রাকৃতিক উপায়ে সংরক্ষিত।',
    category: 'মসলা ও চাল',
    price: 550,
    compareAtPrice: 620,
    stock: 25,
    rating: 4.7,
    reviewsCount: 110,
    badge: 'ঐতিহ্যবাহী ঢেঁকি 🌾',
    rarity: 'Heritage Drop',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    xpReward: 70,
    isFeatured: true
  },
  {
    id: 'prod-9',
    name: 'রয়েল মিক্সড ড্রাই ফ্রুটস ও বাদাম (Royal Mixed Nuts & Dry Fruits)',
    banglaName: 'রয়েল মিক্সড ড্রাই ফ্রুটস ও বাদাম',
    slug: 'royal-mixed-nuts',
    unit: '৪০০ গ্রাম ফুড প্যাক',
    tagline: 'আমন্ড, কাজু, পেস্তা, আখরোট, এপ্রিকট ও ইরানি কিশমিশের পুষ্টিকর ব্লেন্ড',
    description: 'কোনো ভাজা বা অতিরিক্ত লবণ ছাড়া কাঁচা অর্গানিক বাদামের শক্তি। প্রতিদিনের সকালের নাস্তা বা স্ন্যাকসের জন্য শ্রেষ্ঠ স্বাস্থ্যকর উপহার।',
    category: 'খেজুর ও বাদাম',
    price: 820,
    compareAtPrice: 950,
    stock: 18,
    rating: 5.0,
    reviewsCount: 175,
    badge: 'ভিআইপি এনার্জি 🥜',
    rarity: 'Premium Reserve',
    image: 'https://images.unsplash.com/photo-1543158181-e6f9f6712055?auto=format&fit=crop&w=800&q=80',
    xpReward: 110,
    isFeatured: false
  }
];

// Pre-seeded Staff with requested bharin10mim@gmail.com and password 1234
const INITIAL_STAFF: StoredStaffUser[] = [
  {
    id: 'staff-bharin',
    email: 'bharin10mim@gmail.com',
    passwordHash: '1234',
    name: 'Bharin Mim (Director & Super Admin)',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(Date.now() - 100 * 86400000).toISOString()
  },
  {
    id: 'staff-admin',
    email: 'admin@ghorerbazar.com',
    passwordHash: 'AdminPass123!',
    name: 'Rafiqul Islam (Founder)',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 'staff-inventory',
    email: 'inventory@ghorerbazar.com',
    passwordHash: 'Inventory123!',
    name: 'Nusrat Jahan (Agro Procurement Lead)',
    role: 'inventory_manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'staff-orders',
    email: 'orders@ghorerbazar.com',
    passwordHash: 'Orders123!',
    name: 'Tanvir Ahmed (Nationwide Logistics)',
    role: 'orders_manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 'staff-content',
    email: 'content@ghorerbazar.com',
    passwordHash: 'Content123!',
    name: 'Anika Tabassum (Brand Campaigns)',
    role: 'content_editor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-2001',
    orderNumber: 'GB-74812',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    customerName: 'Kazi Farhan',
    customerEmail: 'farhan.kazi@gmail.com',
    customerPhone: '01711223344',
    shippingAddress: {
      street: 'House 14, Road 7, Sector 3',
      city: 'Dhaka',
      area: 'Uttara',
      postalCode: '1230',
      division: 'Dhaka'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'ঘানি ভাঙা খাঁটি সরিষার তেল (১ লিটার)',
        price: 380,
        quantity: 2,
        unit: '১ লিটার বোতল',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
        rarity: 'Signature'
      },
      {
        productId: 'prod-3',
        name: 'সিরাজগঞ্জের খাঁটি গাওয়া ঘি (৫০০ গ্রাম)',
        price: 790,
        quantity: 1,
        unit: '৫০০ গ্রাম জার',
        image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80',
        rarity: 'Premium Reserve'
      }
    ],
    subtotal: 1550,
    discount: 100,
    pointsDiscountAmount: 50,
    pointsRedeemed: 500,
    shippingFee: 60,
    total: 1460,
    xpEarned: 180,
    status: 'processing',
    paymentMethod: 'bkash',
    paymentId: 'BKASH-TRX-982143',
    trackingNumber: 'STEADFAST-984128',
    notes: 'দয়া করে কল দিয়ে ডেলিভারি করবেন'
  },
  {
    id: 'ord-2002',
    orderNumber: 'GB-74813',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    customerName: 'Sharmin Akhter',
    customerEmail: 'sharmin.ctg@yahoo.com',
    customerPhone: '01819556677',
    shippingAddress: {
      street: 'Flat 4B, Nasirabad Housing Society',
      city: 'Chittagong',
      area: 'Nasirabad',
      postalCode: '4000',
      division: 'Chittagong'
    },
    items: [
      {
        productId: 'prod-2',
        name: 'সুন্দরবনের প্রাকৃতিক খলিশা ফুলের মধু (৫০০ গ্রাম)',
        price: 650,
        quantity: 1,
        unit: '৫০০ গ্রাম জার',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        rarity: 'Premium Reserve'
      }
    ],
    subtotal: 650,
    discount: 0,
    pointsDiscountAmount: 0,
    pointsRedeemed: 0,
    shippingFee: 120,
    total: 770,
    xpEarned: 80,
    status: 'shipped',
    paymentMethod: 'cod',
    paymentId: 'COD-DELIVERY-CASH',
    trackingNumber: 'REDX-8812903',
    notes: 'ক্যাশ অন ডেলিভারি'
  }
];

const INITIAL_CONTENT: SiteContent = {
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
};

const INITIAL_LOYALTY: Record<string, LoyaltyAccount> = {
  'demo-user': {
    userId: 'demo-user',
    email: 'customer@ghorerbazar.com',
    pointsBalance: 850,
    lifetimePoints: 2150,
    tier: 'সিলভার সদস্য',
    streakDays: 5,
    lastSpinDate: '',
    unlockedBadges: ['FIRST_ORDER', 'ORGANIC_LOVER', 'MUSTARD_CONNOISSEUR']
  }
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        
        // Ensure bharin10mim@gmail.com with password 1234 exists
        let loadedStaff: StoredStaffUser[] = parsed.staff || INITIAL_STAFF;
        const bharinIndex = loadedStaff.findIndex(s => s.email.toLowerCase() === 'bharin10mim@gmail.com');
        if (bharinIndex >= 0) {
          loadedStaff[bharinIndex].passwordHash = '1234';
          loadedStaff[bharinIndex].role = 'super_admin';
        } else {
          loadedStaff.unshift({
            id: 'staff-bharin',
            email: 'bharin10mim@gmail.com',
            passwordHash: '1234',
            name: 'Bharin Mim (Director & Super Admin)',
            role: 'super_admin',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            createdAt: new Date().toISOString()
          });
        }

        const state: DatabaseSchema = {
          staff: loadedStaff,
          products: INITIAL_PRODUCTS, // Always sync the verified matching products and images
          orders: parsed.orders || INITIAL_ORDERS,
          content: parsed.content || INITIAL_CONTENT,
          loyalty: parsed.loyalty || INITIAL_LOYALTY
        };
        this.save(state);
        return state;
      }
    } catch (e) {
      console.error('Failed to load database file, using default seed:', e);
    }

    const initial: DatabaseSchema = {
      staff: INITIAL_STAFF,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      content: INITIAL_CONTENT,
      loyalty: INITIAL_LOYALTY
    };
    this.save(initial);
    return initial;
  }

  private save(dataToSave: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database file:', e);
    }
  }

  getStaff(): StaffUser[] {
    return this.data.staff.map(({ passwordHash, ...rest }) => rest);
  }

  authenticateStaff(email: string, passwordAttempt: string): StaffUser | null {
    const user = this.data.staff.find(s => s.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return null;
    if (user.passwordHash === passwordAttempt) {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  getStaffById(id: string): StaffUser | null {
    const user = this.data.staff.find(s => s.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  updateStaffRole(id: string, newRole: StoredStaffUser['role']): StaffUser | null {
    const user = this.data.staff.find(s => s.id === id);
    if (!user) return null;
    user.role = newRole;
    this.save();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  addStaff(newUser: Omit<StoredStaffUser, 'id' | 'createdAt'>): StaffUser {
    const created: StoredStaffUser = {
      ...newUser,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.staff.push(created);
    this.save();
    const { passwordHash, ...safeUser } = created;
    return safeUser;
  }

  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | null {
    return this.data.products.find(p => p.id === id) || null;
  }

  createProduct(productData: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.save();
    return this.data.products[index];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  updateStock(id: string, delta: number): Product | null {
    const product = this.data.products.find(p => p.id === id);
    if (!product) return null;
    product.stock = Math.max(0, product.stock + delta);
    this.save();
    return product;
  }

  getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | null {
    return this.data.orders.find(o => o.id === id) || null;
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `GB-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString()
    };

    for (const item of newOrder.items) {
      this.updateStock(item.productId, -item.quantity);
    }

    const userEmailKey = newOrder.customerEmail.toLowerCase().trim();
    if (!this.data.loyalty[userEmailKey]) {
      this.data.loyalty[userEmailKey] = {
        userId: userEmailKey,
        email: newOrder.customerEmail,
        pointsBalance: 100,
        lifetimePoints: 100,
        tier: 'ব্রোঞ্জ কাস্টমার',
        streakDays: 1,
        unlockedBadges: ['FIRST_ORDER']
      };
    }
    
    const account = this.data.loyalty[userEmailKey];
    account.pointsBalance = Math.max(0, account.pointsBalance - (newOrder.pointsRedeemed || 0));
    account.pointsBalance += newOrder.xpEarned;
    account.lifetimePoints += newOrder.xpEarned;

    if (account.lifetimePoints >= 5000) {
      account.tier = 'রয়েল মেম্বার';
    } else if (account.lifetimePoints >= 2500) {
      account.tier = 'গোল্ড প্রিমিয়াম';
    } else if (account.lifetimePoints >= 1000) {
      account.tier = 'সিলভার সদস্য';
    } else {
      account.tier = 'ব্রোঞ্জ কাস্টমার';
    }

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(id: string, status: Order['status'], trackingNumber?: string, notes?: string): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (notes !== undefined) order.notes = notes;
    this.save();
    return order;
  }

  getContent(): SiteContent {
    return this.data.content;
  }

  updateContent(updates: Partial<SiteContent>): SiteContent {
    this.data.content = { ...this.data.content, ...updates };
    this.save();
    return this.data.content;
  }

  getLoyaltyAccount(userIdOrEmail: string): LoyaltyAccount {
    const key = userIdOrEmail.toLowerCase().trim();
    if (!this.data.loyalty[key]) {
      this.data.loyalty[key] = {
        userId: key,
        email: key.includes('@') ? key : `${key}@ghorerbazar.com`,
        pointsBalance: 500,
        lifetimePoints: 500,
        tier: 'ব্রোঞ্জ কাস্টমার',
        streakDays: 3,
        unlockedBadges: ['MEMBER_SIGNUP']
      };
      this.save();
    }
    return this.data.loyalty[key];
  }

  addLoyaltyPoints(userIdOrEmail: string, points: number, badgeAward?: string): LoyaltyAccount {
    const account = this.getLoyaltyAccount(userIdOrEmail);
    account.pointsBalance += points;
    account.lifetimePoints += points;
    if (badgeAward && !account.unlockedBadges.includes(badgeAward)) {
      account.unlockedBadges.push(badgeAward);
    }
    
    if (account.lifetimePoints >= 5000) account.tier = 'রয়েল মেম্বার';
    else if (account.lifetimePoints >= 2500) account.tier = 'গোল্ড প্রিমিয়াম';
    else if (account.lifetimePoints >= 1000) account.tier = 'সিলভার সদস্য';

    this.save();
    return account;
  }
}

export const db = new Database();
