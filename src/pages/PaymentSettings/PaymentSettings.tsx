import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Button from '../../components/Button/Button';
import TopUpModal from '../../components/TopUpModal/TopUpModal';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Smartphone, 
  ShieldCheck,
  ChevronRight,
  Clock
} from 'lucide-react';
import './PaymentSettings.css';

export default function PaymentSettings() {
  const { user, transactions } = useShop();
  const navigate = useNavigate();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="payment-settings-page animate-fade-in">
      <Header 
        title="Payment Settings" 
        showBack 
        onBack={() => navigate('/profile')} 
      />

      <div className="payment-content">
        {/* Wallet Balance Card */}
        <section className="wallet-card-section">
          <div className="wallet-balance-card shadow-glow">
            <div className="card-top">
              <div className="brand">
                <Wallet size={20} />
                <span>VENDORA WALLET</span>
              </div>
              <ShieldCheck size={20} className="secure-icon" />
            </div>
            
            <div className="balance-display">
              <span className="balance-label">Total Balance</span>
              <h1 className="balance-amount">₦{user.walletBalance.toLocaleString()}</h1>
            </div>

            <div className="card-actions">
              <Button 
                variant="primary" 
                className="action-btn active-bounce" 
                onClick={() => setIsTopUpOpen(true)}
              >
                <Plus size={18} />
                <span>Fund Wallet</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Saved Methods */}
        <section className="payment-section">
          <h3 className="section-title">Saved Methods</h3>
          <div className="saved-methods glass-panel">
            <div className="method-item">
              <div className="method-icon bank">
                <CreditCard size={20} />
              </div>
              <div className="method-info">
                <span className="method-name">Access Bank •••• 4242</span>
                <span className="method-expiry">Expires 12/26</span>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="method-item">
              <div className="method-icon mobile">
                <Smartphone size={20} />
              </div>
              <div className="method-info">
                <span className="method-name">V-Cash PIN Enabled</span>
                <span className="method-expiry">Biometric Lock On</span>
              </div>
              <ChevronRight size={18} className="text-secondary" />
            </div>
          </div>
        </section>

        {/* Transaction History */}
        <section className="payment-section transactions-section">
          <div className="section-header">
            <h3 className="section-title">Transaction History</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>

          <div className="transaction-list glass-panel">
            {transactions.length > 0 ? (
              transactions.map((trx) => (
                <div key={trx.id} className="transaction-item">
                  <div className={`trx-icon ${trx.type}`}>
                    {trx.type === 'topup' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="trx-details">
                    <span className="trx-title">
                      {trx.type === 'topup' ? 'Wallet Funded' : 'Order Payment'}
                    </span>
                    <span className="trx-meta">
                      <Clock size={12} /> {formatDate(trx.date)}
                    </span>
                  </div>
                  <div className="trx-amount-container">
                    <span className={`trx-amount ${trx.type}`}>
                      {trx.type === 'topup' ? '+' : '-'}₦{trx.amount.toLocaleString()}
                    </span>
                    <span className="trx-status">Completed</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-history">
                <Clock size={40} className="text-muted" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </section>

        <div className="security-notice">
          <ShieldCheck size={16} />
          <span>All transactions are encrypted and secured by Paystack</span>
        </div>
      </div>

      <TopUpModal 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)} 
      />
    </div>
  );
}
