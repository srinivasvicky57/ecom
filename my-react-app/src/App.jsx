import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import FeaturedProducts from './components/FeaturedProducts'
import About from './components/About'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import Profile from './components/Profile'
import Login from './components/Login'
import AdminView from './components/admin/AdminView'
import WishlistPage from './components/WishlistPage'
import CartPage from './components/CartPage'
import ProductsPage from './components/ProductsPage'
import ProductDetail from './components/ProductDetail'
import InfoPage from './components/InfoPage'
import Checkout from './components/Checkout'
import Loader from './components/Loader'
import Dummy from './components/dummy'
import MaintenancePage from './components/MaintenancePage'
import { isAuthenticated, setAuth, clearAuth, authFetch, fetchProfile } from './constants/auth'
import { WISHLIST_URL, CART_URL, SETTINGS_URL } from './constants/api'

function App() {

  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [wishlist, setWishlist] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [cartProductIds, setCartProductIds] = useState([])
  const [cartItemMap, setCartItemMap] = useState({}) // productId → cartItemId
  const [homeLoading, setHomeLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return isAuthenticated()
  })
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceLoading, setMaintenanceLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  const wishlistCount = wishlist.length

  /* Fetch wishlist from API when logged in */
  const fetchWishlist = async () => {
    if (!isAuthenticated()) { setWishlist([]); return }
    try {
      const res = await authFetch(WISHLIST_URL)
      if (res.ok) {
        const data = await res.json()
        setWishlist(data.map(p => p._id || p))
      }
    } catch { setWishlist([]) }
  }

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isAuthenticated()) {
        setUser(null)
        setUserLoading(false)
        return
      }

      try {
        const res = await fetchProfile()
        if (!res.ok) {
          clearAuth()
          setUser(null)
          setIsLoggedIn(false)
          return
        }
        const data = await res.json()
        setUser(data.user || null)
      } catch {
        setUser(null)
      } finally {
        setUserLoading(false)
      }
    }

    loadUserProfile()
  }, [isLoggedIn])

  useEffect(() => { fetchWishlist() }, [isLoggedIn])

  useEffect(() => {
    const loadMaintenanceState = async () => {
      try {
        const res = await fetch(`${SETTINGS_URL}/maintenance`)
        if (!res.ok) throw new Error('Failed to fetch maintenance state')
        const data = await res.json()
        setMaintenanceMode(Boolean(data.maintenanceMode))
      } catch {
        setMaintenanceMode(false)
      } finally {
        setMaintenanceLoading(false)
      }
    }

    loadMaintenanceState()
  }, [])

  /* Fetch cart count from API when logged in */
  const fetchCartCount = async () => {
    if (!isAuthenticated()) { setCartCount(0); setCartProductIds([]); setCartItemMap({}); return }
    try {
      const res = await authFetch(CART_URL)
      if (res.ok) {
        const data = await res.json()
        setCartCount(data.length)
        setCartProductIds(data.map(item => item.product?._id || item.product).filter(Boolean))
        const map = {}
        data.forEach(item => {
          const pid = item.product?._id || item.product
          if (pid) map[pid] = item._id
        })
        setCartItemMap(map)
      }
    } catch { setCartCount(0); setCartProductIds([]); setCartItemMap({}) }
  }

  const removeFromCart = async (productId) => {
    const itemId = cartItemMap[productId]
    if (!itemId) return
    try {
      await authFetch(`${CART_URL}/${itemId}`, { method: 'DELETE' })
      await fetchCartCount()
    } catch { /* silent */ }
  }

  useEffect(() => { fetchCartCount() }, [isLoggedIn])

  /** Scroll to top on every route change, or to a section if navigated via nav link */
  useEffect(() => {
    const scrollTarget = location.state?.scrollTo
    if (scrollTarget) {
      setTimeout(() => {
        document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.state])

  /* Simulate home page initial load */
  useEffect(() => {
    if (location.pathname === '/' || !['/', '/profile', '/profile/adminView', '/wishlist', '/cart', '/products'].includes(location.pathname) 
      && !location.pathname.startsWith('/productDetail')) {
      setHomeLoading(true)
      const timer = setTimeout(() => setHomeLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleLogin = (userData, token) => {
    setIsLoggedIn(true)
    setUser(userData)
    setAuth(token, userData.userId)
    setLoginOpen(false)

    if (location.pathname === '/login') {
      const redirectTo = location.state?.redirectTo || location.state?.from || '/'
      const redirectState = location.state?.redirectState
      navigate(redirectTo, redirectState ? { state: redirectState } : undefined)
    }
  }


  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (location.pathname !== '/') return
    const sectionIds = ['home', 'products', 'about', 'testimonials']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-76px 0px 0px 0px' }
    )
    // Small delay to ensure DOM sections are rendered after route change
    const timer = setTimeout(() => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
      })
    }, 50)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [location.pathname])

  const isAdminUser = !!user?.isAdmin

  if (maintenanceMode && !maintenanceLoading && !userLoading && !isAdminUser) {
    return <MaintenancePage />
  }

  return (
    <>
      <Navbar wishlistCount={wishlistCount} cartCount={cartCount} activeSection={activeSection}
      
      isLoggedIn={isLoggedIn} onLogin={() => setLoginOpen(true)} />
      <Login isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />

      <Routes>

        <Route path="/profile" element={<Profile />} />
        <Route
          path="/login"
          element={
            <Login
              isOpen={true}
              onClose={() => navigate(location.state?.from || '/')}
              onLogin={handleLogin}
            />
          }
        />
        <Route path="/profile/adminView" element={<AdminView />} />
        <Route path="/wishlist" element={<WishlistPage onWishlistChange={fetchWishlist} 
        cartProductIds={cartProductIds} onCartChange={fetchCartCount} removeFromCart={removeFromCart} />} />
        <Route path="/cart" element={<CartPage onWishlistChange={fetchWishlist} onCartChange={fetchCartCount} />} />
        <Route path="/products" element={<ProductsPage wishlist={wishlist} onWishlistChange={setWishlist} 
        onCartChange={fetchCartCount} cartProductIds={cartProductIds} removeFromCart={removeFromCart} />} />
        <Route path="/productDetail/:id" element={<ProductDetail onWishlistChange={fetchWishlist} 
        onCartChange={fetchCartCount} cartProductIds={cartProductIds} removeFromCart={removeFromCart} />} />
        <Route path="/info/:type" element={<InfoPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dummy" element={<Dummy />} />

        <Route path="*" element={
          homeLoading ? <Loader message="Loading…" /> : (
          <>
            <Hero />
            <Categories />
            <FeaturedProducts wishlist={wishlist} onWishlistChange={setWishlist} 
            onCartChange={fetchCartCount} cartProductIds={cartProductIds} removeFromCart={removeFromCart} />
            <About />
            <Testimonials />
            {toast && <div className="toast">✓ {toast}</div>}
            {showScrollTop && (
              <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                ↑
              </button>
            )}
          </>
          )
        } />
        
      </Routes>

      <Footer />
    </>
  )
}

export default App
