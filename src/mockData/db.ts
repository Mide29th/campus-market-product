import { Product, Vendor } from '../types';

export const categories = [
  { id: 'food', name: 'Food & Drinks', icon: '🍔' },
  { id: 'stationery', name: 'Stationery', icon: '📚' },
  { id: 'services', name: 'Services', icon: '🧺' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
];

export const vendors: Vendor[] = [
  {
    id: 1,
    name: 'Taste of Home Foods',
    category: 'food',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400',
    description: 'Best home-cooked meals on campus. Hot and fresh!',
    products: [1, 2],
    reputation: 'Excellent',
    deliveryTime: '20-30 mins'
  },
  {
    id: 2,
    name: 'Campus Prints & Co.',
    category: 'services',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc53a?auto=format&fit=crop&q=80&w=400',
    description: 'Fast printing, binding, and photocopies.',
    products: [3],
    reputation: 'Good',
    deliveryTime: '15-20 mins'
  },
  {
    id: 3,
    name: 'Fresh Laundry Express',
    category: 'services',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1545173153-5dd921f1b934?auto=format&fit=crop&q=80&w=400',
    description: 'We wash, dry, and fold. 24h turnaround.',
    products: [4],
    reputation: 'Top Rated',
    deliveryTime: '24 hours'
  },
  {
    id: 4,
    name: 'Tech Gadget Hub',
    category: 'electronics',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=400',
    description: 'Chargers, cables, and phone accessories.',
    products: [5],
    reputation: 'Verified',
    deliveryTime: '10-15 mins'
  }
];

export const products: Product[] = [
  {
    id: 1,
    vendorId: 1,
    vendorName: 'Taste of Home Foods',
    name: 'Spicy Jollof Rice Combo',
    price: 1500,
    description: 'A rich bowl of jollof rice with fried plantain and chicken.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=400',
    stock: 20,
    category: 'food',
    rating: 4.5,
    reviews: 12
  },
  {
    id: 2,
    vendorId: 1,
    vendorName: 'Taste of Home Foods',
    name: 'Beef Shawarma',
    price: 1200,
    description: 'Juicy beef shawarma with extra cream.',
    image: 'https://images.unsplash.com/photo-1648434771343-fc0f15c1eeb7?auto=format&fit=crop&q=80&w=400',
    stock: 15,
    category: 'food',
    rating: 4.8,
    reviews: 45
  },
  {
    id: 3,
    vendorId: 2,
    vendorName: 'Campus Prints & Co.',
    name: 'Color Printing (Per Page)',
    price: 50,
    description: 'High-quality color laser printing.',
    image: 'https://images.unsplash.com/photo-1596495578065-ef2fcd105156?auto=format&fit=crop&q=80&w=400',
    stock: 1000,
    category: 'services',
    rating: 4.2,
    reviews: 156
  },
  {
    id: 4,
    vendorId: 3,
    vendorName: 'Fresh Laundry Express',
    name: 'Wash & Fold (Per kg)',
    price: 500,
    description: 'Standard 24h wash and fold service for everyday clothes.',
    image: 'https://images.unsplash.com/photo-1582735689369-0df4bfebbc46?auto=format&fit=crop&q=80&w=400',
    stock: 50,
    category: 'services',
    rating: 4.9,
    reviews: 89
  },
  {
    id: 5,
    vendorId: 4,
    vendorName: 'Tech Gadget Hub',
    name: 'Fast Charging Cable (Type-C)',
    price: 2500,
    description: 'Durable braided Type-C cable, 2 meters.',
    image: 'https://images.unsplash.com/photo-1616421422778-9588ac532655?auto=format&fit=crop&q=80&w=400',
    stock: 30,
    category: 'electronics',
    rating: 4.0,
    reviews: 23
  }
];

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase();
  return products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
};
