import { useState, useEffect } from 'react'
import { CATEGORY_URL, fetchCategories as fetchCategoriesCache, invalidateCategoryCache } from '../../constants/api'
import { useToast } from '../Toast'
import CustomDropdown from '../CustomDropdown'

const ICON_OPTIONS = [ 
  { value: '🥻', label: '🥻 Saree' },
  { value: '👗', label: '👗 Dress' },
  { value: '🧶', label: '🧶 Yarn' },
  { value: '👚', label: '👚 Blouse' },
  { value: '🧵', label: '🧵 Thread' }, 
  { value: '🧣', label: '🧣 Scarf' },
  { value: '👘', label: '👘 Kimono' },
  { value: '👕', label: '👕 T-Shirt' },
  { value: '�', label: '👔 Shirt' },
  { value: '🩱', label: '🩱 Swimsuit' },
  { value: '👙', label: '👙 Bikini' },
  { value: '🧥', label: '🧥 Coat' },
  { value: '🪡', label: '🪡 Needle' },
  { value: '🎨', label: '🎨 Palette' },
  { value: '🌺', label: '🌺 Hibiscus' },   
  { value: '🌸', label: '🌸 Blossom' },
  { value: '🦚', label: '🦚 Peacock' },
  { value: '🪷', label: '🪷 Lotus' },
  { value: '🎭', label: '🎭 Arts' },
  { value: '✨', label: '✨ Sparkles' },
  { value: '💎', label: '💎 Gem' },
  { value: '🎀', label: '🎀 Ribbon' },
  { value: '👛', label: '👛 Purse' },
  { value: '👜', label: '👜 Handbag' },
  { value: '🧴', label: '🧴 Lotion' },
  { value: '�📁', label: '📁 Folder' },
]

