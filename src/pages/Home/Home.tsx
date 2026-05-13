import React from 'react';
import { useShop } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import './Home.css';
import { Search, Store, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../../types';

export default function Home() {
  const { categories, products, vendors, addToCart, user } = useShop();
  const navigate = useNavigate();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <div className="home-page animate-fade-in">
      {/* Vendor Banner */}
      {user?.role === 'vendor' && (
        <div className="vendor-mode-banner" onClick={() => navigate('/vendor-dashboard')}>
          <div className="banner-content">
            <Store size={18} />
            <span>You are in Vendor Mode. Tap to manage your store.</span>
          </div>
          <ChevronRight size={18} />
        </div>
      )}

      {/* Welcome Section */}
      <section className="welcome-section">
        <h2 className="greeting">Hello, {user?.name?.split(' ')[0] || 'Guest'} 👋</h2>
        <p className="subtitle">Ready to find something amazing?</p>
        
        {/* Search Bar */}
        <div className="search-bar-mock" onClick={() => navigate('/search')}>
          <Search size={20} />
          <span>Search for items, food, services...</span>
        </div>
      </section>

      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Categories */}
      <section className="categories-section">
        <div className="section-header">
          <h3>Explore Campus</h3>
        </div>
        <div className="categories-horizontal">
          {(categories as Category[]).map((category, idx) => (
            <div 
              key={category.id} 
              className="category-pill-card animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => navigate(`/search?category=${category.id}`)}
            >
              <span className="cat-icon">{category.icon}</span>
              <span className="cat-name">{category.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="section-header">
          <h3>Featured 🔥</h3>
          <button className="see-all-btn" onClick={() => navigate('/search')}>See all</button>
        </div>
        <div className="products-grid">
          {products.map(product => {
            const vendor = vendors.find(v => v.id === product.vendorId);
            return (
              <ProductCard 
                key={product.id} 
                product={product} 
                vendor={vendor}
                onAddClick={handleAddToCart}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
