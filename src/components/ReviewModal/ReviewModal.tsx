import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import Button from '../Button/Button';
import './ReviewModal.css';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  productName: string;
}

export default function ReviewModal({ isOpen, onClose, onSubmit, productName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="review-modal glass-panel animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rate your experience</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <p className="product-context">How was your purchase of <strong>{productName}</strong>?</p>
          
          <div className="star-rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star size={32} fill={star <= (hover || rating) ? "currentColor" : "none"} />
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="review-form">
            <label htmlFor="comment">Tell us more (Optional)</label>
            <textarea
              id="comment"
              placeholder="What did you like or dislike?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="glass-panel"
            />
            
            <div className="modal-actions">
              <Button 
                variant="outline" 
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                disabled={rating === 0}
                type="submit"
              >
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
