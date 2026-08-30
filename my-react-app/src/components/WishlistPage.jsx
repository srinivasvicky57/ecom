import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WISHLIST_URL, CART_URL } from '../constants/api'
import { authFetch, isAuthenticated } from '../constants/auth'
import Loader from './Loader'

/**
 * WishlistPage — standalone page at /wishlist showing saved items.
 * Users can remove items or move them to cart.
 */
function WishlistPage({ onWishlistChange, cartProductIds = [], onCartChange, removeFromCart }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [movedToCart, setMovedToCart] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    if (!isAuthenticated()) { setLoading(false); return }
    try {
      const res = await authFetch(WISHLIST_URL)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchWishlist() }, [])

  /** Remove a product from the wishlist */
  const handleRemove = async (id) => {
    try {
      const res = await authFetch(`${WISHLIST_URL}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(p => p._id !== id))
        if (onWishlistChange) onWishlistChange()
      }
    } catch { /* silent */ }
  }

  /** Add a product to the cart via API */
  const handleAddToCart = async (item) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }
    setMovedToCart(prev => [...prev, item._id]);
    try {
      await authFetch(CART_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item._id, size: item.sizes?.[0]?.size || 'Free Size', qty: 1 }),
      });
      if (onCartChange) onCartChange();
    } catch { /* silent */ }
    setTimeout(() => setMovedToCart(prev => prev.filter(x => x !== item._id)), 2000);
  };

  if (loading) return <Loader message="Loading wishlist…" />

  return (
    <div className="wl-page">
      {/* ── Page title bar ── */}
      <div className="page-title-bar">
        <h1 className="page-title-heading">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          My Wishlist
          <span className="page-count-badge">{items.length}</span>
        </h1>
        <button className="page-title-link" onClick={() => navigate('/cart')}>
          🛒 Go to Cart
        </button>
      </div>

      {/* ── Content ── */}
      <div className="wl-page-content">
        {items.length === 0 ? (
          <div className="wl-empty">
            <span className="wl-empty-icon">♡</span>
            <h2>Your wishlist is empty</h2>
            <p>Browse our collection and save items you love!</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Explore Products</button>
          </div>
        ) : (
          <div className="wl-grid">
            {items.map(item => (
              <div key={item._id} className="wl-card">
                <div className="wl-card-img-wrap">
                  <img src={item.image} alt={item.name} className="wl-card-img" />
                  {item.badge && <span className="wl-card-badge">{item.badge}</span>}
                  <button className="wl-card-remove" title="Remove from wishlist" onClick={() => handleRemove(item._id)}>✕</button>
                </div>

                <div className="wl-card-body">
                  <h3 className="wl-card-name">{item.name}</h3>
                  <p className="wl-card-desc">{item.description}</p>

                  <div className="wl-card-pricing">
                    <span className="wl-card-price">₹{item.price.toLocaleString()}</span>
                    <span className="wl-card-original">₹{item.originalPrice.toLocaleString()}</span>
                    <span className="wl-card-discount">{Math.round((1 - item.price / item.originalPrice) * 100)}% off</span>
                  </div>

                  <div className="wl-card-rating">
                    <span className="wl-card-stars">{'★'.repeat(Math.floor(item.rating || 0))}{'☆'.repeat(5 - Math.floor(item.rating || 0))}</span>
                  </div>

                  <div className="wl-card-actions">
                    {cartProductIds.includes(item._id) ? (
                      <button className="wl-add-cart-btn in-cart" onClick={async () => { if (removeFromCart) await removeFromCart(item._id); }}>
                        In Cart ✕
                      </button>
                    ) : (
                      <button
                        className={`wl-add-cart-btn ${movedToCart.includes(item._id) ? 'added' : ''}`}
                        onClick={() => handleAddToCart(item)}
                        disabled={movedToCart.includes(item._id)}
                      >
                        {movedToCart.includes(item._id) ? '✓ Added' : '🛒 Cart'}
                      </button>
                    )}
                    <button className="wl-buy-btn" onClick={() => {
                      const checkoutState = { product: item, qty: 1, selectedSize: item.sizes?.[0]?.size || 'Free Size' }
                      if (!isAuthenticated()) {
                        navigate('/login', {
                          state: {
                            from: window.location.pathname,
                            redirectTo: '/checkout',
                            redirectState: checkoutState,
                          },
                        })
                        return
                      }
                      navigate('/checkout', { state: checkoutState })
                    }}>Buy Now</button>
                    <button className="wl-remove-btn" onClick={() => handleRemove(item._id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistPage
