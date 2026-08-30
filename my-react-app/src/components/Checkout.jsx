import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PAYMENT_URL, CART_URL, ORDER_URL } from '../constants/api';
import { authFetch, isAuthenticated, fetchProfile, addAddress, deleteAddress } from '../constants/auth';

const EMPTY_ADDRESS = { name: '', mobile: '', pincode: '', state: '', address: '', landmark: '', district: '', isDefault: false };

const addressValidators = {
  name: (v) => (!v.trim() ? 'Name is required' : ''),
  mobile: (v) => { if (!v.trim()) return 'Mobile is required'; if (!/^\d{10}$/.test(v)) return 'Must be 10 digits'; return ''; },
  pincode: (v) => { if (!v.trim()) return 'Pincode is required'; if (!/^\d{6}$/.test(v)) return 'Must be 6 digits'; return ''; },
  state: (v) => (!v.trim() ? 'State is required' : ''),
  address: (v) => (!v.trim() ? 'Address is required' : ''),
  landmark: (v) => (!v.trim() ? 'Landmark is required' : ''),
  district: (v) => (!v.trim() ? 'District is required' : ''),
};

const addressFilters = {
  name: (v) => v.replace(/[^a-zA-Z\s]/g, ''),
  mobile: (v) => v.replace(/\D/g, '').slice(0, 10),
  pincode: (v) => v.replace(/\D/g, '').slice(0, 6),
};

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const product = state?.product;
  const initQty = state?.qty || 1;
  const initSize = state?.selectedSize || 'Free Size';
  const fromCart = state?.fromCart || false;

  const [qty, setQty] = useState(initQty);
  const [selectedSize, setSelectedSize] = useState(initSize);

  const hasSizes = product?.sizes?.length > 0;
  const selectedSizeObj = hasSizes ? product?.sizes?.find(s => s.size === selectedSize) : null;
  const maxQty = hasSizes ? (selectedSizeObj?.stock || 0) : Infinity;
  const sizeSelected = !hasSizes || !!selectedSize;

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  /* Cart items */
  const [cartItems, setCartItems] = useState([]);
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  /* Addresses */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS });
  const [addressErrors, setAddressErrors] = useState({});
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    setCartLoading(true);
    authFetch(CART_URL)
      .then(res => res.ok ? res.json() : [])
      .then(items => {
        // Filter out the "Buy Now" product (same id) to avoid duplication
        const filtered = product
          ? items.filter(i => i.product?._id !== product._id)
          : items;
        setCartItems(filtered);
        if (fromCart) {
          setSelectedCartIds(filtered.map(i => i._id));
        }
      })
      .catch(() => setCartItems([]))
      .finally(() => setCartLoading(false));
  }, []);

  /* Fetch addresses */
  useEffect(() => {
    if (!isAuthenticated()) return;
    setAddressLoading(true);
    fetchProfile()
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const addrs = data?.user?.addresses || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefault);
        setSelectedAddressId(def?._id || addrs[0]?._id || null);
      })
      .catch(() => setAddresses([]))
      .finally(() => setAddressLoading(false));
  }, []);

  const handleAddressFieldChange = (field, raw) => {
    const val = addressFilters[field] ? addressFilters[field](raw) : raw;
    setAddressForm(prev => ({ ...prev, [field]: val }));
    if (addressValidators[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: addressValidators[field](val) }));
    }
  };

  const handleAddressSave = async () => {
    const newErrors = {};
    for (const key of Object.keys(addressValidators)) {
      const err = addressValidators[key](addressForm[key]);
      if (err) newErrors[key] = err;
    }
    if (Object.keys(newErrors).length) { setAddressErrors(newErrors); return; }

    setAddressSaving(true);
    setAddressErrors({});
    try {
      const res = await addAddress(addressForm);
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      const addrs = data.addresses || [];
      setAddresses(addrs);
      const newAddr = addrs[addrs.length - 1];
      setSelectedAddressId(newAddr?._id);
      setAddressForm({ ...EMPTY_ADDRESS });
      setShowAddressForm(false);
    } catch {
      setAddressErrors({ _form: 'Failed to save address. Try again.' });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await deleteAddress(id);
      if (res.ok) {
        const data = await res.json();
        const addrs = data.addresses || [];
        setAddresses(addrs);
        if (selectedAddressId === id) {
          const def = addrs.find(a => a.isDefault);
          setSelectedAddressId(def?._id || addrs[0]?._id || null);
        }
      }
    } catch { /* silent */ }
  };

  const selectedAddress = addresses.find(a => a._id === selectedAddressId);

  const toggleCartItem = (id) => {
    setSelectedCartIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllCart = () => {
    if (selectedCartIds.length === cartItems.length) {
      setSelectedCartIds([]);
    } else {
      setSelectedCartIds(cartItems.map(i => i._id));
    }
  };

  /** Update a cart item's qty locally and on the server */
  const updateCartItemQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, qty: newQty } : i));
    try {
      await authFetch(`${CART_URL}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty }),
      });
    } catch { /* silent */ }
  };

  /** Update a cart item's size locally and on the server */
  const updateCartItemSize = async (itemId, newSize) => {
    setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, size: newSize } : i));
    // Note: The server cart stores size per item; re-add with new size
    const item = cartItems.find(i => i._id === itemId);
    if (!item) return;
    try {
      // Remove old item and add with new size
      await authFetch(`${CART_URL}/${itemId}`, { method: 'DELETE' });
      await authFetch(CART_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.product._id, size: newSize, qty: item.qty }),
      });
    } catch { /* silent */ }
  };

  /* ── Computed totals ── */
  const buyNowSubtotal = product ? product.price * qty : 0;
  const buyNowOriginal = product ? product.originalPrice * qty : 0;

  const selectedCart = cartItems.filter(i => selectedCartIds.includes(i._id));
  const cartSubtotal = selectedCart.reduce((s, i) => s + (i.product?.price || 0) * i.qty, 0);
  const cartOriginal = selectedCart.reduce((s, i) => s + (i.product?.originalPrice || i.product?.price || 0) * i.qty, 0);

  const grandTotal = buyNowSubtotal + cartSubtotal;
  const grandOriginal = buyNowOriginal + cartOriginal;
  const grandDiscount = grandOriginal - grandTotal;
  const totalItemCount = (product ? qty : 0) + selectedCart.reduce((s, i) => s + i.qty, 0);

  const discount = product ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  if (!product && !fromCart && cartItems.length === 0 && !cartLoading) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>No product selected</h2>
          <p>Please select a product to proceed with checkout.</p>
          <button className="ck-btn ck-btn-primary" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (grandTotal <= 0) return;
    setProcessing(true);
    setError('');

    const description = product
      ? `${product.name}${selectedCart.length > 0 ? ` + ${selectedCart.length} cart item(s)` : ''}`
      : `${selectedCart.length} cart item(s)`;

    try {
      const orderRes = await fetch(`${PAYMENT_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal, productName: description }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const orderData = await orderRes.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MS Vastravarna',
        description,
        order_id: orderData.orderId,
        image: product?.image,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${PAYMENT_URL}/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              setPaymentId(verifyData.paymentId);

              // Build order items
              const orderItems = [];
              if (product) {
                orderItems.push({ product: product._id, qty, size: selectedSize || '' });
              }
              selectedCart.forEach(ci => {
                orderItems.push({ product: ci.product._id, qty: ci.qty, size: ci.size || '' });
              });

              // Save order via API
              try {
                const orderRes = await authFetch(ORDER_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    items: orderItems,
                    shippingAddress: selectedAddress,
                    payment: {
                      method: 'UPI',
                      transactionId: verifyData.paymentId,
                      paymentStatus: 'Paid',
                    },
                    shippingCharge: 0,
                    discount: grandDiscount,
                  }),
                });
                const orderData = await orderRes.json();
                if (orderRes.ok && orderData.order) {
                  setOrderId(orderData.order.orderId);
                }
              } catch {
                // Order save failed but payment succeeded — still show success
              }

              setSuccess(true);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch {
            setError('Payment verification failed. Please try again.');
          }
          setProcessing(false);
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#8b1c1c' },
        modal: { ondismiss: () => setProcessing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error.description || 'Payment failed. Please try again.');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page">
        <div className="ck-success">
          <div className="ck-success-confetti">
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <div className="ck-success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="ck-success-title">Order Placed!</h2>
          <p className="ck-success-text">Your order has been placed successfully. We'll send you updates on your order status.</p>
          {orderId && <p className="ck-success-method">Order ID: <strong>{orderId}</strong></p>}
          {paymentId && <p className="ck-success-method">Payment ID: <strong>{paymentId}</strong></p>}
          <div className="ck-success-actions">
            <button className="ck-btn ck-btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="ck-topbar">
        <button className="ck-back" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="checkout-title">Checkout</h1>
        <div className="ck-secure-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secure
        </div>
      </div>

      {/* Steps indicator */}
      <div className="ck-steps">
        <div className="ck-step ck-step-done">
          <span className="ck-step-num">1</span>
          <span className="ck-step-label">Items</span>
        </div>
        <div className="ck-step-line"></div>
        <div className={`ck-step${selectedAddressId ? ' ck-step-done' : ' ck-step-active'}`}>
          <span className="ck-step-num">2</span>
          <span className="ck-step-label">Address</span>
        </div>
        <div className="ck-step-line"></div>
        <div className={`ck-step${selectedAddressId ? ' ck-step-active' : ''}`}>
          <span className="ck-step-num">3</span>
          <span className="ck-step-label">Payment</span>
        </div>
      </div>

      <div className="ck-layout">
        {/* Left column — items + address */}
        <div className="ck-left">
          {/* Order Items */}
          <div className="ck-section-card">
            <div className="ck-section-header">
              <div className="ck-section-badge">1</div>
              <h2 className="ck-section-title">Order Items</h2>
            </div>

            {/* Buy Now product */}
            {product && !fromCart && (
              <div className="ck-product-card">
                <div className="ck-product-img-wrap">
                  <img src={product.image} alt={product.name} className="ck-product-img"
                   onClick={() => navigate(`/productDetail/${product._id}`)} />
                  {discount > 0 && <span className="ck-product-discount-tag">-{discount}%</span>}
                </div>

                <div className="ck-product-info">

                  <span className="ck-product-category">{product.subcategory}</span>
                  <h3 className="ck-product-name" onClick={() => navigate(`/productDetail/${product._id}`)}>{product.name}</h3>
                  {product.description && <p className="ck-product-desc">{product.description}</p>}
                  <div className="ck-product-pricing">
                    <span className="ck-price">₹{product.price.toLocaleString()}</span>
                    <span className="ck-original">₹{product.originalPrice.toLocaleString()}</span>
                    {discount > 0 && <span className="ck-discount">-{discount}%</span>}
                  </div>

                  <div className="ck-product-meta">

                    <div className="ck-meta-group">
                      <span className="ck-meta-label">Size</span>
                      {product.sizes?.length > 0 ? (
                        <div className="ck-size-options">
                          {product.sizes.map(s => (
                            <button
                              key={s.size}
                              className={`ck-size-btn${selectedSize === s.size ? ' ck-size-active' : ''}${s.stock === 0 ? ' ck-size-oos' : ''}`}
                              onClick={() => { if (s.stock > 0) { setSelectedSize(s.size); setQty(1); } }}
                              disabled={s.stock === 0}
                            >
                              {s.size}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="ck-meta-value">Free Size</span>
                      )}
                    </div>

                    <div className="ck-meta-group">
                      <span className="ck-meta-label">Qty</span>
                      {!sizeSelected ? (
                        <span className="ck-qty-hint">Select size first</span>
                      ) : (
                        <div className="ck-qty-controls">
                          <button className="ck-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                          <span className="ck-qty-value">{qty}</span>
                          <button className="ck-qty-btn" onClick={() => setQty(q => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}>+</button>
                        </div>
                      )}
                    </div>


                  </div>
                </div>
              </div>
            )}

            {/* Cart items as full product cards (when coming from cart) */}
            {fromCart && cartItems.map(item => {
              const p = item.product;
              if (!p) return null;
              const itemDisc = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
              const sizeObj = p.sizes?.find(s => s.size === item.size);
              const itemMaxQty = sizeObj ? sizeObj.stock : Infinity;

              return (
                <div key={item._id} className="ck-product-card">

                  <div className="ck-product-img-wrap">
                    <img src={p.image} alt={p.name} className="ck-product-img" onClick={() => navigate(`/productDetail/${p._id}`)} />
                    {itemDisc > 0 && <span className="ck-product-discount-tag">-{itemDisc}%</span>}
                  </div>

                  <div className="ck-product-info">

                    <span className="ck-product-category">{p.subcategory || p.category}</span>
                    <h3 className="ck-product-name" onClick={() => navigate(`/productDetail/${p._id}`)}>{p.name}</h3>
                    {p.description && <p className="ck-product-desc">{p.description}</p>}
                    <div className="ck-product-pricing">
                      <span className="ck-price">₹{p.price.toLocaleString()}</span>
                      {p.originalPrice > p.price && <span className="ck-original">₹{p.originalPrice.toLocaleString()}</span>}
                      {itemDisc > 0 && <span className="ck-discount">-{itemDisc}%</span>}
                    </div>

                    <div className="ck-product-meta">

                      <div className="ck-meta-group">
                        <span className="ck-meta-label">Size</span>
                        {p.sizes?.length > 0 ? (
                          <div className="ck-size-options">
                            {p.sizes.map(s => (
                              <button
                                key={s.size}
                                className={`ck-size-btn${item.size === s.size ? ' ck-size-active' : ''}${s.stock === 0 ? ' ck-size-oos' : ''}`}
                                onClick={() => { if (s.stock > 0) updateCartItemSize(item._id, s.size); }}
                                disabled={s.stock === 0}
                              >
                                {s.size}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="ck-meta-value">Free Size</span>
                        )}
                      </div>

                      <div className="ck-meta-group">
                        <span className="ck-meta-label">Qty</span>
                        <div className="ck-qty-controls">
                          <button className="ck-qty-btn" onClick={() => updateCartItemQty(item._id, Math.max(1, item.qty - 1))} disabled={item.qty <= 1}>−</button>
                          <span className="ck-qty-value">{item.qty}</span>
                          <button className="ck-qty-btn" onClick={() => updateCartItemQty(item._id, Math.min(itemMaxQty, item.qty + 1))} disabled={item.qty >= itemMaxQty}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Selected cart items in summary (only for Buy Now flow) */}
            {!fromCart && selectedCart.length > 0 && (
              <div className="ck-selected-cart-items">
                <p className="ck-selected-cart-label">+ {selectedCart.length} cart item{selectedCart.length > 1 ? 's' : ''} added</p>
                {selectedCart.map(item => {
                  const p = item.product;
                  if (!p) return null;
                  return (
                    <div key={item._id} className="ck-selected-item">
                      <img src={p.image} alt={p.name} className="ck-selected-item-img"
                       onClick={() => navigate(`/productDetail/${p._id}`)} style={{ cursor: 'pointer' }} />
                      <div className="ck-selected-item-info">
                        <span className="ck-selected-item-name" onClick={() => navigate(`/productDetail/${p._id}`)} 
                        style={{ cursor: 'pointer' }}>{p.name}</span>
                        <span className="ck-selected-item-detail">{item.size} × {item.qty}</span>
                      </div>
                      <span className="ck-selected-item-price">₹{(p.price * item.qty).toLocaleString()}</span>
                      <button className="ck-remove-item-btn" title="Remove from order" onClick={() => toggleCartItem(item._id)}>×</button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Delivery Address Section */}
          <div className="ck-section-card">
            <div className="ck-section-header">
              <div className="ck-section-badge">2</div>
              <h2 className="ck-section-title">
                Delivery Address
              </h2>
            </div>

            {addressLoading && <div className="ck-addr-loading"><span className="ck-spinner-sm"></span> Loading addresses…</div>}

            {!addressLoading && addresses.length === 0 && !showAddressForm && (
              <div className="ck-addr-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p>No saved addresses</p>
                <span>Add a delivery address to continue</span>
                <button className="ck-btn ck-btn-add-addr" onClick={() => setShowAddressForm(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New Address
                </button>
              </div>
            )}

            {!addressLoading && addresses.length > 0 && (
              <div className="ck-addr-list">
                {addresses.map(addr => (
                  <div
                    key={addr._id}
                    className={`ck-addr-card${selectedAddressId === addr._id ? ' ck-addr-card-selected' : ''}`}
                    onClick={() => setSelectedAddressId(addr._id)}
                  >
                    <div className="ck-addr-radio">
                      <span className={`ck-addr-dot${selectedAddressId === addr._id ? ' ck-addr-dot-active' : ''}`}></span>
                    </div>

                    <div className="ck-addr-details">
                      <div className="ck-addr-top">
                        <span className="ck-addr-name">{addr.name}</span>
                        {addr.isDefault && <span className="ck-addr-default-badge">Default</span>}
                      </div>
                      <p className="ck-addr-line">{addr.address}</p>
                      <p className="ck-addr-line">{addr.landmark}, {addr.district}, {addr.state} - {addr.pincode}</p>
                      <p className="ck-addr-phone">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {addr.mobile}
                      </p>
                    </div>

                    <button className="ck-addr-delete" title="Delete address" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>

                  </div>
                ))}

                {!showAddressForm && (
                  <button className="ck-btn ck-btn-add-addr" onClick={() => setShowAddressForm(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                    strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add New Address
                  </button>
                )}
                
              </div>
            )}

            {showAddressForm && (
              <div className="ck-addr-form">

                <h3 className="ck-addr-form-title">Add New Address</h3>

                <div className="ck-addr-form-grid">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Full Name' },
                    { key: 'mobile', label: 'Mobile', type: 'tel', placeholder: '10-digit mobile' },
                    { key: 'pincode', label: 'Pincode', type: 'text', placeholder: '6-digit pincode' },
                    { key: 'state', label: 'State', type: 'text', placeholder: 'State' },
                    { key: 'district', label: 'District', type: 'text', placeholder: 'District' },
                    { key: 'landmark', label: 'Landmark', type: 'text', placeholder: 'Landmark' },
                  ].map(f => (
                    <div key={f.key} className="ck-addr-field">

                      <label>{f.label} <span className="ck-addr-required">*</span></label>
                      <input
                        type={f.type}
                        value={addressForm[f.key]}
                        onChange={e => handleAddressFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className={addressErrors[f.key] ? 'ck-addr-input-error' : ''}
                      />
                      {addressErrors[f.key] && <span className="ck-addr-field-error">{addressErrors[f.key]}</span>}

                    </div>
                  ))}

                  <div className="ck-addr-field ck-addr-field-full">
                    <label>Address <span className="ck-addr-required">*</span></label>
                    <textarea
                      value={addressForm.address}
                      onChange={e => handleAddressFieldChange('address', e.target.value)}
                      placeholder="House No., Building, Street, Area"
                      rows={2}
                      className={addressErrors.address ? 'ck-addr-input-error' : ''}
                    ></textarea>
                    {addressErrors.address && <span className="ck-addr-field-error">{addressErrors.address}</span>}
                  </div>

                </div>

                <label className="ck-addr-default-check">
                  <input type="checkbox" checked={addressForm.isDefault}
                   onChange={e => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))} />
                  Set as default address
                </label>
                {addressErrors._form && <p className="ck-addr-error">{addressErrors._form}</p>}
                <div className="ck-addr-form-actions">
                  <button className="ck-btn ck-btn-secondary" onClick={() => { setShowAddressForm(false); setAddressErrors({}); }}>Cancel</button>
                  <button className="ck-btn ck-btn-primary" onClick={handleAddressSave} disabled={addressSaving}>
                    {addressSaving ? 'Saving…' : 'Save Address'}
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Right column — price summary + payment (sticky) */}
        <div className="ck-right">
          <div className="ck-section-card ck-sticky">

            <div className="ck-section-header">
              <div className="ck-section-badge">3</div>
              <h2 className="ck-section-title">Price Details</h2>
            </div>

            <div className="ck-price-breakdown">
              <div className="ck-price-row">
                <span>Price ({totalItemCount} {totalItemCount > 1 ? 'items' : 'item'})</span>
                <span>₹{grandOriginal.toLocaleString()}</span>
              </div>
              <div className="ck-price-row ck-row-green">
                <span>Discount</span>
                <span>−₹{grandDiscount.toLocaleString()}</span>
              </div>
              <div className="ck-price-row">
                <span>Delivery</span>
                <span className="ck-free">FREE</span>
              </div>
              <div className="ck-price-row ck-price-total">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
              {grandDiscount > 0 && (
                <div className="ck-savings-banner">
                  You're saving <strong>₹{grandDiscount.toLocaleString()}</strong> on this order!
                </div>
              )}
            </div>

            {/* Delivery info */}
            {selectedAddress && (
              <div className="ck-deliver-to">
                <span className="ck-deliver-to-label">Deliver to:</span>
                <strong>{selectedAddress.name}</strong>, {selectedAddress.district} - {selectedAddress.pincode}
              </div>
            )}

            {/* Payment info */}
            <div className="ck-razorpay-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <div>
                <p className="ck-rz-title">Razorpay Secure Payment</p>
                <p className="ck-rz-subtitle">UPI, Cards, Netbanking, Wallets</p>
              </div>
            </div>

            {error && (
              <div className="ck-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button className="ck-btn ck-btn-pay" onClick={handlePay} disabled={processing || grandTotal <= 0 || !selectedAddressId}>
              {processing ? (
                <span className="ck-spinner"></span>
              ) : !selectedAddressId ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Select delivery address
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Pay ₹{grandTotal.toLocaleString()} to Place Order
                </>
              )}
            </button>

            <div className="ck-secure">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>100% Secure & Encrypted Payment</span>
            </div>

          </div>
        </div>
      </div>

      {/* Cart Items Grid — below the main layout (only for Buy Now flow) */}
      {!fromCart && cartItems.length > 0 && (
        <div className="ck-cart-grid-section">

          <div className="ck-cart-grid-header">
            <h2 className="ck-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Your Cart ({cartItems.length})
            </h2>
            <button className="ck-select-all-btn" onClick={selectAllCart}>
              {selectedCartIds.length === cartItems.length ? 'Remove All from Order' : 'Add All to Order'}
            </button>
          </div>


          <div className="ck-cart-grid">
            {cartItems.map(item => {
              const p = item.product;
              if (!p) return null;
              const checked = selectedCartIds.includes(item._id);
              const itemDiscount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
              return (
                <div key={item._id} className={`ck-cart-grid-card${checked ? ' ck-cart-grid-card-selected' : ''}`}>

                  {checked && <span className="ck-cart-grid-badge">In Order</span>}
                  <img src={p.image} alt={p.name} className="ck-cart-grid-img" 
                  onClick={() => navigate(`/productDetail/${p._id}`)} style={{ cursor: 'pointer' }} />

                  <div className="ck-cart-grid-body">
                    <span className="ck-cart-grid-name" onClick={() => navigate(`/productDetail/${p._id}`)} style={{ cursor: 'pointer' }}>{p.name}</span>
                    <div className="ck-cart-grid-pricing">
                      <span className="ck-price">₹{(p.price * item.qty).toLocaleString()}</span>
                      {itemDiscount > 0 && <span className="ck-original">₹{(p.originalPrice * item.qty).toLocaleString()}</span>}
                      {itemDiscount > 0 && <span className="ck-discount">-{itemDiscount}%</span>}
                    </div>
                    {/* Size selector */}
                    <div className="ck-cart-grid-controls">

                      <div className="ck-meta-group">
                        <span className="ck-meta-label">Size:</span>
                        {p.sizes?.length > 0 ? (
                          <div className="ck-size-options">
                            {p.sizes.map(s => (
                              <button
                                key={s.size}
                                className={`ck-size-btn ck-size-btn-sm${item.size === s.size ? ' ck-size-active' : ''}${s.stock === 0 ? ' ck-size-oos' : ''}`}
                                onClick={() => { if (s.stock > 0) updateCartItemSize(item._id, s.size); }}
                                disabled={s.stock === 0}
                              >
                                {s.size}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <strong>{item.size || 'Free Size'}</strong>
                        )}
                      </div>

                      <div className="ck-meta-group">
                        <span className="ck-meta-label">Qty:</span>
                        <div className="ck-qty-controls ck-qty-controls-sm">
                          <button className="ck-qty-btn" onClick={() => updateCartItemQty(item._id, item.qty - 1)} disabled={item.qty <= 1}>−</button>
                          <span className="ck-qty-value">{item.qty}</span>
                          <button className="ck-qty-btn" onClick={() => updateCartItemQty(item._id, item.qty + 1)}>+</button>
                        </div>
                      </div>

                    </div>

                    <button
                      className={`ck-btn ck-btn-add-order${checked ? ' ck-btn-remove-order' : ''}`}
                      onClick={() => toggleCartItem(item._id)}
                    >
                      {checked ? 'Remove from Order' : 'Add to Order'}
                    </button>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cartLoading && <p className="ck-cart-loading">Loading cart items…</p>}
    </div>
  );
}

export default Checkout;
