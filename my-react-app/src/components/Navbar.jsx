import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navText } from "../data/siteContent";
import {
  BrandLogo,
  HeartIcon,
  ShoppingBagIcon,
  UserIcon,
} from "../assets/svgs";

const NAV_LINKS = navText.links;

/* ── reusable sub-components ── */

function NavLink({ id, label, active, onNavigate }) {
  return (
    <a
      href={`#${id}`}
      className={active ? "active" : ""}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(id);
      }}
    >
      {label}
    </a>
  );
}

function Brand({ onNavigate }) {
  return (
    <a href="#" className="navbar-brand" onClick={() => onNavigate("home")}>
      <div className="brand-logo">
        <BrandLogo />
      </div>
      <div className="brand-text">
        <span className="brand-name">{navText.brandName}</span>
        <span className="brand-tagline">{navText.tagline}</span>
      </div>
    </a>
  );
}

function NavIcons({
  wishlistCount,
  cartCount,
  isLoggedIn,
  onLogin,
  navNavigate,
  currentPath,
}) {
  return (
    <div className="navbar-icons">
      {isLoggedIn && (
        <button
          className={`nav-icon-btn${currentPath === "/wishlist" ? " nav-icon-active" : ""}`}
          onClick={() => navNavigate("/wishlist")}
          title="Wishlist"
          aria-label="Wishlist"
        >
          <HeartIcon />
          {wishlistCount > 0 && (
            <span className="wishlist-badge">{wishlistCount}</span>
          )}
        </button>
      )}

      {isLoggedIn && (
        <button
          className={`nav-icon-btn${currentPath === "/cart" ? " nav-icon-active" : ""}`}
          onClick={() => navNavigate("/cart")}
          title="Shopping bag"
          aria-label="Shopping bag"
        >
          <ShoppingBagIcon />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      )}

      {isLoggedIn ? (
        <button
          className={`nav-icon-btn${currentPath.startsWith("/profile") ? " nav-icon-active" : ""}`}
          onClick={() => navNavigate("/profile")}
          title="My account"
          aria-label="My account"
        >
          <UserIcon />
        </button>
      ) : (
        <button className="nav-login-btn" onClick={onLogin} aria-label="Login">
          Login
        </button>
      )}
    </div>
  );
}

/* ── main component ── */

function Navbar({
  cartCount,
  wishlistCount,
  activeSection,
  isLoggedIn,
  onLogin,
}) {
  const navNavigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (navRef.current && !navRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = (id) => {
    setMenuOpen(false);
    if (id === "categories") {
      navNavigate("/products");
      return;
    }
    if (!isHomePage) {
      navNavigate("/", { state: { scrollTo: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      ref={navRef}
      className={`navbar${scrolled ? " navbar-scrolled" : ""}`}
      role="navigation"
    >
      <div className="navbar-container">
        <Brand onNavigate={navigate} />

        <ul className="nav-desktop">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <NavLink
                id={id}
                label={label}
                active={isHomePage && activeSection === id}
                onNavigate={navigate}
              />
            </li>
          ))}
        </ul>

        <NavIcons
          wishlistCount={wishlistCount}
          cartCount={cartCount}
          isLoggedIn={isLoggedIn}
          onLogin={onLogin}
          navNavigate={navNavigate}
          currentPath={location.pathname}
        />

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className={`nav-hamburger-lines${menuOpen ? " open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div className={`nav-mobile-menu${menuOpen ? " open" : ""}`}>
        <ul className="nav-mobile-links">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={isHomePage && activeSection === id ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(id);
                }}
              >
                <span className="nav-mobile-dot" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
