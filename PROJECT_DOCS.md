# MS Vastravarna — Project Documentation


## Overview

**MS Vastravarna** is a Kalamkari-themed e-commerce web application built with React (frontend) and Node.js/Express (backend). The design draws inspiration from the ancient Kalamkari art of Srikalahasti & Machilipatnam, Andhra Pradesh.

- **Frontend:** React 19 + Vite
- **Backend:** Node.js + Express (skeleton)
- **Database:** MongoDB (planned — not yet integrated)
- **Currency:** Indian Rupees (₹)

---

## Project Structure

```
c:\srinivas\msv\
│
├── my-react-app/                ← React Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── vite.svg
│   └── src/
│       ├── main.jsx             ← React entry point
│       ├── App.jsx              ← Main app component (all state lives here)
│       ├── App.css              ← Full theme CSS (~3,700 lines)
│       ├── index.css            ← CSS variables & base styles
│       ├── assets/
│       │   └── svgs/            ← Kalamkari SVG motif components
│       │       ├── index.js     ← Barrel export
│       │       ├── Lotus.jsx
│       │       ├── Mandala.jsx
│       │       ├── Mango.jsx
│       │       ├── Paisley.jsx
│       │       ├── Peacock.jsx
│       │       ├── SmallFlower.jsx
│       │       ├── TinyLotus.jsx
│       │       └── TinyPaisley.jsx
│       ├── components/
│       │   ├── Navbar.jsx       ← Sticky nav with scroll detection
│       │   ├── Hero.jsx         ← Hero section with floating motifs
│       │   ├── Categories.jsx   ← Category filter grid
│       │   ├── ProductGrid.jsx  ← Product listing wrapper
│       │   ├── ProductCard.jsx  ← Individual product card
│       │   ├── About.jsx        ← Heritage/about section
│       │   ├── Testimonials.jsx ← Carousel testimonials
│       │   ├── Footer.jsx       ← 4-column footer
│       │   ├── Cart.jsx         ← Slide-in cart drawer
│       │   ├── Profile.jsx      ← Full-screen profile overlay
│       │   └── Login.jsx        ← Full-screen login/signup page
│       └── data/
│           ├── products.js      ← Product, category, testimonial data
│           └── siteContent.js   ← All static text content
│
└── server/                      ← Node.js Backend
    ├── .env                     ← PORT=5000
    ├── package.json
    └── server.js                ← Express server (skeleton)
```

---

## Frontend Details

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI library |
| react-dom | ^19.0.0 | DOM rendering |
| vite | ^6.0.0 | Build tool & dev server |
| @vitejs/plugin-react | ^4.3.4 | React support for Vite |

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

### App Architecture

- **No router** — Single-page scroll-based navigation using anchor IDs and `IntersectionObserver`
- **No external state management** — All state in `App.jsx` via `useState`
- **No API integration yet** — Cart, wishlist, profile, login are all client-side only

### State (App.jsx)

| State | Type | Description |
|-------|------|-------------|
| `cart` | array | Cart items with `qty` property |
| `cartOpen` | boolean | Cart drawer visibility |
| `profileOpen` | boolean | Profile overlay visibility |
| `loginOpen` | boolean | Login page visibility |
| `activeCategory` | string | Product filter (default: 'All') |
| `toast` | string/null | Notification message (auto-dismiss 3s) |
| `showScrollTop` | boolean | Scroll-to-top button visibility |
| `activeSection` | string | Active nav section (via IntersectionObserver) |
| `wishlist` | array | Wishlist items |
| `isLoggedIn` | boolean | Login state |

### Render Order

```
Navbar → Hero → Categories → ProductGrid → About → Testimonials → Footer
→ Cart (drawer) → Profile (overlay) → Login (fullscreen) → Toast → ScrollTop
```

---

## Components

| Component | Description |
|-----------|-------------|
| **Navbar** | Sticky top nav with scroll detection, brand logo (inline SVG), desktop nav links with smooth scroll, icon buttons (wishlist, cart with badge counts, profile/login toggle), hamburger mobile menu, ESC key & click-outside close |
| **Hero** | Full-viewport hero with radial overlay, 8 floating Kalamkari SVG motifs, badge, two-line title with highlighted brand name + tagline, subtitle, 2 CTA buttons, decorative divider, 3 stat counters, scroll indicator |
| **Categories** | Category filter grid — "All" button + 7 category cards. Highlights active, calls `onFilter` |
| **ProductGrid** | Maps products array to `ProductCard` components. Shows empty state when no products match |
| **ProductCard** | Product card with image (lazy loading), badge overlay, hover overlay (Quick View + Wishlist), discount badge, star rating (supports half stars), pricing, Add to Cart button |
| **About** | Two-column: text content (paragraphs + 3 feature cards) and decorative visual (mandala + "3000+ Years" showcase + 3 image cards) |
| **Testimonials** | Responsive carousel — 6 cards on desktop, 4 on smaller screens. Pagination with dots and nav buttons |
| **Footer** | 4-column grid: brand + social links, Quick Links, Customer Care, Newsletter. Copyright bar |
| **Cart** | Slide-in right drawer with backdrop. Cart items with qty controls, savings display, total, checkout button |
| **Profile** | Full-screen overlay with sidebar tabs: Overview, Orders, Wishlist, Addresses, Settings. Mock data (Priya Sharma) |
| **Login** | Full-screen two-panel page. Left: decorative Kalamkari panel with brand info & stats. Right: login/signup form with validation |

---

## SVG Motifs

8 Kalamkari-inspired SVG components used as floating background decorations:

| Component | Description |
|-----------|-------------|
| `Paisley` | Traditional paisley/boteh teardrop motif |
| `Lotus` | 8-petal lotus flower with radiating petals |
| `Peacock` | Peacock with fanned tail feathers |
| `Mango` | Traditional mango motif |
| `Mandala` | Circular mandala pattern |
| `SmallFlower` | Small decorative flower |
| `TinyPaisley` | Miniature paisley variant |
| `TinyLotus` | Miniature lotus variant |

