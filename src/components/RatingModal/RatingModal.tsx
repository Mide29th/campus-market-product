import React, { useState, ChangeEvent } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { Star } from 'lucide-react';
import './RatingModal.css';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName?: string;
}

export default function RatingModal({ isOpen, onClose, vendorName }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    // Mock submission
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      // Reset after closing
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setReview('');
      }, 500);
    }, 1500);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Rate ${vendorName || 'the Vendor'}`}
    >
      {submitted ? (
        <div className="rating-success animate-slide-up">
          <div className="rating-success-icon">🎉</div>
          <h3>Thank you!</h3>
          <p>Your review helps us maintain a trusted campus marketplace.</p>
        </div>
      ) : (
        <div className="rating-form">
          <p className="rating-subtitle">How was your experience?</p>
          
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="star-btn active-bounce"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star 
                  size={40} 
                  fill={(hoverRating || rating) >= star ? 'var(--color-warning)' : 'transparent'} 
                  color={(hoverRating || rating) >= star ? 'var(--color-warning)' : 'var(--color-border)'}
                />
              </button>
            ))}
          </div>
          
          <div className="review-input-group">
            <label htmlFor="review-text">Leave a review (optional)</label>
            <textarea 
              id="review-text"
              rows={4} 
              placeholder="The food was amazing, delivery was fast..."
              value={review}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
              className="review-textarea"
            ></textarea>
          </div>
          
          <Button 
            fullWidth 
            onClick={handleSubmit} 
            disabled={rating === 0}
            className="mt-4"
          >
            Submit Review
          </Button>
        </div>
      )}
    </Modal>
  );
}
