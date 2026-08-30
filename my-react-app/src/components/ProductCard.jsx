import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WISHLIST_URL, CART_URL } from '../constants/api';
import { authFetch, isAuthenticated } from '../constants/auth';

function ProductCard({ product, onAddToCart, index = 0, wishlist = [], onWishlistChange, onCartChange, cartProductIds = [], removeFromCart }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const inCart = cartProductIds.includes(product._id);

  useEffect(() => {
    setWishlisted(wishlist.some(id => id === product._id));
  }, [wishlist, product._id]);

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (wishBusy) return;
    setWishBusy(true);
    try {
      const res = await authFetch(`${WISHLIST_URL}/${product._id}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWishlisted(data.wishlisted);
        if (onWishlistChange) onWishlistChange(data.wishlist);
      }
    } catch { /* silent */ }
    setWishBusy(false);
  };

  const addToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (cartBusy) return;
    setCartBusy(true);
    try {
      const res = await authFetch(CART_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, size: product.sizes?.[0]?.size || 'Free Size', qty: 1 }),
      });
      if (res.ok && onCartChange) onCartChange();
    } catch { /* silent */ }
    setCartBusy(false);
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${(index % 6) * 80}ms`;
          el.classList.add('card-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <svg key={i} className="star filled" width="11" height="11" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
          </svg>
        );
      } else if (i - rating < 1) {
        stars.push(
          <svg key={i} className="star half" width="11" height="11" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d5d0c8" />
              </linearGradient>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#half-${i})`} />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="star empty" width="11" height="11" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
          </svg>
        );
      }
    }
    return stars;
  };

  const isOutOfStock = product.isActive === false;

  return (
    <div ref={cardRef} className={`product-card card-animate${isOutOfStock ? ' out-of-stock' : ''}`} onClick={() => navigate(`/productDetail/${product._id}`)} style={{ cursor: 'pointer' }}>
      <div className="product-image-wrapper">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        {isOutOfStock && <div className="product-oos-overlay"><span>Out of Stock</span></div>}
        {!isOutOfStock && product.badge && <span className={`product-badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}
        {!isOutOfStock && discount > 0 && <span className="discount-badge">-{discount}%</span>}
        {!isOutOfStock && (
          <button className={`product-wishlist-btn${wishlisted ? ' wishlisted' : ''}`} title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'} onClick={toggleWishlist} disabled={wishBusy}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        )}
      </div>
      <div className="product-info">
        <span className="product-category">{product.subcategory}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-meta-row">
          <div className="product-meta-left">
            {product.rating > 0 && (
              <div className="product-rating">
                <div className="stars">{renderStars(product.rating)}</div>
                <span className="review-count">({Array.isArray(product.reviews) ? product.reviews.length : product.reviews})</span>
              </div>
            )}
            <a href="#" className="product-view-details">View Details →</a>
          </div>
          <div className="product-pricing">
            <span className="current-price">₹{product.price.toLocaleString()}</span>
            <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="product-actions">
          {isOutOfStock ? (
            <span className="oos-label">Out of Stock</span>
          ) : (
            <>
              <button className={`btn-action btn-cart${inCart ? ' in-cart' : ''}`} onClick={inCart ? async (e) => { e.stopPropagation(); if (removeFromCart) await removeFromCart(product._id); } : addToCart} disabled={cartBusy} title={inCart ? 'Remove from Cart' : 'Add to Cart'}>
                {inCart ? 'In Cart ✕' : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                )}
              </button>
              <button className="btn-action btn-buy" onClick={(e) => {
                e.stopPropagation();
                const checkoutState = { product, qty: 1, selectedSize: product.sizes?.[0]?.size || 'Free Size' };
                if (!isAuthenticated()) {
                  navigate('/login', {
                    state: {
                      from: window.location.pathname,
                      redirectTo: '/checkout',
                      redirectState: checkoutState,
                    },
                  });
                  return;
                }
                navigate('/checkout', { state: checkoutState });
              }}>Buy Now</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
