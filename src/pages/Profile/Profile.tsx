import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  LogOut, 
  Package, 
  CreditCard, 
  HelpCircle, 
  Store, 
  Mail, 
  Star, 
  Heart, 
  Users, 
  History, 
  Search, 
  MapPin, 
  Settings, 
  UserX, 
  ChevronRight,
  Wallet,
  Camera
} from 'lucide-react';
import Button from '../../components/Button/Button';
import TopUpModal from '../../components/TopUpModal/TopUpModal';
import './Profile.css';

export default function Profile() {
  const { user, setUserRole, updateUserAvatar } = useShop();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const handleAvatarChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleToggle = () => {
    if (user.role === 'student') {
      setUserRole('vendor');
    } else {
      setUserRole('student');
    }
  };

  return (
    <div className="profile-page animate-fade-in">
      {/* Hidden file input for avatar selection */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />
      {/* 1. Header & Wallet */}
      <div className="profile-header-section glass-panel">
        <div className="profile-user-brief">
          <div className="profile-avatar-container" onClick={handleAvatarChange}>
            <div className="profile-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="avatar-edit-overlay">
              <Camera size={16} />
            </div>
          </div>
          <div className="profile-meta">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span>
        </div>
        
        <div className="wallet-strip">
          <div className="wallet-info">
            <Wallet size={20} className="text-primary" />
            <div className="wallet-details">
              <span className="wallet-label">Wallet Balance</span>
              <span className="wallet-amount">₦{user.walletBalance.toLocaleString()}</span>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            className="topup-btn"
            onClick={() => setIsTopUpOpen(true)}
          >
            Top Up
          </Button>
        </div>
      </div>

      <TopUpModal 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)} 
      />

      {/* 2. Need Assistance? */}
      <section className="profile-section">
        <h3 className="section-title">Need Assistance?</h3>
        <div className="menu-group glass-panel">
          <div className="menu-item active-bounce">
            <div className="menu-icon-bg"><HelpCircle size={18} /></div>
            <div className="menu-text">Help and Support</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
        </div>
      </section>

      {/* 3. My VENDORA Account */}
      <section className="profile-section">
        <h3 className="section-title">My VENDORA Account</h3>
        <div className="menu-group glass-panel">
          <div className="menu-item active-bounce" onClick={() => navigate('/orders')}>
            <div className="menu-icon-bg"><Package size={18} /></div>
            <div className="menu-text">Orders</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce" onClick={() => navigate('/inbox')}>
            <div className="menu-icon-bg"><Mail size={18} /></div>
            <div className="menu-text">Inbox</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce">
            <div className="menu-icon-bg"><Star size={18} /></div>
            <div className="menu-text">Rating and Reviews</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce" onClick={() => navigate('/wishlist')}>
            <div className="menu-icon-bg"><Heart size={18} /></div>
            <div className="menu-text">Wishlist</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce">
            <div className="menu-icon-bg"><Users size={18} /></div>
            <div className="menu-text">Followed Sellers</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce" onClick={() => navigate('/recently-viewed')}>
            <div className="menu-icon-bg"><History size={18} /></div>
            <div className="menu-text">Recently Viewed</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce" onClick={() => navigate('/recently-searched')}>
            <div className="menu-icon-bg"><Search size={18} /></div>
            <div className="menu-text">Recently Searched</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
        </div>
      </section>

      {/* 4. My Settings */}
      <section className="profile-section">
        <h3 className="section-title">My Settings</h3>
        <div className="menu-group glass-panel">
          <div className="menu-item active-bounce" onClick={() => navigate('/payment-settings')}>
            <div className="menu-icon-bg"><CreditCard size={18} /></div>
            <div className="menu-text">Payment Settings</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce">
            <div className="menu-icon-bg"><MapPin size={18} /></div>
            <div className="menu-text">Address Book</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce">
            <div className="menu-icon-bg"><Settings size={18} /></div>
            <div className="menu-text">Account Management</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
          <div className="menu-item active-bounce text-danger">
            <div className="menu-icon-bg danger-light"><UserX size={18} /></div>
            <div className="menu-text">Close Account</div>
            <ChevronRight size={16} className="menu-arrow" />
          </div>
        </div>
      </section>

      {/* Persona Switch & Logout */}
      <div className="profile-actions">
        <Button 
          variant="outline" 
          fullWidth 
          className="mb-3 switch-btn"
          onClick={handleRoleToggle}
        >
          <Store size={18} className="mr-2" />
          Switch to {user.role === 'student' ? 'Vendor' : 'Student'} Account
        </Button>
        <Button variant="outline" fullWidth className="logout-btn text-danger">
          <LogOut size={18} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
