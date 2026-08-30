import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authFetch } from '../../constants/auth'
import { API_URL, ORDER_URL } from '../../constants/api'
import GenerateInvoiceButton from '../GenerateInvoiceButton'
import SettingsTab from '../SettingsTab'
import AdminBirthdayWishes from './AdminBirthdayWishes'

// Status mapping: backend orderStatus → frontend tab key
const STATUS_TO_TAB = {
  'Placed': 'placed',
  'Confirmed': 'confirmed',
  'Shipped': 'shipped',
  'Delivered': 'delivered',
  'Cancelled': 'cancelled',
  'Returned': 'returned',
}

const TAB_TO_STATUS = {
  'placed': 'Placed',
  'confirmed': 'Confirmed',
  'shipped': 'Shipped',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
  'returned': 'Returned',
}

const adminTabs = [
  { key: 'overview', icon: '◉', label: 'Overview' },
  { key: 'birthdays', icon: '🎂', label: 'Birthdays', birthdayCount: true },
  { key: 'placed', icon: '⏳', label: 'Placed Orders', countKey: 'placed' },
  { key: 'confirmed', icon: '✓', label: 'Confirmed Orders', countKey: 'confirmed' },
  { key: 'shipped', icon: '🚚', label: 'Shipped Orders', countKey: 'shipped' },
  { key: 'delivered', icon: '📦', label: 'Delivered Orders', countKey: 'delivered' },
  { key: 'cancelled', icon: '✕', label: 'Cancelled Orders', countKey: 'cancelled' },
  { key: 'returned', icon: '↩', label: 'Returned Orders', countKey: 'returned' },
  { key: 'settings', icon: '⚙', label: 'Settings' },
]

