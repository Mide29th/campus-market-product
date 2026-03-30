export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  vendorId: number;
  vendorName: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  stock?: number;
}

export interface Vendor {
  id: number;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  products: number[];
  reputation: string;
  deliveryTime: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  productId: number;
  userId: number;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: number | string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  vendorId: number;
  vendorName: string;
  vendorImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  deliveryMethod: 'pickup' | 'delivery';
  address?: string;
}

export interface User {
  id: number;
  name: string;
  role: 'student' | 'vendor';
  email: string;
  walletBalance: number;
  avatarUrl?: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
}

export interface ShopContextType {
  products: Product[];
  vendors: Vendor[];
  cart: CartItem[];
  user: User;
  orders: Order[];
  categories: Category[];
  conversations: Conversation[];
  reviews: Review[];
  wishlist: number[];
  recentlyViewed: number[];
  recentlySearched: SearchHistory[];
  cartTotal: number;
  cartItemCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  addOrder: (items: CartItem[], total: number, deliveryMethod: 'pickup' | 'delivery', address?: string) => void;
  sendMessage: (vendorId: number, text: string) => void;
  addReview: (productId: number, rating: number, comment: string) => void;
  toggleWishlist: (productId: number) => void;
  addToRecentlyViewed: (productId: number) => void;
  addToRecentlySearched: (query: string) => void;
  clearRecentlySearched: () => void;
  getVendorById: (vendorId: number) => Vendor | undefined;
  getProductById: (productId: number) => Product | undefined;
  getProductsByVendor: (vendorId: number) => Product[];
  setUserRole: (role: 'student' | 'vendor') => void;
  updateUserAvatar: (url: string) => void;
  topUpWallet: (amount: number) => void;
}
