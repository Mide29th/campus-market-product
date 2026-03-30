import React, { createContext, useContext, useState, ReactNode } from 'react';
import { products, vendors, categories } from '../mockData/db';
import { Product, Vendor, CartItem, User, ShopContextType, Order, Conversation, ChatMessage, Review, SearchHistory } from '../types';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  // --- Global State ---
  
  // 1. User Session (Mock logged in student)
  const [user, setUser] = useState<User>({
    id: 123, // Use nubmer to match interface
    name: 'Alex Johnson',
    role: 'student', // student | vendor
    email: 'alex@campus.edu',
    walletBalance: 0,
    avatarUrl: undefined // Start with no avatar to show initials
  });

  // 2. Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // 3. Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  
  // 4. Shop Data
  const [dbProducts] = useState<Product[]>(products);
  const [dbVendors] = useState<Vendor[]>(vendors);
  
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

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
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

  const getVendorById = (id: number) => dbVendors.find(v => v.id === id);
  const getProductById = (id: number) => dbProducts.find(p => p.id === id);
  const getProductsByVendor = (vendorId: number) => dbProducts.filter(p => p.vendorId === vendorId);

  const setUserRole = (role: 'student' | 'vendor') => {
    setUser(prev => ({ ...prev, role }));
    if (role === 'student') clearCart();
  };

  const updateUserAvatar = (avatarUrl: string) => {
    setUser(prev => ({ ...prev, avatarUrl }));
  };

  const topUpWallet = (amount: number) => {
    setUser(prev => ({ ...prev, walletBalance: prev.walletBalance + amount }));
    
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
    if (user.walletBalance < amount) return false;
    
    setUser(prev => ({ ...prev, walletBalance: prev.walletBalance - amount }));
    
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
      vendorId: 1,
      vendorName: 'Gadget Hub',
      vendorImage: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=200',
      lastMessage: 'Your order is being processed and will be delivered soon!',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 1,
      messages: [
        {
          id: 'm1',
          senderId: 1,
          senderName: 'Gadget Hub',
          text: 'Hello! How can I help you today?',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'm2',
          senderId: 123,
          senderName: 'Alex Johnson',
          text: 'I wanted to ask about the warranty on the MacBook Pro.',
          timestamp: new Date(Date.now() - 5400000).toISOString()
        },
        {
          id: 'm3',
          senderId: 1,
          senderName: 'Gadget Hub',
          text: 'Your order is being processed and will be delivered soon!',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    },
    {
      id: 'conv-2',
      vendorId: 2,
      vendorName: 'Fresh Bakes',
      vendorImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200',
      lastMessage: 'The vanilla cupcakes are now back in stock!',
      lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
      unreadCount: 0,
      messages: [
        {
          id: 'm4',
          senderId: 2,
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
      productId: 1,
      userId: 456,
      userName: 'John Doe',
      rating: 5,
      comment: 'Absolutely amazing product! The build quality is top-notch.',
      date: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'rev-2',
      productId: 1,
      userId: 789,
      userName: 'Sarah Jenkins',
      rating: 4,
      comment: 'Very good, just wish the delivery was a bit faster.',
      date: new Date(Date.now() - 259200000).toISOString()
    }
  ]);

  // 7. Wishlist & History States
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [recentlySearched, setRecentlySearched] = useState<SearchHistory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // --- Messaging Actions ---

  const sendMessage = (vendorId: number, text: string) => {
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

  const addReview = (productId: number, rating: number, comment: string) => {
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

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [productId, ...prev]
    );
  };

  const addToRecentlyViewed = (productId: number) => {
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
    deductFromWallet
  };
 Broadway

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}
