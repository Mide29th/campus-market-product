import React from 'react';
import { useShop } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import './Home.css';
import { Search } from 'lucide-react';
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
      {/* Welcome Section */}
      <section className="welcome-section">
        <h2 className="greeting">Hello, {user?.name?.split(' ')[0] || 'Guest'} 👋</h2>
        <p className="subtitle">What are you looking for today?</p>
        
        {/* Fake Search Bar for UI flow */}
        <div className="search-bar-mock glass-panel" style={{ background: 'var(--color-bg-card)', marginBottom: 'var(--spacing-6)' }} onClick={() => navigate('/search')}>
          <Search size={20} color="var(--color-text-muted)" />
          <span>Search for food, printing...</span>
        </div>
      </section>

      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Categories */}
      <section className="categories-section">
        <div className="section-header">
          <h3>Explore Campus</h3>
        </div>
        <div className="categories-grid">
          {(categories as Category[]).map((category, idx) => (
            <div 
              key={category.id} 
              className="category-card active-bounce animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s`, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
              onClick={() => navigate(`/search?category=${category.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span className="category-icon" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{category.icon}</span>
              <span className="category-name" style={{ fontWeight: 600 }}>{category.name}</span>
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
