import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import TopUpModal from '../../components/TopUpModal/TopUpModal';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Receipt,
} from 'lucide-react';
import './PaymentSettings.css';

export default function PaymentSettings() {
  const { user, transactions } = useShop();
  const navigate = useNavigate();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  if (!user) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const totalSpent = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFunded = transactions
    .filter(t => t.type === 'topup')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="ps-page animate-fade-in">

      {/* Simple back header */}
      <div className="ps-top-bar">
        <button className="ps-back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={22} />
        </button>
        <h2>Payment & Wallet</h2>
        <div style={{ width: 36 }} />
      </div>

      <div className="ps-content">

        {/* Wallet card */}
        <div className="ps-wallet-card">
          <div className="ps-wallet-card-inner">
            <div className="ps-card-label">
              <Wallet size={18} />
              <span>VENDORA WALLET</span>
            </div>
            <div className="ps-balance-block">
              <span className="ps-balance-caption">Available Balance</span>
              <h1 className="ps-balance-value">₦{(user.walletBalance || 0).toLocaleString()}</h1>
            </div>
            <button className="ps-fund-btn" onClick={() => setIsTopUpOpen(true)}>
              <Plus size={18} />
              Fund Wallet
            </button>
          </div>
          {/* decorative circles */}
          <div className="ps-card-circle ps-circle-1" />
          <div className="ps-card-circle ps-circle-2" />
        </div>

        {/* Summary row */}
        {transactions.length > 0 && (
          <div className="ps-summary-row">
            <div className="ps-summary-box">
              <ArrowDownLeft size={18} className="ps-sum-icon funded" />
              <div>
                <span className="ps-sum-label">Total Funded</span>
                <span className="ps-sum-value">₦{totalFunded.toLocaleString()}</span>
              </div>
            </div>
            <div className="ps-summary-divider" />
            <div className="ps-summary-box">
              <ArrowUpRight size={18} className="ps-sum-icon spent" />
              <div>
                <span className="ps-sum-label">Total Spent</span>
                <span className="ps-sum-value">₦{totalSpent.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction history */}
        <section className="ps-section">
          <div className="ps-section-header">
            <h3>Transaction History</h3>
            <span className="ps-trx-count">{transactions.length} record{transactions.length !== 1 ? 's' : ''}</span>
          </div>

          {transactions.length > 0 ? (
            <div className="ps-trx-list">
              {transactions.map(trx => (
                <div key={trx.id} className="ps-trx-item">
                  <div className={`ps-trx-icon ${trx.type}`}>
                    {trx.type === 'topup'
                      ? <ArrowDownLeft size={18} />
                      : <ArrowUpRight size={18} />}
                  </div>
                  <div className="ps-trx-details">
                    <span className="ps-trx-title">
                      {trx.type === 'topup' ? 'Wallet Funded' : 'Order Payment'}
                    </span>
                    <span className="ps-trx-date">
                      <Clock size={11} /> {formatDate(trx.date)}
                    </span>
                  </div>
                  <div className="ps-trx-right">
                    <span className={`ps-trx-amount ${trx.type}`}>
                      {trx.type === 'topup' ? '+' : '-'}₦{trx.amount.toLocaleString()}
                    </span>
                    <span className="ps-trx-badge">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ps-empty">
              <Receipt size={44} strokeWidth={1.2} />
              <h4>No transactions yet</h4>
              <p>Fund your wallet or make a purchase to see your history here.</p>
              <button className="ps-fund-empty-btn" onClick={() => setIsTopUpOpen(true)}>
                <Plus size={16} /> Fund Wallet
              </button>
            </div>
          )}
        </section>

        <div className="ps-security-note">
          <ShieldCheck size={15} />
          <span>All transactions are secured and encrypted by Paystack</span>
        </div>

      </div>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </div>
  );
}
