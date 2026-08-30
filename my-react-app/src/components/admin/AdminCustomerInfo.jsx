import { useState, useEffect } from 'react'
import { INFO_URL, fetchInfo, invalidateInfoCache } from '../../constants/api'
import { useToast } from '../Toast'

const SECTION_ICONS = {
  shipping: '🚚',
  returns: '🔄',
  'size-guide': '📏',
  faq: '❓',
}

const AdminCustomerInfo = () => {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedType, setExpandedType] = useState(null)
  const [addingTo, setAddingTo] = useState(null)
  const [addForm, setAddForm] = useState({ heading: '', text: '' })
  const [editIdx, setEditIdx] = useState(null)
  const [editForm, setEditForm] = useState({ heading: '', text: '' })
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const fetchSections = () => {
    invalidateInfoCache()
    fetchInfo()
      .then(data => setSections(data))
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSections() }, [])

  const updateSection = async (type, content) => {
    setSaving(true)
    try {
      const res = await fetch(`${INFO_URL}/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update'); }
      fetchSections()
      return true
    } catch (err) {
      addToast(err.message, 'error')
      return false
    } finally {
      setSaving(false)
    }
  }

  /* ── Add ── */
  const handleAdd = async (section) => {
    if (!addForm.heading.trim()) { addToast('Heading is required', 'error'); return }
    const newContent = [...section.content, { heading: addForm.heading.trim(), text: addForm.text.trim() }]
    const ok = await updateSection(section.type, newContent)
    if (ok) { setAddForm({ heading: '', text: '' }); setAddingTo(null); addToast('Item added!', 'success') }
  }

  /* ── Edit ── */
  const startEdit = (idx, item) => {
    setEditIdx(idx)
    setEditForm({ heading: item.heading, text: item.text || '' })
  }

  const handleEditSave = async (section, idx) => {
    if (!editForm.heading.trim()) { addToast('Heading is required', 'error'); return }
    const newContent = section.content.map((c, i) =>
      i === idx ? { heading: editForm.heading.trim(), text: editForm.text.trim() } : c
    )
    const ok = await updateSection(section.type, newContent)
    if (ok) { setEditIdx(null); addToast('Item updated!', 'success') }
  }

  /* ── Delete ── */
  const handleDelete = async (section, idx) => {
    if (!window.confirm(`Delete "${section.content[idx].heading}"?`)) return
    const newContent = section.content.filter((_, i) => i !== idx)
    const ok = await updateSection(section.type, newContent)
    if (ok) addToast('Item deleted', 'success')
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <p className="admin-card-desc">Manage shipping, returns, size guide &amp; FAQ content shown to customers.</p>
        </div>
      </div>

      <div className="admin-category-body">
        {loading ? (
          <div className="admin-category-loading">
            <div className="admin-spinner" />
            <p>Loading info sections...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="admin-category-empty">
            <span className="admin-category-empty-icon">📄</span>
            <p>No info sections found</p>
          </div>
        ) : (
          <div className="admin-info-sections">
            {sections.map(section => {
              const isOpen = expandedType === section.type
              return (
                <div key={section.type} className="admin-info-section">
                  {/* Section header */}
                  <button
                    className={`admin-info-section-header${isOpen ? ' open' : ''}`}
                    onClick={() => { setExpandedType(isOpen ? null : section.type); setAddingTo(null); setEditIdx(null) }}
                  >
                    <span className="admin-info-section-icon">{SECTION_ICONS[section.type] || '📄'}</span>
                    <span className="admin-info-section-name">{section.title}</span>
                    <span className="admin-info-section-count">{section.content.length} items</span>
                    <svg className="admin-accordion-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="admin-info-section-body">
                      {/* Content items list */}
                      {section.content.length === 0 ? (
                        <p className="admin-info-empty">No content items yet.</p>
                      ) : (
                        <div className="admin-info-items">
                          {section.content.map((item, idx) => (
                            <div key={idx} className="admin-info-item">
                              {editIdx === idx && expandedType === section.type ? (
                                /* ── Edit mode ── */
                                <div className="admin-info-edit-form">
                                  <div className="admin-cat-field">
                                    <label className="admin-cat-label">Heading *</label>
                                    <input
                                      className="admin-cat-input"
                                      type="text"
                                      value={editForm.heading}
                                      onChange={e => setEditForm(prev => ({ ...prev, heading: e.target.value }))}
                                    />
                                  </div>
                                  <div className="admin-cat-field">
                                    <label className="admin-cat-label">Text</label>
                                    <textarea
                                      className="admin-cat-input admin-info-textarea"
                                      rows={3}
                                      value={editForm.text}
                                      onChange={e => setEditForm(prev => ({ ...prev, text: e.target.value }))}
                                    />
                                  </div>
                                  <div className="admin-cat-form-actions">
                                    <button type="button" className="admin-cat-cancel" onClick={() => setEditIdx(null)}>Cancel</button>
                                    <button type="button" className="admin-cat-save" disabled={saving} onClick={() => handleEditSave(section, idx)}>
                                      {saving ? 'Saving...' : 'Update'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* ── Display mode ── */
                                <>
                                  <div className="admin-info-item-content">
                                    <strong className="admin-info-item-heading">{item.heading}</strong>
                                    {item.text && <p className="admin-info-item-text">{item.text}</p>}
                                  </div>
                                  <div className="admin-category-actions">
                                    <button className="admin-cat-action-btn admin-cat-edit-btn" onClick={() => startEdit(idx, item)} title="Edit">
                                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2-7 7H3.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                    <button className="admin-cat-action-btn admin-cat-delete-btn" onClick={() => handleDelete(section, idx)} title="Delete">
                                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 4.5h9M5.5 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5M6 7v3.5M9 7v3.5M4 4.5l.5 7.5a1 1 0 001 1h4a1 1 0 001-1l.5-7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new item */}
                      {addingTo === section.type ? (
                        <div className="admin-info-add-form">
                          <div className="admin-cat-field">
                            <label className="admin-cat-label">Heading *</label>
                            <input
                              className="admin-cat-input"
                              type="text"
                              placeholder="e.g. Delivery Timeline"
                              value={addForm.heading}
                              onChange={e => setAddForm(prev => ({ ...prev, heading: e.target.value }))}
                            />
                          </div>
                          <div className="admin-cat-field">
                            <label className="admin-cat-label">Text</label>
                            <textarea
                              className="admin-cat-input admin-info-textarea"
                              rows={3}
                              placeholder="Description text..."
                              value={addForm.text}
                              onChange={e => setAddForm(prev => ({ ...prev, text: e.target.value }))}
                            />
                          </div>
                          <div className="admin-cat-form-actions">
                            <button type="button" className="admin-cat-cancel" onClick={() => { setAddingTo(null); setAddForm({ heading: '', text: '' }) }}>Cancel</button>
                            <button type="button" className="admin-cat-save" disabled={saving} onClick={() => handleAdd(section)}>
                              {saving ? 'Saving...' : 'Add Item'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="admin-info-add-btn" onClick={() => { setAddingTo(section.type); setAddForm({ heading: '', text: '' }); setEditIdx(null) }}>
                          + Add Item
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCustomerInfo
