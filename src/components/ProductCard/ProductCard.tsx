import React, { MouseEvent } from 'react';
import { Plus, Heart } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, Vendor } from '../../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  vendor?: Vendor;
  onAddClick?: (product: Product) => void;
  onClick?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  vendor, 
  onAddClick,
  onClick 
}: ProductCardProps) {
  const { wishlist, toggleWishlist } = useShop();
  const isWishlisted = wishlist.includes(product.id);

  const handleAddClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (onAddClick) onAddClick(product);
  };

  const handleWishlistToggle = (e: MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const hasLowStock = product.stock !== undefined && product.stock <= 5;

  return (
    <div className="product-card" onClick={() => onClick && onClick(product)}>
      <div className="card-image-wrapper">
        <img src={product.image} alt={product.name} className="card-image" loading="lazy" />
        <button 
          className={`wishlist-btn active-bounce ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        {hasLowStock && (
          <span className="stock-badge">Only {product.stock} left</span>
        )}
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-vendor">{vendor?.name || product.vendorName}</p>
        </div>
        
        <div className="card-footer">
          <span className="product-price">₦{product.price.toLocaleString()}</span>
          <button 
            className="add-to-cart-btn active-bounce"
            onClick={handleAddClick}
            aria-label="Add to cart"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
