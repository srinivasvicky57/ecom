import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WISHLIST_URL, CART_URL } from '../constants/api'
import { authFetch, isAuthenticated } from '../constants/auth'
import Loader from './Loader'

const SHIPPING_THRESHOLD = 1999
const SHIPPING_CHARGE = 99

/**
 * CartPage — standalone full-page cart at /cart.
 * Shows line items, quantity controls, and an order summary sidebar.
 */
function CartPage({ onWishlistChange, onCartChange }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    if (!isAuthenticated()) { setLoading(false); return }
    try {
      const res = await authFetch(CART_URL)
      if (res.ok) setItems(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchCart() }, [])

  /** Update quantity for a given cart item */
  const updateQty = async (itemId, qty) => {
    try {
      const res = await authFetch(`${CART_URL}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty }),
      })
      if (res.ok) { setItems(await res.json()); if (onCartChange) onCartChange() }
    } catch { /* silent */ }
  }

  /** Remove an item from the cart */
  const removeItem = async (itemId) => {
    try {
      const res = await authFetch(`${CART_URL}/${itemId}`, { method: 'DELETE' })
      if (res.ok) { setItems(await res.json()); if (onCartChange) onCartChange() }
    } catch { /* silent */ }
  }

  /** Change size for a cart item (delete + re-add) */
  const changeSize = async (itemId, newSize) => {
    const item = items.find(i => i._id === itemId)
    if (!item) return
    try {
      await authFetch(`${CART_URL}/${itemId}`, { method: 'DELETE' })
      const res = await authFetch(CART_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.product._id, size: newSize, qty: item.qty }),
      })
      if (res.ok) { setItems(await res.json()); if (onCartChange) onCartChange() }
    } catch { /* silent */ }
  }

  /* ── Computed totals ── */
  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.qty, 0)
  const totalMRP = items.reduce((sum, i) => sum + (i.product?.originalPrice || i.product?.price || 0) * i.qty, 0)
  const productDiscount = totalMRP - subtotal
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE
  const total = subtotal + shipping
  const totalItems = items.reduce((s, i) => s + i.qty, 0)

  if (loading) return <Loader message="Loading cart…" />

  return (
    <div className="cp-page">
      {/* ── Page title bar ── */}
      <div className="page-title-bar">
        <h1 className="page-title-heading">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Shopping Cart
          <span className="page-count-badge">{totalItems}</span>
        </h1>
        <button className="page-title-link" onClick={() => navigate('/wishlist')}>
          ♡ Wishlist
        </button>
      </div>

      {/* ── Content ── */}
      <div className="cp-page-content">
        {items.length === 0 ? (
          <div className="cp-empty">
            <div className="cp-empty-icon-wrap">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Discover our handcrafted Kalamkari collection</p>
            <button className="cp-empty-btn" onClick={() => navigate('/')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
          <div className="cp-items-header">
            <span className="cp-items-count">{totalItems} item{totalItems > 1 ? 's' : ''} in your cart</span>
            {subtotal < SHIPPING_THRESHOLD && (
              <div className="cp-free-ship-bar">
                <div className="cp-free-ship-track">
                  <div className="cp-free-ship-fill" style={{ width: `${Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)}%` }}></div>
                </div>
                <span className="cp-free-ship-text">Add ₹{(SHIPPING_THRESHOLD - subtotal).toLocaleString()} more for <strong>FREE shipping</strong></span>
              </div>
            )}
          </div>

          <div className="cp-layout">
            {/* Left — Cart items */}
            <div className="cp-items-section">
              {items.map((item, idx) => {
                const p = item.product
                if (!p) return null
                const disc = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0
                return (
                <div key={item._id} className="cp-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <img src={p.image} alt={p.name} className="cp-item-img" onClick={() => navigate(`/productDetail/${p._id}`)} />
                  <div className="cp-item-details">
                    <span className="cp-item-category">{p.subcategory || p.category}</span>
                    <h3 className="cp-item-name" onClick={() => navigate(`/productDetail/${p._id}`)}>{p.name}</h3>
                    {p.description && <p className="cp-item-desc">{p.description}</p>}

                    <div className="cp-size-qty-row">
                      <div className="cp-item-size-row">
                        <span className="cp-item-size-label">Size</span>
                        {p.sizes?.length > 0 ? (
                          <div className="cp-size-options">
                            {p.sizes.map(s => (
                              <button
                                key={s.size}
                                className={`cp-size-btn${item.size === s.size ? ' cp-size-active' : ''}${s.stock === 0 ? ' cp-size-oos' : ''}`}
                                onClick={() => { if (s.stock > 0 && s.size !== item.size) changeSize(item._id, s.size) }}
                                disabled={s.stock === 0}
                              >
                                {s.size}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="cp-item-size-value">Free Size</span>
                        )}
                      </div>
                      <div className="cp-item-qty-group">
                        <span className="cp-item-size-label">Qty</span>
                        {(() => {
                          const sizeObj = p.sizes?.find(s => s.size === item.size)
                          const maxQty = sizeObj ? sizeObj.stock : Infinity
                          return (
                            <div className="cp-qty-controls">
                              <button className="cp-qty-btn" onClick={() => updateQty(item._id, item.qty - 1)} disabled={item.qty <= 1}>−</button>
                              <span className="cp-qty-value">{item.qty}</span>
                              <button className="cp-qty-btn" onClick={() => updateQty(item._id, item.qty + 1)} disabled={item.qty >= maxQty}>+</button>
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="cp-item-bottom">
                      <div className="cp-item-pricing">
                        <span className="cp-item-price">₹{p.price.toLocaleString()}</span>
                        {p.originalPrice > p.price && (
                          <>
                            <span className="cp-item-original">₹{p.originalPrice.toLocaleString()}</span>
                            <span className="cp-item-discount">{disc}% off</span>
                          </>
                        )}
                      </div>
                      <div className="cp-item-actions">
                        <button className="cp-action-link cp-action-remove" onClick={() => removeItem(item._id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Remove
                        </button>
                        <button className="cp-action-link cp-action-wishlist" onClick={async () => {
                          if (!isAuthenticated()) { navigate('/login'); return }
                          try {
                            await authFetch(`${WISHLIST_URL}/${p._id}`, { method: 'POST' })
                            await removeItem(item._id)
                            if (onWishlistChange) onWishlistChange()
                          } catch { /* silent */ }
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          Wishlist
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="cp-item-line-total">
                    ₹{(p.price * item.qty).toLocaleString()}
                  </div>
                </div>
                )
              })}
            </div>

            {/* Right — Order summary */}
            <aside className="cp-summary">
              <h3 className="cp-summary-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                Order Summary
              </h3>

              <div className="cp-summary-rows">
                <div className="cp-summary-row">
                  <span>Total MRP ({totalItems} items)</span>
                  <span>₹{totalMRP.toLocaleString()}</span>
                </div>
                <div className="cp-summary-row cp-discount-row">
                  <span>Product Discount</span>
                  <span className="cp-green">− ₹{productDiscount.toLocaleString()}</span>
                </div>
                <div className="cp-summary-row">
                  <span>Delivery</span>
                  <span>{shipping === 0 ? <span className="cp-green">FREE</span> : `₹${shipping}`}</span>
                </div>
              </div>

              <div className="cp-summary-divider" />

              <div className="cp-summary-row cp-total-row">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              {productDiscount > 0 && (
                <div className="cp-savings-banner">
                  You're saving <strong>₹{productDiscount.toLocaleString()}</strong> on this order!
                </div>
              )}

              <button className="cp-checkout-btn" onClick={() => navigate('/checkout', { state: { fromCart: true } })}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Proceed to Checkout
              </button>

              <div className="cp-trust-row">
                <span className="cp-trust-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Secure
                </span>
                <span className="cp-trust-divider">·</span>
                <span className="cp-trust-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Safe Payment
                </span>
                <span className="cp-trust-divider">·</span>
              
              </div>
            </aside>
          </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
