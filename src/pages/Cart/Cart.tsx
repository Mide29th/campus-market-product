import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import Button from '../../components/Button/Button';
import { CartItem } from '../../types';
import './Cart.css';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartItemCount } = useShop();
  const navigate = useNavigate();

  if (cartItemCount === 0) {
    return (
      <div className="cart-page empty-cart animate-fade-in">
        <div className="empty-cart-container">
          <div className="empty-icon-ring">
            <ShoppingCart size={48} className="empty-icon-main" />
          </div>
          <h2>Your cart is empty</h2>
          <p>Explore the marketplace and find amazing campus deals.</p>
          <Button 
            onClick={() => navigate('/search')} 
            variant="primary"
            className="mt-6 active-bounce"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade-in">
      <header className="cart-header">
        <h2 className="page-title">My Cart</h2>
        <span className="cart-count-badge">{cartItemCount} items</span>
      </header>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          {cart.map((item: CartItem, idx: number) => (
            <div 
              key={item.id} 
              className="cart-item-card glass-panel animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="cart-item-img-box">
                <img src={item.image} alt={item.name} />
              </div>
              
              <div className="cart-item-content">
                <div className="cart-item-top">
                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <span className="item-category">{item.category}</span>
                  </div>
                  <button 
                    className="item-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="cart-item-bottom">
                  <span className="item-price">₦{item.price.toLocaleString()}</span>
                  
                  <div className="item-qty-selector">
                    <button 
                      className="qty-act-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-num">{item.quantity}</span>
                    <button 
                      className="qty-act-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary-section">
          <div className="summary-card glass-panel animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3>Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="summary-line">
                <span>Estimated Delivery</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="summary-line savings">
                <span>Campus Discount</span>
                <span>- ₦0.00</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-line total">
              <span>Total Amount</span>
              <span className="total-price">₦{cartTotal.toLocaleString()}</span>
            </div>
            
            <Button 
              fullWidth 
              size="lg" 
              variant="primary"
              className="checkout-btn mt-6 active-bounce"
              onClick={() => navigate('/checkout')}
            >
              Secure Checkout
              <ArrowRight size={20} />
            </Button>

            <div className="checkout-badge">
              <span className="shield-icon">🛡️</span>
              Safe & Secure Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
