# E-Commerce Product Browser — Specification

## 1. Project Overview
- **Name**: ShopVista — Product Browser
- **Type**: Single-page e-commerce web application
- **Core Functionality**: Browse and search products from Fake Store API with responsive grid layout
- **Target Users**: General consumers browsing products online
- **Tech Stack**: Vanilla JavaScript (ES6+), HTML5, CSS3, Fetch API

---

## 2. Visual & Rendering Specification

### Scene Setup
- Single-page application with header, main content area, and footer
- No complex 3D rendering required — standard DOM manipulation

### Layout Structure
```
┌─────────────────────────────────────┐
│           HEADER (fixed)            │
│  Logo    Search Bar    Cart Icon   │
├─────────────────────────────────────┤
│                                     │
│     CATEGORY FILTER TABS            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         PRODUCT GRID                │
│   (Responsive 1-4 columns)          │
│                                     │
├─────────────────────────────────────┤
│              FOOTER                 │
└─────────────────────────────────────┘
```

### Visual Style
- **Theme**: Modern minimalist with soft shadows and rounded corners
- **Color Palette**:
  - Primary: `#2563eb` (vibrant blue)
  - Secondary: `#1e293b` (dark slate)
  - Accent: `#f59e0b` (amber for ratings/wishlist)
  - Background: `#f8fafc` (light gray)
  - Card Background: `#ffffff`
  - Text Primary: `#1e293b`
  - Text Secondary: `#64748b`
  - Error: `#ef4444`
  - Success: `#22c55e`
- **Typography**: Inter (Google Fonts) — clean, modern sans-serif
- **Spacing**: 8px base unit, consistent padding/margins

### Product Card Design
- Product image (aspect ratio 1:1, object-fit: contain)
- Product title (truncate to 2 lines)
- Category badge
- Price (bold, prominent)
- Star rating display (1-5 stars with count)
- Add to cart button (hover state)

### Responsive Breakpoints
- **Mobile**: < 640px — 1 column grid
- **Tablet**: 640px - 1024px — 2 columns
- **Desktop**: 1024px - 1280px — 3 columns
- **Large Desktop**: > 1280px — 4 columns

---

## 3. API & Data Specification

### API Endpoint
- **Base URL**: `https://dummyjson.com`
- **Products**: `GET /products?limit=100`
- **Categories**: `GET /products/categories`
- **Filter by Category**: `GET /products/category/{category}?limit=100`

### Product Data Structure
```json
{
  "id": 1,
  "title": "Essence Mascara Lash Princess",
  "price": 9.99,
  "description": "The Essence Mascara Lash Princess is a popular mascara...",
  "category": "beauty",
  "thumbnail": "https://dummyimage.com/400x400/...",
  "rating": 2.56,
  "stock": 99
}
```

---

## 4. Component Architecture

### Components (each as JS class/object)
1. **App** — Root component, manages state and orchestrates
2. **Header** — Logo, search input, cart icon with count
3. **CategoryFilter** — Horizontal scrollable category tabs
4. **ProductGrid** — Container for ProductCard components
5. **ProductCard** — Individual product display
6. **LoadingSpinner** — Loading state indicator
7. **ErrorMessage** — Error state display
8. **Toast** — Notification system for cart actions

### Component Communication
- Event-driven using custom events
- Central state store in App component
- Components subscribe to state changes

---

## 5. Interaction Specification

### Search
- Real-time filtering as user types (debounced 300ms)
- Filters by product title and description
- Case-insensitive matching
- Shows "No results found" message when empty

### Category Filter
- Horizontal tab bar with "All" option
- Single selection (click to filter)
- Active state styling
- Smooth transition when filtering

### Add to Cart
- Button click adds product to cart
- Toast notification confirms action
- Cart count updates in header
- Cart stored in localStorage for persistence

### Cart Functionality
- View cart items (sidebar/modal)
- Remove items from cart
- See total price
- Persist cart in localStorage

---

## 6. Loading & Error States

### Loading State
- Skeleton cards during initial load
- Spinner overlay for category changes
- Disable interactions during loading

### Error State
- Friendly error message with retry button
- Specific error types:
  - Network error (no internet)
  - API error (server issues)
  - 404 (resource not found)

### Empty State
- "No products found" message
- Suggestion to adjust search or filter

---

## 7. File Structure
```
/
├── index.html        # Main HTML structure
├── styles.css        # All CSS styles
├── app.js            # Main application JavaScript
└── SPEC.md           # This specification
```

---

## 8. Acceptance Criteria

- [ ] Products load and display in responsive grid
- [ ] Search filters products in real-time
- [ ] Category tabs filter products correctly
- [ ] Loading spinner shows during API calls
- [ ] Error message displays on API failure with retry
- [ ] Add to cart works and persists in localStorage
- [ ] Cart count updates in header
- [ ] Layout is fully responsive (mobile to desktop)
- [ ] No console errors during normal operation
- [ ] All external resources (fonts, API) are accessible
