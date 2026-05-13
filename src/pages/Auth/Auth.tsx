import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import { Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Auth() {
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'vendor'>('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // [PROD] Used for email verification message
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  // 2. Handle Countdown Timer for Rate Limits
  useEffect(() => {
    if (errorMsg.includes('seconds')) {
      const match = errorMsg.match(/(\d+)/);
      if (match) {
        setCountdown(parseInt(match[1]));
      }
    } else {
      setCountdown(null);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setErrorMsg(''); // Clear error when timer is done
      setCountdown(null);
    }
  }, [countdown]);

  // 3. If the user is already logged in, send them straight to the app
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const sanitizedEmail = email.trim();
      
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              role: role,
              walletBalance: 0 
            }
          }
        });
        if (error) throw error;

        /* [PROD] UNCOMMENT THIS BLOCK FOR EMAIL VERIFICATION
        if (data.user && data.session === null) {
          setSuccessMsg('Check your email for the confirmation link!');
          setEmail('');
          setPassword('');
          setName('');
        }
        */

        // With "Confirm email" OFF in Supabase, data.session will be present immediately.
        // The AuthContext will pick this up and redirect the user automatically.
      }
    } catch (error: any) {
      console.error('Auth Error Details:', error);
      setErrorMsg(error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-split-layout">
        {/* Left Side: Branding (Visible on Desktop) */}
        <div className="auth-branding-section">
          <div className="branding-content">
            <h1 className="logo-text">VENDORA</h1>
            <p className="tagline">The ultimate campus marketplace. Buy, sell, and connect with ease.</p>
            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span className="feature-text">Built for your campus</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <span className="feature-text">Verified student community</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Instant messaging & trade</span>
              </div>
            </div>
          </div>
          <div className="branding-bg-overlay"></div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-section">
          <div className="auth-container glass-panel">

            {/* Mobile-only branding — hidden on desktop where the left panel shows */}
            <div className="mobile-auth-brand">
              <div className="mobile-logo-mark">V</div>
              <h1 className="mobile-logo-text">VENDORA</h1>
              <p className="mobile-logo-sub">The campus marketplace</p>
            </div>

            <div className="auth-header">
              <h2 className="gradient-text">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="subtitle">{isLogin ? 'Sign in to your account' : 'Join the campus community'}</p>
            </div>

            <form className="auth-form" onSubmit={handleAuth}>
              {errorMsg && (
                <div className="auth-error-message animate-slide-up">
                  {countdown !== null && countdown > 0 
                    ? `Please wait ${countdown}s before retrying` 
                    : errorMsg}
                </div>
              )}

              {/* [PROD] UNCOMMENT THIS BLOCK FOR EMAIL VERIFICATION */}
              {successMsg && (
                <div className="auth-success-message animate-slide-up" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', textAlign: 'center' }}>
                  {successMsg}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group role-selector">
                    <label>Account Type</label>
                    <div className="role-options">
                      <button
                        type="button"
                        className={`role-btn ${role === 'student' ? 'active' : ''}`}
                        onClick={() => setRole('student')}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        className={`role-btn ${role === 'vendor' ? 'active' : ''}`}
                        onClick={() => setRole('vendor')}
                      >
                        Vendor
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button 
                fullWidth 
                type="submit" 
                variant="primary" 
                disabled={loading || (countdown !== null && countdown > 0)}
                className="auth-submit-btn"
              >
                {loading ? (
                  <span className="btn-loader-content">
                    <span className="spinner"></span>
                    Processing...
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "New here? " : "Joined already? "}
                <button 
                  className="switch-mode-btn"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrorMsg('');
                    setSuccessMsg('');
                    setEmail('');
                    setPassword('');
                    setName('');
                    setShowPassword(false);
                  }}
                >
                  {isLogin ? 'Create an account' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
