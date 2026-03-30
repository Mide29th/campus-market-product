import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
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

  // If the user is already logged in, send them straight to the app
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
        const { error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              role: role,
              walletBalance: 0 // initial balance
            }
          }
        });
        if (error) throw error;
        // On success, Supabase either logs them in or sends a verification email 
        // depending on project settings.
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-container glass-panel">
        <div className="auth-header">
          <h1 className="gradient-text">{isLogin ? 'Welcome Back!' : 'Join VENDORA'}</h1>
          <p>{isLogin ? 'Sign in to access your account.' : 'Create an account to start buying and selling on campus.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          {errorMsg && <div className="auth-error-message animate-slide-up">{errorMsg}</div>}

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group role-selector">
                <label>I want to:</label>
                <div className="role-options">
                  <button
                    type="button"
                    className={`role-btn ${role === 'student' ? 'active' : ''}`}
                    onClick={() => setRole('student')}
                  >
                    Buy (Student)
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'vendor' ? 'active' : ''}`}
                    onClick={() => setRole('vendor')}
                  >
                    Sell (Vendor)
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">School Email</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. alex@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            fullWidth 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="mt-6"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="auth-footer mt-6 text-center">
          <p className="text-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="text-primary font-bold bg-transparent border-0 cursor-pointer p-0 underline-on-hover"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
