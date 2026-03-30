import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Minus, Plus, ShoppingBag, Store, Star } from 'lucide-react';
import Button from '../../components/Button/Button';
import { Product, Vendor } from '../../types';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, vendors, addToCart, reviews, addToRecentlyViewed } = useShop();
  
  const productId = id ? parseInt(id) : NaN;
  const product = products.find(p => p.id === productId);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      addToRecentlyViewed(productId);
    }
  }, [productId]);

  const productReviews = reviews.filter(r => r.productId === productId);
  const averageRating = productReviews.length > 0 
    ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
    : '0.0';
  const reviewCount = productReviews.length;
  
  if (!product) {
    return <div className="p-4 text-center">Product not found. <button onClick={() => navigate(-1)}>Go Back</button></div>;
  }
  
  const vendor = vendors.find(v => v.id === product.vendorId);
  
  const handleAddToCart = () => {
    addToCart(product);
    // Visual feedback could be added here
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };
  
  const maxStock = product.stock || 99;
  
  return (
    <div className="product-details-page animate-fade-in">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-hero-image" />
        <button className="back-btn-absolute active-bounce" onClick={() => navigate(-1)}>
          &larr;
        </button>
      </div>
      
      <div className="product-info-section">
        <div className="product-header-row">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-rating-badge glass-panel">
            <Star size={14} fill="#ffb800" color="#ffb800" />
            <span>{averageRating}</span>
            <span className="count">({reviewCount})</span>
          </div>
        </div>
        <p className="product-price-lg">₦{product.price.toLocaleString()}</p>
        
        {product.stock !== undefined && product.stock <= 5 && (
          <div className="stock-warning">Only {product.stock} items left in stock</div>
        )}
        
        <div className="vendor-card">
          <div className="vendor-icon"><Store size={20} /></div>
          <div className="vendor-texts" style={{ flex: 1 }}>
            <h4 className="vendor-name-bold">{vendor?.name}</h4>
            <span className="vendor-rating">⭐ {vendor?.rating}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate(`/chat/${product.vendorId}`)}>Message</Button>
        </div>
        
        <div className="description-section">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>

        <div className="reviews-section">
          <div className="section-header">
            <h3>Customer Reviews</h3>
            {reviewCount > 0 && <span className="view-all">See All</span>}
          </div>

          {productReviews.length > 0 ? (
            <div className="reviews-list">
              {productReviews.slice(0, 3).map(review => (
                <div key={review.id} className="review-item glass-panel">
                  <div className="review-user">
                    {review.userImage ? (
                      <img src={review.userImage} alt={review.userName} className="review-avatar" />
                    ) : (
                      <div className="review-avatar-placeholder">{review.userName[0]}</div>
                    )}
                    <div className="user-info">
                      <span className="user-name">{review.userName}</span>
                      <div className="user-rating">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star 
                            key={s} 
                            size={10} 
                            fill={s <= review.rating ? "#ffb800" : "none"} 
                            color={s <= review.rating ? "#ffb800" : "#ccc"} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews glass-panel">
              <p>No reviews yet. Be the first to rate this product!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Sticky Action Bar */}
      <div className="product-action-bar">
        <div className="quantity-selector">
          <button 
            className="qty-btn" 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >-</button>
          <span className="qty-value">{quantity}</span>
          <button 
            className="qty-btn" 
            onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
            disabled={quantity >= maxStock}
          >+</button>
        </div>
        
        <div className="add-btn-container">
          <Button fullWidth onClick={handleAddToCart} className="add-to-cart-big-btn">
            <ShoppingBag size={20} />
            Add to Cart - ₦{(product.price * quantity).toLocaleString()}
          </Button>
        </div>
      </div>
    </div>
  );
}
