// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyBsOmPIoAbsPTI8WwX8TrnTY01hv6UhcX8",
    authDomain: "pharmacy-admin-2ff91.firebaseapp.com",
    projectId: "pharmacy-admin-2ff91",
    storageBucket: "pharmacy-admin-2ff91.appspot.com",
    messagingSenderId: "809512854347",
    appId: "1:809512854347:web:a7294d8e77c7f138f83ece"
};

// Initialize Firebase
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ===== APP STORE =====
class PharmacyStore {
    constructor() {
        this.products = [];
        this.cart = [];
        this.favorites = [];
        this.categories = [
            { id: 'all', name: 'الكل' },
            { id: 'painkillers', name: 'مسكنات' },
            { id: 'vitamins', name: 'فيتامينات' },
            { id: 'supplements', name: 'مكملات' },
            { id: 'cold-flu', name: 'برد' },
            { id: 'cosmetics', name: 'تجميل' }
        ];
        this.selectedCategory = 'all';
        this.sortBy = 'default';
        this.currentView = 'home-view';

        this.init();
    }

    init() {
        this.loadLocalData();
        this.setupCategories();
        this.listenToProducts(); // Real-time data
        this.updateCartUI();
    }

    loadLocalData() {
        const data = localStorage.getItem('pharmacy-store-v2');
        if (data) {
            const parsed = JSON.parse(data);
            this.cart = parsed.cart || [];
            this.favorites = parsed.favorites || [];
        }
    }

    saveState() {
        localStorage.setItem('pharmacy-store-v2', JSON.stringify({
            cart: this.cart,
            favorites: this.favorites
        }));
        this.updateCartUI();
    }

    setupCategories() {
        const desktopList = document.getElementById('desktopCategories');
        if (desktopList) {
            desktopList.innerHTML = this.categories.map(cat => `
                <li>
                    <button class="${this.selectedCategory === cat.id ? 'active' : ''}" 
                            onclick="store.setCategory('${cat.id}')">
                        ${cat.name}
                    </button>
                </li>
            `).join('');
        }
    }

    setCategory(id) {
        this.selectedCategory = id;
        this.renderProducts();
        this.setupCategories(); // Re-render for active state
    }

    // ===== DATA FETCHING =====
    listenToProducts() {
        // Show loading
        const grid = document.getElementById('productsGrid');
        if (grid) grid.innerHTML = `<div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i><p>جاري تحميل المنتجات...</p></div>`;

        db.collection('products').onSnapshot((snapshot) => {
            this.products = [];
            snapshot.forEach((doc) => {
                this.products.push({ id: doc.id, ...doc.data() });
            });
            console.log("Loaded products:", this.products.length);
            this.renderProducts();
        }, (error) => {
            console.error("Error fetching products:", error);
            // Fallback if permission issues or empty
            if (this.products.length === 0) this.loadMockData();
        });
    }

    loadMockData() {
        // Fallback only
        this.products = [
            { id: '1', name: 'بانادول', price: 25, category: 'painkillers', image: 'https://via.placeholder.com/300' },
            { id: '2', name: 'فيتامين سي', price: 60, category: 'vitamins', image: 'https://via.placeholder.com/300' }
        ];
        this.renderProducts();
    }

    // ===== RENDERING =====
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        let filtered = this.products;

        // Filter Category
        if (this.selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.selectedCategory);
        }

        // Sort
        if (this.sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (this.sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">لا توجد منتجات متاحة حالياً</p>`;
            return;
        }

        grid.innerHTML = filtered.map(product => `
            <div class="product-card">
                <button class="heart-btn ${this.favorites.includes(product.id) ? 'active' : ''}" 
                        onclick="store.toggleFavorite('${product.id}')">
                    <i class="${this.favorites.includes(product.id) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <img src="${product.image}" class="card-img" alt="${product.name}" 
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/883/883407.png'">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price-row">
                        <span class="price">${product.price} ج.م</span>
                        <button class="add-cart-btn" onclick="store.addToCart('${product.id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    sortProducts(value) {
        this.sortBy = value;
        this.renderProducts();
    }

    // ===== CART LOGIC =====
    addToCart(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const existing = this.cart.find(i => i.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveState();

        // Open drawer for feedback
        this.toggleCart(true);
    }

    removeFromCart(id) {
        this.cart = this.cart.filter(i => i.id !== id);
        this.saveState();
    }

    toggleCart(forceOpen = null) {
        const drawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('cartOverlay');

        const isOpen = drawer.classList.contains('open');
        const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;

        if (shouldOpen) {
            drawer.classList.add('open');
            overlay.classList.add('open');
        } else {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
        }
    }

    updateCartUI() {
        const count = this.cart.reduce((a, b) => a + b.quantity, 0);
        const total = this.cart.reduce((a, b) => a + (b.price * b.quantity), 0);

        // Header Badge
        document.getElementById('headerCartCount').textContent = count;
        document.getElementById('headerCartCount').style.display = count > 0 ? 'block' : 'none';

        // Cart Drawer
        const container = document.getElementById('cartItems');
        if (container) {
            if (this.cart.length === 0) {
                container.innerHTML = '<p class="text-center text-muted">السلة فارغة</p>';
            } else {
                container.innerHTML = this.cart.map(item => `
                    <div style="display: flex; gap: 10px; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
                        <img src="${item.image}" style="width: 50px; height: 50px; object-fit: contain;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${item.name}</div>
                            <div style="font-size: 0.9rem;">${item.price} ج.م × ${item.quantity}</div>
                        </div>
                        <button onclick="store.removeFromCart('${item.id}')" style="background: none; border: none; color: red;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
        document.getElementById('cartTotal').textContent = total.toFixed(2) + ' ج.م';
    }

    toggleFavorite(id) {
        if (this.favorites.includes(id)) {
            this.favorites = this.favorites.filter(fid => fid !== id);
        } else {
            this.favorites.push(id);
        }
        this.saveState();
        this.renderProducts();
        this.updateWishlistCount();
    }

    updateWishlistCount() {
        const count = this.favorites.length;
        document.getElementById('wishlistCount').textContent = count;
        document.getElementById('wishlistCount').style.display = count > 0 ? 'block' : 'none';
    }

    navigateTo(screenId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        if (screenId === 'wishlist-screen') {
            document.getElementById('wishlist-view').classList.add('active');
            this.renderWishlist();
        } else {
            document.getElementById('home-view').classList.add('active');
        }
    }

    renderWishlist() {
        const grid = document.getElementById('wishlistGrid');
        const items = this.products.filter(p => this.favorites.includes(p.id));

        if (items.length === 0) {
            grid.innerHTML = '<p>لا توجد منتجات في المفضلة</p>';
            return;
        }

        grid.innerHTML = items.map(product => `
            <div class="product-card">
                 <button class="heart-btn active" onclick="store.toggleFavorite('${product.id}'); store.renderWishlist();">
                    <i class="fas fa-heart"></i>
                </button>
                <img src="${product.image}" class="card-img">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price-row">
                        <span class="price">${product.price} ج.م</span>
                        <button class="add-cart-btn" onclick="store.addToCart('${product.id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    toggleDarkMode() {
        // Simple toggle implementation if needed later
        document.body.classList.toggle('dark-mode');
    }
}

// Global toggle for mobile menu
function toggleMobileMenu() {
    const nav = document.querySelector('.category-nav');
    nav.classList.toggle('open');
}

// Initialize
const store = new PharmacyStore();
function scrollToProducts() {
    document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth' });
}