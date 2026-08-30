import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchProducts } from '../constants/api';
import ProductCard from './ProductCard';
import CustomDropdown from './CustomDropdown';
import Loader from './Loader';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
];

function ProductsPage({ wishlist = [], onWishlistChange, onCartChange, cartProductIds = [], removeFromCart }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const sub = searchParams.get('sub') || '';
  const [sortBy, setSortBy] = useState('relevance');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Fetch products & categories from API */
  useEffect(() => {
    Promise.all([
      fetchProducts().catch(() => []),
      fetchCategories().catch(() => []),
    ]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats.map(cat => ({
        name: cat.name,
        icon: cat.icon || '📁',
        subs: cat.subCategories || [],
      })));
    }).finally(() => setLoading(false));
  }, []);

  /* Subcategories for the active category */
  const activeSubs = useMemo(() => {
    if (!category) return [];
    const cat = categories.find((c) => c.name === category);
    return cat ? cat.subs : [];
  }, [category, categories]);

  /* Filter + sort */
  const filtered = useMemo(() => {
    let list = [...products];
    if (category) list = list.filter((p) => p.category === category);
    if (sub) list = list.filter((p) => p.subcategory === sub);

    switch (sortBy) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      case 'newest':     return [...list].sort((a, b) => b._id.localeCompare(a._id));
      default:           return list;
    }
  }, [category, sub, sortBy, products]);

  const pageTitle = sub || category || 'All Products';
  const breadcrumb = sub ? `${category} › ${sub}` : category;

  if (loading) return <Loader message="Loading products…" />;

  return (
    <div className="pp-page">

      <div className="page-title-bar">
        <h1 className="page-title-heading">
          <button className="pp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6"
             stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {pageTitle}
        </h1>
        {breadcrumb && <span className="pp-breadcrumb">Home › {breadcrumb}</span>}
      </div>

      {/* ── Filter bar ── */}
      <div className="pp-filter-bar section-container">
        <div className="pp-filters-row">
          <CustomDropdown
            label="Filters"
            value={category}
            placeholder="All Products"
            options={categories.map((c) => ({ value: c.name, label: c.name, icon: c.icon }))}
            onSelect={(val) => {
              if (!val) setSearchParams({});
              else setSearchParams({ category: val });
            }}
          />
          {activeSubs.length > 0 && (
            <CustomDropdown
              label="Subcategory"
              value={sub}
              placeholder={`All ${category}`}
              options={activeSubs.map((s) => ({ value: s, label: s }))}
              onSelect={(val) => {
                if (!val) setSearchParams({ category });
                else setSearchParams({ category, sub: val });
              }}
            />
          )}
          <CustomDropdown
            label="Sort by"
            value={sortBy}
            placeholder="Relevance"
            options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            onSelect={(val) => setSortBy(val || 'relevance')}
            className="pp-dropdown--sort"
          />
        </div>

        <div className="pp-filter-footer">
          <p className="pp-result-count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          {(category || sub || sortBy !== 'relevance') && (
            <button className="pp-clear-filters" onClick={() => { setSearchParams({}); setSortBy('relevance'); }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 3L3 11M3 3l8 8" 
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="pp-content section-container">
        {filtered.length === 0 ? (
          <div className="pp-empty">
            <span className="pp-empty-icon">🔍</span>
            <h3>No products found</h3>
            <p>We're adding new products to this category soon!</p>
            <button className="btn btn-primary" onClick={() => { setSearchParams({}); setSortBy('relevance'); }}>View All Products</button>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} wishlist={wishlist} 
              onWishlistChange={onWishlistChange} onCartChange={onCartChange} cartProductIds={cartProductIds} removeFromCart={removeFromCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
