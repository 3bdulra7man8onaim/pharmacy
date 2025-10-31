// ===== PHARMACY CLIENT APP =====

// Store Class
class PharmacyStore {
    constructor() {
        this.products = [];
        this.cart = [];
        this.favorites = [];
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.isDarkMode = false;
        this.language = 'ar';
        
        this.loadFromStorage();
        this.initializeProducts();
    }

    // Load data from localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('pharmacy-store');
        if (stored) {
            const data = JSON.parse(stored);
            this.cart = data.cart || [];
            this.favorites = data.favorites || [];
            this.isDarkMode = data.isDarkMode || false;
            this.language = data.language || 'ar';
        }
    }

    // Save data to localStorage
    saveToStorage() {
        const data = {
            cart: this.cart,
            favorites: this.favorites,
            isDarkMode: this.isDarkMode,
            language: this.language
        };
        localStorage.setItem('pharmacy-store', JSON.stringify(data));
    }

    // Initialize products
    async initializeProducts() {
        try {
            if (typeof db !== 'undefined') {
                const snapshot = await db.collection('products').get();
                this.products = [];
                snapshot.forEach(doc => {
                    this.products.push({ id: doc.id, ...doc.data() });
                });
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }

        // Load default products if none exist
        if (this.products.length === 0) {
            this.products = [
                {
                    id: 'default-1',
                    name: 'بانادول إكسترا',
                    price: 25.00,
                    category: 'painkillers',
                    image: 'https://via.placeholder.com/200x200/4CAF50/white?text=بانادول',
                    description: 'مسكن قوي للألم والصداع',
                    available: true
                },
                {
                    id: 'default-2', 
                    name: 'فيتامين سي 1000',
                    price: 45.00,
                    category: 'vitamins',
                    image: 'https://via.placeholder.com/200x200/FF9800/white?text=فيتامين+سي',
                    description: 'فيتامين سي لتقوية المناعة',
                    available: true
                },
                {
                    id: 'default-3',
                    name: 'كريم مرطب للبشرة',
                    price: 35.00,
                    category: 'skincare',
                    image: 'https://via.placeholder.com/200x200/2196F3/white?text=كريم+مرطب',
                    description: 'كريم مرطب طبيعي للبشرة الجافة',
                    available: true
                },
                {
                    id: 'default-4',
                    name: 'شراب كحة للأطفال',
                    price: 30.00,
                    category: 'baby',
                    image: 'https://via.placeholder.com/200x200/E91E63/white?text=شراب+كحة',
                    description: 'شراب آمن لعلاج الكحة عند الأطفال',
                    available: true
                },
                {
                    id: 'default-5',
                    name: 'مقياس حرارة رقمي',
                    price: 85.00,
                    category: 'devices',
                    image: 'https://via.placeholder.com/200x200/9C27B0/white?text=مقياس+حرارة',
                    description: 'مقياس حرارة رقمي دقيق وسريع',
                    available: true
                }
            ];
        }

        renderProducts();
        renderCategories();
    }

    // Add to cart
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.available) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        this.updateCartUI();
        this.showToast(`تم إضافة ${product.name} إلى السلة`, 'success');
    }

    // Remove from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateCartUI();
    }

    // Update cart quantity
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveToStorage();
            this.updateCartUI();
        }
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveToStorage();
        this.updateCartUI();
        this.showToast('تم إفراغ السلة', 'success');
    }

    // Toggle favorite
    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(productId);
        }
        this.saveToStorage();
    }

    // Update cart UI
    updateCartUI() {
        const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartTotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Update cart count
        const cartCountElements = document.querySelectorAll('#cartCount, #mobileCartCount');
        cartCountElements.forEach(element => {
            if (element) element.textContent = cartCount;
        });

        // Update cart total
        const cartTotalElement = document.getElementById('cartTotal');
        const cartSubtotalElement = document.getElementById('cartSubtotal');
        if (cartSubtotalElement) cartSubtotalElement.textContent = `${cartTotal} جنيه`;
        if (cartTotalElement) cartTotalElement.textContent = `${cartTotal} جنيه`;
        
        // Show/hide cart footer
        const cartFooter = document.getElementById('cartFooter');
        const cartEmpty = document.getElementById('cartEmpty');
        
        if (cartFooter && cartEmpty) {
            if (cartCount > 0) {
                cartFooter.style.display = 'block';
                cartEmpty.style.display = 'none';
            } else {
                cartFooter.style.display = 'none';
                cartEmpty.style.display = 'block';
            }
        }

        // Render cart items
        this.renderCartItems();
    }

    // Render cart items
    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:1.5rem;\\'>📦</div>'; console.warn('Failed to load cart image:', '${item.image}');">
                    ${item.quantity > 1 ? `<div class="quantity-badge">${item.quantity}</div>` : ''}
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <div class="cart-item-price">${item.price} جنيه</div>
                    <div class="cart-item-controls">
                        <button onclick="store.updateCartQuantity('${item.id}', ${item.quantity - 1})" 
                                class="quantity-btn" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button onclick="store.updateCartQuantity('${item.id}', ${item.quantity + 1})" 
                                class="quantity-btn">+</button>
                        <button onclick="store.removeFromCart('${item.id}')" class="remove-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)} جنيه
                </div>
            </div>
        `).join('');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Toggle dark mode
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
        this.saveToStorage();
    }

    // Toggle language
    toggleLanguage() {
        this.language = this.language === 'ar' ? 'en' : 'ar';
        this.saveToStorage();
        // Language switching logic would go here
    }
}

// Initialize store
const store = new PharmacyStore();

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    let filteredProducts = store.products.filter(product => {
        const matchesCategory = store.selectedCategory === 'all' || product.category === store.selectedCategory;
        const matchesSearch = !store.searchQuery || 
            product.name.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(store.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && product.available;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>لا توجد منتجات</h3>
                <p>لم يتم العثور على منتجات تطابق البحث</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map((product, index) => {
        const isFavorite = store.favorites.includes(product.id);
        const displayName = product.name;
        
        return `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div class="product-image">
                <img src="${product.image}" alt="${displayName}" 
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:2rem;\\'>📦</div>'; console.warn('Failed to load image:', '${product.image}');">
                
                <!-- Product Badges -->
                <div class="product-badges">
                    <span class="badge badge-available">متاح</span>
                </div>
                
                <!-- Favorite Button -->
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite('${product.id}')" 
                        title="${isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">${displayName}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-category">
                    <span class="category-tag">${getCategoryDisplayName(product.category)}</span>
                </div>
                
                <div class="product-footer">
                    <div class="product-price">
                        <span class="current-price">${product.price} جنيه</span>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary add-to-cart-btn" 
                                onclick="store.addToCart('${product.id}')"
                                title="إضافة للسلة">
                            <i class="fas fa-cart-plus"></i>
                            <span>أضف للسلة</span>
                        </button>
                        
                        <button class="btn btn-secondary quick-order-btn" 
                                onclick="openWhatsAppOrder('${product.id}')"
                                title="طلب سريع">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Render categories
function renderCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;

    const categories = [
        { id: 'all', name: 'جميع المنتجات', icon: '🏥', count: store.products.length },
        { id: 'painkillers', name: 'مسكنات', icon: '💊', count: store.products.filter(p => p.category === 'painkillers').length },
        { id: 'vitamins', name: 'فيتامينات', icon: '🍊', count: store.products.filter(p => p.category === 'vitamins').length },
        { id: 'supplements', name: 'مكملات غذائية', icon: '💪', count: store.products.filter(p => p.category === 'supplements').length },
        { id: 'cold', name: 'أدوية البرد', icon: '🤧', count: store.products.filter(p => p.category === 'cold').length },
        { id: 'baby', name: 'منتجات الأطفال', icon: '👶', count: store.products.filter(p => p.category === 'baby').length },
        { id: 'skincare', name: 'العناية الشخصية', icon: '🧴', count: store.products.filter(p => p.category === 'skincare').length },
        { id: 'devices', name: 'أجهزة طبية', icon: '🩺', count: store.products.filter(p => p.category === 'devices').length }
    ];

    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card ${store.selectedCategory === category.id ? 'active' : ''}" 
             onclick="selectCategory('${category.id}')">
            <div class="category-icon">${category.icon}</div>
            <div class="category-info">
                <h3 class="category-name">${category.name}</h3>
                <p class="category-count">${category.count} منتج</p>
            </div>
        </div>
    `).join('');
}

// Get category display name
function getCategoryDisplayName(category) {
    const categories = {
        'painkillers': 'مسكنات',
        'vitamins': 'فيتامينات',
        'supplements': 'مكملات غذائية',
        'cold': 'أدوية البرد',
        'baby': 'منتجات الأطفال',
        'skincare': 'العناية الشخصية',
        'oral': 'العناية بالفم والأسنان',
        'haircare': 'العناية بالشعر',
        'devices': 'أجهزة طبية',
        'other': 'أخرى'
    };
    return categories[category] || category;
}

// Select category
function selectCategory(categoryId) {
    store.selectedCategory = categoryId;
    renderCategories();
    renderProducts();
}

function toggleFavorite(productId) {
    store.toggleFavorite(productId);
    renderProducts(); // Re-render to update favorite button state
}

// Cart functionality
function toggleCart() {
    const cart = document.getElementById('shoppingCart');
    const overlay = document.getElementById('cartOverlay');
    
    if (cart && overlay) {
        const isOpen = cart.classList.contains('open');
        
        if (isOpen) {
            cart.classList.remove('open');
            overlay.classList.remove('active');
        } else {
            cart.classList.add('open');
            overlay.classList.add('active');
            store.updateCartUI();
        }
    }
}

function closeCart() {
    const cart = document.getElementById('shoppingCart');
    const overlay = document.getElementById('cartOverlay');
    
    if (cart && overlay) {
        cart.classList.remove('open');
        overlay.classList.remove('active');
    }
}

// WhatsApp order functionality
function openWhatsAppOrder(productId) {
    const product = store.products.find(p => p.id === productId);
    if (!product) return;

    const message = `مرحباً، أريد طلب:\n${product.name}\nالسعر: ${product.price} جنيه\n\nيرجى التواصل معي لتأكيد الطلب.`;
    const whatsappUrl = `https://wa.me/201006273308?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Search functionality
