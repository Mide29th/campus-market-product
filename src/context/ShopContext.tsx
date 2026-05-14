import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { categories } from '../mockData/db';
import {
  Product, Vendor, CartItem, User, ShopContextType, Order,
  Conversation, ChatMessage, Review, SearchHistory, Transaction, Category
} from '../types';
import { useAuth } from './AuthContext';
import { useFeedback } from './FeedbackContext';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const { showFeedback } = useFeedback();

  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(authUser ?? null); }, [authUser]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbVendors, setDbVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Mappers ───────────────────────────────────────────────────────────────
  const mapProduct = (p: any, fallback?: Partial<Product>): Product => ({
    id: p.id,
    name: p.name ?? fallback?.name ?? '',
    price: Number(p.price ?? fallback?.price ?? 0),
    description: p.description ?? fallback?.description ?? '',
    image: p.image ?? fallback?.image ?? '',
    category: p.category ?? fallback?.category ?? '',
    vendorId: p.vendor_id ?? p.vendorId ?? fallback?.vendorId ?? '',
    vendorName: p.vendor_name ?? p.vendorName ?? fallback?.vendorName ?? 'Unknown Vendor',
    rating: Number(p.rating) || 0,
    reviews: Number(p.reviews_count ?? p.reviews) || 0,
    stock: Number(p.stock ?? fallback?.stock ?? 0) || 0,
  });

  const mapVendor = (v: any): Vendor => ({
    id: v.id,
    name: v.name ?? 'Unknown Vendor',
    category: v.category ?? 'others',
    rating: Number(v.rating) || 0,
    image: v.image ?? '',
    description: v.description ?? '',
    products: [],
    reputation: v.reputation ?? 'New',
    deliveryTime: v.delivery_time ?? v.deliveryTime ?? '10-15 mins',
  });

  const mapOrderItem = (item: any) => ({
    id: item.product_id ?? item.id,
    productId: item.product_id ?? item.id,
    vendorId: item.vendor_id ?? item.products?.vendor_id ?? '',
    name: item.name ?? '',
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    image: item.image ?? '',
  });

  const mapOrder = (order: any, items: any[] = []): Order => ({
    id: order.id,
    userId: order.user_id ?? '',
    items: items.map(mapOrderItem),
    total: Number(order.total) || 0,
    date: order.created_at ?? new Date().toISOString(),
    status: order.status ?? 'completed',
    deliveryMethod: order.delivery_method ?? 'pickup',
    address: order.address ?? undefined,
  });

  const isMissingColumnError = (error: any, column: string) => {
    const msg = `${error?.message ?? ''} ${error?.details ?? ''}`;
    return error?.code === 'PGRST204' && msg.includes(column);
  };

  // ── Ensure vendor profile row exists (FK requirement for products) ────────
  const ensureVendorProfile = async (product: Product) => {
    const vendorId = product.vendorId;

    // Check if vendor profile already exists — avoids unnecessary insert/upsert
    const { data: existing } = await supabase
      .from('vendors').select('id').eq('id', vendorId).maybeSingle();
    if (existing) return; // already there, nothing to do

    // Insert new vendor profile
    const vendorRow = {
      id: vendorId,
      name: product.vendorName || 'Unknown Vendor',
      category: product.category || 'others',
      rating: 0,
      image: '',
      description: 'Campus vendor',
      reputation: 'New',
      delivery_time: '10-15 mins',
    };
    const { data, error } = await supabase
      .from('vendors').insert([vendorRow]).select().single();

    if (error) {
      // If insert fails due to RLS or conflict, log but don't crash —
      // the product insert can still succeed if vendor_id FK is satisfied
      // by an existing row we couldn't read due to RLS.
      console.warn('ensureVendorProfile insert failed (non-fatal):', error.message);
      return;
    }
    if (data) {
      const saved = mapVendor(data);
      setDbVendors(prev => {
        const exists = prev.some(v => v.id === saved.id);
        return exists ? prev : [saved, ...prev];
      });
    }
  };

  // ── Fetch buyer's own orders ──────────────────────────────────────────────
  const fetchBuyerOrders = async (userId: string): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select(`id, user_id, total, created_at, status, delivery_method, address,
               order_items ( id, product_id, name, price, quantity, image, vendor_id )`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('fetchBuyerOrders error:', error.message);
      return [];
    }
    return (data || []).map((o: any) => mapOrder(o, o.order_items || []));
  };

  // ── Fetch vendor's orders (orders containing their products) ─────────────
  // Strategy: get the vendor's product IDs first, then find order_items that
  // reference those products, then get those orders. This avoids the RLS
  // subquery limitation that silently returns 0 rows.
  const fetchVendorOrders = async (vendorId: string): Promise<Order[]> => {
    // Step 1: get this vendor's product IDs
    const { data: vendorProds, error: vpErr } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendorId);
    if (vpErr || !vendorProds || vendorProds.length === 0) return [];

    const productIds = vendorProds.map((p: any) => p.id);

    // Step 2: find order_items for those products
    const { data: itemRows, error: itemErr } = await supabase
      .from('order_items')
      .select('order_id, product_id, name, price, quantity, image, vendor_id')
      .in('product_id', productIds);
    if (itemErr || !itemRows || itemRows.length === 0) return [];

    const orderIds = [...new Set(itemRows.map((i: any) => i.order_id))];

    // Step 3: get those orders
    const { data: orderRows, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, total, created_at, status, delivery_method, address')
      .in('id', orderIds)
      .order('created_at', { ascending: false });
    if (orderErr || !orderRows) return [];

    // Step 4: stitch items onto orders
    return orderRows.map((o: any) => {
      const items = itemRows.filter((i: any) => i.order_id === o.id);
      return mapOrder(o, items);
    });
  };

  // ── Main fetch ────────────────────────────────────────────────────────────
  const fetchShopData = async (currentUser?: User | null) => {
    setIsLoading(true);
    try {
      // Products — public, no auth
      const { data: productsData, error: pError } = await supabase
        .from('products').select('*');
      if (pError) throw pError;
      setDbProducts((productsData || []).map(p => mapProduct(p)));

      // Vendors
      const { data: vendorsData, error: vError } = await supabase
        .from('vendors').select('*');
      if (vError) throw vError;
      setDbVendors((vendorsData || []).map(mapVendor));

      // Orders — fetch differently based on role
      const resolvedUser = currentUser ?? authUser;
      if (resolvedUser) {
        const uid = resolvedUser.id.toString();
        if (resolvedUser.role === 'vendor') {
          const [buyerOrders, vendorOrders] = await Promise.all([
            fetchBuyerOrders(uid),
            fetchVendorOrders(uid),
          ]);
          // Merge, dedup by id
          const merged = [...buyerOrders];
          for (const vo of vendorOrders) {
            if (!merged.some(o => o.id === vo.id)) merged.push(vo);
          }
          merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(merged);
        } else {
          setOrders(await fetchBuyerOrders(uid));
        }
      }
    } catch (error) {
      console.error('fetchShopData error:', error);
      setDbProducts([]);
      setDbVendors([]);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch orders whenever user changes (login/logout/role switch)
  useEffect(() => {
    fetchShopData(authUser);
  }, [authUser?.id, authUser?.role]);

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const productsChannel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' },
        (payload) => setDbProducts(prev => {
          const exists = prev.some(p => p.id === payload.new.id);
          return exists ? prev : [mapProduct(payload.new), ...prev];
        }))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => setDbProducts(prev =>
          prev.map(p => p.id === payload.new.id ? mapProduct(payload.new) : p)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'products' },
        (payload) => setDbProducts(prev => prev.filter(p => p.id !== payload.old.id)))
      .subscribe();

    // When a new order is inserted, refetch so the vendor dashboard updates live
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        async () => {
          if (authUser) {
            const uid = authUser.id.toString();
            if (authUser.role === 'vendor') {
              const vendorOrders = await fetchVendorOrders(uid);
              setOrders(prev => {
                const merged = [...prev];
                for (const vo of vendorOrders) {
                  if (!merged.some(o => o.id === vo.id)) merged.push(vo);
                }
                return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              });
            }
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [authUser?.id, authUser?.role]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      showFeedback({ type: 'success', title: 'Cart Updated', message: `${product.name} quantity increased.`, confirmText: 'Got it' });
      setCart(prev => prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return;
    }
    showFeedback({ type: 'success', title: 'Added to Cart', message: `${product.name} added to cart.`, confirmText: 'Continue Shopping' });
    setCart(prev => [...prev, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (productId: string) => {
    const product = cart.find(i => i.id === productId);
    if (product) showFeedback({ type: 'info', title: 'Removed', message: `${product.name} removed from cart.` });
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0);

  // ── Place order (saves to Supabase) ───────────────────────────────────────
  const addOrder = async (items: CartItem[], total: number, deliveryMethod: 'pickup' | 'delivery', address?: string) => {
    if (!user) throw new Error('You must be logged in to place an order.');

    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: user.id.toString(), total, status: 'completed', delivery_method: deliveryMethod, address: address || null }])
      .select('id, user_id, total, created_at, status, delivery_method, address')
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map(i => ({
      order_id: insertedOrder.id,
      product_id: i.id,
      vendor_id: i.vendorId,   // store vendor_id directly on order_items for easy lookup
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select('id, product_id, vendor_id, name, price, quantity, image');
    if (itemsError) throw itemsError;

    const newOrder: Order = {
      id: insertedOrder.id,
      userId: insertedOrder.user_id,
      items: (insertedItems || []).map(mapOrderItem),
      total,
      date: insertedOrder.created_at,
      status: 'completed',
      deliveryMethod,
      address,
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  // ── Products CRUD ─────────────────────────────────────────────────────────
  const addProduct = async (newProduct: Product) => {
    await ensureVendorProfile(newProduct);

    const productRow = {
      name: newProduct.name, price: newProduct.price,
      description: newProduct.description, image: newProduct.image,
      category: newProduct.category, vendor_id: newProduct.vendorId,
      vendor_name: newProduct.vendorName, stock: newProduct.stock || 50,
    };

    let { data: inserted, error } = await supabase
      .from('products').insert([productRow]).select().single();

    if (isMissingColumnError(error, 'vendor_name')) {
      const { vendor_name, ...rowWithout } = productRow;
      const retry = await supabase.from('products').insert([rowWithout]).select().single();
      inserted = retry.data; error = retry.error;
    }

    if (error) throw error;
    const saved = inserted ? mapProduct(inserted, newProduct) : newProduct;
    setDbProducts(prev => [saved, ...prev]);
    showFeedback({ type: 'success', title: 'Product Listed', message: `${saved.name} is now live.` });
  };

  const deleteProduct = async (productId: string) => {
    const { data, error } = await supabase
      .from('products').delete().eq('id', productId).select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Delete blocked by RLS. Ensure you own this product.');
    setDbProducts(prev => prev.filter(p => p.id !== productId));
    showFeedback({ type: 'success', title: 'Product Deleted', message: 'Listing removed from marketplace.' });
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;

    const { data, error } = await supabase
      .from('products').update(dbUpdates).eq('id', productId).select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Update blocked by RLS. Ensure you own this product.');
    setDbProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    showFeedback({ type: 'success', title: 'Product Updated', message: 'Changes saved.' });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getVendorById = (id: string) => dbVendors.find(v => v.id === id);
  const getProductById = (id: string) => dbProducts.find(p => p.id === id);
  const getProductsByVendor = (vendorId: string) => dbProducts.filter(p => p.vendorId === vendorId);
  const updateUserName = (n: string) => setUser(prev => prev ? { ...prev, name: n } : null);
  const setUserRole = (role: 'student' | 'vendor') => { setUser(prev => prev ? { ...prev, role } : null); if (role === 'student') clearCart(); };
  const updateUserAvatar = (avatarUrl: string) => setUser(prev => prev ? { ...prev, avatarUrl } : null);

  // ── Wallet ────────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const topUpWallet = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + amount } : null);
    setTransactions(prev => [{ id: `TRX-${Date.now()}`, type: 'topup', amount, date: new Date().toISOString(), status: 'completed', method: 'bank', description: 'Wallet funding' }, ...prev]);
  };

  const deductFromWallet = (amount: number): boolean => {
    if (!user || user.walletBalance < amount) return false;
    setUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance - amount } : null);
    setTransactions(prev => [{ id: `TRX-${Date.now()}`, type: 'payment', amount, date: new Date().toISOString(), status: 'completed', method: 'wallet', description: 'Order payment' }, ...prev]);
    return true;
  };

  // ── Messaging ─────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const sendMessage = (vendorId: string, text: string) => {
    if (!user) return;
    const msg: ChatMessage = { id: `msg-${Date.now()}`, senderId: user.id, senderName: user.name, text, timestamp: new Date().toISOString() };
    setConversations(prev => {
      const existing = prev.find(c => c.vendorId === vendorId);
      if (existing) return prev.map(c => c.vendorId === vendorId ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastMessageTime: msg.timestamp } : c);
      const vendor = dbVendors.find(v => v.id === vendorId);
      return [{ id: `conv-${Date.now()}`, vendorId, vendorName: vendor?.name || 'Unknown Vendor', vendorImage: vendor?.image || '', lastMessage: text, lastMessageTime: msg.timestamp, unreadCount: 0, messages: [msg] }, ...prev];
    });
  };

  // ── Reviews ───────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);

  const addReview = (productId: string, rating: number, comment: string) => {
    if (!user) return;
    setReviews(prev => [{ id: `rev-${Date.now()}`, productId, userId: user.id, userName: user.name, userImage: user.avatarUrl, rating, comment, date: new Date().toISOString() }, ...prev]);
    showFeedback({ type: 'success', title: 'Review Submitted', message: 'Thanks for your feedback!' });
  };

  // ── Wishlist & History ────────────────────────────────────────────────────
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [recentlySearched, setRecentlySearched] = useState<SearchHistory[]>([]);

  const toggleWishlist = (productId: string) => {
    const product = dbProducts.find(p => p.id === productId);
    const isSaved = wishlist.includes(productId);
    showFeedback({ type: isSaved ? 'info' : 'success', title: isSaved ? 'Removed from Wishlist' : 'Saved!', message: product ? `${product.name} ${isSaved ? 'removed from' : 'added to'} wishlist.` : '' });
    setWishlist(prev => isSaved ? prev.filter(id => id !== productId) : [productId, ...prev]);
  };

  const addToRecentlyViewed = (productId: string) =>
    setRecentlyViewed(prev => [productId, ...prev.filter(id => id !== productId)].slice(0, 20));

  const addToRecentlySearched = (query: string) => {
    if (!query.trim()) return;
    setRecentlySearched(prev => {
      const filtered = prev.filter(h => h.query.toLowerCase() !== query.toLowerCase());
      return [{ id: `search-${Date.now()}`, query, timestamp: new Date().toISOString() }, ...filtered].slice(0, 10);
    });
  };

  const clearRecentlySearched = () => setRecentlySearched([]);

  const value = {
    isLoading, products: dbProducts, vendors: dbVendors,
    cart, user, orders, categories,
    conversations, reviews, wishlist,
    recentlyViewed, recentlySearched, transactions,
    cartTotal, cartItemCount,
    addToCart, removeFromCart, updateQuantity, clearCart,
    addOrder, sendMessage, addReview,
    toggleWishlist, addToRecentlyViewed, addToRecentlySearched, clearRecentlySearched,
    getVendorById, getProductById, getProductsByVendor,
    setUserRole, updateUserAvatar, topUpWallet, deductFromWallet,
    addProduct, deleteProduct, updateProduct, updateUserName,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
