/**
 * ShopVista — E-Commerce Product Browser
 * Component-based Vanilla JavaScript Application
 */

// ===================================
// API Service
// ===================================
class ApiService {
  constructor() {
    this.baseUrl = 'https://dummyjson.com';
  }

  async getProducts() {
    const response = await fetch(`${this.baseUrl}/products?limit=100`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.products;
  }

  async getCategories() {
    const response = await fetch(`${this.baseUrl}/products/categories`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getProductsByCategory(category) {
    const response = await fetch(`${this.baseUrl}/products/category/${category}?limit=100`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.products;
  }
}

// ===================================
// State Store
// ===================================
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

  getState() {
    return this.state;
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// ===================================
// Utility Functions
// ===================================
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let starsHtml = '';

  for (let i = 0; i < fullStars; i++) {
    starsHtml += `<svg class="star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }

  if (hasHalfStar) {
    starsHtml += `<svg class="star half" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z"/></svg>`;
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHtml += `<svg class="star empty" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }

  return starsHtml;
}

// ===================================
// Toast Component
// ===================================
class Toast {
  constructor() {
    this.container = document.getElementById('toast-container');
  }

  show(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success'
      ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `
      ${icon}
      <span class="toast-message">${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  success(message) {
    this.show(message, 'success');
  }

  error(message) {
    this.show(message, 'error');
  }
}

// ===================================
// Cart Component
// ===================================
class Cart {
  constructor(store) {
    this.store = store;
    this.sidebar = document.getElementById('cart-sidebar');
    this.overlay = document.getElementById('cart-overlay');
    this.itemsContainer = document.getElementById('cart-items');
    this.emptyState = document.getElementById('cart-empty');
    this.footer = document.getElementById('cart-footer');
    this.totalPrice = document.getElementById('cart-total-price');
    this.badge = document.getElementById('cart-badge');

    this.init();
  }

  init() {
    document.getElementById('cart-button').addEventListener('click', () => this.open());
    document.getElementById('cart-close').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());

    this.store.subscribe(() => this.render());
    this.render();
  }

  open() {
    this.sidebar.classList.remove('hidden');
    this.overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.sidebar.classList.add('visible');
      this.overlay.classList.add('visible');
    });
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.sidebar.classList.remove('visible');
    this.overlay.classList.remove('visible');
    setTimeout(() => {
      this.sidebar.classList.add('hidden');
      this.overlay.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
  }

  addItem(product) {
    const cart = [...this.store.getState().cart];
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    this.store.setState({ cart });
    this.saveToLocalStorage();
  }

  removeItem(productId) {
    const cart = this.store.getState().cart.filter(item => item.id !== productId);
    this.store.setState({ cart });
    this.saveToLocalStorage();
  }

  updateQuantity(productId, delta) {
    const cart = [...this.store.getState().cart];
    const index = cart.findIndex(item => item.id === productId);

    if (index >= 0) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      this.store.setState({ cart });
      this.saveToLocalStorage();
    }
  }

  getTotal() {
    return this.store.getState().cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  getCount() {
    return this.store.getState().cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  saveToLocalStorage() {
    localStorage.setItem('shopvista_cart', JSON.stringify(this.store.getState().cart));
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('shopvista_cart');
      if (saved) {
        this.store.setState({ cart: JSON.parse(saved) });
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage');
    }
  }

  render() {
    const { cart } = this.store.getState();
    const count = this.getCount();
    const total = this.getTotal();

    // Update badge
    this.badge.textContent = count;
    this.badge.classList.toggle('visible', count > 0);

    // Update sidebar
    if (cart.length === 0) {
      this.itemsContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      this.footer.classList.add('hidden');
    } else {
      this.emptyState.classList.add('hidden');
      this.footer.classList.remove('hidden');

      this.itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img class="cart-item-image" src="${item.thumbnail}" alt="${item.title}" loading="lazy">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-controls">
              <button class="quantity-btn minus" data-action="decrease" data-id="${item.id}">-</button>
              <span class="cart-item-quantity">${item.quantity}</span>
              <button class="quantity-btn plus" data-action="increase" data-id="${item.id}">+</button>
              <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Remove item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');

      this.totalPrice.textContent = formatPrice(total);
    }
  }
}

// ===================================
// Product Card Component
// ===================================
class ProductCard {
  constructor(product, onAddToCart) {
    this.product = product;
    this.onAddToCart = onAddToCart;
  }

  render() {
    const { id, title, price, description, thumbnail, category, rating, stock } = this.product;
    const ratingCount = stock || 0;

    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = id;

    card.innerHTML = `
      <div class="product-image-wrapper">
        <img class="product-image" src="${thumbnail}" alt="${title}" loading="lazy">
        <span class="product-badge">${category}</span>
      </div>
      <div class="product-content">
        <h3 class="product-title">${title}</h3>
        <p class="product-description">${description}</p>
        <div class="product-rating">
          <div class="stars">${generateStars(rating)}</div>
          <span class="rating-count">(${ratingCount})</span>
        </div>
        <div class="product-footer">
          <span class="product-price">${formatPrice(price)}</span>
          <button class="add-to-cart-btn" data-action="add-to-cart" data-id="${id}">
            Add to Cart
          </button>
        </div>
      </div>
    `;

    return card;
  }
}

// ===================================
// Product Grid Component
// ===================================
class ProductGrid {
  constructor(store, cart) {
    this.store = store;
    this.cart = cart;
    this.container = document.getElementById('product-grid');
    this.loadingState = document.getElementById('loading-state');
    this.errorState = document.getElementById('error-state');
    this.emptyState = document.getElementById('empty-state');
    this.errorMessage = document.getElementById('error-message');
    this.toast = new Toast();

    this.init();
  }

  init() {
    this.store.subscribe(() => this.render());
    this.render();

    // Event delegation for add to cart
    this.container.addEventListener('click', (e) => {
      const button = e.target.closest('[data-action="add-to-cart"]');
      if (button) {
        const productId = parseInt(button.dataset.id, 10);
        const product = this.store.getState().products.find(p => p.id === productId);
        if (product) {
          this.cart.addItem(product);
          this.toast.success(`${product.title.substring(0, 30)}... added to cart`);
        }
      }
    });
  }

  showLoading() {
    this.container.innerHTML = '';
    this.container.classList.add('hidden');
    this.loadingState.classList.remove('hidden');
    this.errorState.classList.add('hidden');
    this.emptyState.classList.add('hidden');
  }

  showError(message) {
    this.loadingState.classList.add('hidden');
    this.container.classList.add('hidden');
    this.errorState.classList.remove('hidden');
    this.emptyState.classList.add('hidden');
    this.errorMessage.textContent = message;
  }

  showEmpty() {
    this.loadingState.classList.add('hidden');
    this.errorState.classList.add('hidden');
    this.container.classList.remove('hidden');
    this.emptyState.classList.remove('hidden');
    this.container.innerHTML = '';
  }

  render() {
    const { filteredProducts, isLoading, error } = this.store.getState();

    if (isLoading) {
      this.showLoading();
      return;
    }

    if (error) {
      this.showError(error);
      return;
    }

    if (filteredProducts.length === 0) {
      this.showEmpty();
      return;
    }

    this.loadingState.classList.add('hidden');
    this.errorState.classList.add('hidden');
    this.emptyState.classList.add('hidden');
    this.container.classList.remove('hidden');

    this.container.innerHTML = '';
    filteredProducts.forEach(product => {
      const card = new ProductCard(product).render();
      this.container.appendChild(card);
    });
  }
}

// ===================================
// Category Filter Component
// ===================================
class CategoryFilter {
  constructor(store, api) {
    this.store = store;
    this.api = api;
    this.container = document.getElementById('category-tabs');

    this.init();
  }

  init() {
    this.store.subscribe(() => this.render());
    this.render();

    this.container.addEventListener('click', async (e) => {
      const tab = e.target.closest('.category-tab');
      if (tab) {
        const category = tab.dataset.category;
        await this.setCategory(category);
      }
    });
  }

  async setCategory(category) {
    if (category === this.store.getState().activeCategory) return;

    this.store.setState({ isLoading: true, activeCategory: category });

    try {
      let products;
      if (category === 'all') {
        products = await this.api.getProducts();
      } else {
        products = await this.api.getProductsByCategory(category);
      }

      this.store.setState({
        products,
        filteredProducts: this.filterProducts(products, this.store.getState().searchQuery),
        isLoading: false,
        error: null
      });
    } catch (err) {
      this.store.setState({
        isLoading: false,
        error: 'Failed to load products. Please try again.'
      });
    }
  }

  filterProducts(products, query) {
    if (!query) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    );
  }

  render() {
    const { categories, activeCategory } = this.store.getState();

    const tabsHtml = `
      <button class="category-tab ${activeCategory === 'all' ? 'active' : ''}" data-category="all">All</button>
      ${categories.map(cat => `
        <button class="category-tab ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">
          ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      `).join('')}
    `;

    this.container.innerHTML = tabsHtml;
  }
}

// ===================================
// Search Component
// ===================================
class Search {
  constructor(store) {
    this.store = store;
    this.input = document.getElementById('search-input');
    this.clearBtn = document.getElementById('search-clear');

    this.init();
  }

  init() {
    const debouncedSearch = debounce((query) => {
      this.performSearch(query);
    }, 300);

    this.input.addEventListener('input', (e) => {
      const query = e.target.value;
      this.clearBtn.classList.toggle('visible', query.length > 0);
      debouncedSearch(query);
    });

    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.clearBtn.classList.remove('visible');
      this.performSearch('');
      this.input.focus();
    });
  }

  performSearch(query) {
    const { products } = this.store.getState();
    const filtered = this.filterProducts(products, query);
    this.store.setState({
      searchQuery: query,
      filteredProducts: filtered
    });
  }

  filterProducts(products, query) {
    if (!query) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// ===================================
// Main Application
// ===================================
class App {
  constructor() {
    this.api = new ApiService();
    this.store = new Store();
    this.cart = new Cart(this.store);
    this.toast = new Toast();

    this.init();
  }

  async init() {
    // Load cart from localStorage
    this.cart.loadFromLocalStorage();

    // Initialize components
    new Search(this.store);
    new ProductGrid(this.store, this.cart);
    new CategoryFilter(this.store, this.api);

    // Retry button handler
    document.getElementById('retry-button').addEventListener('click', () => {
      this.loadProducts();
    });

    // Cart item event delegation
    document.getElementById('cart-items').addEventListener('click', (e) => {
      const button = e.target.closest('[data-action]');
      if (!button) return;

      const productId = parseInt(button.dataset.id, 10);
      const action = button.dataset.action;

      switch (action) {
        case 'increase':
          this.cart.updateQuantity(productId, 1);
          break;
        case 'decrease':
          this.cart.updateQuantity(productId, -1);
          break;
        case 'remove':
          this.cart.removeItem(productId);
          this.toast.success('Item removed from cart');
          break;
      }
    });

    // Load initial data
    await this.loadCategories();
    await this.loadProducts();
  }

  async loadCategories() {
    try {
      const categories = await this.api.getCategories();
      // API returns array of objects like {slug, name, url}, extract slugs
      const categorySlugs = categories.map(cat => cat.slug || cat);
      this.store.setState({ categories: categorySlugs });
    } catch (err) {
      console.warn('Failed to load categories');
    }
  }

  async loadProducts() {
    this.store.setState({ isLoading: true, error: null });

    try {
      const products = await this.api.getProducts();
      this.store.setState({
        products,
        filteredProducts: products,
        isLoading: false,
        error: null
      });
    } catch (err) {
      this.store.setState({
        isLoading: false,
        error: 'Unable to load products. Please check your connection and try again.'
      });
    }
  }
}

// ===================================
// Initialize Application
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
