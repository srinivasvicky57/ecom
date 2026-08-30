import { useEffect, useMemo, useState } from 'react'
import {
  PRODUCT_CODE_IMAGE_URL,
  fetchProductCodeImages as fetchProductCodeImagesCache,
  invalidateProductCodeImageCache,
} from '../../constants/api'
import { authFetch } from '../../constants/auth'
import { useToast } from '../Toast'

const emptyForm = { productCode: '', imageFile: null }

const AdminProductCodeImages = () => {
  const [mappings, setMappings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [previewSrc, setPreviewSrc] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { addToast } = useToast()

  const fetchMappings = () => {
    invalidateProductCodeImageCache()
    fetchProductCodeImagesCache()
      .then((data) => setMappings(data))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMappings()
  }, [])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleImageFileChange = (file) => {
    if (!file) {
      update('imageFile', null)
      setPreviewSrc('')
      return
    }
    update('imageFile', file)
    setPreviewSrc(URL.createObjectURL(file))
  }

  const resetForm = () => {
    setForm({ ...emptyForm })
    setPreviewSrc('')
    setEditingId(null)
    setShowForm(false)
  }

  const startAdd = () => {
    setForm({ ...emptyForm })
    setEditingId(null)
    setShowForm(true)
  }

  const startEdit = (item) => {
    setForm({
      productCode: item.productCode || '',
      imageFile: null,
    })
    setPreviewSrc(item.image || '')
    setEditingId(item._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.productCode.trim()) { addToast('Product code is required', 'error'); return }
    if (!editingId && !form.imageFile) { addToast('Please select an image file', 'error'); return }

    setSaving(true)
    try {
      const body = new FormData()
      body.append('productCode', form.productCode.trim().toUpperCase())
      if (form.imageFile) body.append('image', form.imageFile)

      const url = editingId ? `${PRODUCT_CODE_IMAGE_URL}/${editingId}` : PRODUCT_CODE_IMAGE_URL
      const method = editingId ? 'PUT' : 'POST'

      const res = await authFetch(url, {
        method,
        body,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `Failed to ${editingId ? 'update' : 'create'} mapping`)
      }

      addToast(editingId ? 'Mapping updated!' : 'Mapping created!', 'success')
      resetForm()
      fetchMappings()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete mapping for ${code}? This cannot be undone.`)) return
    try {
      const res = await authFetch(`${PRODUCT_CODE_IMAGE_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete mapping')
      }
      addToast('Mapping deleted', 'success')
      fetchMappings()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const filteredMappings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return mappings
    return mappings.filter((item) =>
      item.productCode.toLowerCase().includes(q) || item.image.toLowerCase().includes(q)
    )
  }, [mappings, searchQuery])

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-header-top">
          <div>
            <h2 className="admin-card-title">Product Code and Image Mapping</h2>
            <p className="admin-card-desc">Create product codes and upload product images.</p>
          </div>
          <button className="admin-add-btn" onClick={() => (showForm ? resetForm() : startAdd())}>
            {showForm ? '✕ Cancel' : '+ Add Code and Image'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="admin-cat-form" onSubmit={handleSubmit}>
          <div className="admin-cat-form-row">
            <div className="admin-cat-field">
              <label className="admin-cat-label">Product Code *</label>
              <input
                className="admin-cat-input"
                type="text"
                placeholder="e.g. KK-SAR-001"
                value={form.productCode}
                onChange={(e) => update('productCode', e.target.value.toUpperCase())}
              />
            </div>
            <div className="admin-cat-field">
              <label className="admin-cat-label">Image File {editingId ? '' : '*'} </label>
              <input
                className="admin-cat-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {previewSrc && (
            <div className="admin-cat-field">
              <label className="admin-cat-label">Preview</label>
              <img
                src={previewSrc}
                alt="Selected"
                style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--kk-border)' }}
              />
            </div>
          )}

          <div className="admin-cat-form-actions">
            <button type="button" className="admin-cat-cancel" onClick={resetForm}>Cancel</button>
            <button type="submit" className="admin-cat-save" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Mapping' : 'Save Mapping'}
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="admin-prod-search-bar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            className="admin-prod-search"
            type="text"
            placeholder="Search by code or image path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className="admin-category-body">
        {loading ? (
          <div className="admin-category-loading"><div className="admin-spinner" /><p>Loading mappings...</p></div>
        ) : filteredMappings.length === 0 ? (
          <div className="admin-category-empty">
            <span className="admin-category-empty-icon">🖼️</span>
            <p>{searchQuery ? 'No mappings match your search' : 'No product code-image mappings yet'}</p>
          </div>
        ) : (
          <div className="admin-category-list">
            {filteredMappings.map((item) => (
              <div key={item._id} className="admin-category-item">
                <span className="admin-category-icon">🏷️</span>
                <div className="admin-category-info">
                  <strong>{item.productCode}</strong>
                  <img
                    src={item.image}
                    alt={item.productCode}
                    style={{ width: '56px', height: '74px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--kk-border)' }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.image}</span>
                </div>
                <div className="admin-category-actions">
                  <button className="admin-cat-action-btn admin-cat-edit-btn" onClick={() => startEdit(item)} title="Edit">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2-7 7H3.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button className="admin-cat-action-btn admin-cat-delete-btn" onClick={() => handleDelete(item._id, item.productCode)} title="Delete">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 4.5h9M5.5 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5M6 7v3.5M9 7v3.5M4 4.5l.5 7.5a1 1 0 001 1h4a1 1 0 001-1l.5-7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProductCodeImages
