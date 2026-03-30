import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './HeroBanner.css';

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

const slides: BannerSlide[] = [
  {
    id: 's1',
    title: '50% Off First Printing',
    subtitle: 'Get your term papers printed right on campus with lightning speed.',
    gradient: 'var(--color-gradient-1)',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=2070&auto=format&fit=crop',
    ctaText: 'Print Now',
    ctaLink: '/search?category=printing'
  },
  {
    id: 's2',
    title: 'Craving Late Night Snacks?',
    subtitle: 'Hot noodles, drinks, and pastries delivered to your hostel in minutes.',
    gradient: 'var(--color-gradient-3)',
    image: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?q=80&w=2086&auto=format&fit=crop',
    ctaText: 'Order Food',
    ctaLink: '/search?category=food'
  },
  {
    id: 's3',
    title: 'Sell Your Old Textbooks',
    subtitle: 'Free up space and make money by selling course materials to juniors.',
    gradient: 'var(--color-gradient-2)',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1974&auto=format&fit=crop',
    ctaText: 'Start Selling',
    ctaLink: '/vendor'
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="hero-carousel">
      {slides.map((s, index) => (
        <div 
          key={s.id}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${s.image})` }}
        >
          {/* A gradient overlay for readability and premium feel */}
          <div className="hero-overlay" style={{ background: `linear-gradient(to right, ${s.gradient.replace('linear-gradient(135deg, ', '').replace(')', '')} 0%, transparent 100%)` }}>
            <div className="hero-content">
              <span className="hero-badge glass-panel">Featured Deal</span>
              <h2 className="animate-slide-up" style={{ animationDelay: '0.1s' }}>{s.title}</h2>
              <p className="animate-slide-up" style={{ animationDelay: '0.2s' }}>{s.subtitle}</p>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Button 
                  variant="primary" 
                  onClick={() => navigate(s.ctaLink)}
                  style={{ background: s.gradient, border: 'none' }}
                >
                  {s.ctaText} <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Pagination dots */}
      <div className="hero-pagination glass-panel">
        {slides.map((_, index) => (
          <button 
            key={index} 
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
