import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Button from '../../components/Button/Button';
import { CartItem } from '../../types';
import './Cart.css';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartItemCount } = useShop();
  const navigate = useNavigate();

  if (cartItemCount === 0) {
    return (
      <div className="cart-page empty-cart animate-fade-in">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate('/search')} className="mt-4">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade-in">
      <h2 className="page-title">My Cart ({cartItemCount})</h2>
      
      <div className="cart-items">
        {cart.map((item: CartItem) => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            
            <div className="cart-item-details">
              <div className="cart-item-header">
                <h4 className="cart-item-name">{item.name}</h4>
                <button 
                  className="remove-btn active-bounce"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="cart-item-footer">
                <span className="cart-item-price">₦{item.price.toLocaleString()}</span>
                
                <div className="cart-qty-controls">
                  <button 
                    className="qty-btn-sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-value-sm">{item.quantity}</span>
                  <button 
                    className="qty-btn-sm"
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

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₦{cartTotal.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Delivery</span>
          <span className="text-secondary">Calculated at checkout</span>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-row total">
          <span>Total</span>
          <span>₦{cartTotal.toLocaleString()}</span>
        </div>
        
        <Button 
          fullWidth 
          size="lg" 
          className="checkout-btn mt-4"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}
