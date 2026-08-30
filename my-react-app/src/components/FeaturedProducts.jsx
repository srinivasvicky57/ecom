import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import HomeAllProducts from './HomeAllProducts';
import { productsText } from '../data/siteContent';
import { fetchProducts } from '../constants/api';
import Loader from './Loader';

function FeaturedProducts({ onAddToCart, wishlist = [], onWishlistChange, onCartChange, cartProductIds = [], removeFromCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = products.filter(p => p.isFeatured);

  if (loading) return <Loader message="Loading products…" />;

  return (
    <>
    <section id="products" className="products-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">{productsText.badge}</span>
          <h2 className="section-title">{productsText.title}</h2>
          <p className="section-subtitle">{productsText.subtitle}</p>
        </div>
        {featuredProducts.length === 0 ? (
          <div className="no-products">
            <span className="no-products-icon">{productsText.emptyIcon}</span>
            <p>{productsText.emptyMessage}</p>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product, idx) => (
              <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} index={idx} wishlist={wishlist} onWishlistChange={onWishlistChange} onCartChange={onCartChange} cartProductIds={cartProductIds} removeFromCart={removeFromCart} />
            ))}
          </div>
        )}
      </div>
    </section>
    <HomeAllProducts products={products} onAddToCart={onAddToCart} wishlist={wishlist} onWishlistChange={onWishlistChange} onCartChange={onCartChange} cartProductIds={cartProductIds} removeFromCart={removeFromCart} />
    </>
  );
}

export default FeaturedProducts;
