# ShopVista
CONVERSELY AI ( Assignment )
# ShopVista — Product Browser

A responsive, single-page e-commerce product browser built with vanilla JavaScript. Browse products fetched from the [DummyJSON API](https://dummyjson.com), filter by category, search in real time, and manage a persistent shopping cart — all with zero dependencies.

---

## Features

- **Product Grid** — Responsive layout (1–4 columns) with product image, title, category badge, price, and star rating
- **Real-time Search** — Debounced (300ms) search filtering by product title and description
- **Category Filtering** — Horizontal tab bar to filter products by category
- **Shopping Cart** — Slide-out sidebar with quantity controls, item removal, and total price
- **Cart Persistence** — Cart state saved to `localStorage` and restored on page load
- **Toast Notifications** — Confirmation messages for cart actions
- **Loading States** — Skeleton card placeholders during API calls
- **Error Handling** — User-friendly error messages with a retry button
- **Empty State** — Helpful messaging when search/filter returns no results

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, flexbox, grid) |
| Logic | Vanilla JavaScript (ES6+, ES Modules) |
| Data | [DummyJSON REST API](https://dummyjson.com) |
| Fonts | Inter via Google Fonts |

No build tools, bundlers, or frameworks required.

---

## Project Structure

```
/
├── index.html     # App shell and static markup
├── styles.css     # All styles (layout, components, responsive)
├── app.js         # Application logic (ES module)
└── SPEC.md        # Product specification
```

---

## Architecture

The app follows a component-based pattern using plain ES6 classes with a central reactive store.

```
App
├── ApiService       — Fetch wrapper for DummyJSON endpoints
├── Store            — Central state with subscribe/notify pattern
├── Search           — Debounced input filtering
├── CategoryFilter   — Tab-based category switching
├── ProductGrid      — Renders ProductCard list, manages view states
│   └── ProductCard  — Individual product tile
├── Cart             — Sidebar, quantity controls, localStorage sync
└── Toast            — Ephemeral notification messages
```

**State flow:** User interactions update the `Store`, which notifies all subscribed components to re-render.

---

## API Endpoints

| Purpose | Endpoint |
|---|---|
| All products | `GET https://dummyjson.com/products?limit=100` |
| All categories | `GET https://dummyjson.com/products/categories` |
| Products by category | `GET https://dummyjson.com/products/category/{slug}?limit=100` |

---

## Getting Started

No installation or build step needed. Just serve the files from any static file server.

**Using VS Code Live Server**
1. Open the project folder in VS Code
2. Right-click `index.html` → **Open with Live Server**

**Using Python**
```bash
python -m http.server 8080
# then open http://localhost:8080
```

**Using Node.js**
```bash
npx serve .
```

---

## Responsive Breakpoints

| Breakpoint | Columns |
|---|---|
| < 640px (mobile) | 1 |
| 640px – 1024px (tablet) | 2 |
| 1024px – 1280px (desktop) | 3 |
| > 1280px (large desktop) | 4 |

---

## Color Palette

| Token | Value | Usage |
|---|---|---|
| Primary | `#2563eb` | Buttons, links, active states |
| Secondary | `#1e293b` | Headings, dark text |
| Accent | `#f59e0b` | Star ratings |
| Background | `#f8fafc` | Page background |
| Error | `#ef4444` | Error states |
| Success | `#22c55e` | Toast confirmations |

---

## License

MIT
