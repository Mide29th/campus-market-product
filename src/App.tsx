import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import BottomNav from './components/BottomNav/BottomNav';

// Contexts
import { ShopProvider } from './context/ShopContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Auth from './pages/Auth/Auth';
import Home from './pages/Home/Home';
import Category from './pages/Category/Category';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess/CheckoutSuccess';
import Profile from './pages/Profile/Profile';
import VendorDashboard from './pages/VendorDashboard/VendorDashboard';
import Inbox from './pages/Inbox/Inbox';
import Chat from './pages/Chat/Chat';
import Orders from './pages/Orders/Orders';
import Wishlist from './pages/Wishlist/Wishlist';
import RecentlyViewed from './pages/RecentlyViewed/RecentlyViewed';
import RecentlySearched from './pages/RecentlySearched/RecentlySearched';
import PaymentSettings from './pages/PaymentSettings/PaymentSettings';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>; // Could be a better spinner
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/search')) return 'search';
    if (path.startsWith('/cart')) return 'cart';
    if (path.startsWith('/profile') || path.startsWith('/vendor')) return 'profile';
    return 'home';
  };

  const handleTabChange = (tabId: string) => {
    switch(tabId) {
      case 'home': navigate('/'); break;
      case 'search': navigate('/search'); break;
      case 'cart': navigate('/cart'); break;
      case 'profile': navigate('/profile'); break;
      default: navigate('/');
    }
  };

  // Do not show BottomNav or App Header on specific pages
  const isAuthPage = location.pathname === '/auth';
  const isProductDetails = location.pathname.startsWith('/product/');
  const isCheckoutSuccess = location.pathname === '/checkout/success';
  const isMessaging = location.pathname === '/inbox' || location.pathname.startsWith('/chat');
  const hideShell = isAuthPage || isProductDetails || isCheckoutSuccess || isMessaging;

  return (
    <div className="app-container">
      {!hideShell && <Header title="VENDORA" />}
      <main className={`main-content ${hideShell ? 'no-padding' : ''}`}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Category /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="/chat/:vendorId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/recently-viewed" element={<ProtectedRoute><RecentlyViewed /></ProtectedRoute>} />
          <Route path="/recently-searched" element={<ProtectedRoute><RecentlySearched /></ProtectedRoute>} />
          <Route path="/payment-settings" element={<ProtectedRoute><PaymentSettings /></ProtectedRoute>} />
          <Route path="/vendor" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {!hideShell && <BottomNav activeTab={getActiveTab()} onTabChange={handleTabChange} />}
    </div>
  );
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ShopProvider>
          <Router>
            <AppLayout />
          </Router>
        </ShopProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
