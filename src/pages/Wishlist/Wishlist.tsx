import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlist, products, vendors, addToCart } = useShop();
  const navigate = useNavigate();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="wishlist-page animate-fade-in">
      <div className="page-header">
        <button className="back-btn active-bounce" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>My Wishlist</h1>
        <div className="header-badge">
          <Heart size={16} fill="currentColor" />
          <span>{wishlistedProducts.length}</span>
        </div>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="products-grid">
          {wishlistedProducts.map(product => {
            const vendor = vendors.find(v => v.id === product.vendorId);
            return (
              <ProductCard 
                key={product.id} 
                product={product} 
                vendor={vendor}
                onAddClick={() => addToCart(product)}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <div className="empty-icon-wrapper">
            <Heart size={48} className="empty-icon" />
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you like and they'll appear here so you can easily buy them later.</p>
          <button 
            className="explore-btn active-bounce"
            onClick={() => navigate('/')}
          >
            Start Exploring
          </button>
        </div>
      )}
    </div>
  );
}
