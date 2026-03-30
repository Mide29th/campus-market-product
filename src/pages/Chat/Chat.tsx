import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Phone, Info, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import Header from '../../components/Header/Header';
import './Chat.css';

export default function Chat() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { user, conversations, sendMessage, getVendorById } = useShop();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const vendor = getVendorById(Number(vendorId));
  const conversation = conversations.find(c => c.vendorId === Number(vendorId));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const handleSend = () => {
    if (inputText.trim() && vendorId) {
      sendMessage(Number(vendorId), inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!vendor) return <div className="chat-error">Vendor not found</div>;

  return (
    <div className="chat-page-container">
      <Header 
        title={vendor.name} 
        showBack={true} 
        onBack={() => navigate('/inbox')}
        rightElement={
          <div className="chat-header-actions">
            <Phone size={20} className="header-action-icon" />
            <MoreVertical size={20} className="header-action-icon" />
          </div>
        }
      />
      
      <div className="chat-messages-container scroll-y">
        <div className="chat-disclaimer glass-panel">
          <Info size={14} />
          <span>Messages are protected and private.</span>
        </div>

        {conversation?.messages.map((msg, idx) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id || idx} className={`message-wrapper ${isMe ? 'me' : 'them'}`}>
              {!isMe && (
                <div className="message-avatar">
                  <img src={vendor.image} alt={vendor.name} />
                </div>
              )}
              <div className="message-bubble glass-panel">
                <p>{msg.text}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container glass-panel">
        <button className="chat-attach-btn">
          <ImageIcon size={22} />
        </button>
        <div className="chat-input-wrapper">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <button 
          className={`chat-send-btn ${inputText.trim() ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