function handleSearch(query) {
    store.searchQuery = query.trim();
    renderProducts();
}

// Scroll to products
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== MARKETING POSTER FUNCTIONALITY =====

// Load marketing poster from localStorage
function loadMarketingPoster() {
    try {
        const posterData = JSON.parse(localStorage.getItem('pharmacy-marketing-poster') || '{}');
        
        if (posterData.url && !posterData.hidden) {
            let banner = document.getElementById('marketingBanner');
            
            // Create banner if it doesn't exist
            if (!banner) {
                banner = document.createElement('section');
                banner.id = 'marketingBanner';
                banner.className = 'marketing-banner';
                banner.style.cssText = `
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                    padding: 0;
                    margin: 20px 0;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                `;
                
                const heroSection = document.querySelector('.hero');
                if (heroSection) {
                    heroSection.parentNode.insertBefore(banner, heroSection.nextSibling);
                }
            }
            
            banner.innerHTML = `
                <div class="container">
                    <div class="marketing-banner-inner" style="position: relative; display: flex; align-items: center; justify-content: center; min-height: 200px;">
                        <img src="${posterData.url}" alt="العرض التسويقي" 
                             style="width: 100%; height: auto; max-height: 400px; object-fit: cover; border-radius: 15px; transition: transform 0.3s ease;"
                             onload="this.parentElement.parentElement.parentElement.style.display='block'"
                             onerror="this.parentElement.parentElement.parentElement.style.display='none'">
                    </div>
                </div>
            `;
            
            banner.style.display = 'block';
            console.log('✅ Marketing poster loaded successfully');
        } else {
            // Hide banner if no poster or poster is hidden
            const banner = document.getElementById('marketingBanner');
            if (banner) banner.style.display = 'none';
        }
    } catch (error) {
        console.log('No marketing poster configured:', error);
        const banner = document.getElementById('marketingBanner');
        if (banner) banner.style.display = 'none';
    }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Cart toggle
    const cartToggle = document.getElementById('cartToggle');
    const mobileCartToggle = document.getElementById('mobileCartToggle');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    const clearCartBtn = document.getElementById('clearCart');

    if (cartToggle) cartToggle.addEventListener('click', toggleCart);
    if (mobileCartToggle) mobileCartToggle.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (clearCartBtn) clearCartBtn.addEventListener('click', () => store.clearCart());

    // Search
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => store.toggleDarkMode());
        
        // Set initial dark mode state
        if (store.isDarkMode) {
            document.documentElement.classList.add('dark-mode');
        }
    }

    // Language toggle
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => store.toggleLanguage());
    }

    // Mobile menu
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    // Initialize
    store.updateCartUI();
    loadMarketingPoster();
    
    // Check for poster updates every 30 seconds
    setInterval(loadMarketingPoster, 30000);
    
    console.log('🏥 Pharmacy Client App Initialized Successfully!');
});

// Global functions
window.store = store;
window.selectCategory = selectCategory;
window.toggleFavorite = toggleFavorite;
window.openWhatsAppOrder = openWhatsAppOrder;
window.scrollToProducts = scrollToProducts;