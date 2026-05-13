import React, { useState, ChangeEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Search as SearchIcon, X } from 'lucide-react';
import { Category as CategoryType, Product } from '../../types';
import './Category.css';

export default function Category() {
  const { products, vendors, categories, addToCart, addToRecentlySearched } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';
  const initialSearch = queryParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Update search query if URL changes (from history click)
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q) setSearchQuery(q);
  }, [location.search]);

  // Search History Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        addToRecentlySearched(searchQuery.trim());
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [searchQuery, addToRecentlySearched]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <div className="search-page animate-fade-in">
      <div className="search-header-stick">
        <div className="search-input-container">
          <SearchIcon size={20} className="search-icon" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search for items, food..." 
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="category-pills">
          <button 
            className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {(categories as CategoryType[]).map(cat => (
            <button 
              key={cat.id}
              className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="search-results">
        <p className="results-count">
          Showing {filteredProducts.length} results
        </p>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);
              return (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  vendor={vendor}
                  onAddClick={handleAddToCart}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No products found for your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
