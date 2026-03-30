import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Clock } from 'lucide-react';
import Button from '../../components/Button/Button';
import { Product } from '../../types';
import './VendorDashboard.css';

interface Order {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: 'pending' | 'accepted' | 'ready' | 'delivered';
  time: string;
}

export default function VendorDashboard() {
  const { user, products } = useShop();
  const navigate = useNavigate();

  // If a student tries to access vendor dashboard, redirect them
  if (user.role !== 'vendor') {
    return (
      <div className="p-4 text-center mt-8">
        <h2>Unauthorized Access</h2>
        <p>You must be signed in as a vendor to view this page.</p>
        <Button onClick={() => navigate('/profile')} className="mt-4">Go to Profile to Switch Roles</Button>
      </div>
    );
  }

  // Filter products for this specific vendor
  const vendorProducts = products.filter(p => p.vendorId === user.id);

  // Mock Active Orders
  const [activeOrders, setActiveOrders] = useState<Order[]>([
    { id: '#ORD-1092', customer: 'Alex Johnson', items: 2, total: 3000, status: 'pending', time: '5m ago' },
    { id: '#ORD-1091', customer: 'Sarah D.', items: 1, total: 1200, status: 'accepted', time: '15m ago' },
    { id: '#ORD-1088', customer: 'Michael T.', items: 4, total: 5500, status: 'ready', time: '1h ago' }
  ]);

  const handleUpdateStatus = (orderId: string, currentStatus: Order['status']) => {
    setActiveOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        let nextStatus: Order['status'] = currentStatus;
        if (currentStatus === 'pending') nextStatus = 'accepted';
        else if (currentStatus === 'accepted') nextStatus = 'ready';
        else if (currentStatus === 'ready') nextStatus = 'delivered';
        return { ...order, status: nextStatus };
      }
      return order;
    }));
  };

  const getStatusBadge = (status: Order['status']) => {
    const map: Record<Order['status'], { color: string; label: string }> = {
      'pending': { color: 'var(--color-warning)', label: 'Pending' },
      'accepted': { color: 'var(--color-primary)', label: 'Preparing' },
      'ready': { color: 'var(--color-success)', label: 'Ready for Pickup' },
      'delivered': { color: 'var(--color-text-muted)', label: 'Completed' }
    };
    const mapped = map[status];
    return <span className="order-status-badge" style={{ backgroundColor: mapped.color + '20', color: mapped.color }}>{mapped.label}</span>;
  }

  return (
    <div className="vendor-dashboard animate-fade-in">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back, {user.name}</p>
      </div>

      <div className="stats-grid mt-4">
        <div className="stat-card">
          <div className="stat-icon-wrapper sales"><TrendingUp size={20} /></div>
          <div className="stat-content">
            <span className="stat-value">₦45,000</span>
            <span className="stat-label">Today's Sales</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orders"><Package size={20} /></div>
          <div className="stat-content">
            <span className="stat-value">12</span>
            <span className="stat-label">Active Orders</span>
          </div>
        </div>
      </div>

      <section className="dashboard-section mt-6">
        <div className="section-header-flex">
          <h3>Active Orders</h3>
          <span className="badge-count">{activeOrders.filter(o => o.status !== 'delivered').length}</span>
        </div>
        
        <div className="orders-list">
          {activeOrders.filter(o => o.status !== 'delivered').length === 0 ? (
             <div className="empty-state">No active orders right now.</div>
          ) : (
            activeOrders.filter(o => o.status !== 'delivered').map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">{order.id}</span>
                    <span className="order-time"><Clock size={12} /> {order.time}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="order-details">
                  <div className="order-customer">
                    <span className="label">Customer:</span> {order.customer}
                  </div>
                  <div className="order-items-total">
                    <span className="label">Items:</span> {order.items} • <span className="font-bold text-primary">₦{order.total.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="order-actions">
                  <Button 
                    fullWidth 
                    size="sm" 
                    variant={order.status === 'pending' ? 'primary' : 'outline'}
                    onClick={() => handleUpdateStatus(order.id, order.status)}
                  >
                    {order.status === 'pending' ? 'Accept Order' : 
                     order.status === 'accepted' ? 'Mark Ready' : 'Mark Delivered'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-section mt-6">
        <div className="section-header-flex">
          <h3>My Products ({vendorProducts.length})</h3>
          <Button size="sm" variant="outline" className="add-prod-btn">+ Add</Button>
        </div>
        
        <div className="vendor-products-list">
          {vendorProducts.slice(0, 3).map((product: Product) => (
            <div key={product.id} className="vendor-prod-item">
              <img src={product.image} alt={product.name} />
              <div className="vendor-prod-info">
                <h4>{product.name}</h4>
                <span className="price">₦{product.price.toLocaleString()}</span>
              </div>
              <div className="stock-info">
                Stock: {product.stock}
              </div>
            </div>
          ))}
          {vendorProducts.length > 3 && (
            <div className="view-all-text text-center mt-2 text-primary font-bold">
              View all products
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
