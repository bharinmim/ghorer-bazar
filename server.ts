import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { db } from './src/server/db.ts';
import { StaffRole, RealtimeEvent } from './src/types.ts';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory sessions storage: token -> { userId: string, expiresAt: number }
const SESSIONS: Map<string, { userId: string; expiresAt: number }> = new Map();

// SSE Clients registry
const sseClients: Set<Response> = new Set();

function broadcastEvent(type: RealtimeEvent['type'], data: any) {
  const event: RealtimeEvent = {
    type,
    data,
    timestamp: new Date().toISOString()
  };
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Keep SSE alive every 25s
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 25000);

// Authentication & RBAC Middleware
interface AuthenticatedRequest extends Request {
  staffUser?: ReturnType<typeof db.getStaffById>;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const session = SESSIONS.get(token);
  if (!session || session.expiresAt < Date.now()) {
    SESSIONS.delete(token);
    return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  const user = db.getStaffById(session.userId);
  if (!user) {
    return res.status(403).json({ error: 'Staff account not found' });
  }

  req.staffUser = user;
  next();
}

function requireRole(allowedRoles: StaffRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.staffUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // super_admin always has access
    if (req.staffUser.role === 'super_admin' || allowedRoles.includes(req.staffUser.role)) {
      return next();
    }
    return res.status(403).json({
      error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Your current role is '${req.staffUser.role}'.`
    });
  };
}

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.authenticateStaff(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  // Create session
  const token = `nv_tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  SESSIONS.set(token, {
    userId: user.id,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  return res.json({
    token,
    user
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'নাম, ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক' });
  }

  const existing = db.getStaff().find(s => s.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি স্টাফ একাউন্ট রয়েছে। দয়া করে লগইন করুন।' });
  }

  const created = db.addStaff({
    email: email.trim(),
    passwordHash: password,
    name: name.trim(),
    role: role || 'inventory_manager',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  });

  const token = `nv_tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  SESSIONS.set(token, {
    userId: created.id,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });

  return res.status(201).json({
    token,
    user: created,
    message: 'নতুন স্টাফ একাউন্ট সফলভাবে তৈরি হয়েছে!'
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.staffUser });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token) SESSIONS.delete(token);
  return res.json({ success: true });
});

app.get('/api/auth/staff', authenticateToken, requireRole(['super_admin']), (req: Request, res: Response) => {
  const staff = db.getStaff();
  return res.json({ staff });
});

app.post('/api/auth/staff', authenticateToken, requireRole(['super_admin']), (req: Request, res: Response) => {
  const { email, password, name, role, avatar } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields (email, password, name, role)' });
  }
  const created = db.addStaff({
    email,
    passwordHash: password,
    name,
    role,
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  });
  return res.status(201).json({ staffUser: created });
});

app.patch('/api/auth/staff/:id/role', authenticateToken, requireRole(['super_admin']), (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'New role is required' });
  }
  const updated = db.updateStaffRole(id, role);
  if (!updated) {
    return res.status(404).json({ error: 'Staff member not found' });
  }
  return res.json({ staffUser: updated });
});

// ==================== PRODUCTS ROUTES ====================
app.get('/api/products', (req: Request, res: Response) => {
  const products = db.getProducts();
  return res.json({ products });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.json({ product });
});

app.post('/api/products', authenticateToken, requireRole(['super_admin', 'inventory_manager']), (req: Request, res: Response) => {
  const productData = req.body;
  if (!productData.name || !productData.price || productData.stock === undefined) {
    return res.status(400).json({ error: 'Name, price, and stock are required' });
  }
  const newProduct = db.createProduct(productData);
  broadcastEvent('inventory_updated', { action: 'created', product: newProduct });
  return res.status(201).json({ product: newProduct });
});

app.put('/api/products/:id', authenticateToken, requireRole(['super_admin', 'inventory_manager']), (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateProduct(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  broadcastEvent('inventory_updated', { action: 'updated', product: updated });
  return res.json({ product: updated });
});

app.patch('/api/products/:id/stock', authenticateToken, requireRole(['super_admin', 'inventory_manager', 'orders_manager']), (req: Request, res: Response) => {
  const { id } = req.params;
  const { delta, newStock } = req.body;
  
  let updated;
  if (newStock !== undefined) {
    updated = db.updateProduct(id, { stock: Math.max(0, parseInt(newStock, 10)) });
  } else if (delta !== undefined) {
    updated = db.updateStock(id, parseInt(delta, 10));
  } else {
    return res.status(400).json({ error: 'Either delta or newStock must be provided' });
  }

  if (!updated) return res.status(404).json({ error: 'Product not found' });
  broadcastEvent('inventory_updated', { action: 'stock_change', product: updated });
  return res.json({ product: updated });
});

app.delete('/api/products/:id', authenticateToken, requireRole(['super_admin', 'inventory_manager']), (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteProduct(id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  broadcastEvent('inventory_updated', { action: 'deleted', id });
  return res.json({ success: true, id });
});

// ==================== ORDERS ROUTES ====================
app.get('/api/orders', authenticateToken, requireRole(['super_admin', 'orders_manager', 'inventory_manager']), (req: Request, res: Response) => {
  const orders = db.getOrders();
  return res.json({ orders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  return res.json({ order });
});

app.patch('/api/orders/:id/status', authenticateToken, requireRole(['super_admin', 'orders_manager']), (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, notes } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const updated = db.updateOrderStatus(id, status, trackingNumber, notes);
  if (!updated) return res.status(404).json({ error: 'Order not found' });

  broadcastEvent('order_status_updated', { order: updated });
  return res.json({ order: updated });
});

// ==================== PAYMENT GATEWAY & CHECKOUT ====================
app.post('/api/payment/process', (req: Request, res: Response) => {
  const {
    customerName,
    customerEmail,
    shippingAddress,
    items,
    subtotal,
    discount,
    pointsDiscountAmount,
    pointsRedeemed,
    shippingFee,
    total,
    paymentMethod,
    cardDetails
  } = req.body;

  if (!customerName || !customerEmail || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required customer or items details' });
  }

  // Simulate gateway security verification
  if (paymentMethod === 'card') {
    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cvv) {
      return res.status(400).json({ error: 'Payment card details are incomplete or invalid' });
    }
    // Simulation: card starting with 0000 fails
    if (cardDetails.cardNumber.replace(/\s+/g, '').startsWith('0000')) {
      return res.status(402).json({ error: 'Payment Declined: Insufficient test funds on card' });
    }
  }

  // Calculate XP earned: 1 XP per $1 spent * active site multiplier
  const content = db.getContent();
  const multiplier = content.loyaltyMultiplier || 1;
  const xpEarned = Math.round(total * 2 * multiplier);

  // Create payment reference
  const paymentPrefix = paymentMethod === 'bkash' ? 'BKASH' : paymentMethod === 'nagad' ? 'NAGAD' : paymentMethod === 'cod' ? 'COD' : 'CARD';
  const paymentId = `${paymentPrefix}-TRX-${Math.floor(100000 + Math.random() * 900000)}`;

  // Create real order in database
  const createdOrder = db.createOrder({
    customerName,
    customerEmail,
    shippingAddress: shippingAddress || {
      street: 'House 12, Road 4, Dhanmondi',
      city: 'Dhaka',
      area: 'Dhanmondi',
      postalCode: '1205',
      division: 'Dhaka'
    },
    items,
    subtotal,
    discount: discount || 0,
    pointsDiscountAmount: pointsDiscountAmount || 0,
    pointsRedeemed: pointsRedeemed || 0,
    shippingFee: shippingFee || 0,
    total,
    xpEarned,
    status: 'processing',
    paymentMethod,
    paymentId
  });

  // Broadcast real-time order creation to connected admin panels and clients
  broadcastEvent('order_created', { order: createdOrder });

  return res.json({
    success: true,
    transactionId: paymentId,
    order: createdOrder,
    xpEarned,
    message: 'Payment verified and transaction settled successfully'
  });
});

// ==================== CONTENT CMS ROUTES ====================
app.get('/api/content', (req: Request, res: Response) => {
  const content = db.getContent();
  return res.json({ content });
});

app.put('/api/content', authenticateToken, requireRole(['super_admin', 'content_editor']), (req: Request, res: Response) => {
  const updated = db.updateContent(req.body);
  broadcastEvent('content_updated', { content: updated });
  return res.json({ content: updated });
});

// ==================== LOYALTY & GAMIFICATION ROUTES ====================
app.get('/api/loyalty/:userId', (req: Request, res: Response) => {
  const account = db.getLoyaltyAccount(req.params.userId);
  return res.json({ account });
});

app.post('/api/loyalty/spin', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  // Prize segments: 50 pts, 100 pts, 250 pts, 500 pts, 1000 pts (Jackpot)
  const prizes = [
    { label: '50 XP', points: 50, color: '#3b82f6' },
    { label: '100 XP', points: 100, color: '#8b5cf6' },
    { label: '250 XP', points: 250, color: '#ec4899' },
    { label: '500 XP Surge!', points: 500, color: '#f59e0b' },
    { label: '75 XP', points: 75, color: '#06b6d4' },
    { label: 'JACKPOT 1,000 XP 🔥', points: 1000, color: '#10b981' }
  ];

  const randomIndex = Math.floor(Math.random() * prizes.length);
  const prize = prizes[randomIndex];

  const updatedAccount = db.addLoyaltyPoints(userId, prize.points, 'WHEEL_SPINNER');
  return res.json({
    prize,
    prizeIndex: randomIndex,
    updatedAccount
  });
});

app.post('/api/loyalty/scratch', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const bonusPoints = 150;
  const updatedAccount = db.addLoyaltyPoints(userId, bonusPoints, 'MYSTERY_SCRATCHER');
  return res.json({
    pointsAwarded: bonusPoints,
    promoCode: 'SCRATCH15',
    discountPercent: 15,
    updatedAccount
  });
});

// ==================== REAL-TIME SSE STREAM ====================
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// ==================== VITE SPA INTEGRATION ====================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`NeonVault server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
