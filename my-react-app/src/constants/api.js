const getDefaultApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  return window.location.origin;
};

export const API_BASE_URL = getDefaultApiBase();
const apiBase = API_BASE_URL;
const url = (path) => `${apiBase}${path}`;

export const API_URL = url('/api/auth');
export const BANNER_URL = url('/api/banner');
export const CATEGORY_URL = url('/api/categories');
export const INFO_URL = url('/api/info');
export const PAYMENT_URL = url('/api/payment');
export const PRODUCT_URL = url('/api/products');
export const WISHLIST_URL = url('/api/wishlist');
export const CART_URL = url('/api/cart');
export const ADDRESS_URL = url('/api/address');
export const ORDER_URL = url('/api/orders');
export const SETTINGS_URL = url('/api/settings');
export const PRODUCT_CODE_IMAGE_URL = url('/api/product-code-images');

// Banner — session-level cache
let _bannerCache = null;

export const fetchBanner = async () => {
  if (_bannerCache) return _bannerCache;
  const res = await fetch(BANNER_URL);
  if (res.ok) {
    const data = await res.json();
    _bannerCache = data;
    return data;
  }
  throw new Error('Failed to fetch banner');
};

export const invalidateBannerCache = () => {
  _bannerCache = null;
};

// Categories — session-level cache
let _categoryCache = null;

export const fetchCategories = async () => {
  if (_categoryCache) return _categoryCache;
  const res = await fetch(CATEGORY_URL);
  if (res.ok) {
    const data = await res.json();
    _categoryCache = data;
    return data;
  }
  throw new Error('Failed to fetch categories');
};

export const invalidateCategoryCache = () => {
  _categoryCache = null;
};

// Info — session-level cache
let _infoCache = null;

export const fetchInfo = async () => {
  if (_infoCache) return _infoCache;
  const res = await fetch(INFO_URL);
  if (res.ok) {
    const data = await res.json();
    _infoCache = data;
    return data;
  }
  throw new Error('Failed to fetch info');
};

export const invalidateInfoCache = () => {
  _infoCache = null;
};

// Products — session-level cache
let _productCache = null;

export const fetchProducts = async () => {
  if (_productCache) return _productCache;
  const res = await fetch(PRODUCT_URL);
  if (res.ok) {
    const data = await res.json();
    _productCache = data;
    return data;
  }
  throw new Error('Failed to fetch products');
};

export const invalidateProductCache = () => {
  _productCache = null;
};

// Product code-image mappings - session-level cache
let _productCodeImageCache = null;

export const fetchProductCodeImages = async () => {
  if (_productCodeImageCache) return _productCodeImageCache;
  const res = await fetch(PRODUCT_CODE_IMAGE_URL);
  if (res.ok) {
    const data = await res.json();
    _productCodeImageCache = data;
    return data;
  }
  throw new Error('Failed to fetch product code images');
};

export const invalidateProductCodeImageCache = () => {
  _productCodeImageCache = null;
};
