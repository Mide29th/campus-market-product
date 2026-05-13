import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, TrendingUp, Package, DollarSign, Users,
  Edit, Trash2, ExternalLink, LayoutDashboard, ShoppingBag,
  MessageSquare, Settings, HelpCircle, LogOut, ChevronRight,
  BarChart3, List, Store, ArrowUpRight, Sparkles,
} from 'lucide-react';
import './VendorDashboard.css';

export default function VendorDashboard() {
  const { getProductsByVendor, orders } = useShop();
  const { user, signOut, toggleViewMode } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return <div className="unauthorized-message">Please log in to access the dashboard.</div>;
  }

  const vendorProducts = getProductsByVendor(user.id.toString());
  const vendorSales = orders.filter(order =>
    order.items.some(item => vendorProducts.some(vp => vp.id === item.id))
  );
  const totalRevenue = vendorSales.reduce((acc, curr) => acc + curr.total, 0);

  const stats = [
    { label: 'Revenue',  value: `₦${totalRevenue.toLocaleString()}`,       icon: DollarSign,  color: '#10b981', bg: '#d1fae5', trend: '+12%' },
    { label: 'Listings', value: vendorProducts.length.toString(),            icon: Package,     color: '#6366f1', bg: '#e0e7ff', trend: `+${vendorProducts.length}` },
    { label: 'Sales',    value: vendorSales.length.toString(),               icon: TrendingUp,  color: '#f59e0b', bg: '#fef3c7', trend: '+8%' },
    { label: 'Clients',  value: '12',                                        icon: Users,       color: '#ec4899', bg: '#fce7f3', trend: '+3' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleSwitchToBuying = () => {
    toggleViewMode();
    navigate('/');
  };

  return (
    <div className="vendor-dashboard-layout">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Sparkles size={16} /></div>
          <span>Vendor Hub</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          <div className="nav-item active"><LayoutDashboard size={20} /><span>Overview</span></div>
          <div className="nav-item" onClick={() => navigate('/add-product')}><Plus size={20} /><span>Add Product</span></div>
          <div className="nav-item"><ShoppingBag size={20} /><span>Orders</span></div>
          <div className="nav-item" onClick={() => navigate('/inbox')}><MessageSquare size={20} /><span>Messages</span></div>
          <div className="nav-divider" />
          <div className="nav-section-label">Account</div>
          <div className="nav-item" onClick={() => navigate('/profile')}><Settings size={20} /><span>Settings</span></div>
          <div className="nav-item"><HelpCircle size={20} /><span>Help Centre</span></div>
        </nav>

        <div className="sidebar-footer">
          <button className="switch-buying-btn" onClick={handleSwitchToBuying}>
            <Store size={18} /><span>Switch to Buying</span>
          </button>
          <button className="logout-side-btn" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut size={18} /><span>{isLoggingOut ? 'Signing out…' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="dashboard-main">
        <header className="dashboard-top-bar">
          <div className="welcome-block">
            <p className="welcome-sub">Good day,</p>
            <h1 className="welcome-name">{user.name.split(' ')[0]}'s Store</h1>
          </div>
          <button className="primary-action-btn" onClick={() => navigate('/add-product')}>
            <Plus size={18} strokeWidth={2.5} /><span>New Listing</span>
          </button>
        </header>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="stat-top">
                <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                  <stat.icon size={22} strokeWidth={2} />
                </div>
                <span className="stat-trend" style={{ color: stat.color }}>
                  <ArrowUpRight size={14} /> {stat.trend}
                </span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-content-grid">
          {/* Products Table */}
          <section className="dashboard-section products-section">
            <div className="section-header">
              <div>
                <h2>Inventory</h2>
                <p className="section-sub">{vendorProducts.length} product{vendorProducts.length !== 1 ? 's' : ''} listed</p>
              </div>
              <button className="text-link-btn" onClick={() => navigate('/add-product')}>
                <List size={16} /><span>Full Catalog</span>
              </button>
            </div>

            <div className="products-table-wrapper">
              {vendorProducts.length > 0 ? (
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorProducts.map(product => (
                      <tr key={product.id}>
                        <td className="product-cell">
                          <img src={product.image} alt="" />
                          <div className="product-name-info">
                            <span className="p-name">{product.name}</span>
                            <span className="p-id">#{product.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td><span className="table-tag">{product.category}</span></td>
                        <td className="price-cell">₦{product.price.toLocaleString()}</td>
                        <td><span className="status-pill active">In Stock</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="icon-btn-sml" title="View" onClick={() => navigate(`/product/${product.id}`)}><ExternalLink size={16} /></button>
                            <button className="icon-btn-sml" title="Edit"><Edit size={16} /></button>
                            <button className="icon-btn-sml delete" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="dashboard-empty-state">
                  <div className="empty-icon-box"><Package size={48} strokeWidth={1.2} /></div>
                  <h3>No products yet</h3>
                  <p>Add your first product to start selling on the marketplace.</p>
                  <button className="secondary-btn" onClick={() => navigate('/add-product')}>
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Recent Sales */}
          <section className="dashboard-section sales-section">
            <div className="section-header">
              <div>
                <h2>Recent Sales</h2>
                <p className="section-sub">{vendorSales.length} order{vendorSales.length !== 1 ? 's' : ''}</p>
              </div>
              <BarChart3 size={18} color="#94a3b8" />
            </div>
            <div className="activity-list">
              {vendorSales.length > 0 ? (
                vendorSales.map(order => (
                  <div key={order.id} className="activity-item">
                    <div className="activity-icon-box"><TrendingUp size={18} /></div>
                    <div className="activity-details">
                      <div className="activity-title">Order #{order.id.slice(0, 6).toUpperCase()}</div>
                      <div className="activity-meta">₦{order.total.toLocaleString()} · {order.status}</div>
                    </div>
                    <button className="activity-action-btn"><ChevronRight size={16} /></button>
                  </div>
                ))
              ) : (
                <div className="dashboard-empty-state small">
                  <TrendingUp size={32} strokeWidth={1.2} color="#cbd5e1" />
                  <p>No sales yet. Share your listings to get started.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