const categories = [
  { key: 'placed', label: 'Placed', icon: '⏳', color: '#C8933E' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓', color: '#218838' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', color: '#2C3E6B' },
  { key: 'delivered', label: 'Delivered', icon: '📦', color: '#3B5323' },
  { key: 'cancelled', label: 'Cancelled', icon: '✕', color: '#8B1A1A' },
  { key: 'returned', label: 'Returned', icon: '↩', color: '#6c3483' },
]

// Group flat orders array into { placed: [...], confirmed: [...], ... }
const groupOrdersByStatus = (orders) => {
  const grouped = {}
  for (const cat of categories) grouped[cat.key] = []
  for (const order of orders) {
    const tabKey = STATUS_TO_TAB[order.orderStatus] || 'placed'
    if (grouped[tabKey]) grouped[tabKey].push(order)
  }
  return grouped
}

function AdminOverview({ setActiveTab, ordersByStatus }) {
  const totalOrders = categories.reduce((sum, c) => sum + (ordersByStatus[c.key] || []).length, 0)

  // Build donut segments
  let cumulativePct = 0
  const donutSegments = categories.map(cat => {
    const count = (ordersByStatus[cat.key] || []).length
    const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0
    const start = cumulativePct
    cumulativePct += pct
    return { ...cat, count, pct, start }
  })
  const conicStops = donutSegments.map(s =>
    `${s.color} ${s.start}% ${s.start + s.pct}%`
  ).join(', ')

  const revenueByCategory = categories.map(cat => {
    const orders = ordersByStatus[cat.key] || []
    const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    return { ...cat, revenue, orderCount: orders.length }
  })
  const totalRevenue = revenueByCategory.reduce((sum, c) => sum + c.revenue, 0)
  const maxRevenue = Math.max(...revenueByCategory.map(c => c.revenue), 1)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return (
    <div className="profile-tab-content">
      <h3 className="profile-tab-title">Orders Overview</h3>

      {/* Clickable Summary Cards */}
      <div className="admin-overview-grid">
        {categories.map((cat, i) => (
          <button
            key={cat.key}
            className="admin-overview-card admin-overview-card-interactive"
            style={{ borderTopColor: cat.color, animationDelay: `${i * 0.08}s` }}
            onClick={() => setActiveTab(cat.key)}
            title={`View ${cat.label} Orders`}
          >
            <div className="admin-overview-card-top">
              <span className="admin-overview-card-icon" style={{ color: cat.color }}>{cat.icon}</span>
              <span className="admin-overview-card-count" style={{ color: cat.color }}>{(ordersByStatus[cat.key] || []).length}</span>
            </div>
            <span className="admin-overview-card-label">{cat.label} Orders</span>
            <span className="admin-overview-card-arrow" style={{ color: cat.color }}>→</span>
          </button>
        ))}
      </div>

      {/* Charts Row: Revenue Summary + Donut */}
      <div className="admin-charts-row">
        {/* Order Value Summary */}
        <div className="admin-orders-chart-section">
          <h4 className="admin-chart-heading">Revenue Summary</h4>
          <div className="admin-revenue-content">
            {/* Earnings Stats Row */}
            <div className="admin-earnings-row">
              <div className="admin-earning-stat">
                <span className="admin-earning-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
                <span className="admin-earning-label">Total Revenue</span>
              </div>
              <div className="admin-earning-divider" />
              <div className="admin-earning-stat">
                <span className="admin-earning-value">{totalOrders}</span>
                <span className="admin-earning-label">Total Orders</span>
              </div>
              <div className="admin-earning-divider" />
              <div className="admin-earning-stat">
                <span className="admin-earning-value">₹{avgOrderValue.toLocaleString('en-IN')}</span>
                <span className="admin-earning-label">Avg. Order Value</span>
              </div>
            </div>

            {/* Revenue per category — horizontal bars */}
            <div className="admin-revenue-bars">
              {revenueByCategory.map((cat, i) => {
                const pct = (cat.revenue / maxRevenue) * 100
                return (
                  <button
                    key={cat.key}
                    className="admin-revenue-bar-row"
                    onClick={() => setActiveTab(cat.key)}
                    title={`View ${cat.label} Orders`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="admin-revenue-bar-header">
                      <span className="admin-revenue-bar-icon" style={{ color: cat.color }}>{cat.icon}</span>
                      <span className="admin-revenue-bar-name">{cat.label}</span>
                      <span className="admin-revenue-bar-amount" style={{ color: cat.color }}>₹{cat.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="admin-revenue-bar-track">
                      <div
                        className="admin-revenue-bar-fill"
                        style={{ width: `${pct}%`, background: cat.color, animationDelay: `${i * 0.12}s` }}
                      />
                    </div>
                    <div className="admin-revenue-bar-meta">
                      <span>{cat.orderCount} order{cat.orderCount !== 1 ? 's' : ''}</span>
                      <span>{totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0}% of revenue</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="admin-donut-section">
          <h4 className="admin-chart-heading">Proportion</h4>
          <div className="admin-donut-wrapper">
            <div
              className="admin-donut"
              style={{ background: totalOrders > 0 ? `conic-gradient(${conicStops})` : '#e8e0d4' }}
            >
              <div className="admin-donut-hole">
                <span className="admin-donut-total">{totalOrders}</span>
                <span className="admin-donut-label">Total</span>
              </div>
            </div>
          </div>
          <div className="admin-donut-legend">
            {donutSegments.map(s => (
              <button
                key={s.key}
                className="admin-donut-legend-item"
                onClick={() => setActiveTab(s.key)}
                title={`View ${s.label} Orders`}
              >
                <span className="admin-donut-legend-dot" style={{ background: s.color }} />
                <span className="admin-donut-legend-name">{s.label}</span>
                <span className="admin-donut-legend-val">{s.count}</span>
                <span className="admin-donut-legend-pct">{s.pct.toFixed(0)}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

const NEXT_STATUS_OPTIONS = {
  'Placed': ['Placed', 'Confirmed', 'Cancelled'],
  'Confirmed': ['Confirmed', 'Shipped', 'Cancelled'],
  'Shipped': ['Shipped', 'Delivered'],
  'Delivered': ['Delivered', 'Returned'],
  'Cancelled': ['Cancelled'],
  'Returned': ['Returned'],
}

const STATUS_COLORS = {}
categories.forEach(c => { STATUS_COLORS[c.label] = c.color })

function TrackingIdModal({ orderId, onConfirm, onCancel }) {
  const [trackingId, setTrackingId] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <h4 className="admin-modal-title">Enter Tracking ID</h4>
        <p className="admin-modal-desc">Order <strong>{orderId}</strong> → <span style={{color:'#2C3E6B',fontWeight:600}}>Shipped</span></p>
        <input
          ref={inputRef}
          type="text"
          className="admin-prod-input"
          placeholder="e.g. TRACK-123456789"
          value={trackingId}
          onChange={e => setTrackingId(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && trackingId.trim()) onConfirm(trackingId.trim()) }}
          style={{ marginTop: '0.5rem' }}
        />
        <div className="admin-modal-actions">
          <button className="admin-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="admin-modal-confirm" disabled={!trackingId.trim()} onClick={() => onConfirm(trackingId.trim())}>Confirm & Ship</button>
        </div>
      </div>
    </div>
  )
}

function AdminAllOrdersTable({ allOrders, onStatusChange }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortIcon = (key) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

  const filtered = useMemo(() => {
    let list = [...allOrders]
    if (filterStatus !== 'All') list = list.filter(o => o.orderStatus === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(o =>
        (o.orderId || '').toLowerCase().includes(q) ||
        (o.userName || '').toLowerCase().includes(q) ||
        (o.userPhone || '').includes(q) ||
        (o.userEmail || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let va, vb
      switch (sortKey) {
        case 'orderId': va = a.orderId || ''; vb = b.orderId || ''; break
        case 'userName': va = (a.userName || '').toLowerCase(); vb = (b.userName || '').toLowerCase(); break
        case 'userPhone': va = a.userPhone || ''; vb = b.userPhone || ''; break
        case 'status': va = a.orderStatus || ''; vb = b.orderStatus || ''; break
        case 'total': va = a.totalAmount || 0; vb = b.totalAmount || 0; break
        default: va = a.createdAt || ''; vb = b.createdAt || ''
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [allOrders, search, filterStatus, sortKey, sortDir])

  const ALL_STATUSES = ['All', 'Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned']

  return (
    <div className="admin-allorders-section">
      <h4 className="admin-chart-heading">All Orders ({allOrders.length})</h4>

      {/* Filters row */}
      <div className="admin-allorders-filters">
        <div className="admin-allorders-search">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Search order ID, name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button type="button" className="admin-allorders-clear-btn" onClick={() => setSearch('')} title="Clear search">✕</button>
          )}
        </div>
        <div className="admin-allorders-status-filters">
          {ALL_STATUSES.map(s => (
            <button key={s}
              className={`admin-allorders-status-btn${filterStatus === s ? ' active' : ''}`}
              style={filterStatus === s && s !== 'All' ? { background: STATUS_COLORS[s] || '#555', color: '#fff', borderColor: STATUS_COLORS[s] || '#555' } : {}}
              onClick={() => setFilterStatus(s)}
            >{s}{s !== 'All' ? ` (${allOrders.filter(o => o.orderStatus === s).length})` : ''}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-allorders-table-wrap">
        <table className="admin-allorders-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th className="admin-allorders-sortable" onClick={() => toggleSort('orderId')}>Order ID{sortIcon('orderId')}</th>
              <th className="admin-allorders-sortable" onClick={() => toggleSort('userName')}>Customer{sortIcon('userName')}</th>
              <th className="admin-allorders-sortable" onClick={() => toggleSort('userPhone')}>Phone{sortIcon('userPhone')}</th>
              <th>Email</th>
              <th>Products</th>
              <th className="admin-allorders-sortable" onClick={() => toggleSort('total')}>Total{sortIcon('total')}</th>
              <th className="admin-allorders-sortable" onClick={() => toggleSort('status')}>Status{sortIcon('status')}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="9" className="admin-allorders-empty">No orders found</td></tr>
            ) : filtered.map((order, idx) => {
              const opts = NEXT_STATUS_OPTIONS[order.orderStatus] || [order.orderStatus]
              const isTerminal = opts.length <= 1
              return (
                <tr key={order._id}>
                  <td className="admin-allorders-sno">{idx + 1}</td>
                  <td className="admin-allorders-oid">{order.orderId}</td>
                  <td>{order.userName || '—'}</td>
                  <td>{order.userPhone || '—'}</td>
                  <td className="admin-allorders-email">{order.userEmail || '—'}</td>
                  <td className="admin-allorders-products">
                    {(order.items || []).map((item, i) => (
                      <span key={i} className="admin-allorders-product-chip" title={item.productName || item.product?.name || ''}>
                        {item.productCode || item.product?.productCode || '—'}
                      </span>
                    ))}
                  </td>
                  <td className="admin-allorders-total">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <span className="admin-allorders-status-badge" style={{ background: STATUS_COLORS[order.orderStatus] || '#888' }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-allorders-action-select"
                      value={order.orderStatus}
                      onChange={e => onStatusChange(order.orderId, e.target.value)}
                      disabled={isTerminal}
                    >
                      {opts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminOrderTab({ activeTab, ordersByStatus, onStatusChange, addToast }) {
  const orders = ordersByStatus[activeTab] || []
  const backendStatus = TAB_TO_STATUS[activeTab] || activeTab
  const [trackingModal, setTrackingModal] = useState(null) // { orderId }

  const handleLocalStatusChange = (orderId, newStatus) => {
    if (newStatus === 'Shipped') {
      setTrackingModal({ orderId })
    } else {
      onStatusChange(orderId, newStatus)
    }
  }

  return (
    <div className="profile-tab-content">
      <h3 className="profile-tab-title">{backendStatus} Orders ({orders.length})</h3>
      {trackingModal && (
        <TrackingIdModal
          orderId={trackingModal.orderId}
          onCancel={() => setTrackingModal(null)}
          onConfirm={(trackingId) => {
            onStatusChange(trackingModal.orderId, 'Shipped', trackingId)
            setTrackingModal(null)
          }}
        />
      )}

      {orders.length === 0 ? (
        <div className="admin-category-empty">
          <span className="admin-category-empty-icon">📦</span>
          <p>No {backendStatus.toLowerCase()} orders</p>
        </div>
      ) : (
        <div className="admin-order-cards">
          {orders.map(order => (
            <div key={order._id} className="admin-order-card">
              {/* Order header */}
              <div className="admin-order-card-header">
                <div className="admin-order-card-header-left">
                  <span className="admin-order-card-oid">Order #{order.orderId}</span>
                  <span className="admin-order-card-customer">{order.userName}{order.userPhone ? ` · ${order.userPhone}` : ''}</span>
                </div>
                <div className="admin-order-card-header-right">
                  <span className={`order-status ${activeTab}`}>{order.orderStatus}</span>
                  <select
                    className="admin-prod-input"
                    style={{fontSize:'0.72rem',padding:'0.25rem 0.5rem',width:'auto',minWidth:'130px'}}
                    value={order.orderStatus}
                    onChange={e => handleLocalStatusChange(order.orderId, e.target.value)}
                    disabled={!NEXT_STATUS_OPTIONS[order.orderStatus] || NEXT_STATUS_OPTIONS[order.orderStatus].length <= 1}
                  >
                    {(NEXT_STATUS_OPTIONS[order.orderStatus] || [order.orderStatus]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order items */}
              <div className="admin-order-items">
                {(order.items || []).map((item, idx) => {
                  const img = item.image || item.product?.image || ''
                  const name = item.productName || item.product?.name || '—'
                  const code = item.productCode || item.product?.productCode || '—'
                  const subcat = item.product?.subcategory || ''
                  return (
                    <div key={idx} className="admin-order-item-row">
                      <div className="admin-order-item-img">
                        {img ? <img src={img} alt={name} loading="lazy" /> : <span className="admin-order-item-noimag">📷</span>}
                      </div>
                      <div className="admin-order-item-details">
                        <span className="admin-order-item-name">{name}</span>
                        <span className="admin-order-item-meta">{code}{subcat ? ` · ${subcat}` : ''}{item.size ? ` · Size: ${item.size}` : ''}</span>
                      </div>
                      <div className="admin-order-item-nums">
                        <span className="admin-order-item-qty">×{item.qty}</span>
                        <span className="admin-order-item-price">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tracking ID display */}
              {order.trackingId && (
                <div className="admin-order-tracking">
                  <span className="admin-order-tracking-label">🚚 Tracking ID:</span>
                  <span className="admin-order-tracking-value">{order.trackingId}</span>
                </div>
              )}

              {/* Order footer */}
              <div className="admin-order-card-footer">
                <span className="admin-order-card-payment">{order.payment?.method || ''}{order.payment?.paymentStatus ? ` · ${order.payment.paymentStatus}` : ''}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <GenerateInvoiceButton order={order} />
                  <span className="admin-order-card-total">Total: ₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const AdminProfile = ({ user, activeTab, setActiveTab, handleLogout, setUserDetails, addToast }) => {
  const navigate = useNavigate()
  const [birthdayData, setBirthdayData] = useState([])
  const [birthdayLoading, setBirthdayLoading] = useState(true)
  const [allOrders, setAllOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const fetchAllOrders = () => {
    setOrdersLoading(true)
    authFetch(`${ORDER_URL}/admin/all?limit=1000`)
      .then(async res => {
        if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to load orders') }
        return res.json()
      })
      .then(data => setAllOrders(data.orders || []))
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setOrdersLoading(false))
  }

  useEffect(() => {
    fetchAllOrders()
    authFetch(`${API_URL}/admin/birthdays`)
      .then(async res => {
        if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to load birthdays') }
        return res.json()
      })
      .then(d => setBirthdayData(d.birthdays || []))
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setBirthdayLoading(false))
  }, [])

  const ordersByStatus = groupOrdersByStatus(allOrders)

  const [trackingModalOverview, setTrackingModalOverview] = useState(null)

  const handleStatusChange = async (orderId, newStatus, trackingId) => {
    try {
      const body = { status: newStatus }
      if (trackingId) body.trackingId = trackingId
      const res = await authFetch(`${ORDER_URL}/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to update status') }
      addToast(`Order ${orderId} updated to "${newStatus}"`, 'success')
      fetchAllOrders()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const todayBirthdayCount = birthdayData.filter(b => b.daysUntil === 0).length

  return (
    <>
      {/* Profile Sidebar */}
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

          <button className="profile-manage-data-btn" onClick={() => navigate('/profile/adminView')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            Manage Data
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="profile-nav">
          {adminTabs.map(tab => (
            <button
              key={tab.key}
              className={`profile-nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="profile-nav-icon">{tab.icon}</span>
              {tab.label}
              {tab.countKey && <span className="profile-nav-count">{(ordersByStatus[tab.countKey] || []).length}</span>}
              {tab.birthdayCount && todayBirthdayCount > 0 && <span className="profile-nav-count birthday-nav-count">{todayBirthdayCount}</span>}
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

      {/* Profile Content */}
      <div className="profile-content">
        {activeTab === 'overview' && (
            <AdminOverview setActiveTab={setActiveTab} ordersByStatus={ordersByStatus} />
        )}

        {['placed', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'].includes(activeTab) && (
          ordersLoading ? (
            <div className="profile-tab-content">
              <div className="admin-category-loading"><div className="admin-spinner" /><p>Loading orders...</p></div>
            </div>
          ) : (
            <AdminOrderTab activeTab={activeTab} ordersByStatus={ordersByStatus} onStatusChange={handleStatusChange} addToast={addToast} />
          )
        )}

        {activeTab === 'birthdays' && (
          <AdminBirthdayWishes birthdays={birthdayData} loading={birthdayLoading} addToast={addToast} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab user={user} setUserDetails={setUserDetails} addToast={addToast} />
        )}
      </div>

      {/* Tracking ID modal for overview table */}
      {trackingModalOverview && (
        <TrackingIdModal
          orderId={trackingModalOverview.orderId}
          onCancel={() => setTrackingModalOverview(null)}
          onConfirm={(trackingId) => {
            handleStatusChange(trackingModalOverview.orderId, 'Shipped', trackingId)
            setTrackingModalOverview(null)
          }}
        />
      )}

      {/* Full-width All Orders Table — rendered outside sidebar layout */}
      {activeTab === 'overview' && (
        <div className="admin-allorders-fullwidth">
          <AdminAllOrdersTable allOrders={allOrders} onStatusChange={(orderId, newStatus) => {
            if (newStatus === 'Shipped') {
              setTrackingModalOverview({ orderId })
            } else {
              handleStatusChange(orderId, newStatus)
            }
          }} />
        </div>
      )}
    </>
  )
}

export default AdminProfile
