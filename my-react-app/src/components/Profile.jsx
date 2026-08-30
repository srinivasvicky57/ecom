import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authFetch, fetchProfile, addAddress, updateAddress, deleteAddress, clearAuth, isAuthenticated } from '../constants/auth'
import { ORDER_URL } from '../constants/api'
import { useToast } from './Toast'
import AdminProfile from './admin/AdminProfile'
import SettingsTab from './SettingsTab'
import Loader from './Loader'

const EMPTY_ADDRESS = { name: '', mobile: '', pincode: '', state: '', address: '', landmark: '', district: '', isDefault: false }

const addressValidators = {
  name: (v) => (!v.trim() ? 'Name is required' : ''),
  mobile: (v) => { if (!v.trim()) return 'Mobile is required'; if (!/^\d{10}$/.test(v)) return 'Must be 10 digits'; return '' },
  pincode: (v) => { if (!v.trim()) return 'Pincode is required'; if (!/^\d{6}$/.test(v)) return 'Must be 6 digits'; return '' },
  state: (v) => (!v.trim() ? 'State is required' : ''),
  address: (v) => (!v.trim() ? 'Address is required' : ''),
  landmark: (v) => (!v.trim() ? 'Landmark is required' : ''),
  district: (v) => (!v.trim() ? 'District is required' : ''),
}

const addressFilters = {
  name: (v) => v.replace(/[^a-zA-Z\s]/g, ''),
  mobile: (v) => v.replace(/\D/g, '').slice(0, 10),
  pincode: (v) => v.replace(/\D/g, '').slice(0, 6),
}

