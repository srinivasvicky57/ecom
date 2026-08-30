import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../constants/api';

const MAX_VISIBLE_SUBS = 3;
const MAX_VISIBLE_SUBS_MOBILE = 2;

const categoriesText = {
  badge: 'Explore',
  title: 'Shop by Category',
  subtitle: 'Browse our curated collection of authentic Kalamkari artworks',
};

function CategoryCard({ cat, goToCategory }) {
  const [expanded, setExpanded] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const limit = isMobile ? MAX_VISIBLE_SUBS_MOBILE : MAX_VISIBLE_SUBS;
  const hasMore = cat.subs.length > limit;
  const visibleSubs = expanded ? cat.subs : cat.subs.slice(0, limit);
  const hiddenCount = cat.subs.length - limit;

  return (
    <div className="category-card">
      <div className="category-card-top" onClick={() => goToCategory(cat.name)}>
        <span className="category-icon">{cat.icon}</span>
        <h3 className="category-name">{cat.name}</h3>
        <span className="category-count">{cat.count}</span>
      </div>
      <ul className="category-subs">
        {visibleSubs.map((sub) => (
          <li key={sub}>
            <button
              className="category-sub-link"
              onClick={() => goToCategory(cat.name, sub)}
            >
              {sub}
            </button>
          </li>
        ))}
        {hasMore && (
          <li>
            <button
              className="category-see-more"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show Less' : `+${hiddenCount} More`}
            </button>
          </li>
        )}
      </ul>
      <div className="category-card-footer">
        <button className="category-view-all" onClick={() => goToCategory(cat.name)}>
          View All {cat.name}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data.map(cat => ({
        id: cat._id,
        name: cat.name,
        icon: cat.icon || '📁',
        count: cat.subCategories?.length || 0,
        subs: cat.subCategories || [],
      }))))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const goToCategory = (category, sub) => {
    const params = new URLSearchParams({ category });
    if (sub) params.set('sub', sub);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <section id="categories" className="categories-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">{categoriesText.badge}</span>
          <h2 className="section-title">{categoriesText.title}</h2>
          <p className="section-subtitle">{categoriesText.subtitle}</p>
        </div>
        <div className="categories-grid">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--kk-text-light)', gridColumn: '1 / -1' }}>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--kk-text-light)', gridColumn: '1 / -1' }}>No categories available yet.</p>
          ) : (
            categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} goToCategory={goToCategory} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Categories;
