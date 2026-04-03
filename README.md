# ShopVista — Product Browser

> A responsive, zero-dependency single-page e-commerce product browser built with vanilla JavaScript, HTML5, and CSS3.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [API Reference](#api-reference)
5. [Setup & Installation](#setup--installation)
6. [Project Structure](#project-structure)
7. [Architectural Decisions](#architectural-decisions)
   - [State Management](#state-management)
   - [Component Structure](#component-structure)
   - [Event-Driven Communication](#event-driven-communication)
   - [Cart Persistence](#cart-persistence)
   - [Search Debouncing](#search-debouncing)
8. [Responsive Design](#responsive-design)
9. [Key Design Decisions & Trade-offs](#key-design-decisions--trade-offs)
10. [Known Limitations](#known-limitations)
11. [License](#license)

---

## Project Overview

ShopVista is a client-side product browsing application that consumes the [DummyJSON REST API](https://dummyjson.com) to display a catalogue of products. Users can search and filter products, manage a shopping cart, and receive real-time feedback — all without any frameworks, build tools, or external JavaScript libraries.

The goal was to demonstrate how a well-structured, maintainable frontend application can be built using only platform primitives: the DOM, Fetch API, CSS Grid, and ES6+ JavaScript classes.

---

## Features

- **Product Grid** — Responsive 1–4 column layout displaying product image, title, category badge, price, and star rating
- **Real-time Search** — Debounced input (300ms) filters products by title and description simultaneously
- **Category Filtering** — Horizontally scrollable tab bar for filtering by product category
- **Shopping Cart Sidebar** — Slide-out panel with per-item quantity controls, item removal, and a running total
- **Cart Persistence** — Cart contents survive page refreshes via `localStorage`
- **Toast Notifications** — Non-blocking confirmation and error messages for cart actions
- **Skeleton Loading** — Placeholder cards shown during API fetches for a smooth perceived performance
- **Error Recovery** — User-friendly error screen with a retry button on API failure
- **Empty State Handling** — Contextual messaging when search or filter yields no results
- **Fully Responsive** — Optimised for mobile, tablet, and desktop viewports

---

## Technologies Used

| Technology | Reason for Choice |
|---|---|
| **HTML5** | Semantic structure, accessibility attributes (`aria-label`, `role`) |
| **CSS3** | Custom properties, Grid, Flexbox — no CSS framework needed |
| **JavaScript ES6+ (Modules)** | Classes, `async`/`await`, destructuring, template literals |
| **Fetch API** (native) | Built-in HTTP client; no library overhead |
| **Google Fonts — Inter** | Clean, modern sans-serif optimised for UI readability |
| **DummyJSON API** | Free, stable, realistic product data with categories and images |

**Deliberately excluded:**

- No React, Vue, or Angular — demonstrates framework-agnostic skills and deep understanding of the platform
- No Webpack, Vite, or any bundler — the project runs directly in the browser via native ES Modules
- No CSS preprocessors — vanilla CSS with custom properties achieves the same maintainability
- No npm dependencies — zero `node_modules`, instant setup on any machine

---

## API Reference

All data is fetched from the [DummyJSON](https://dummyjson.com) public REST API. No API key or authentication is required.

| Purpose | Method | Endpoint |
|---|---|---|
| Fetch all products | `GET` | `https://dummyjson.com/products?limit=100` |
| Fetch all categories | `GET` | `https://dummyjson.com/products/categories` |
| Fetch products by category | `GET` | `https://dummyjson.com/products/category/{slug}?limit=100` |

### Product Data Shape

```json
{
  "id": 1,
  "title": "Essence Mascara Lash Princess",
  "price": 9.99,
  "description": "The Essence Mascara Lash Princess is a popular mascara known for...",
  "category": "beauty",
  "thumbnail": "https://cdn.dummyjson.com/products/images/beauty/...",
  "rating": 2.56,
  "stock": 99
}
```

### Category Data Shape

The `/products/categories` endpoint returns an array of category objects:

```json
[
  { "slug": "beauty", "name": "Beauty", "url": "https://dummyjson.com/products/category/beauty" },
  { "slug": "furniture", "name": "Furniture", "url": "..." }
]
```

> The app extracts the `slug` field for API filtering and capitalises it for display in the tab bar.

---

## Setup & Installation

No build step, package manager, or tooling is required. Because the app uses native ES Modules (`type="module"`), it **must be served over HTTP** — opening `index.html` directly as a `file://` URL will trigger CORS errors from the API and module-loading failures in the browser.

**Option 1 — VS Code Live Server (recommended)**

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Open the project folder in VS Code
3. Right-click `index.html` → **Open with Live Server**
4. The browser opens automatically at `http://127.0.0.1:5500`

**Option 2 — Python (no install required)**

```bash
# Python 3
python -m http.server 8080
# Open http://localhost:8080
```

**Option 3 — Node.js**

```bash
npx serve .
# Follow the URL printed in the terminal
```

**Option 4 — Static hosting**

Drop `index.html`, `styles.css`, and `app.js` into any static host (GitHub Pages, Netlify, Vercel) and deploy — no build configuration needed.

---

## Project Structure

```
/
├── index.html     # App shell: semantic markup and DOM anchor points
├── styles.css     # All styles: layout, components, states, animations, responsive
├── app.js         # All JavaScript: classes, state, API, DOM rendering
└── SPEC.md        # Product specification and acceptance criteria
```

All application logic lives in a single `app.js` file, divided into clearly labelled class sections. This keeps the project approachable without requiring a module bundler, directory conventions, or import maps.

---

## Architectural Decisions

### State Management

Rather than using a library like Redux, ShopVista implements a lightweight **reactive store** based on the Observer (publish/subscribe) pattern.

```js
class Store {
  constructor() {
    this.state = {
      products: [],
      filteredProducts: [],
      categories: [],
      activeCategory: 'all',
      searchQuery: '',
      cart: [],
      isLoading: false,
      error: null
    };
    this.listeners = new Set();
  }

  setState(updates) {
    this.state = { ...this.state, ...updates }; // immutable-style merge
    this.notify();                              // re-render all subscribers
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener); // returns unsubscribe fn
  }
}
```

**Why this approach:**

- **Single source of truth** — all UI state lives in one place; no component holds private state that can drift out of sync with another
- **Predictable updates** — `setState()` is the only entry point for mutations, making data flow straightforward to trace and debug
- **Automatic re-renders** — components subscribe once and re-render whenever state changes, with no manual DOM coordination between components
- **Minimal boilerplate** — the entire store is ~30 lines with zero external dependencies

---

### Component Structure

Each UI concern is encapsulated in its own ES6 class. Components receive the `store` (and `api` where needed) via constructor injection — no globals are shared except the root `window.app` instance used for debugging.

```
App                         ← Root orchestrator; wires all components together
├── ApiService              ← All network calls; throws on non-2xx responses
├── Store                   ← Central reactive state (see above)
├── Search                  ← Reads input; writes searchQuery + filteredProducts
├── CategoryFilter          ← Manages active tab; triggers API calls on change
├── ProductGrid             ← Subscribes to store; delegates rendering to cards
│   └── ProductCard         ← Pure render — receives a product, returns a DOM node
├── Cart                    ← Reads/writes cart state; manages sidebar visibility
└── Toast                   ← Stateless; creates and auto-removes notification nodes
```

**Key design choices within components:**

- **`ProductCard` is stateless** — it receives a product object and returns a DOM element. It holds no internal state and does not subscribe to the store, keeping it fast, predictable, and easy to test in isolation.

- **Event delegation over per-element listeners** — `ProductGrid` attaches a single `click` listener to the grid container rather than one per card. `Cart` does the same for its items list. This prevents listener accumulation and memory leaks each time the list re-renders.

- **Components own their DOM queries** — each class queries its own elements in the constructor (`document.getElementById(...)`) rather than accepting pre-queried elements as arguments. This makes dependencies explicit and avoids fragile global selector usage.

---

### Event-Driven Communication

Child components never call parent methods directly. Instead, they update the store and let subscriptions propagate changes through the tree automatically.

**Example — adding a product to the cart:**

```
User clicks "Add to Cart" on a ProductCard
  → ProductGrid's delegated click listener fires (data-id attribute read)
  → cart.addItem(product) is called
  → Cart.addItem() calls store.setState({ cart: updatedCart })
  → Store notifies all subscribers
  → Cart component re-renders sidebar and badge count automatically
  → toast.success("...added to cart") fires independently
```

`ProductCard` has no knowledge of `Cart`. `Cart` has no knowledge of `ProductCard`. Both depend only on the `Store` as a shared interface, keeping components loosely coupled and independently maintainable.

---

### Cart Persistence

Cart state is serialised to `localStorage` on every mutation and rehydrated during app startup:

```js
saveToLocalStorage() {
  localStorage.setItem('shopvista_cart', JSON.stringify(this.store.getState().cart));
}

loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('shopvista_cart');
    if (saved) this.store.setState({ cart: JSON.parse(saved) });
  } catch (e) {
    console.warn('Failed to load cart from localStorage');
    // app starts with an empty cart — no crash
  }
}
```

The `try/catch` ensures that corrupted or tampered `localStorage` data fails silently rather than crashing the application. `loadFromLocalStorage()` is called once in `App.init()` before any components render, so the badge count and cart sidebar reflect the saved state immediately on load.

---

### Search Debouncing

The search input is debounced at 300ms to avoid redundant filtering on every keystroke:

```js
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// In Search component:
const debouncedSearch = debounce((query) => this.performSearch(query), 300);
input.addEventListener('input', (e) => debouncedSearch(e.target.value));
```

Critically, search filters the **in-memory** `products` array rather than issuing a new API request. Once the initial product list is loaded, search results are instant regardless of network conditions.

---

## Responsive Design

Layout responsiveness is handled entirely with CSS Grid and media queries — no JavaScript resize listeners or layout calculations.

| Viewport | Columns | Breakpoint |
|---|---|---|
| Mobile | 1 | `< 640px` |
| Tablet | 2 | `640px – 1024px` |
| Desktop | 3 | `1024px – 1280px` |
| Large Desktop | 4 | `> 1280px` |

The header collapses gracefully on small screens, the search bar scales fluidly, and category tabs scroll horizontally with hidden scrollbars rather than wrapping to a second line.

---

## Key Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|---|---|---|
| Vanilla JS over a framework | Demonstrates core platform skills; zero setup overhead | More manual DOM management; no virtual DOM reconciliation |
| Single `app.js` file | Readable top-to-bottom; no bundler required | Would need splitting for a larger codebase |
| In-memory search | Instant results; no extra API calls per keystroke | Full product list (~100 items) must load upfront |
| `localStorage` for cart | Zero backend required; survives page refresh | Not synced across devices or browser profiles |
| ES Modules (`type="module"`) | Native scoping; no global pollution; future-proof | Cannot open via `file://` — requires an HTTP server |
| Skeleton loading cards | Better perceived performance vs a spinner overlay | Slightly more HTML and CSS to maintain |
| Observer pattern for state | Decouples components; simple to reason about | No time-travel debugging; no middleware support |

---

## Known Limitations

- **No pagination** — all products are fetched in a single `limit=100` request. A larger catalogue would require pagination or infinite scroll.
- **No checkout flow** — the "Proceed to Checkout" button is a UI placeholder; no payment or order processing is implemented.
- **Search scope** — search filters only the currently loaded product set. Switching category resets the product list, which clears any active search results.
- **No offline support** — the app requires an active internet connection to fetch products. No service worker or PWA caching is implemented.
- **Single currency** — prices are displayed in USD as returned by the API; no currency conversion is available.
- **Images from external CDN** — product images are hosted by DummyJSON. If that CDN is unavailable, images will not load.

---

## License

MIT — free to use, modify, and distribute.