const AdminCategory = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', icon: '', subCategories: [''] })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', icon: '', subCategories: [''] })
  const [editSaving, setEditSaving] = useState(false)
  const { addToast } = useToast()

  const fetchCategories = () => { 
    invalidateCategoryCache()
    fetchCategoriesCache()
      .then(data => setCategories(data))
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSubChange = (index, value) => {
    setForm(prev => {
      const subs = [...prev.subCategories]
      subs[index] = value
      return { ...prev, subCategories: subs }
    })
  }

  const addSubField = () => {
    setForm(prev => ({ ...prev, subCategories: [...prev.subCategories, ''] }))
  }

  const removeSubField = (index) => {   
    setForm(prev => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== index),
    }))
  }

  const resetForm = () => {
    setForm({ name: '', icon: '', subCategories: [''] })
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { addToast('Category name is required', 'error'); return }
    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
        icon: form.icon.trim(),
        subCategories: form.subCategories.map(s => s.trim()).filter(Boolean),
      }
      const res = await fetch(CATEGORY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to add category') }
      addToast('Category added successfully!', 'success')
      resetForm()
      fetchCategories()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  /* ── Edit ── */
  const startEdit = (cat) => {
    setEditingId(cat._id)
    setEditForm({
      name: cat.name,
      icon: cat.icon || '',
      subCategories: cat.subCategories?.length > 0 ? [...cat.subCategories] : [''],
    })
  }

  const cancelEdit = () => { setEditingId(null) }

  const handleEditSubChange = (index, value) => {
    setEditForm(prev => {
      const subs = [...prev.subCategories]
      subs[index] = value
      return { ...prev, subCategories: subs }
    })
  }

  const handleEditSave = async () => {
    if (!editForm.name.trim()) { addToast('Category name is required', 'error'); return }
    setEditSaving(true)
    try {
      const body = {
        name: editForm.name.trim(),
        icon: editForm.icon.trim(),
        subCategories: editForm.subCategories.map(s => s.trim()).filter(Boolean),
      }
      const res = await fetch(`${CATEGORY_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update category') }
      addToast('Category updated!', 'success')
      setEditingId(null)
      fetchCategories()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setEditSaving(false)
    }
  }

  /* ── Delete ── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`${CATEGORY_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to delete category') }
      addToast('Category deleted', 'success')
      fetchCategories()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-header-top">
          <div>
            <h2 className="admin-card-title">Manage Categories</h2>
            <p className="admin-card-desc">Add, edit or remove product categories and subcategories.</p>
          </div>
          <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Category'}
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showForm && (
        <form className="admin-cat-form" onSubmit={handleSubmit}>
          <div className="admin-cat-form-row">
            <div className="admin-cat-field">
              <label className="admin-cat-label">Category Name *</label>
              <input
                className="admin-cat-input"
                type="text"
                placeholder="e.g. Sarees"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="admin-cat-field admin-cat-field--icon">
              <label className="admin-cat-label">Icon</label>
              <CustomDropdown
                value={form.icon}
                placeholder="Select Icon"
                options={ICON_OPTIONS}
                onSelect={val => setForm(prev => ({ ...prev, icon: val }))}
              />
            </div>
          </div>

          <div className="admin-cat-field">
            <label className="admin-cat-label">Subcategories</label>
            <div className="admin-cat-subs">
              {form.subCategories.map((sub, i) => (
                <div key={i} className="admin-cat-sub-row">
                  <input
                    className="admin-cat-input"
                    type="text"
                    placeholder={`Subcategory ${i + 1}`}
                    value={sub}
                    onChange={e => handleSubChange(i, e.target.value)}
                  />
                  {form.subCategories.length > 1 && (
                    <button type="button" className="admin-cat-sub-remove" onClick={() => removeSubField(i)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="admin-cat-sub-add" onClick={addSubField}>
                + Add Subcategory
              </button>
            </div>
          </div>

          <div className="admin-cat-form-actions">
            <button type="button" className="admin-cat-cancel" onClick={resetForm}>Cancel</button>
            <button type="submit" className="admin-cat-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      <div className="admin-category-body">
        {loading ? (
          <div className="admin-category-loading">
            <div className="admin-spinner" />
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="admin-category-empty">
            <span className="admin-category-empty-icon">📂</span>
            <p>No categories available</p>
          </div>
        ) : (
          <div className="admin-category-list">
            {categories.map(cat => (
              <div key={cat._id} className="admin-category-item">
                {editingId === cat._id ? (
                  /* ── Inline edit form ── */
                  <div className="admin-cat-edit-form">
                    <div className="admin-cat-form-row">
                      <div className="admin-cat-field">
                        <label className="admin-cat-label">Name *</label>
                        <input
                          className="admin-cat-input"
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="admin-cat-field admin-cat-field--icon">
                        <label className="admin-cat-label">Icon</label>
                        <CustomDropdown
                          value={editForm.icon}
                          placeholder="Select Icon"
                          options={ICON_OPTIONS}
                          onSelect={val => setEditForm(prev => ({ ...prev, icon: val }))}
                        />
                      </div>
                    </div>
                    <div className="admin-cat-field">
                      <label className="admin-cat-label">Subcategories</label>
                      <div className="admin-cat-subs">
                        {editForm.subCategories.map((sub, i) => (
                          <div key={i} className="admin-cat-sub-row">
                            <input
                              className="admin-cat-input"
                              type="text"
                              placeholder={`Subcategory ${i + 1}`}
                              value={sub}
                              onChange={e => handleEditSubChange(i, e.target.value)}
                            />
                            {editForm.subCategories.length > 1 && (
                              <button type="button" className="admin-cat-sub-remove" onClick={() => setEditForm(prev => ({
                                ...prev, subCategories: prev.subCategories.filter((_, idx) => idx !== i)
                              }))}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" className="admin-cat-sub-add" onClick={() => setEditForm(prev => ({
                          ...prev, subCategories: [...prev.subCategories, '']
                        }))}>
                          + Add Subcategory
                        </button>
                      </div>
                    </div>
                    <div className="admin-cat-form-actions">
                      <button type="button" className="admin-cat-cancel" onClick={cancelEdit}>Cancel</button>
                      <button type="button" className="admin-cat-save" disabled={editSaving} onClick={handleEditSave}>
                        {editSaving ? 'Saving...' : 'Update'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Normal display ── */
                  <>
                    <span className="admin-category-icon">{cat.icon || '📁'}</span>
                    <div className="admin-category-info">
                      <strong>{cat.name}</strong>
                      <span>{cat.subCategories?.length > 0 ? cat.subCategories.join(', ') : 'No subcategories'}</span>
                    </div>
                    <div className="admin-category-actions">
                      <button className="admin-cat-action-btn admin-cat-edit-btn" onClick={() => startEdit(cat)} title="Edit">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2-7 7H3.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button className="admin-cat-action-btn admin-cat-delete-btn" onClick={() => handleDelete(cat._id, cat.name)} title="Delete">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 4.5h9M5.5 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5M6 7v3.5M9 7v3.5M4 4.5l.5 7.5a1 1 0 001 1h4a1 1 0 001-1l.5-7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategory
