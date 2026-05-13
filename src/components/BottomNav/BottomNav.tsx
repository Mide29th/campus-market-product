import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { Home, ShoppingCart, User as UserIcon, LayoutGrid, LucideIcon, PlusSquare, BarChart3 } from 'lucide-react';
import './BottomNav.css';

interface NavTab { id: string; icon: LucideIcon; label: string; badge?: number; }
interface BottomNavProps { activeTab?: string; onTabChange?: (tabId: string) => void; }

export default function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
  const { cartItemCount } = useShop();
  const { viewMode, user } = useAuth();

  const buyingTabs: NavTab[] = [
    { id: 'home',    icon: Home,         label: 'Home' },
    { id: 'search',  icon: LayoutGrid,   label: 'Categories' },
    { id: 'cart',    icon: ShoppingCart, label: 'Cart', badge: cartItemCount },
    { id: 'profile', icon: UserIcon,     label: 'Account' },
  ];

  const sellingTabs: NavTab[] = [
    { id: 'dashboard',   icon: BarChart3,  label: 'Dashboard' },
    { id: 'add-product', icon: PlusSquare, label: 'Add' },
    { id: 'orders',      icon: LayoutGrid, label: 'Sales' },
    { id: 'profile',     icon: UserIcon,   label: 'Account' },
  ];

  // Students always see buying tabs; only vendors in selling mode see vendor tabs
  const isVendorSelling = user?.role === 'vendor' && viewMode === 'selling';
  const tabs = isVendorSelling ? sellingTabs : buyingTabs;

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange(tab.id)}>
            <div className="icon-wrapper">
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {tab.badge ? <span className="nav-badge">{tab.badge}</span> : null}
            </div>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
