import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import './RecentlyViewed.css';

export default function RecentlyViewed() {
  const { recentlyViewed, products, vendors, addToCart } = useShop();
  const navigate = useNavigate();

  // Map IDs to product objects, maintaining order
  const viewedProducts = recentlyViewed
    .map(id => products.find(p => p.id === id))
    .filter(p => p !== undefined);

  return (
    <div className="history-page animate-fade-in">
      <div className="page-header">
        <button className="back-btn active-bounce" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Recently Viewed</h1>
        <div className="header-badge">
          <Clock size={16} />
          <span>{viewedProducts.length}</span>
        </div>
      </div>

      {viewedProducts.length > 0 ? (
        <div className="products-grid">
          {viewedProducts.map(product => {
            const vendor = vendors.find(v => v.id === product!.id); // Wait p! is better
            return (
              <ProductCard 
                key={product!.id} 
                product={product!} 
                vendor={vendors.find(v => v.id === product!.vendorId)}
                onAddClick={() => addToCart(product!)}
                onClick={() => navigate(`/product/${product!.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <div className="empty-icon-wrapper">
            <Clock size={48} className="empty-icon" />
          </div>
          <h3>No view history</h3>
          <p>The products you view will appear here for quick access later.</p>
          <button 
            className="explore-btn active-bounce"
            onClick={() => navigate('/')}
          >
            Browse Products
          </button>
        </div>
      )}
    </div>
  );
}