All accept a `className` prop. Colors: deep red (#8B1A1A), gold (#C8933E), indigo (#2C3E6B), green (#3B5323).

---

## Data Files

### siteContent.js — Static Text Exports

| Export | Description |
|--------|-------------|
| `heroText` | Badge, titles, subtitle, CTAs, stats |
| `categoriesText` | Section header, "All" category config |
| `productsText` | Section header, empty state, button labels |
| `aboutText` | Heritage section content, features, showcase, image cards |
| `testimonialsText` | Section header |
| `footerText` | Brand, links, newsletter, copyright |
| `navText` | Brand name, tagline, nav links |
| `loginText` | Left/right panel text, form labels, error messages |

### products.js — Data Exports

| Export | Items | Fields |
|--------|-------|--------|
| `products` | 12 | id, name, price, originalPrice, image (Unsplash), category, description, rating, reviews, badge |
| `categories` | 7 | id, name, icon (emoji), count |
| `testimonials` | 5 | id, name, text, rating, avatar (initials) |

**Categories:** Sarees, Dupattas, Kurtas, Home Decor, Accessories, Fabrics, Lehengas
**Price range:** ₹499 – ₹5,999
**Badges:** Bestseller, New, Trending, Premium

---

## CSS Theme

Single monolithic `App.css` file (~3,700 lines) with:

### CSS Variables (defined in index.css)

| Variable | Value | Usage |
|----------|-------|-------|
| `--kk-deep-red` | #8B1A1A | Primary brand color |
| `--kk-madder` | #A0522D | Earth tone |
| `--kk-rust` | #B7472A | Warm accent |
| `--kk-indigo` | #2C3E6B | Contrast color |
| `--kk-mustard` | #C8933E | Gold accent |
| `--kk-gold` | #DAA520 | Highlight gold |
| `--kk-green` | #3B5323 | Natural accent |
| `--kk-cream` | #FDF5E6 | Light background |
| `--kk-ivory` | #FAF0E6 | Alternate light |
| `--kk-brown` | #5C3317 | Warm brown |
| `--kk-warm-white` | #FFFBF0 | Section bg |
| `--kk-text` | #2D1810 | Primary text |
| `--kk-text-light` | #6B4F3F | Secondary text |
| `--kk-border` | #E8D5C0 | Border color |

### Fonts (Google Fonts)

| Font | Usage |
|------|-------|
| Playfair Display | Headings, brand name, prices, stat numbers |
| Cormorant Garamond | Title lines, taglines, testimonial text |
| Poppins | Body text, labels, buttons, navigation |

### Key Animations

| Animation | Description |
|-----------|-------------|
| `fadeInUp` | Entrance with upward slide |
| `float` / `floatReverse` | Floating motif movement |
| `slowSpin` | Mandala rotation (80s cycle) |
| `pulse` | Badge dot pulsing |
| `shimmer` | Gradient shimmer on brand text |
| `scrollLine` | Scroll indicator animation |
| `borderDance` | Kalamkari decorative border |

---

## Backend Details

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.21.0 | Web framework |
| cors | ^2.8.5 | Cross-origin requests |
| dotenv | ^16.4.5 | Environment variables |

### Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start server |
| `npm run dev` | Start with auto-reload (--watch) |

### Current Endpoints

| Method | Route | Response |
|--------|-------|----------|
| GET | `/` | `{ message: 'MS Vastravarna API is running' }` |

### Environment Variables (server/.env)

| Variable | Value |
|----------|-------|
| PORT | 5000 |

---

## Planned Next Steps

- [ ] Create Product model & CRUD API
- [ ] Create Cart & Order models & routes
- [ ] Add AuthContext for persistent login state
- [ ] Deploy: Frontend → Vercel, Backend → Render, DB → MongoDB Atlas

---

## JWT Authentication — Detailed Walkthrough

### 1. The Problem We Had

When a user logged in, the server returned their `userId` (like `MSV-20260425-1234`). The browser stored it in `localStorage` and sent it in every API URL:

```
GET  /api/auth/profile/MSV-20260425-1234
PUT  /api/auth/profile/MSV-20260425-1234
```

**Why this was dangerous:**

Imagine your phone number is your bank password. Anyone who knows your phone number can access your bank account. That's exactly what was happening — the `userId` was the only "proof" of identity, and it was sitting right there in the URL. If someone opened the browser DevTools, pasted a different userId, they'd see someone else's profile. The server blindly trusted whatever userId came in the URL.

---

### 2. What Is a JWT?

JWT stands for **JSON Web Token**. It's a small piece of text that acts like a **sealed, tamper-proof ID card**.

Real-world analogy:
- **Before JWT**: You walk into a building and say "I'm Employee #42." The guard lets you in. Anyone can say they're Employee #42.
- **After JWT**: You show a photo ID card that has your name, photo, and a holographic seal that only the company can emboss. The guard checks the seal. If it's valid, you're in. If someone photocopies your card and changes the name, the seal won't match — rejected.

A JWT token looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJNU1YtMjAyNjA0MjUtMTIzNCIsImVtYWlsIjoicHJpeWFAZ21haWwuY29tIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTcxNDAwMDAwMCwiZXhwIjoxNzE0NjA0ODAwfQ.abc123signature
```

It has 3 parts separated by dots:

```
HEADER.PAYLOAD.SIGNATURE
```

**Part 1 — Header** (tells how the token was signed):
```json
{
  "alg": "HS256",     ← signing algorithm (HMAC with SHA-256)
  "typ": "JWT"         ← type of token
}
```
This is Base64-encoded (not encrypted — anyone can decode it).

**Part 2 — Payload** (the actual user data):
```json
{
  "userId": "MSV-20260425-1234",
  "email": "priya@gmail.com",
  "isAdmin": false,
  "iat": 1714000000,     ← "issued at" — when the token was created (Unix timestamp)
  "exp": 1714604800      ← "expires at" — when it stops working (7 days later)
}
```
This is also Base64-encoded. Anyone can read it. **The payload is NOT secret** — it's just the data.

**Part 3 — Signature** (the "seal"):
```
HMAC-SHA256(
  base64(header) + "." + base64(payload),
  "msv-kalamkari-kala-secret-key-2026"     ← the SECRET_KEY, only on the server
)
```
This is the magic part. The server takes the header + payload, combines them, and creates a cryptographic hash using a secret key that only the server knows. This signature is **impossible to forge** without the secret key.

**Why is this secure?**
- If someone changes `"isAdmin": false` to `"isAdmin": true` in the payload, the signature won't match the new payload → server rejects it.
- If someone tries to create a new signature, they don't have the secret key → can't do it.
- The payload is readable but not modifiable. Reading it tells you nothing dangerous. Modifying it breaks it.

---

### 3. The Complete Flow — What Happens in Our App

#### Step A: User Logs In

**Browser sends:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "priya@gmail.com",
  "password": "Priya@1234"
}
```

**Server code that handles this** (`server/routes/auth.js`):
```javascript
router.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  // 1. Find the user in MongoDB by email or phone
  const user = await User.findOne({
    $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }]
  });
  if (!user) return res.status(401).json({ message: 'Invalid email/phone or password' });

  // 2. Check password (bcrypt compares the plain text with the hashed version in DB)
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email/phone or password' });

  // 3. Password is correct! Generate a JWT token for this user
  const token = generateToken(user);

  // 4. Send token + user data back to the browser
  res.json({
    message: 'Login successful',
    token,                           // ← NEW: the JWT token
    user: { userId: user.userId, name: user.name, email: user.email, phone: user.phone }
  });
});
```

**`generateToken` function** (`server/middleware/auth.js`):
```javascript
function generateToken(user) {
  return jwt.sign(
    { userId: user.userId, email: user.email, isAdmin: user.isAdmin },  // payload data
    JWT_SECRET,                                                          // secret key from .env
    { expiresIn: '7d' }                                                  // token dies after 7 days
  );
}
```

`jwt.sign()` does three things:
1. Creates the header (`{"alg":"HS256","typ":"JWT"}`) and Base64-encodes it
2. Creates the payload with your data + `iat` (issued at) + `exp` (expiry) and Base64-encodes it
3. Creates the signature by hashing header+payload with the secret key
4. Joins all three with dots → returns the token string

**Server responds with:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJNU1YtMjAyNjA0MjUtMTIzNCIsImVtYWlsIjoicHJpeWFAZ21haWwuY29tIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTcxNDAwMDAwMCwiZXhwIjoxNzE0NjA0ODAwfQ.Xk9ZaBcDeFgHiJkLmNoPqRsTuVwXyZ",
  "user": {
    "userId": "MSV-20260425-1234",
    "name": "Priya Sharma",
    "email": "priya@gmail.com",
    "phone": "9876543210"
  }
}
```

#### Step B: Browser Stores the Token

**Frontend code** (`Login.jsx` → calls `onLogin` → `App.jsx`):

```javascript
// In Login.jsx — after successful login/signup:
onLogin(data.user, data.token);

