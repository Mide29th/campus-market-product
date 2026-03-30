import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { usePaystackPayment } from 'react-paystack';
import Button from '../../components/Button/Button';
import { ArrowLeft, MapPin, Package, CreditCard, Wallet } from 'lucide-react';
import { CartItem } from '../../types';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, clearCart, addOrder, user, deductFromWallet } = useShop();
  const navigate = useNavigate();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'wallet'>('bank');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  const deliveryFee = deliveryMethod === 'delivery' ? 500 : 0;
  const finalTotal = cartTotal + deliveryFee;

  // Paystack Config
  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || `${user?.id || 'guest'}@vendora.app`,
    amount: finalTotal * 100, // Paystack amount is in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const onSuccess = (reference: any) => {
    // Implementation for success
    console.log("Payment Successful:", reference);
    addOrder(cart, finalTotal, deliveryMethod, address);
    clearCart();
    navigate('/checkout/success', { replace: true });
  };

  const onClose = () => {
    // Implementation for close
    console.log("Payment Modal Closed");
    alert("Payment was not completed.");
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = (e: FormEvent) => {
    e.preventDefault();
    if (deliveryMethod === 'delivery' && !address) {
      alert('Please enter a delivery address');
      return;
    }

    if (paymentMethod === 'wallet') {
      if (user.walletBalance < finalTotal) {
        alert('Insufficient wallet balance. Please top up or use another method.');
        return;
      }
      
      const success = deductFromWallet(finalTotal);
      if (success) {
        addOrder(cart, finalTotal, deliveryMethod, address);
        clearCart();
        navigate('/checkout/success', { replace: true });
      } else {
        alert('Payment failed. Please try again.');
      }
    } else {
      // @ts-ignore
      initializePayment(onSuccess, onClose);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="p-4 text-center mt-8">
        <h2>Your cart is empty</h2>
        <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="checkout-page animate-fade-in">
      <div className="checkout-header">
        <button className="back-btn active-bounce" onClick={() => navigate('/cart')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Checkout</h2>
        <div style={{ width: 40}}></div> {/* Spacer for center alignment */}
      </div>

      <form className="checkout-form" onSubmit={handlePayment}>
        <section className="checkout-section border-subtle">
          <h3>Delivery Method</h3>
          <div className="method-toggles">
            <button 
              type="button"
              className={`method-toggle ${deliveryMethod === 'pickup' ? 'active' : ''}`}
              onClick={() => setDeliveryMethod('pickup')}
            >
              <Package size={20} />
              <span>Pickup</span>
            </button>
            <button 
              type="button"
              className={`method-toggle ${deliveryMethod === 'delivery' ? 'active' : ''}`}
              onClick={() => setDeliveryMethod('delivery')}
            >
              <MapPin size={20} />
              <span>Delivery</span>
            </button>
          </div>
          
          {deliveryMethod === 'delivery' && (
            <div className="delivery-details animate-slide-up">
              <label className="input-label">
                Hostel / Location on Campus
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Block A, Room 102"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                />
              </label>
              <label className="input-label mt-3">
                Phone Number
                <input 
                  type="tel" 
                  className="input-field" 
                  placeholder="080..."
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </label>
              <p className="delivery-notice text-secondary">Delivery fee of ₦500 applied.</p>
            </div>
          )}
        </section>

        <section className="checkout-section border-subtle">
          <h3>Payment Method</h3>
          <div className="method-toggles">
            <button 
              type="button"
              className={`method-toggle ${paymentMethod === 'wallet' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('wallet')}
            >
              <Wallet size={20} />
              <span>Wallet (₦{user.walletBalance.toLocaleString()})</span>
            </button>
            <button 
              type="button"
              className={`method-toggle ${paymentMethod === 'bank' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('bank')}
            >
              <CreditCard size={20} />
              <span>Bank / Card</span>
            </button>
          </div>
          {paymentMethod === 'wallet' && user.walletBalance < finalTotal && (
            <p className="insufficient-notice text-danger animate-fade-in">
              ⚠️ Insufficient balance. Needs ₦{(finalTotal - user.walletBalance).toLocaleString()} more.
            </p>
          )}
        </section>

        <section className="checkout-section border-subtle">
          <h3>Order Summary</h3>
          <div className="order-items-minimal">
            {cart.map((item: CartItem) => (
              <div key={item.id} className="summary-item">
                <span className="summary-item-name">{item.quantity}x {item.name}</span>
                <span className="summary-item-price">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-divider mt-2 mb-2"></div>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₦{cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₦{deliveryFee.toLocaleString()}</span>
          </div>
          <div className="summary-row total mt-2">
            <span>Total to Pay</span>
            <span className="text-primary">₦{finalTotal.toLocaleString()}</span>
          </div>
        </section>

        <div className="checkout-action-bar">
          <Button 
            type="submit" 
            fullWidth 
            size="lg"
            disabled={paymentMethod === 'wallet' && user.walletBalance < finalTotal}
          >
            {paymentMethod === 'wallet' ? <Wallet size={20} /> : <CreditCard size={20} />}
            {paymentMethod === 'wallet' ? 'Pay with Wallet' : `Pay ₦${finalTotal.toLocaleString()}`}
          </Button>
          <p className="secure-badge">
            {paymentMethod === 'wallet' ? '🔒 Instant wallet deduction' : '🔒 Secure payment by Paystack'}
          </p>
        </div>
      </form>
    </div>
  );
}