function AddressFormModal({ editAddr, userId, onSaved, onClose, addToast }) {
  const [form, setForm] = useState(editAddr ? { name: editAddr.name, mobile: editAddr.mobile, pincode: editAddr.pincode, state: editAddr.state, address: editAddr.address, landmark: editAddr.landmark, district: editAddr.district, isDefault: editAddr.isDefault } : { ...EMPTY_ADDRESS })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleChange = (field, raw) => {
    const val = addressFilters[field] ? addressFilters[field](raw) : raw
    setForm(prev => ({ ...prev, [field]: val }))
    if (addressValidators[field]) {
      setErrors(prev => ({ ...prev, [field]: addressValidators[field](val) }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    for (const key of Object.keys(addressValidators)) {
      const err = addressValidators[key](form[key])
      if (err) newErrors[key] = err
    }
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }

    setSaving(true)
    try {
      const res = editAddr
        ? await updateAddress(editAddr._id, form)
        : await addAddress(form)
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to save address') }
      const data = await res.json()
      onSaved(data.addresses)
      addToast(editAddr ? 'Address updated' : 'Address added', 'success')
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="address-modal-overlay" onClick={onClose}>
      <div className="address-modal" onClick={e => e.stopPropagation()}>
        <div className="address-modal-header">
          <h3>{editAddr ? 'Edit Address' : 'Add New Address'}</h3>
          <button className="address-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="address-modal-form" onSubmit={handleSubmit}>
          <div className="address-form-grid">
            {[{ key: 'name', label: 'Full Name', type: 'text' }, { key: 'mobile', label: 'Mobile Number', type: 'tel' }, { key: 'pincode', label: 'Pincode', type: 'text' }, { key: 'state', label: 'State', type: 'text' }, { key: 'district', label: 'District', type: 'text' }, { key: 'landmark', label: 'Landmark', type: 'text' }].map(f => (
              <div key={f.key} className="address-form-field">
                <label className="profile-form-label">{f.label} <span className="login-required">*</span></label>
                <input className={`profile-form-input${errors[f.key] ? ' profile-form-error' : ''}`} type={f.type} value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)} />
                {errors[f.key] && <span className="profile-field-error">{errors[f.key]}</span>}
              </div>
            ))}
          </div>
          <div className="address-form-field address-form-full">
            <label className="profile-form-label">Address <span className="login-required">*</span></label>
            <textarea className={`profile-form-input address-textarea${errors.address ? ' profile-form-error' : ''}`} rows={3} value={form.address} onChange={e => handleChange('address', e.target.value)} />
            {errors.address && <span className="profile-field-error">{errors.address}</span>}
          </div>
          <label className="address-default-check">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm(prev => ({ ...prev, isDefault: e.target.checked }))} />
            Set as default address
          </label>
          <div className="profile-form-actions">
            <button type="submit" className="settings-action-btn profile-save-btn" disabled={saving}>{saving ? 'Saving…' : (editAddr ? 'Update Address' : 'Add Address')}</button>
            <button type="button" className="settings-action-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Profile = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [addressModal, setAddressModal] = useState(null) // null=closed, 'new' or address obj
  const { addToast } = useToast()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }
    fetchProfile()
      .then(async res => {
        if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to load profile'); }
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUserDetails(data.user);
          setAddresses(data.user.addresses || []);
        } else navigate('/');
      })
      .catch((err) => { addToast(err.message, 'error'); navigate('/'); })
      .finally(() => setLoading(false));

    // Fetch real orders
    setOrdersLoading(true);
    authFetch(ORDER_URL)
      .then(res => res.ok ? res.json() : [])
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [navigate]);

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const user = {
    name: userDetails?.name || 'Guest',
    email: userDetails?.email || '',
    phone: userDetails?.phone || '',
    userId: userDetails?.userId || '',
    avatar: userDetails?.name
      ? userDetails.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : 'G',
    memberSince: userDetails?.createdAt
      ? new Date(userDetails.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : '',
    totalOrders: orders.length,
    wishlistCount: 0,
    totalSpent: `₹${totalSpent.toLocaleString()}`,
    isAdmin: userDetails?.isAdmin || false,
    dateOfBirth: userDetails?.dateOfBirth || '',
    gender: userDetails?.gender || '',
  }

  const getStatusClass = (status) => {
    const map = { Placed: 'processing', Confirmed: 'processing', Shipped: 'shipped', Delivered: 'delivered', Cancelled: 'cancelled', Returned: 'cancelled' }
    return map[status] || 'processing'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await deleteAddress(addrId)
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Delete failed') }
      const data = await res.json()
      setAddresses(data.addresses)
      addToast('Address deleted', 'success')
    } catch (err) { addToast(err.message, 'error') }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/')
    window.location.reload()
  }

  if (loading) {
    return <Loader message="Loading profile…" />
  }

  return (
    <div className="profile-page">
      <div className="page-title-bar">
        <div className="admin-header-left">
          <button className="admin-back-btn" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="page-title-heading">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          My Profile
        </h1>
        </div>
        <span className="page-title-badge">{user.name}</span>
      </div>

      <div className="profile-page-content">
        <div className="profile-layout">
          {user.isAdmin ? (
            <AdminProfile
              user={user}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleLogout={handleLogout}
              setUserDetails={setUserDetails}
              addToast={addToast}
            />
          ) : (
            <>
              {/* User Sidebar */}
              <aside className="profile-sidebar">
                <div className="profile-card">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                      <span>{user.avatar}</span>
                    </div>
                  </div>
                  <h3 className="profile-name">{user.name}</h3>
                  <p className="profile-email">{user.email}</p>
                  <p className="profile-member-since">Member since {user.memberSince}</p>

                  <div className="profile-quick-stats">
                    <div className="profile-stat">
                      <span className="profile-stat-number">{user.totalOrders}</span>
                      <span className="profile-stat-label">Orders</span>
                    </div>
                    <div className="profile-stat-divider" />
                    <div className="profile-stat">
                      <span className="profile-stat-number">{user.wishlistCount}</span>
                      <span className="profile-stat-label">Wishlist</span>
                    </div>
                    <div className="profile-stat-divider" />
                    <div className="profile-stat">
                      <span className="profile-stat-number">{user.totalSpent}</span>
                      <span className="profile-stat-label">Spent</span>
                    </div>
                  </div>
                </div>

                <nav className="profile-nav">
                  {[
                    { key: 'overview', icon: '◉', label: 'Overview' },
                    { key: 'orders', icon: '📦', label: 'My Orders' },
                    { key: 'wishlist', icon: '♡', label: 'Wishlist' },
                    { key: 'addresses', icon: '⌂', label: 'Addresses' },
                    { key: 'settings', icon: '⚙', label: 'Settings' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`profile-nav-item ${activeTab === tab.key ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      <span className="profile-nav-icon">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                  <button
                    className="profile-nav-item profile-logout-btn"
                    onClick={handleLogout}
                  >
                    <span className="profile-nav-icon">⏻</span>
                    Logout
                  </button>
                </nav>
              </aside>

              {/* User Content */}
              <div className="profile-content">
                {activeTab === 'overview' && (
                  <div className="profile-tab-content">
                    <h3 className="profile-tab-title">Account Overview</h3>

                    <div className="overview-cards">
                      <div className="overview-card overview-card-orders">
                        <div className="overview-card-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" rx="2"/>
                            <path d="M16 8h4l3 3v5a1 1 0 0 1-1 1h-2"/>
                            <circle cx="5.5" cy="18.5" r="2.5"/>
                            <circle cx="18.5" cy="18.5" r="2.5"/>
                          </svg>
                        </div>
                        <div className="overview-card-info">
                          <span className="overview-card-value">{user.totalOrders}</span>
                          <span className="overview-card-label">Total Orders</span>
                        </div>
                      </div>

                      <div className="overview-card overview-card-spent">
                        <div className="overview-card-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                        </div>
                        <div className="overview-card-info">
                          <span className="overview-card-value">{user.totalSpent}</span>
                          <span className="overview-card-label">Total Spent</span>
                        </div>
                      </div>

                      <div className="overview-card overview-card-wishlist">
                        <div className="overview-card-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </div>
                        <div className="overview-card-info">
                          <span className="overview-card-value">{user.wishlistCount}</span>
                          <span className="overview-card-label">Wishlist Items</span>
                        </div>
                      </div>
                    </div>

                    <div className="profile-info-section">
                      <h4 className="profile-info-heading">Personal Information</h4>
                      <div className="profile-info-grid">
                        <div className="profile-info-item">
                          <span className="profile-info-label">Full Name</span>
                          <span className="profile-info-value">{user.name}</span>
                        </div>
                        <div className="profile-info-item">
                          <span className="profile-info-label">Email Address</span>
                          <span className="profile-info-value">{user.email}</span>
                        </div>
                        <div className="profile-info-item">
                          <span className="profile-info-label">Phone Number</span>
                          <span className="profile-info-value">{user.phone}</span>
                        </div>
                        <div className="profile-info-item">
                          <span className="profile-info-label">Location</span>
                          {(() => {
                            const loc = addresses.find(a => a.isDefault) || addresses[0]
                            return loc ? (
                              <span className="profile-info-value">{loc.district}, {loc.state} — {loc.pincode}</span>
                            ) : (
                              <button className="profile-add-address-link" onClick={() => setActiveTab('addresses')}>+ Add Address</button>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="profile-info-section">
                      <h4 className="profile-info-heading">Recent Orders</h4>
                      {ordersLoading ? (
                        <p style={{ color: '#888', fontSize: '0.95rem' }}>Loading orders…</p>
                      ) : orders.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.95rem' }}>No orders yet.</p>
                      ) : (
                        <>
                          <div className="orders-list">
                            {orders.slice(0, 2).map(order => (
                              <div key={order._id} className="order-card-rich">
                                <div className="order-card-header">
                                  <div className="order-card-meta">
                                    <span className="order-id">{order.orderId}</span>
                                    <span className="order-date">{formatDate(order.createdAt)}</span>
                                  </div>
                                  <span className={`order-status ${getStatusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                                </div>
                                <div className="order-card-items">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="order-item-row">
                                      <div className="order-item-img">
                                        {item.image ? <img src={item.image} alt={item.productName} /> : <div className="order-item-img-placeholder">No Image</div>}
                                      </div>
                                      <div className="order-item-info">
                                        <span className="order-item-name">{item.productName}</span>
                                        {item.productCode && <span className="order-item-code">{item.productCode}</span>}
                                        <div className="order-item-details">
                                          {item.size && <span className="order-item-tag">Size: {item.size}</span>}
                                          <span className="order-item-tag">Qty: {item.qty}</span>
                                          <span className="order-item-price">₹{item.price?.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="order-card-footer">
                                  <span className="order-card-total-label">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                                  <span className="order-card-total">₹{order.totalAmount?.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className="profile-view-all" onClick={() => setActiveTab('orders')}>
                            View All Orders →
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="profile-tab-content">
                    <h3 className="profile-tab-title">My Orders</h3>
                    {ordersLoading ? (
                      <p style={{ color: '#888', fontSize: '0.95rem' }}>Loading orders…</p>
                    ) : orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem 0', color: '#888' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No orders yet</p>
                        <p style={{ fontSize: '0.9rem' }}>Your orders will appear here once you make a purchase.</p>
                      </div>
                    ) : (
                      <div className="orders-list">
                        {orders.map(order => (
                          <div key={order._id} className="order-card-rich">
                            <div className="order-card-header">
                              <div className="order-card-meta">
                                <span className="order-id">{order.orderId}</span>
                                <span className="order-date">{formatDate(order.createdAt)}</span>
                              </div>
                              <span className={`order-status ${getStatusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                            </div>
                            <div className="order-card-items">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="order-item-row">
                                  <div className="order-item-img">
                                    {item.image ? <img src={item.image} alt={item.productName} /> : <div className="order-item-img-placeholder">No Image</div>}
                                  </div>
                                  <div className="order-item-info">
                                    <span className="order-item-name">{item.productName}</span>
                                    {item.productCode && <span className="order-item-code">{item.productCode}</span>}
                                    <div className="order-item-details">
                                      {item.size && <span className="order-item-tag">Size: {item.size}</span>}
                                      <span className="order-item-tag">Qty: {item.qty}</span>
                                      <span className="order-item-price">₹{item.price?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="order-card-footer">
                              <span className="order-card-total-label">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                              <span className="order-card-total">₹{order.totalAmount?.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="profile-tab-content">
                    <h3 className="profile-tab-title">My Wishlist</h3>
                    <div className="wishlist-grid">
                      {wishlist.map(item => (
                        <div key={item.id} className="wishlist-card">
                          <div className="wishlist-img-wrapper">
                            <img src={item.image} alt={item.name} className="wishlist-img" />
                            <button className="wishlist-remove" title="Remove">✕</button>
                          </div>
                          <div className="wishlist-info">
                            <h4>{item.name}</h4>
                            <span className="wishlist-price">{item.price}</span>
                            <button className="btn-add-cart wishlist-add-btn">Add to Cart</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="profile-tab-content">
                    <h3 className="profile-tab-title">Saved Addresses</h3>
                    <div className="addresses-grid">
                      {addresses.map(addr => (
                        <div key={addr._id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                          <div className="address-header">
                            <span className="address-label">{addr.name}</span>
                            {addr.isDefault && <span className="address-default-badge">Default</span>}
                          </div>
                          <p className="address-name">{addr.mobile}</p>
                          <p className="address-line">{addr.address}</p>
                          <p className="address-city">{addr.landmark}, {addr.district}</p>
                          <p className="address-city">{addr.state} — {addr.pincode}</p>
                          <div className="address-actions">
                            <button className="address-edit-btn" onClick={() => setAddressModal(addr)}>Edit</button>
                            <button className="address-delete-btn" onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                      <button className="address-card address-add-new" onClick={() => setAddressModal('new')}>
                        <span className="address-add-icon">+</span>
                        <span>Add New Address</span>
                      </button>
                    </div>
                    {addressModal && (
                      <AddressFormModal
                        editAddr={addressModal !== 'new' ? addressModal : null}
                        userId={user.userId}
                        onSaved={(addrs) => setAddresses(addrs)}
                        onClose={() => setAddressModal(null)}
                        addToast={addToast}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <SettingsTab user={user} setUserDetails={setUserDetails} addToast={addToast} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
