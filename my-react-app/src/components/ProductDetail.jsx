import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PRODUCT_URL, WISHLIST_URL, CART_URL } from '../constants/api';
import { authFetch, isAuthenticated } from '../constants/auth';
import Loader from './Loader';

function ProductDetail({ onWishlistChange, onCartChange, cartProductIds = [], removeFromCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [cartBusy, setCartBusy] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch(`${PRODUCT_URL}/${id}`);
        if (res.ok) setProduct(await res.json());
        else setProduct(null);
      } catch { setProduct(null); }
      // Check if in wishlist
      if (isAuthenticated()) {
        try {
          const wRes = await authFetch(WISHLIST_URL);
          if (wRes.ok) {
            const wl = await wRes.json();
            setWishlisted(wl.some(p => (p._id || p) === id));
          }
        } catch { /* silent */ }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const toggleWishlist = async () => {
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
        if (onWishlistChange) onWishlistChange();
      }
    } catch { /* silent */ }
    setWishBusy(false);
  };

  const inCart = cartProductIds.includes(id);

  const addToCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (cartBusy) return;
    const size = selectedSize || product.sizes?.[0]?.size || 'Free Size';
    setCartBusy(true);
    try {
      const res = await authFetch(CART_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, size, qty }),
      });
      if (res.ok && onCartChange) onCartChange();
    } catch { /* silent */ }
    setCartBusy(false);
  };

  if (loading) return <Loader message="Loading product…" />;

  if (!product) {
    return (
      <div className="pd-not-found">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const isOutOfStock = product.isActive === false;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <svg key={i} className="star filled" width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
          </svg>
        );
      } else if (i - rating < 1) {
        stars.push(
          <svg key={i} className="star half" width="16" height="16" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`pd-half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d5d0c8" />
              </linearGradient>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#pd-half-${i})`} />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="star empty" width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
          </svg>
        );
      }
    }
    return stars;
  };

  const hasSizes = product?.sizes?.length > 0;
  const selectedSizeObj = hasSizes ? product.sizes.find(s => s.size === selectedSize) : null;
  const maxQty = hasSizes ? (selectedSizeObj?.stock || 0) : Infinity;
  const sizeSelected = !hasSizes || !!selectedSize;

  return (
    <>
    <div className="pd-container">
      <button className="pd-back" onClick={() => navigate(-1)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="pd-main">
        {/* Image Section */}
        <div className="pd-image-section">
          <div className={`pd-image-wrapper${isOutOfStock ? ' pd-oos' : ''}`}>
            <img src={product.image} alt={product.name} className="pd-image" />
            {isOutOfStock && <div className="pd-oos-overlay"><span>Out of Stock</span></div>}
            {!isOutOfStock && product.badge && <span className={`pd-badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}
            {!isOutOfStock && discount > 0 && <span className="pd-discount-badge">-{discount}%</span>}
          </div>
        </div>

        {/* Info Section */}
        <div className="pd-info-section">
          <span className="pd-breadcrumb">{product.category} / {product.subcategory}</span>
          <h1 className="pd-title">{product.name}</h1>
          <p className="pd-code">Code: {product.productCode}</p>

          {product.rating > 0 && (
            <div className="pd-rating-row">
              <div className="stars">{renderStars(product.rating)}</div>
              <span className="pd-rating-text">{product.rating}</span>
              <span className="pd-review-count">({Array.isArray(product.reviews) ? product.reviews.length : product.reviews} reviews)</span>
            </div>
          )}

          <div className="pd-pricing">
            <span className="pd-current-price">₹{product.price.toLocaleString()}</span>
            <span className="pd-original-price">₹{product.originalPrice.toLocaleString()}</span>
            {discount > 0 && <span className="pd-save">You save ₹{(product.originalPrice - product.price).toLocaleString()} ({discount}%)</span>}
          </div>

          <p className="pd-description">{product.description}</p>

          {/* Details Grid */}
          <div className="pd-details-grid">
            <div className="pd-detail-item">
              <span className="pd-detail-label">Material</span>
              <span className="pd-detail-value">{product.material}</span>
            </div>
            <div className="pd-detail-item">
              <span className="pd-detail-label">Weight</span>
              <span className="pd-detail-value">{product.weight}</span>
            </div>
            <div className="pd-detail-item">
              <span className="pd-detail-label">Dimensions</span>
              <span className="pd-detail-value">{product.dimensions}</span>
            </div>
            <div className="pd-detail-item">
              <span className="pd-detail-label">Care</span>
              <span className="pd-detail-value">{product.careInstructions}</span>
            </div>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="pd-option-group">
              <span className="pd-option-label">Colors</span>
              <div className="pd-option-chips">
                {product.colors.map(c => <span key={c} className="pd-chip">{c}</span>)}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="pd-option-group">
              <div className="pd-size-header">
                <span className="pd-option-label">Sizes</span>
                <button className="pd-size-chart-toggle" onClick={() => setShowSizeChart(!showSizeChart)}>
                  {showSizeChart ? 'Hide' : 'Size Chart'}
                </button>
              </div>
              {showSizeChart && (
                <table className="pd-size-chart">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>S</th>
                      <th>M</th>
                      <th>L</th>
                      <th>XL</th>
                      <th>XXL</th>
                      <th>3XL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Body (in)</td>
                      <td>36</td>
                      <td>38</td>
                      <td>40</td>
                      <td>42</td>
                      <td>44</td>
                      <td>46</td>
                    </tr>
                  </tbody>
                </table>
              )}
              <div className="pd-option-chips">
                {product.sizes.map(s => (
                  <span key={s.size} className={`pd-chip ${s.stock === 0 ? 'pd-chip-oos' : ''}${selectedSize === s.size ? ' pd-chip-selected' : ''}`}
                    onClick={() => { if (s.stock > 0) { setSelectedSize(s.size); setQty(1); } }}
                    style={{ cursor: s.stock > 0 ? 'pointer' : 'default' }}>
                    {s.size} {s.stock > 0 && <small>({s.stock})</small>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="pd-tags">
              {product.tags.map(t => <span key={t} className="pd-tag">#{t}</span>)}
            </div>
          )}

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="pd-quantity">
              <span className="pd-option-label">Quantity</span>
              {!sizeSelected ? (
                <span className="pd-qty-hint">Please select a size first</span>
              ) : (
                <div className="pd-qty-controls">
                  <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                  <span className="pd-qty-value">{qty}</span>
                  <button className="pd-qty-btn" onClick={() => setQty(q => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}>+</button>
                  {maxQty < Infinity && <span className="pd-qty-hint">({maxQty} available)</span>}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pd-actions">
            {isOutOfStock ? (
              <span className="pd-oos-label">Out of Stock</span>
            ) : (
              <>
                <button className="pd-btn pd-btn-cart" onClick={inCart ? async () => { if (removeFromCart) await removeFromCart(id); } : addToCart} disabled={cartBusy}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  {inCart ? 'In Cart — Remove' : cartBusy ? 'Adding...' : 'Add to Cart'}
                </button>
                <button className="pd-btn pd-btn-buy" onClick={() => {
                  const checkoutState = { product, qty, selectedSize: selectedSize || product.sizes?.[0]?.size || 'Free Size' };
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
                <button className={`pd-btn-wishlist${wishlisted ? ' wishlisted' : ''}`} title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'} onClick={toggleWishlist} disabled={wishBusy}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {Array.isArray(product.reviews) && product.reviews.length > 0 && (
        <div className="pd-reviews">
          <h2 className="pd-reviews-title">Customer Reviews</h2>
          <div className="pd-reviews-list">
            {product.reviews.map((r, idx) => (
              <div key={idx} className="pd-review-card">
                <div className="pd-review-header">
                  <span className="pd-review-avatar">{r.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <span className="pd-review-name">{r.name}</span>
                    <div className="stars">{renderStars(r.rating)}</div>
                  </div>
                </div>
                <p className="pd-review-text">{r.review}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default ProductDetail;