// In App.jsx — handleLogin stores everything:
const handleLogin = (userData, token) => {
  setIsLoggedIn(true)
  setUser(userData)
  setAuth(token, userData.userId)   // ← stores in localStorage
}
```

**`setAuth` function** (`src/constants/auth.js`):
```javascript
export const setAuth = (token, userId) => {
  localStorage.setItem('token', token)    // stores: "eyJhbGci..."
  localStorage.setItem('userId', userId)  // stores: "MSV-20260425-1234" (for display, not auth)
}
```

Now the browser has the token saved. It persists even if you close the tab and come back.

#### Step C: Making Authenticated API Calls

When the user opens their Profile page, the app needs to fetch their data. Here's what happens:

**Frontend code** (`Profile.jsx`):
```javascript
// Before JWT:
fetch(`${API_URL}/profile/${userId}`)   // userId in URL — anyone could change this

// After JWT:
fetchProfile()                           // no userId needed — server reads it from token
```

**`fetchProfile` calls `authFetch`** (`src/constants/auth.js`):
```javascript
export const fetchProfile = () => authFetch(`${API_URL}/profile`)
```

**`authFetch` — the magic wrapper**:
```javascript
export const authFetch = async (url, options = {}) => {
  const token = getToken()                              // 1. Get token from localStorage
  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`        // 2. Add it to the request header
  }

  const res = await fetch(url, { ...options, headers }) // 3. Make the actual HTTP request

  if (res.status === 401) {                             // 4. If server says "unauthorized"
    const data = await res.clone().json().catch(() => ({}))
    if (data.expired) {                                 // 5. If token has expired
      clearAuth()                                       // 6. Clear localStorage
      window.location.href = '/'                        // 7. Redirect to home (force re-login)
      throw new Error('Session expired. Please login again.')
    }
  }

  return res
}
```

**What the actual HTTP request looks like:**
```http
GET http://localhost:5000/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJNU1YtMjAyNjA0MjUtMTIzNCJ9.abc123
```

Notice: **No userId in the URL anymore.** The server will figure out who you are from the token.

#### Step D: Server Verifies the Token

When the request hits the server, it goes through the `authMiddleware` BEFORE reaching the route handler.

**Route definition** (`server/routes/auth.js`):
```javascript
//                      ↓ middleware runs first
router.get('/profile', authMiddleware, async (req, res) => {
  // This code only runs if authMiddleware calls next()
  const user = await User.findOne({ userId: req.user.userId })  // ← req.user was set by middleware
  res.json({ user: { ... } })
})
```

**The middleware** (`server/middleware/auth.js`):
```javascript
function authMiddleware(req, res, next) {
  // 1. Get the Authorization header
  const header = req.headers.authorization;
  //    header = "Bearer eyJhbGciOiJIUzI1NiJ9..."

  // 2. Check if it exists and starts with "Bearer "
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
    // ↑ Request stops here. Route handler never runs.
  }

  // 3. Extract just the token (remove "Bearer " prefix)
  const token = header.split(' ')[1];
  //    token = "eyJhbGciOiJIUzI1NiJ9..."

  try {
    // 4. VERIFY the token — this is the critical step
    const decoded = jwt.verify(token, JWT_SECRET);
    //
    // jwt.verify() does the following:
    //   a. Splits the token into header, payload, signature
    //   b. Re-creates the signature using header+payload+SECRET_KEY
    //   c. Compares re-created signature with the one in the token
    //   d. If they DON'T match → throws an error (token was tampered)
    //   e. Checks if current time > exp (expiry) → throws TokenExpiredError
    //   f. If everything is OK → returns the decoded payload
    //
    // decoded = { userId: "MSV-20260425-1234", email: "priya@gmail.com", isAdmin: false, iat: ..., exp: ... }

    // 5. Attach the decoded user data to the request object
    req.user = decoded;

    // 6. Call next() — this lets the request continue to the actual route handler
    next();

  } catch (err) {
    // Token verification failed
    if (err.name === 'TokenExpiredError') {
      // Token was valid but has expired
      return res.status(401).json({ message: 'Session expired. Please login again.', expired: true });
    }
    // Token was tampered with, malformed, or signed with wrong key
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

**After middleware passes**, the route handler uses `req.user.userId` to look up the user in MongoDB. The server NEVER trusts a userId from the URL — it only trusts the userId extracted from the verified token.

#### Step E: What Happens When Things Go Wrong

**Scenario 1 — No token (user not logged in):**
```
Browser: GET /profile (no Authorization header)
Server:  → 401 { message: "Authentication required" }
```

**Scenario 2 — Token expired (logged in 8 days ago):**
```
Browser: GET /profile, Authorization: Bearer <expired-token>
Server:  → jwt.verify() throws TokenExpiredError
         → 401 { message: "Session expired.", expired: true }
Browser: → authFetch detects expired: true
         → clearAuth() removes localStorage
         → Redirects to home page
         → User must log in again to get a fresh token
```

**Scenario 3 — Token tampered (hacker changed payload):**
```
Hacker:  Takes token, decodes payload, changes isAdmin to true, re-encodes
         BUT can't re-create the signature (doesn't have SECRET_KEY)
