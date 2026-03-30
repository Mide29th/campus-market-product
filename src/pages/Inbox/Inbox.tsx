import React, { useState } from 'react';
import { Search, ChevronRight, MessageSquare, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import Header from '../../components/Header/Header';
import './Inbox.css';

export default function Inbox() {
  const { conversations } = useShop();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => 
    conv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="inbox-page-container">
      <Header 
        title="Inbox" 
        showBack={true} 
        onBack={() => navigate('/profile')} 
      />
      
      <div className="inbox-content scroll-y">
        {/* Search Bar */}
        <div className="inbox-search-container">
          <div className="search-wrapper glass-panel">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="filter-btn">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="conversation-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <div 
                key={conv.id} 
                className="conversation-card glass-panel active-bounce"
                onClick={() => navigate(`/chat/${conv.vendorId}`)}
              >
                <div className="conv-avatar">
                  <img src={conv.vendorImage} alt={conv.vendorName} />
                  {conv.unreadCount > 0 && <span className="unread-dot"></span>}
                </div>
                <div className="conv-info">
                  <div className="conv-header">
                    <h3>{conv.vendorName}</h3>
                    <span className="conv-time">{formatDate(conv.lastMessageTime)}</span>
                  </div>
                  <p className={`conv-last-msg ${conv.unreadCount > 0 ? 'unread' : ''}`}>
                    {conv.lastMessage}
                  </p>
                </div>
                <ChevronRight size={18} className="conv-arrow" />
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <MessageSquare size={48} />
              </div>
              <h3>No Messages Yet</h3>
              <p>Start a conversation with a vendor to see it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
