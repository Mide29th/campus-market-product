import React from 'react';
import { useShop } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import './Home.css';
import { Search, Store, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../../types';

function ProductSkeleton() {
  return (
    <div className="product-skeleton">
      <div className="skeleton-img" />
      <div className="skeleton-line long" />
      <div className="skeleton-line short" />
      <div className="skeleton-line mid" />
    </div>
  );
}

export default function Home() {
  const { categories, products, vendors, addToCart, user, isLoading } = useShop();
  const navigate = useNavigate();

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

      {/* Welcome */}
      <section className="welcome-section">
        <h2 className="greeting">Hello, {user?.name?.split(' ')[0] || 'Guest'} 👋</h2>
        <p className="subtitle">Ready to find something amazing?</p>
        <div className="search-bar-mock" onClick={() => navigate('/search')}>
          <Search size={20} />
          <span>Search for items, food, services...</span>
        </div>
      </section>

      {/* Hero */}
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
          {!isLoading && products.length > 0 && (
            <button className="see-all-btn" onClick={() => navigate('/search')}>See all</button>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="products-grid">
            {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <div className="home-empty-state">
            <ShoppingBag size={52} strokeWidth={1.2} />
            <h3>No products listed yet</h3>
            <p>Check back soon — vendors are setting up their stores.</p>
            {user?.role === 'vendor' && (
              <button className="empty-cta-btn" onClick={() => navigate('/add-product')}>
                List your first product
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!isLoading && products.length > 0 && (
          <div className="products-grid">
            {products.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  vendor={vendor}
                  onAddClick={addToCart}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
