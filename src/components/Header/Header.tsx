import React, { ReactNode } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import './Header.css';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: ReactNode;
}

export default function Header({ 
  title, 
  showBack = false, 
  onBack,
  rightElement
}: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useShop();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  return (
    <header className="cmp-header glass-panel">
      {/* Left side: Back Button OR Creative Identity */}
      <div className="header-left">
        {showBack ? (
          <button className="icon-btn active-bounce" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div 
            className={`header-identity ${user?.avatarUrl ? 'has-avatar' : ''} active-bounce`} 
            onClick={() => navigate('/profile')}
          >
            <div className="header-user-avatar">
              <div className="avatar-inner">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
                ) : (
                  user ? getInitials(user.name) : 'V'
                )}
              </div>
              <div className="avatar-glow"></div>
            </div>
            {user?.avatarUrl && (
              <span className="header-user-name">
                {getFirstName(user.name)}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Center: Brand Title */}
      <div className="header-center">
        <div className="brand-title" onClick={() => navigate('/')}>
          {title}
        </div>
      </div>
      
      {/* Right side: Notifications */}
      <div className="header-right">
        {rightElement || (
          <button className="icon-btn active-bounce notification-btn" aria-label="Notifications">
            <Bell size={24} />
            {user && <span className="notification-dot"></span>}
          </button>
        )}
      </div>
    </header>
  );
}