Server:  → jwt.verify() re-creates signature → doesn't match → throws error
         → 401 { message: "Invalid token" }
```

**Scenario 4 — Token valid:**
```
Browser: GET /profile, Authorization: Bearer <valid-token>
Server:  → jwt.verify() succeeds
         → decoded = { userId: "MSV-1234", email: "priya@gmail.com", isAdmin: false }
         → req.user = decoded
         → next() → route handler runs
         → Fetches profile for MSV-1234 from MongoDB
         → 200 { user: { name: "Priya", ... } }
```

---

### 4. File-by-File Breakdown

#### `server/.env`
```env
JWT_SECRET=msv-kalamkari-kala-secret-key-2026
```
The secret key. Used by `jwt.sign()` to create tokens and `jwt.verify()` to validate them. If you change this key, ALL existing tokens become invalid (everyone logs out). **Never share this publicly.**

#### `server/middleware/auth.js`
- **`generateToken(user)`** — Takes a user object, creates a JWT token containing `userId`, `email`, `isAdmin`. Token expires in 7 days.
- **`authMiddleware`** — Express middleware function. Extracts token from the `Authorization` header, verifies it using the secret key, puts decoded data in `req.user`, and calls `next()` to continue. If verification fails, returns 401 and stops the request.

#### `server/routes/auth.js`
- **`POST /signup`** and **`POST /login`** — Public routes (no middleware). After successful auth, they call `generateToken(user)` and include the `token` in the response alongside the user data.
- **`GET /profile`**, **`PUT /profile`**, **`POST/PUT/DELETE /addresses`** — Protected routes. Each has `authMiddleware` as the second argument. Inside these routes, `req.user.userId` is used instead of `req.params.userId`.

#### `src/constants/auth.js`
- **`setAuth(token, userId)`** — Saves token and userId to localStorage after login.
- **`clearAuth()`** — Removes both from localStorage (logout).
- **`isAuthenticated()`** — Returns `true` if a token exists in localStorage.
- **`authFetch(url, options)`** — Wraps the native `fetch()`. Reads the token from localStorage, adds it as `Authorization: Bearer <token>` header. After the request, checks if the response is 401 with `expired: true`, and if so, auto-clears auth and redirects to home.
- **API shortcuts** — `fetchProfile()`, `updateProfile()`, `addAddress()`, `updateAddress()`, `deleteAddress()` — each calls `authFetch` with the right URL and method.

#### Frontend components that changed:
- **`App.jsx`** — `handleLogin(userData, token)` now calls `setAuth(token, userId)`. `handleLogout` calls `clearAuth()`. Initial login check uses `isAuthenticated()`.
- **`Login.jsx`** — After successful login/signup, passes `data.token` to the `onLogin` callback.
- **`Profile.jsx`** — Uses `fetchProfile()`, `updateProfile()`, `deleteAddress()` etc. instead of raw `fetch` with userId in URL. Logout uses `clearAuth()`.
- **`Banner.jsx`** — Uses `fetchProfile()` to get user name.
- **`AdminView.jsx`** — Uses `fetchProfile()` to verify admin status.

---

### 5. Important Things to Know

**Q: Can someone steal my token from localStorage?**
Yes — if there's an XSS (cross-site scripting) vulnerability on the site, injected JavaScript can read localStorage. For our app this is acceptable. For higher-security apps, tokens are stored in HttpOnly cookies (which JS can't access).

**Q: What happens when the token expires?**
The user gets a 401 response. `authFetch` detects the `expired: true` flag, clears localStorage, and redirects to the home page. The user will need to log in again. The new login gives them a fresh 7-day token.

**Q: Can I decode a JWT without the secret key?**
Yes — the payload is just Base64-encoded, not encrypted. You can paste any JWT token into https://jwt.io and read the payload. But you CANNOT modify it and create a valid signature without the secret key.

**Q: Why 7 days expiry?**
It's a balance. Too short (1 hour) = user keeps getting logged out. Too long (1 year) = if a token is stolen, the attacker has access for a long time. 7 days is a common choice for non-critical apps.

**Q: What if I change the JWT_SECRET?**
Every existing token in every user's browser becomes invalid instantly. Everyone gets logged out because `jwt.verify()` will fail for all old tokens. This is actually useful if you suspect tokens have been compromised — change the secret to invalidate everything.

---

## Product Schema & Data Structure

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "productCode": "KK-SAR-001",
  "name": "Kalamkari Silk Saree - Peacock Motif",
  "category": "Sarees",
  "subcategory": "Silk Sarees",
  "description": "Hand-painted Kalamkari pure silk saree with intricate peacock and temple motifs in rich maroon and gold.",
  "price": 4999,
  "originalPrice": 7999,
  "discount": 38,
  "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop",
  "images": [],
  "rating": 4.8,
  "reviews": 214,
  "badge": "Bestseller",
  "sizes": [
    { "size": "Free Size", "stock": 15 }
  ],
  "colors": ["Maroon & Gold", "Indigo & Rust"],
  "material": "Pure Silk",
  "isFeatured": true,
  "isActive": true,
  "tags": ["kalamkari", "silk", "handpainted", "wedding", "peacock"],
  "weight": "350g",
  "dimensions": "5.5m with blouse piece",
  "careInstructions": "Dry clean only. Store in muslin cloth.",
  "createdAt": "2025-06-01T10:30:00.000Z",
  "updatedAt": "2025-06-15T14:22:00.000Z"
}


Here's how to get your Razorpay API keys:

Go to https://dashboard.razorpay.com
Sign up or Log in with your email/phone
Once logged in, go to Settings → API Keys (left sidebar)
Click Generate Key — you'll get:
Key ID (starts with rzp_test_ or rzp_live_)
Key Secret (shown only once — copy it immediately)
Paste them in your .env file replacing the placeholders
For testing (no real money):

Use the Test Mode toggle at the top of the Razorpay dashboard
Generate keys in test mode — they'll start with rzp_test_
Test card: 4111 1111 1111 1111, any future expiry, any CVV