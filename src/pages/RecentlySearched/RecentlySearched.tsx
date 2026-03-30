import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Trash2, Clock } from 'lucide-react';
import './RecentlySearched.css';

export default function RecentlySearched() {
  const { recentlySearched, clearRecentlySearched } = useShop();
  const navigate = useNavigate();

  const handleSearchClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="search-history-page animate-fade-in">
      <div className="page-header">
        <button className="back-btn active-bounce" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Recent Searches</h1>
        {recentlySearched.length > 0 && (
          <button className="clear-all-btn" onClick={clearRecentlySearched}>
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {recentlySearched.length > 0 ? (
        <div className="search-history-list">
          {recentlySearched.map(history => (
            <div 
              key={history.id} 
              className="search-history-item glass-panel active-bounce"
              onClick={() => handleSearchClick(history.query)}
            >
              <div className="search-icon-wrapper">
                <Clock size={16} />
              </div>
              <div className="search-content">
                <span className="search-query">{history.query}</span>
                <span className="search-time">{new Date(history.timestamp).toLocaleDateString()}</span>
              </div>
              <Search size={16} style={{ opacity: 0.3 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <div className="empty-icon-wrapper">
            <Search size={48} className="empty-icon" />
          </div>
          <h3>No search history</h3>
          <p>Your recent searches will be saved here so you can quickly find them again.</p>
          <button 
            className="explore-btn active-bounce"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </div>
      )}
    </div>
  );
}
