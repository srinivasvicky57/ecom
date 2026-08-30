import { useState, useEffect } from 'react'
import { BANNER_URL, fetchBanner, invalidateBannerCache } from '../../constants/api'
import { EditIcon } from '../../assets/svgs'
import { useToast } from '../Toast'

const FIELDS = [
  { key: 'text', label: 'Announcement Text', type: 'textarea', placeholder: 'Enter banner announcement text...' },
  { key: 'badge', label: 'Badge', type: 'text', placeholder: 'e.g. Handcrafted with Love' },
  { key: 'title', label: 'Title', type: 'text', placeholder: 'e.g. MS Vastravarna' },
  { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. The ultimate kalamkari fashion house' },
  { key: 'subheading', label: 'Subheading', type: 'text', placeholder: 'e.g. Every piece is a canvas...' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter description...' },
  { key: 'products', label: 'Products Count', type: 'number', placeholder: '0' },
  { key: 'artisans', label: 'Artisans Count', type: 'number', placeholder: '0' },
]

const AdminBanner = () => {
  const [form, setForm] = useState({
    text: '', badge: '', title: '', tagline: '', subheading: '', description: '', products: 0, artisans: 0,
  })
  const [happyCustomers, setHappyCustomers] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bannerMsg, setBannerMsg] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    fetchBanner()
      .then(data => {
        setForm({
          text: data.text || '',
          badge: data.badge || '',
          title: data.title || '',
          tagline: data.tagline || '',
          subheading: data.subheading || '',
          description: data.description || '',
          products: data.products || 0,
          artisans: data.artisans || 0,
        })
        setHappyCustomers(data.happyCustomers || 0)
      })
      .catch((err) => addToast(err.message, 'error'))
  }, [])

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: ['products', 'artisans'].includes(key) ? (parseInt(value, 10) || 0) : value }))
  }

  const handleSaveBanner = () => {
    setSaving(true)
    setBannerMsg('')
    fetch(BANNER_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(async res => {
        if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to update banner'); }
        return res.json();
      })
      .then((data) => {
        invalidateBannerCache()
        setBannerMsg('Banner updated successfully!')
        setIsEditing(false)
        if (data.happyCustomers !== undefined) setHappyCustomers(data.happyCustomers)
        setTimeout(() => setBannerMsg(''), 3000)
      })
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setSaving(false))
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Banner</h2>
        {!isEditing ? (
          <button className="admin-add-btn" onClick={() => setIsEditing(true)}>
            <EditIcon />
            Edit
          </button>
        ) : (
          <div className="admin-banner-actions">
            <button className="admin-add-btn" onClick={handleSaveBanner} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="admin-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}
      </div>
      <div className="admin-banner-content">
        {isEditing ? (
          <div className="admin-banner-form">
            {FIELDS.map(f => (
              <div key={f.key} className="admin-banner-field">
                <label className="admin-banner-label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    className="admin-banner-input"
                    value={form[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                  />
                ) : (
                  <input
                    className="admin-banner-input"
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
            <div className="admin-banner-field">
              <label className="admin-banner-label">Happy Customers (Auto)</label>
              <input
                className="admin-banner-input admin-banner-input-disabled"
                type="number"
                value={happyCustomers}
                disabled
              />
              <span className="admin-banner-hint">This is the total registered users count and updates automatically.</span>
            </div>
          </div>
        ) : (
          <div className="admin-banner-preview">
            {FIELDS.map(f => (
              <div key={f.key} className="admin-banner-preview-row">
                <span className="admin-banner-preview-label">{f.label}</span>
                <span className="admin-banner-preview-value">
                  {form[f.key] || <span className="admin-banner-empty">Not set</span>}
                </span>
              </div>
            ))}
            <div className="admin-banner-preview-row">
              <span className="admin-banner-preview-label">Happy Customers (Auto)</span>
              <span className="admin-banner-preview-value">{happyCustomers}</span>
            </div>
          </div>
        )}
        {bannerMsg && <p className="admin-banner-msg">{bannerMsg}</p>}
      </div>
    </div>
  )
}

export default AdminBanner
