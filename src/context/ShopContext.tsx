import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { products, vendors, categories } from '../mockData/db';
import { Product, Vendor, CartItem, User, ShopContextType, Order, Conversation, ChatMessage, Review, SearchHistory, Transaction, Category } from '../types';
import { useAuth } from './AuthContext';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  
  // --- Global State ---
  
  // Use the user from AuthContext
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else {
      setUser(null);
    }
  }, [authUser]);

  // 2. Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // 3. Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  
  // 4. Shop Data
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbVendors, setDbVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  
  const fetchShopData = async () => {
    setIsLoading(true);
    try {
      const { data: productsData, error: pError } = await supabase
        .from('products')
        .select('*');
      
      if (pError) throw pError;

      const { data: vendorsData, error: vError } = await supabase
        .from('vendors')
        .select('*');
      
      if (vError) throw vError;

      // Map snake_case from DB to camelCase for App
      const mappedProducts = (productsData || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        image: p.image,
        category: p.category,
        vendorId: p.vendor_id || p.vendorId,
        vendorName: p.vendor_name || p.vendorName || 'Unknown Vendor',
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        stock: p.stock || 0
      }));

      setDbProducts(mappedProducts);
      setDbVendors(vendorsData || []);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);
  
  // --- Cart Actions ---
  
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => prevCart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (items: CartItem[], total: number, deliveryMethod: 'pickup' | 'delivery', address?: string) => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 1000000)}`,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      total,
      date: new Date().toISOString(),
      status: 'completed',
      deliveryMethod,
      address
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // --- Helper Methods ---

  const getVendorById = (id: string) => dbVendors.find(v => v.id === id);
  const getProductById = (id: string) => dbProducts.find(p => p.id === id);
  const getProductsByVendor = (vendorId: string) => dbProducts.filter(p => p.vendorId === vendorId);

  const addProduct = async (newProduct: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          id: newProduct.id,
          name: newProduct.name,
          price: newProduct.price,
          description: newProduct.description,
          image: newProduct.image,
          category: newProduct.category,
          vendor_id: newProduct.vendorId,
          vendor_name: newProduct.vendorName,
          rating: newProduct.rating,
          reviews: newProduct.reviews,
          stock: newProduct.stock || 50
        }]);

      if (error) throw error;
      setDbProducts(prev => [newProduct, ...prev]);
    } catch (error) {
      console.error('Error adding product to Supabase:', error);
      // Still add to local state so it appears immediately, 
      // but the console error will help debug if the DB insert failed.
      setDbProducts(prev => [newProduct, ...prev]);
    }
  };

  const updateUserName = (newName: string) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, name: newName }) : null);
  };

  const setUserRole = (role: 'student' | 'vendor') => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, role }) : null);
    if (role === 'student') clearCart();
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, avatarUrl }) : null);
  };

  const topUpWallet = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, walletBalance: prev.walletBalance + amount }) : null);
    
    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      type: 'topup',
      amount,
      date: new Date().toISOString(),
      status: 'completed',
      method: 'bank',
      description: 'Wallet funding'
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deductFromWallet = (amount: number) => {
    if (!user || user.walletBalance < amount) return false;
    
    setUser(prev => prev ? ({ ...prev, walletBalance: prev.walletBalance - amount }) : null);
    
    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      type: 'payment',
      amount,
      date: new Date().toISOString(),
      status: 'completed',
      method: 'wallet',
      description: 'Order payment'
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  // 5. Conversations State (Messaging)
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      vendorId: '1',
      vendorName: 'Gadget Hub',
      vendorImage: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=200',
      lastMessage: 'Your order is being processed and will be delivered soon!',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 1,
      messages: [
        {
          id: 'm1',
          senderId: '1',
          senderName: 'Gadget Hub',
          text: 'Hello! How can I help you today?',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'm3',
          senderId: '1',
          senderName: 'Gadget Hub',
          text: 'Your order is being processed and will be delivered soon!',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    },
    {
      id: 'conv-2',
      vendorId: '2',
      vendorName: 'Fresh Bakes',
      vendorImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200',
      lastMessage: 'The vanilla cupcakes are now back in stock!',
      lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
      unreadCount: 0,
      messages: [
        {
          id: 'm4',
          senderId: '2',
          senderName: 'Fresh Bakes',
          text: 'The vanilla cupcakes are now back in stock!',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    }
  ]);

  // 6. Reviews State
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      productId: '1',
      userId: '456',
      userName: 'John Doe',
      rating: 5,
      comment: 'Absolutely amazing product! The build quality is top-notch.',
      date: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'rev-2',
      productId: '1',
      userId: '789',
      userName: 'Sarah Jenkins',
      rating: 4,
      comment: 'Very good, just wish the delivery was a bit faster.',
      date: new Date(Date.now() - 259200000).toISOString()
    }
  ]);

  // 7. Wishlist & History States
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [recentlySearched, setRecentlySearched] = useState<SearchHistory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // --- Messaging Actions ---

  const sendMessage = (vendorId: string, text: string) => {
    if (!user) return;
    
    setConversations(prev => {
      const existingConv = prev.find(c => c.vendorId === vendorId);
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        text,
        timestamp: new Date().toISOString()
      };

      if (existingConv) {
        return prev.map(c => 
          c.vendorId === vendorId 
            ? { 
                ...c, 
                messages: [...c.messages, newMessage],
                lastMessage: text,
                lastMessageTime: newMessage.timestamp 
              }
            : c
        );
      } else {
        const vendor = dbVendors.find(v => v.id === vendorId);
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          vendorId,
          vendorName: vendor?.name || 'Unknown Vendor',
          vendorImage: vendor?.image || '',
          lastMessage: text,
          lastMessageTime: newMessage.timestamp,
          unreadCount: 0,
          messages: [newMessage]
        };
        return [newConv, ...prev];
      }
    });
  };

  // --- Review Actions ---

  const addReview = (productId: string, rating: number, comment: string) => {
    if (!user) return;
    
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userId: user.id,
      userName: user.name,
      userImage: user.avatarUrl,
      rating,
      comment,
      date: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
  };

  // --- Preference Actions ---

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [productId, ...prev]
    );
  };

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const addToRecentlySearched = (query: string) => {
    if (!query.trim()) return;
    setRecentlySearched(prev => {
      const filtered = prev.filter(h => h.query.toLowerCase() !== query.toLowerCase());
      const newSearch: SearchHistory = {
        id: `search-${Date.now()}`,
        query,
        timestamp: new Date().toISOString()
      };
      return [newSearch, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const clearRecentlySearched = () => {
    setRecentlySearched([]);
  };

  const value: ShopContextType = {
    isLoading,
    products: dbProducts,
    vendors: dbVendors,
    cart,
    user,
    orders,
    categories,
    conversations,
    reviews,
    wishlist,
    recentlyViewed,
    recentlySearched,
    transactions,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addOrder,
    sendMessage,
    addReview,
    toggleWishlist,
    addToRecentlyViewed,
    addToRecentlySearched,
    clearRecentlySearched,
    getVendorById,
    getProductById,
    getProductsByVendor,
    setUserRole,
    updateUserAvatar,
    topUpWallet,
    deductFromWallet,
    addProduct,
    updateUserName
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}
