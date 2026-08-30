import { useMemo } from 'react';
import ProductCard from './ProductCard';

function HomeAllProducts({ products, onAddToCart, wishlist = [], onWishlistChange, onCartChange, cartProductIds = [], removeFromCart }) {
  const groupedByCategory = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category).push(p);
    });
    return [...map.entries()];
  }, [products]);

  return (
    <section className="home-all-products">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">Explore</span>
          <h2 className="section-title">All Our Products</h2>
          <p className="section-subtitle">Browse our complete collection of authentic Kalamkari creations</p>
        </div>
        {groupedByCategory.map(([category, items]) => (
          <div key={category} className="home-category-group">
            <h3 className="home-category-heading">{category}</h3>
            <div className="home-all-grid">
              {items.map((product, idx) => (
                <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} index={idx} wishlist={wishlist} onWishlistChange={onWishlistChange} onCartChange={onCartChange} cartProductIds={cartProductIds} removeFromCart={removeFromCart} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeAllProducts;
