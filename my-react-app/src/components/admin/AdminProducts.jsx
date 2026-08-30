import { useState, useEffect } from 'react'
import { PRODUCT_URL, fetchProducts as fetchProductsCache, invalidateProductCache } from '../../constants/api'
import { CATEGORY_URL, fetchCategories as fetchCategoriesCache } from '../../constants/api'
import {
  fetchProductCodeImages as fetchProductCodeImagesCache,
  invalidateProductCodeImageCache,
} from '../../constants/api'
import { authFetch } from '../../constants/auth'
import { useToast } from '../Toast'
import CustomDropdown from '../CustomDropdown'

const BADGE_OPTIONS = [
  { value: 'Bestseller', label: 'Bestseller' },
  { value: 'New', label: 'New' },
  { value: 'Trending', label: 'Trending' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Sale', label: 'Sale' },
]

const TAG_OPTIONS = [
  'kalamkari', 'silk', 'cotton', 'linen', 'chiffon',
  'handpainted', 'blockprint', 'penwork', 'embroidered', 'mirrorwork',
  'wedding', 'festive', 'party', 'casual', 'daily',
  'premium', 'lightweight', 'breathable',
  'peacock', 'lotus', 'paisley', 'floral', 'vine', 'elephant', 'treeoflife', 'chariot', 'temple',
  'saree', 'dupatta', 'kurti', 'anarkali', 'blouse', 'frock', 'top', 'fabric',
  'kids', 'readymade', 'stitched', 'unstitched', 'material',
  'running', 'salwar', 'kurta', 'dressmaterial', 'set', 'upholstery', 'homedecor', 'cushion',
  'indigo', 'pastel', 'srikalahasti', 'machilipatnam',
  'padded', 'princesscut', 'mandarin', 'puffsleeves', 'aline', 'straight', 'floorlength', 'jeans',
  'complete',
]

const emptyForm = {
  productCode: '', name: '', category: '', subcategory: '', description: '',
  price: '', originalPrice: '', discount: '', image: '', badge: '', material: '',
  isFeatured: false, isActive: true,
  sizes: [{ size: '', stock: '' }],
  colors: [''],
  tags: [],
  weight: '', dimensions: '', careInstructions: '',
}

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [productCodeOptions, setProductCodeOptions] = useState([])
  const [productCodeToImage, setProductCodeToImage] = useState({})
  const { addToast } = useToast()

  const fetchProducts = () => {
    invalidateProductCache()
    fetchProductsCache()
      .then(data => setProducts(data))
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
    fetchCategoriesCache().then(setCategories).catch(() => {})
    invalidateProductCodeImageCache()
    fetchProductCodeImagesCache()
      .then((data) => {
        const options = data.map((item) => ({ value: item.productCode, label: item.productCode }))
        const map = data.reduce((acc, item) => {
          acc[item.productCode] = item.image
          return acc
        }, {})
        setProductCodeOptions(options)
        setProductCodeToImage(map)
      })
      .catch((err) => addToast(err.message, 'error'))
  }, [])

  // Derived: category & subcategory options for dropdown
  const categoryOptions = categories.map(c => ({ value: c.name, label: `${c.icon || '📁'} ${c.name}` }))
  const selectedCat = categories.find(c => c.name === form.category)
  const subcatOptions = (selectedCat?.subCategories || []).map(s => ({ value: s, label: s }))

  // Form updaters
  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const calculateDiscount = (originalPrice, sellingPrice) => {
    const original = Number(originalPrice || 0)
    const selling = Number(sellingPrice || 0)

    if (!original || !selling || original <= 0 || selling <= 0) return 0
    if (selling >= original) return 0

    const discountPercent = ((original - selling) / original) * 100
    return Math.round(Math.max(0, Math.min(100, discountPercent)))
  }

  const updatePriceFields = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      next.discount = calculateDiscount(next.originalPrice, next.price)
      return next
    })
  }

  // Sizes
  const updateSize = (i, key, val) => setForm(prev => {
    const sizes = [...prev.sizes]; sizes[i] = { ...sizes[i], [key]: val }; return { ...prev, sizes }
  })
  const addSize = () => setForm(prev => ({ ...prev, sizes: [...prev.sizes, { size: '', stock: '' }] }))
  const removeSize = (i) => setForm(prev => ({ ...prev, sizes: prev.sizes.filter((_, idx) => idx !== i) }))

  // Colors
  const updateColor = (i, val) => setForm(prev => {
    const colors = [...prev.colors]; colors[i] = val; return { ...prev, colors }
  })
  const addColor = () => setForm(prev => ({ ...prev, colors: [...prev.colors, ''] }))
  const removeColor = (i) => setForm(prev => ({ ...prev, colors: prev.colors.filter((_, idx) => idx !== i) }))

  // Tags (multi-select toggle)
  const toggleTag = (tag) => setForm(prev => {
    const tags = prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    return { ...prev, tags }
  })

  const resetForm = () => {
    setForm({ ...emptyForm, sizes: [{ size: '', stock: '' }], colors: [''], tags: [] })
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (product) => {
    setEditingId(product._id)
    setForm({
      productCode: product.productCode || '',
      name: product.name || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      description: product.description || '',
      price: product.price ?? '',
      originalPrice: product.originalPrice ?? '',
      discount: product.discount ?? '',
      image: product.image || '',
      badge: product.badge || '',
      material: product.material || '',
      isFeatured: product.isFeatured ?? false,
      isActive: product.isActive ?? true,
      sizes: product.sizes?.length > 0 ? product.sizes.map(s => ({ size: s.size, stock: s.stock })) : [{ size: '', stock: '' }],
      colors: product.colors?.length > 0 ? [...product.colors] : [''],
      tags: product.tags?.length > 0 ? [...product.tags] : [],
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      careInstructions: product.careInstructions || '',
    })
    setShowForm(true)
    // Scroll to top of form
    setTimeout(() => document.querySelector('.admin-prod-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.productCode.trim()) { addToast('Product code is required', 'error'); return }
    if (!form.name.trim()) { addToast('Product name is required', 'error'); return }
    if (!form.category.trim()) { addToast('Category is required', 'error'); return }
    if (!form.subcategory.trim()) { addToast('Subcategory is required', 'error'); return }
    if (!form.price || Number(form.price) <= 0) { addToast('Valid price is required', 'error'); return }
    if (!form.originalPrice || Number(form.originalPrice) <= 0) { addToast('Valid original price is required', 'error'); return }

    const computedDiscount = calculateDiscount(form.originalPrice, form.price)
    setForm(prev => ({ ...prev, discount: computedDiscount }))

    const resolvedImage = productCodeToImage[form.productCode.trim()] || form.image.trim()
    if (!resolvedImage) { addToast('Mapped image not found for selected product code', 'error'); return }
    if (!form.material.trim()) { addToast('Material is required', 'error'); return }
    const validSizes = form.sizes.filter(s => s.size.trim())
    if (validSizes.length === 0) { addToast('At least one size with stock is required', 'error'); return }
    if (validSizes.some(s => s.stock === '' || Number(s.stock) < 0)) { addToast('Stock is required for each size', 'error'); return }

    setSaving(true)
    try {
      const body = {
        productCode: form.productCode.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        subcategory: form.subcategory.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || 0,
        discount: computedDiscount,
        image: resolvedImage,
        badge: form.badge.trim(),
        material: form.material.trim(),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sizes: form.sizes.filter(s => s.size.trim()).map(s => ({ size: s.size.trim(), stock: Number(s.stock) || 0 })),
        colors: form.colors.map(c => c.trim()).filter(Boolean),
        tags: [...form.tags],
        weight: form.weight.trim(),
        dimensions: form.dimensions.trim(),
        careInstructions: form.careInstructions.trim(),
      }

      const url = editingId ? `${PRODUCT_URL}/${editingId}` : PRODUCT_URL
      const method = editingId ? 'PUT' : 'POST'

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || `Failed to ${editingId ? 'update' : 'add'} product`) }

      addToast(editingId ? 'Product updated!' : 'Product added!', 'success')
      resetForm()
      fetchProducts()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await authFetch(`${PRODUCT_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to delete product') }
      addToast('Product deleted', 'success')
      fetchProducts()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const toggleActive = async (product) => {
    try {
      const res = await authFetch(`${PRODUCT_URL}/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      })
      if (!res.ok) throw new Error('Failed to update')
      addToast(`Product ${product.isActive ? 'deactivated' : 'activated'}`, 'success')
      fetchProducts()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  // Filter products by search
  const filtered = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-header-top">
          <div>
            <h2 className="admin-card-title">Manage Products</h2>
            <p className="admin-card-desc">Add, edit or remove products from your store. ({products.length} total)</p>
          </div>
          <button className="admin-add-btn" onClick={() => { if (showForm && !editingId) { resetForm() } else { resetForm(); setShowForm(true) } }}>
            {showForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>
      </div>

      {/* Add / Edit Product Form */}
      {showForm && (
        <form className="admin-prod-form" onSubmit={handleSubmit}>
          <h3 className="admin-prod-form-title">{editingId ? 'Edit Product' : 'New Product'}</h3>

          {/* Row 1: Code, Name */}
          <div className="admin-prod-row">
            <div className="admin-prod-field">
              <label className="admin-prod-label">Product Code <span style={{color:'#c0392b'}}>*</span></label>
              <CustomDropdown value={form.productCode} placeholder="Select Product Code"
                options={productCodeOptions} onSelect={val => { update('productCode', val); update('image', productCodeToImage[val] || '') }} />
              {productCodeOptions.length === 0 && (
                <small style={{ color: 'var(--kk-text-light)' }}>No product codes yet. Add mappings in Product Code and Image section first.</small>
              )}
            </div>
            <div className="admin-prod-field admin-prod-field--wide">
              <label className="admin-prod-label">Product Name <span style={{color:'#c0392b'}}>*</span></label>
              <input className="admin-prod-input" type="text" placeholder="e.g. Kalamkari Silk Saree"
                value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
          </div>

          {/* Row 2: Category, Subcategory, Badge */}
          <div className="admin-prod-row">
            <div className="admin-prod-field">
              <label className="admin-prod-label">Category <span style={{color:'#c0392b'}}>*</span></label>
              <CustomDropdown value={form.category} placeholder="Select Category"
                options={categoryOptions} onSelect={val => { update('category', val); update('subcategory', '') }} />
            </div>
            <div className="admin-prod-field">
              <label className="admin-prod-label">Subcategory <span style={{color:'#c0392b'}}>*</span></label>
              <CustomDropdown value={form.subcategory} placeholder="Select Subcategory"
                options={subcatOptions} onSelect={val => update('subcategory', val)} />
            </div>
            <div className="admin-prod-field">
              <label className="admin-prod-label">Badge</label>
              <CustomDropdown value={form.badge} placeholder="Select Badge"
                options={BADGE_OPTIONS} onSelect={val => update('badge', val)} />
            </div>
          </div>

          {/* Row 3: Price, Original Price, Discount */}
          <div className="admin-prod-row">
            <div className="admin-prod-field">
              <label className="admin-prod-label">Price (₹) <span style={{color:'#c0392b'}}>*</span></label>
              <input className="admin-prod-input" type="number" min="0" placeholder="4999"
                value={form.price} onChange={e => updatePriceFields('price', e.target.value)} />
            </div>
            <div className="admin-prod-field">
              <label className="admin-prod-label">Original Price (₹) <span style={{color:'#c0392b'}}>*</span></label>
              <input className="admin-prod-input" type="number" min="0" placeholder="7999"
                value={form.originalPrice} onChange={e => updatePriceFields('originalPrice', e.target.value)} />
            </div>
            <div className="admin-prod-field">
              <label className="admin-prod-label">Discount (%)</label>
              <input className="admin-prod-input" type="text" readOnly value={form.discount} style={{ background: 'var(--kk-ivory)', cursor: 'default' }} />
            </div>
          </div>

          {/* Row 4: Image URL (auto-filled, readonly), Material */}
          <div className="admin-prod-row">
            <div className="admin-prod-field admin-prod-field--wide">
              <label className="admin-prod-label">Image URL <span style={{color:'#c0392b'}}>*</span> <span style={{fontSize:'0.65rem',fontWeight:400,color:'var(--kk-text-light)'}}>(auto-filled from product code)</span></label>
              <input className="admin-prod-input" type="url" placeholder="Select a product code to auto-fill"
                value={form.image} readOnly style={{background:'var(--kk-ivory)',cursor:'default'}} />
            </div>
            <div className="admin-prod-field">
              <label className="admin-prod-label">Material <span style={{color:'#c0392b'}}>*</span></label>
              <input className="admin-prod-input" type="text" placeholder="e.g. Pure Silk"
                value={form.material} onChange={e => update('material', e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div className="admin-prod-field admin-prod-field--full">
            <label className="admin-prod-label">Description <span style={{color:'#c0392b'}}>*</span></label>
            <textarea className="admin-prod-textarea" rows="3" placeholder="Product description..."
              value={form.description} onChange={e => update('description', e.target.value)} />
          </div>

          {/* Sizes */}
          <div className="admin-prod-field admin-prod-field--full">
            <label className="admin-prod-label">Sizes &amp; Stock <span style={{color:'#c0392b'}}>*</span></label>
            <div className="admin-prod-multi-rows">
              {form.sizes.map((s, i) => (
                <div key={i} className="admin-prod-multi-row">
                  <input className="admin-prod-input" type="text" placeholder="Size (e.g. S, M, L, Free Size)"
                    value={s.size} onChange={e => updateSize(i, 'size', e.target.value)} />
                  <input className="admin-prod-input admin-prod-input--sm" type="number" min="0" placeholder="Stock"
                    value={s.stock} onChange={e => updateSize(i, 'stock', e.target.value)} />
                  {form.sizes.length > 1 && (
                    <button type="button" className="admin-prod-remove-btn" onClick={() => removeSize(i)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="admin-prod-add-row" onClick={addSize}>+ Add Size</button>
            </div>
          </div>

          {/* Colors */}
          <div className="admin-prod-field admin-prod-field--full">
            <label className="admin-prod-label">Colors</label>
            <div className="admin-prod-multi-rows">
              {form.colors.map((c, i) => (
                <div key={i} className="admin-prod-multi-row">
                  <input className="admin-prod-input" type="text" placeholder="e.g. Maroon & Gold"
                    value={c} onChange={e => updateColor(i, e.target.value)} />
                  {form.colors.length > 1 && (
                    <button type="button" className="admin-prod-remove-btn" onClick={() => removeColor(i)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="admin-prod-add-row" onClick={addColor}>+ Add Color</button>
            </div>
          </div>

          {/* Tags (multi-select) */}
          <div className="admin-prod-field admin-prod-field--full">
            <label className="admin-prod-label">Tags {form.tags.length > 0 && <span style={{fontWeight:400,textTransform:'none'}}>({form.tags.length} selected)</span>}</label>
            <div className="admin-prod-tags-grid">
              {TAG_OPTIONS.map(tag => (
                <button key={tag} type="button"
                  className={`admin-prod-tag-chip${form.tags.includes(tag) ? ' selected' : ''}`}
                  onClick={() => toggleTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Row: Weight, Dimensions */}
          <div className="admin-prod-row">
            <div className="admin-prod-field">
              <label className="admin-prod-label">Weight</label>
              <input className="admin-prod-input" type="text" placeholder="e.g. 350g"
                value={form.weight} onChange={e => update('weight', e.target.value)} />
            </div>
            <div className="admin-prod-field">
              <label className="admin-prod-label">Dimensions</label>
              <input className="admin-prod-input" type="text" placeholder="e.g. 5.5m with blouse piece"
                value={form.dimensions} onChange={e => update('dimensions', e.target.value)} />
            </div>
          </div>

          {/* Care Instructions */}
          <div className="admin-prod-field admin-prod-field--full">
            <label className="admin-prod-label">Care Instructions</label>
            <input className="admin-prod-input" type="text" placeholder="e.g. Dry clean only. Store in muslin cloth."
              value={form.careInstructions} onChange={e => update('careInstructions', e.target.value)} />
          </div>

          {/* Toggles */}
          <div className="admin-prod-row admin-prod-toggles">
            <label className="admin-prod-toggle">
              <input type="checkbox" checked={form.isFeatured} onChange={e => update('isFeatured', e.target.checked)} />
              <span>Featured Product</span>
            </label>
            <label className="admin-prod-toggle">
              <input type="checkbox" checked={form.isActive} onChange={e => update('isActive', e.target.checked)} />
              <span>Active (Visible)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="admin-prod-form-actions">
            <button type="button" className="admin-cat-cancel" onClick={resetForm}>Cancel</button>
            <button type="submit" className="admin-cat-save" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      {!showForm && (
        <div className="admin-prod-search-bar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input className="admin-prod-search" type="text" placeholder="Search by name, code or category..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      )}

      {/* Product List */}
      <div className="admin-prod-body">
        {loading ? (
          <div className="admin-category-loading"><div className="admin-spinner" /><p>Loading products...</p></div>
        ) : filtered.length === 0 ? (
          <div className="admin-category-empty">
            <span className="admin-category-empty-icon">📦</span>
            <p>{searchQuery ? 'No products match your search' : 'No products yet'}</p>
          </div>
        ) : (
          <div className="admin-prod-list">
            {filtered.map(product => (
              <div key={product._id} className={`admin-prod-item${!product.isActive ? ' admin-prod-item--inactive' : ''}`}>
                <div className="admin-prod-item-img">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.badge && <span className="admin-prod-item-badge">{product.badge}</span>}
                  {!product.isActive && <span className="admin-prod-item-oos">Inactive</span>}
                </div>

                <div className="admin-prod-item-info">
                  <div className="admin-prod-item-top">
                    <strong className="admin-prod-item-name">{product.name}</strong>
                    <span className="admin-prod-item-code">{product.productCode}</span>
                  </div>
                  <div className="admin-prod-item-meta">
                    <span className="admin-prod-item-price">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice > 0 && product.originalPrice !== product.price && (
                      <span className="admin-prod-item-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                    {product.discount > 0 && <span className="admin-prod-item-discount">-{product.discount}%</span>}
                    <span className="admin-prod-item-cat">{product.category}{product.subcategory ? ` › ${product.subcategory}` : ''}</span>
                  </div>
                  
                  <div className="admin-prod-item-tags">
                    {product.isFeatured && <span className="admin-prod-tag admin-prod-tag--featured">★ Featured</span>}
                    {product.sizes?.length > 0 && <span className="admin-prod-tag">{product.sizes.length} sizes</span>}
                    {product.colors?.length > 0 && <span className="admin-prod-tag">{product.colors.length} colors</span>}
                    {product.rating > 0 && <span className="admin-prod-tag">⭐ {product.rating}</span>}
                  </div>
                </div>

                <div className="admin-prod-item-actions">
                  <button className="admin-cat-action-btn admin-cat-edit-btn" onClick={() => startEdit(product)} title="Edit">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2-7 7H3.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button className={`admin-cat-action-btn admin-prod-toggle-btn${product.isActive ? '' : ' inactive'}`} onClick={() => toggleActive(product)} title={product.isActive ? 'Deactivate' : 'Activate'}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      {product.isActive
                        ? <path d="M7.5 1.5v6M4 3.5a5.5 5.5 0 107 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        : <path d="M3 7.5a4.5 4.5 0 109 0 4.5 4.5 0 10-9 0M7.5 5v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      }
                    </svg>
                  </button>
                  <button className="admin-cat-action-btn admin-cat-delete-btn" onClick={() => handleDelete(product._id, product.name)} title="Delete">
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

export default AdminProducts
