import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { CheckCircle2, ShoppingBag, Package } from 'lucide-react';
import './CheckoutSuccess.css';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { orders } = useShop();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect to orders after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const latestOrder = orders[0];

  return (
    <div className="checkout-success-page animate-fade-in">
      <div className="success-content">
        <div className="success-icon-wrapper">
          <CheckCircle2 color="var(--color-success)" size={80} strokeWidth={1.5} />
        </div>

        <h1 className="success-title">Payment Successful!</h1>

        {latestOrder ? (
          <p className="success-message">
            Order <strong>#{latestOrder.id.slice(-6).toUpperCase()}</strong> placed successfully.
            The vendor has been notified and will prepare it shortly.
          </p>
        ) : (
          <p className="success-message">
            Your order has been placed. The vendor has been notified.
          </p>
        )}

        <div className="success-countdown">
          <div className="countdown-ring">
            <span>{countdown}</span>
          </div>
          <p>Redirecting to your orders in {countdown}s…</p>
        </div>

        <div className="success-actions">
          <button className="success-btn primary" onClick={() => navigate('/orders', { replace: true })}>
            <Package size={18} /> View My Orders
          </button>
          <button className="success-btn ghost" onClick={() => navigate('/', { replace: true })}>
            <ShoppingBag size={18} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
