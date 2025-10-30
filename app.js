// ===== MODERN PHARMACY APP ===== 

// Global State Management
class PharmacyStore {
    constructor() {
        this.products = [];
        this.categories = [
            { id: 'all', name: 'جميع المنتجات', icon: 'fas fa-th-large', color: 'gray' },
            { id: 'painkillers', name: 'المسكنات', icon: 'fas fa-pills', color: 'red' },
            { id: 'vitamins', name: 'الفيتامينات', icon: 'fas fa-sun', color: 'yellow' },
            { id: 'supplements', name: 'المكملات الغذائية', icon: 'fas fa-dumbbell', color: 'green' },
            { id: 'cold', name: 'أدوية البرد', icon: 'fas fa-thermometer-half', color: 'blue' },
            { id: 'baby', name: 'منتجات الأطفال', icon: 'fas fa-baby', color: 'pink' },
            { id: 'skincare', name: 'العناية بالبشرة', icon: 'fas fa-pump-soap', color: 'purple' },
            { id: 'other', name: 'أخرى', icon: 'fas fa-prescription-bottle', color: 'indigo' }
        ];
        this.cart = [];
        this.favorites = [];
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.isDarkMode = false;
        this.isCartOpen = false;
        this.isMobileMenuOpen = false;
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

    // Initialize products from Firestore
    initializeProducts() {
        // Listen to Firestore for real-time updates
        this.listenToProducts();
    }
    
    // Listen to products from Firestore in real-time
    listenToProducts() {
        if (typeof db === 'undefined') {
            console.warn('Firestore not initialized, using default products');
            this.loadDefaultProducts();
            return;
        }
        
        db.collection('products').onSnapshot((snapshot) => {
            this.products = [];
            snapshot.forEach((doc) => {
                this.products.push({ id: doc.id, ...doc.data() });
            });
            
            // Re-render products when updated
            if (typeof renderProducts === 'function') {
                renderProducts();
            }
            
            console.log('✅ Products loaded from Firestore:', this.products.length);
        }, (error) => {
            console.error('Error listening to products:', error);
            // On error, show empty state rather than defaults so admin controls all data
            this.products = [];
            if (typeof renderProducts === 'function') renderProducts();
        });
    }
    
    // Load default products as fallback
    loadDefaultProducts() {
        this.products = [
            // المسكنات
            {
                id: '1',
                name: 'بانادول إكسترا',
                nameEn: 'Panadol Extra',
                price: 28,
                originalPrice: 35,
                category: 'painkillers',
                description: 'مسكن قوي للصداع والآلام العامة مع الكافيين',
                image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&crop=center',
                available: true,
                featured: true,
                bestseller: true,
                discount: 20,
                rating: 4.8,
                reviews: 234
            },
            {
                id: '2',
                name: 'أدفيل',
                nameEn: 'Advil',
                price: 42,
                category: 'painkillers',
                description: 'مضاد للالتهابات ومسكن للآلام',
                image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop&crop=center',
                available: true,
                rating: 4.6,
                reviews: 189
            },
            // الفيتامينات
            {
                id: '3',
                name: 'فيتامين سي 1000',
                nameEn: 'Vitamin C 1000',
                price: 85,
                category: 'vitamins',
                description: 'فيتامين سي عالي التركيز لتقوية جهاز المناعة',
                image: 'https://images.unsplash.com/photo-1550572017-edd951aa8702?w=500&h=500&fit=crop&crop=center',
                available: true,
                featured: true,
                rating: 4.9,
                reviews: 456
            },
            {
                id: '4',
                name: 'فيتامين د 5000',
                nameEn: 'Vitamin D 5000',
                price: 95,
                originalPrice: 120,
                category: 'vitamins',
                description: 'فيتامين د لتقوية العظام والأسنان',
                image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500&h=500&fit=crop&crop=center',
                available: true,
                bestseller: true,
                discount: 21,
                rating: 4.7,
                reviews: 298
            },
            // المكملات الغذائية
            {
                id: '5',
                name: 'أوميجا 3',
                nameEn: 'Omega 3',
                price: 120,
                category: 'supplements',
                description: 'أحماض أوميجا 3 الدهنية لصحة القلب والدماغ',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&crop=center',
                available: true,
                featured: true,
                rating: 4.8,
                reviews: 367
            },
            {
                id: '6',
                name: 'بروتين مصل اللبن',
                nameEn: 'Whey Protein',
                price: 480,
                originalPrice: 550,
                category: 'supplements',
                description: 'بروتين عالي الجودة لبناء العضلات',
                image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=500&fit=crop&crop=center',
                available: true,
                discount: 13,
                rating: 4.5,
                reviews: 143
            },
            // أدوية البرد
            {
                id: '7',
                name: 'كومتريكس',
                nameEn: 'Comtrex',
                price: 35,
                category: 'cold',
                description: 'علاج شامل لأعراض البرد والإنفلونزا',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&crop=center',
                available: true,
                rating: 4.4,
                reviews: 176
            },
            {
                id: '8',
                name: 'فيكس',
                nameEn: 'Vicks',
                price: 28,
                category: 'cold',
                description: 'مرهم للتدليك لعلاج احتقان الصدر',
                image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&h=500&fit=crop&crop=center',
                available: true,
                bestseller: true,
                rating: 4.6,
                reviews: 203
            },
            // منتجات الأطفال
            {
                id: '9',
                name: 'شراب الأطفال للسعال',
                nameEn: 'Kids Cough Syrup',
                price: 45,
                category: 'baby',
                description: 'شراب آمن للأطفال لعلاج السعال',
                image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop&crop=center',
                available: true,
                rating: 4.7,
                reviews: 134
            },
            {
                id: '10',
                name: 'فيتامينات الأطفال',
                nameEn: 'Kids Vitamins',
                price: 65,
                category: 'baby',
                description: 'فيتامينات متعددة للأطفال بطعم الفواكه',
                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop&crop=center',
                available: true,
                featured: true,
                rating: 4.8,
                reviews: 287
            },
            // العناية بالبشرة
            {
                id: '11',
                name: 'كريم مرطب للوجه',
                nameEn: 'Face Moisturizer',
                price: 85,
                category: 'skincare',
                description: 'كريم مرطب للبشرة الحساسة',
                image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=500&fit=crop&crop=center',
                available: true,
                rating: 4.5,
                reviews: 198
            },
            {
                id: '12',
                name: 'واقي الشمس SPF 50',
                nameEn: 'Sunscreen SPF 50',
                price: 95,
                originalPrice: 110,
                category: 'skincare',
                description: 'واقي شمس عالي الحماية للبشرة',
                image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop&crop=center',
                available: true,
                discount: 14,
                rating: 4.6,
                reviews: 167
            },
            // أخرى
            {
                id: '13',
                name: 'جهاز قياس الضغط',
                nameEn: 'Blood Pressure Monitor',
                price: 350,
                category: 'other',
                description: 'جهاز رقمي لقياس ضغط الدم',
                image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop&crop=center',
                available: true,
                featured: true,
                rating: 4.7,
                reviews: 89
            },
            {
                id: '14',
                name: 'ميزان حرارة رقمي',
                nameEn: 'Digital Thermometer',
                price: 75,
                category: 'other',
                description: 'ميزان حرارة دقيق وسريع',
                image: 'https://images.unsplash.com/photo-1559081842-f8ca7a929d3f?w=500&h=500&fit=crop&crop=center',
                available: true,
                rating: 4.4,
                reviews: 156
            },
            // المزيد من المنتجات
            {
                id: '15',
                name: 'كالسيوم + ماغنيسيوم',
                nameEn: 'Calcium + Magnesium',
                price: 110,
                category: 'supplements',
                description: 'مكمل الكالسيوم والماغنيسيوم لصحة العظام',
                image: 'https://images.unsplash.com/photo-1550572017-edd951aa8702?w=500&h=500&fit=crop&crop=center',
                available: true,
                rating: 4.6,
                reviews: 234
            },
            {
                id: '16',
                name: 'زنك 50 مج',
                nameEn: 'Zinc 50mg',
                price: 65,
                category: 'vitamins',
                description: 'مكمل الزنك لتقوية المناعة',
                image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500&h=500&fit=crop&crop=center',
                available: true,
                bestseller: true,
                rating: 4.8,
                reviews: 189
            }
        ];
    }

    // Get filtered products
    getFilteredProducts() {
        return this.products.filter(product => {
            const matchesSearch = this.searchQuery === '' || 
                product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (product.nameEn && product.nameEn.toLowerCase().includes(this.searchQuery.toLowerCase()));
            
            const matchesCategory = this.selectedCategory === 'all' || product.category === this.selectedCategory;
            
            return matchesSearch && matchesCategory && product.available;
        });
    }

    // Cart methods
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        this.saveToStorage();
        this.updateCartUI();
        this.showToast(`تم إضافة ${product.name} إلى السلة`, 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateCartUI();
    }

    updateCartQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveToStorage();
            this.updateCartUI();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveToStorage();
        this.updateCartUI();
        this.showToast('تم إفراغ السلة', 'success');
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getCartCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Favorites methods
    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(productId);
        }
        this.saveToStorage();
    }

    isFavorite(productId) {
        return this.favorites.includes(productId);
    }

    // UI update methods
    updateCartUI() {
        const cartCount = this.getCartCount();
        const cartTotal = this.getCartTotal();
        
        // Update cart count badges
        const cartCountElements = document.querySelectorAll('#cartCount, #mobileCartCount');
        cartCountElements.forEach(el => {
            if (el) {
                el.textContent = cartCount;
                el.classList.toggle('show', cartCount > 0);
            }
        });
        
        // Update cart content
        this.renderCartItems();
        
        // Update cart totals
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotalElement = document.getElementById('cartTotal');
        
        if (cartSubtotal) cartSubtotal.textContent = `${cartTotal} جنيه`;
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
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            return;
        }

        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                    ${item.quantity > 1 ? `<div class="quantity-badge">${item.quantity}</div>` : ''}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="store.updateCartQuantity('${item.id}', ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="store.updateCartQuantity('${item.id}', ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-btn" onclick="store.removeFromCart('${item.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="cart-item-price">${item.price * item.quantity} جنيه</div>
                </div>
            </div>
        `).join('');
    }

    // Toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Toggle cart
    toggleCart() {
        this.isCartOpen = !this.isCartOpen;
        const cartOverlay = document.getElementById('cartOverlay');
        const shoppingCart = document.getElementById('shoppingCart');
        
        if (cartOverlay && shoppingCart) {
            if (this.isCartOpen) {
                cartOverlay.classList.add('show');
                shoppingCart.classList.add('show');
                document.body.style.overflow = 'hidden';
            } else {
                cartOverlay.classList.remove('show');
                shoppingCart.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuToggle');
        
        if (mobileMenu && mobileMenuBtn) {
            if (this.isMobileMenuOpen) {
                mobileMenu.classList.add('show');
                mobileMenuBtn.classList.add('active');
            } else {
                mobileMenu.classList.remove('show');
                mobileMenuBtn.classList.remove('active');
            }
        }
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
        applyLanguageSettings();
        renderCategories();
        renderProducts();
    }
}

// Initialize store
const store = new PharmacyStore();

// ===== DOM MANIPULATION FUNCTIONS =====

// Render categories
function renderCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = store.categories.map(category => `
        <button class="category-card ${category.id === store.selectedCategory ? 'active' : ''}" 
                onclick="selectCategory('${category.id}')">
            <div class="category-icon">
                <i class="${category.icon}"></i>
            </div>
            <span>${category.name}</span>
        </button>
    `).join('');
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const products = store.getFilteredProducts();
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray-500);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>لا توجد منتجات</h3>
                <p>جرب البحث بكلمات أخرى أو اختر فئة مختلفة</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map((product, index) => {
        const displayName = (store.language === 'en' && product.nameEn) ? product.nameEn : product.name;
        return `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div class="product-image">
                <img src="${product.image}" alt="${displayName}" 
                     onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';">
                
                <!-- Product Badges -->
                <div class="product-badges">
                    ${product.bestseller ? '<span class="badge badge-bestseller">' + (store.language === 'en' ? 'Bestseller' : 'الأكثر مبيعاً') + '</span>' : ''}
                    ${product.featured ? '<span class="badge badge-featured">' + (store.language === 'en' ? 'Featured' : 'مميز') + '</span>' : ''}
                    ${product.discount ? `<span class="badge badge-discount">${store.language === 'en' ? 'Discount' : 'خصم'} ${product.discount}%</span>` : ''}
                </div>
                
                <!-- Favorite Button -->
                <button class="favorite-btn ${store.isFavorite(product.id) ? 'active' : ''}" 
                        onclick="toggleFavorite('${product.id}')" title="${store.language === 'en' ? 'Add to favorites' : 'إضافة للمفضلة'}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${displayName}</h3>
                <p class="product-description">${product.description}</p>
                
                ${product.rating ? `
                    <div class="product-rating">
                        <div class="stars">
                            ${generateStars(product.rating)}
                        </div>
                        <span class="rating-text">(${product.reviews || 0})</span>
                    </div>
                ` : ''}
                
                <div class="product-price">
                    <span class="current-price">${product.price} ${store.language === 'en' ? 'EGP' : 'جنيه'}</span>
                    ${product.originalPrice ? `
                        <span class="original-price">${product.originalPrice} ${store.language === 'en' ? 'EGP' : 'جنيه'}</span>
                        <span class="discount-percentage">-${product.discount}%</span>
                    ` : ''}
                </div>
                
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="store.addToCart(${JSON.stringify(product).replace(/\"/g, '&quot;')})">
                        <i class="fas fa-plus"></i>
                        ${store.language === 'en' ? 'Add to cart' : 'إضافة للسلة'}
                    </button>
                    <button class="whatsapp-order-btn" onclick="openWhatsAppOrder('${product.id}')" title="${store.language === 'en' ? 'Order on WhatsApp' : 'طلب عبر الواتساب'}">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Helper functions
function getCategoryName(categoryId) {
    if (store.language === 'en') {
        const map = {
            all: 'All Products',
            painkillers: 'Painkillers',
            vitamins: 'Vitamins',
            supplements: 'Supplements',
            cold: 'Cold Medicines',
            baby: 'Baby Products',
            skincare: 'Skincare',
            other: 'Other'
        };
        return map[categoryId] || 'Other';
    }
    const category = store.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'أخرى';
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt star"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star star empty"></i>';
    }
    
    return stars;
}

// Event handlers
function selectCategory(categoryId) {
    store.selectedCategory = categoryId;
    renderCategories();
    renderProducts();
}

function toggleFavorite(productId) {
    store.toggleFavorite(productId);
    renderProducts(); // Re-render to update favorite button state
}

// WhatsApp Order Modal Management
let currentOrderProduct = null;
let userLocation = null;

function openWhatsAppOrder(productId) {
    const product = store.products.find(p => p.id === productId);
    if (!product) return;
    
    currentOrderProduct = product;
    
    // Populate product info
    document.getElementById('orderProductImage').src = product.image;
    document.getElementById('orderProductName').textContent = product.name;
    document.getElementById('orderProductCategory').textContent = getCategoryName(product.category);
    document.getElementById('orderProductPrice').textContent = `${product.price} جنيه`;
    
    if (product.originalPrice) {
        document.getElementById('orderProductOriginalPrice').textContent = `${product.originalPrice} جنيه`;
        document.getElementById('orderProductOriginalPrice').style.display = 'inline';
    } else {
        document.getElementById('orderProductOriginalPrice').style.display = 'none';
    }
    
    // Update order summary
    updateOrderSummary();
    
    // Show modal
    const overlay = document.getElementById('whatsappOrderOverlay');
    const modal = document.getElementById('whatsappOrderModal');
    
    overlay.classList.add('show');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeWhatsAppOrder() {
    const overlay = document.getElementById('whatsappOrderOverlay');
    const modal = document.getElementById('whatsappOrderModal');
    
    overlay.classList.remove('show');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Reset form
    document.getElementById('whatsappOrderForm').reset();
    document.getElementById('productQuantity').value = 1;
    updateOrderSummary();
    
    // Clear location status
    const locationStatus = document.getElementById('locationStatus');
    locationStatus.className = 'location-status';
    locationStatus.textContent = '';
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('productQuantity');
    let currentQuantity = parseInt(quantityInput.value) || 1;
    let newQuantity = currentQuantity + change;
    
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;
    
    quantityInput.value = newQuantity;
    updateOrderSummary();
}

function updateOrderSummary() {
    if (!currentOrderProduct) return;
    
    const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
    const unitPrice = currentOrderProduct.price;
    const totalPrice = unitPrice * quantity;
    
    document.getElementById('unitPrice').textContent = `${unitPrice} جنيه`;
    document.getElementById('summaryQuantity').textContent = quantity;
    document.getElementById('totalPrice').textContent = `${totalPrice} جنيه`;
}

function getCurrentLocation() {
    const locationStatus = document.getElementById('locationStatus');
    const locationBtn = document.getElementById('getLocationBtn');
    
    if (!navigator.geolocation) {
        locationStatus.className = 'location-status error';
        locationStatus.textContent = 'المتصفح لا يدعم تحديد الموقع';
        return;
    }
    
    locationStatus.className = 'location-status loading';
    locationStatus.textContent = 'جاري تحديد الموقع...';
    locationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            userLocation = { lat, lng };
            
            locationStatus.className = 'location-status success';
            locationStatus.innerHTML = `
                <i class="fas fa-check-circle"></i>
                تم تحديد الموقع بنجاح
                <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" style="color: inherit; text-decoration: underline;">
                    عرض على الخريطة
                </a>
            `;
            locationBtn.disabled = false;
            
            // Auto-fill address with coordinates
            const addressField = document.getElementById('customerAddress');
            if (!addressField.value.trim()) {
                addressField.value = `الموقع: https://maps.google.com/?q=${lat},${lng}`;
            }
        },
        (error) => {
            let errorMessage = 'فشل في تحديد الموقع';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'تم رفض الإذن لتحديد الموقع';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'الموقع غير متاح';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'انتهت مهلة تحديد الموقع';
                    break;
            }
            
            locationStatus.className = 'location-status error';
            locationStatus.textContent = errorMessage;
            locationBtn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

async function submitWhatsAppOrder(event) {
    event.preventDefault();
    
    if (!currentOrderProduct) return;
    
    const formData = new FormData(event.target);
    const customerName = (formData.get('customerName') || '').trim();
    const customerPhone = (formData.get('customerPhone') || '').trim();
    const quantity = parseInt(formData.get('productQuantity')) || 1;
    const address = (formData.get('customerAddress') || '').trim();
    
    // Validation
    if (!customerName || !customerPhone || !address) {
        store.showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (!/^[0-9]{11}$/.test(customerPhone)) {
        store.showToast('يرجى إدخال رقم هاتف صحيح (11 رقم)', 'error');
        return;
    }
    
    // Calculate totals
    const unitPrice = currentOrderProduct.price;
    const totalPrice = unitPrice * quantity;
    
    // Create WhatsApp message
    let message = `🏥 *طلب جديد من صيدلية هشام*\n\n`;
    message += `👤 *العميل:* ${customerName}\n`;
    message += `📱 *الهاتف:* ${customerPhone}\n\n`;
    message += `💊 *المنتج:* ${currentOrderProduct.name}\n`;
    message += `🏷️ *الفئة:* ${getCategoryName(currentOrderProduct.category)}\n`;
    message += `💰 *سعر الوحدة:* ${unitPrice} جنيه\n`;
    message += `🔢 *الكمية:* ${quantity}\n`;
    message += `💵 *المجموع:* ${totalPrice} جنيه\n\n`;
    message += `📍 *العنوان:*\n${address}\n\n`;
    
    if (userLocation) {
        message += `🗺️ *الموقع على الخريطة:*\nhttps://maps.google.com/?q=${userLocation.lat},${userLocation.lng}\n\n`;
    }
    
    message += `🚚 *ملاحظة:* التوصيل مجاني لجميع الطلبات!\n`;
    message += `⏰ *وقت الطلب:* ${new Date().toLocaleString('ar-EG')}`;
    
    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/201006273308?text=${encodedMessage}`;
    
    // Prepare order data (to Firestore)
    const orderData = {
        customerName,
        customerPhone,
        productId: currentOrderProduct.id,
        productName: currentOrderProduct.name,
        productCategory: getCategoryName(currentOrderProduct.category),
        quantity,
        unitPrice,
        totalPrice,
        address,
        location: userLocation ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}` : null,
        whatsappMessage: message,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    let saved = false;
    if (typeof db !== 'undefined') {
        try {
            await db.collection('orders').add(orderData);
            saved = true;
            console.log('✅ Order saved to Firestore');
        } catch (e) {
            console.error('Order Firestore error:', e);
            store.showToast('تعذر حفظ الطلب في لوحة التحكم', 'error');
        }
    }

    if (saved) {
        // Close modal and show success message
        closeWhatsAppOrder();
        store.showToast('تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً', 'success');
    }

    // Open WhatsApp (optional channel)
    window.open(whatsappUrl, '_blank');
}

function scrollToProducts() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

// Search functionality
function handleSearch(query) {
    store.searchQuery = query.trim();
    renderProducts();
}

// Sort functionality
function sortProducts(sortBy) {
    const products = store.getFilteredProducts();
    
    switch (sortBy) {
        case 'name':
            products.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
            break;
        case 'price-low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
    }
    
    // Update the products array with sorted order
    store.products = [...store.products.filter(p => !products.includes(p)), ...products];
    renderProducts();
}

// Translations (minimal UI)
const translations = {
    ar: {
        searchPlaceholder: 'ابحث عن دواء أو منتج...',
        mobileSearchPlaceholder: 'ابحث عن دواء أو منتج...',
        shopNow: 'تسوق الآن',
        categoriesTitle: 'تصفح حسب الفئة',
        categoriesSubtitle: 'اختر الفئة المناسبة لاحتياجاتك الطبية',
        productsTitle: 'منتجاتنا',
        productsSubtitle: 'أفضل الأدوية والمنتجات الطبية'
    },
    en: {
        searchPlaceholder: 'Search for a medicine or product...',
        mobileSearchPlaceholder: 'Search for a medicine or product...',
        shopNow: 'Shop Now',
        categoriesTitle: 'Browse by category',
        categoriesSubtitle: 'Choose the category that suits your needs',
        productsTitle: 'Our Products',
        productsSubtitle: 'Top medicines and health products'
    }
};

function applyLanguageSettings() {
    // Set lang and dir
    document.documentElement.lang = store.language;
    document.documentElement.dir = store.language === 'en' ? 'ltr' : 'rtl';

    // Toggle button label
    const langToggleText = document.getElementById('langToggleText');
    if (langToggleText) langToggleText.textContent = store.language === 'en' ? 'AR' : 'EN';

    const t = translations[store.language];
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    if (mobileSearchInput) mobileSearchInput.placeholder = t.mobileSearchPlaceholder;

    // Hero CTA
    const shopBtn = document.querySelector('.hero-buttons .btn-primary');
    if (shopBtn) shopBtn.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = ` ${t.shopNow} `;
    });

    // Categories header
    const catTitle = document.querySelector('.categories-section .section-title');
    const catSubtitle = document.querySelector('.categories-section .section-subtitle');
    if (catTitle) catTitle.textContent = t.categoriesTitle;
    if (catSubtitle) catSubtitle.textContent = t.categoriesSubtitle;

    // Products header
    const prodTitle = document.querySelector('.products-title-section .section-title');
    const prodSubtitle = document.querySelector('.products-title-section .section-subtitle');
    if (prodTitle) prodTitle.textContent = t.productsTitle;
    if (prodSubtitle) prodSubtitle.textContent = t.productsSubtitle;
}

// ===== INITIALIZATION =====

// Loading screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    
    if (!loadingScreen || !loadingProgress) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            loadingProgress.style.width = '100%';
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
            
            clearInterval(interval);
        } else {
            loadingProgress.style.width = progress + '%';
        }
    }, 200);
}

// Header scroll effect
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
}

// Initialize all event listeners
function initEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => store.toggleMobileMenu());
    }

    // Cart toggles
    const cartToggle = document.getElementById('cartToggle');
    const mobileCartToggle = document.getElementById('mobileCartToggle');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartToggle) cartToggle.addEventListener('click', () => store.toggleCart());
    if (mobileCartToggle) mobileCartToggle.addEventListener('click', () => store.toggleCart());
    if (cartClose) cartClose.addEventListener('click', () => store.toggleCart());
    if (cartOverlay) cartOverlay.addEventListener('click', () => store.toggleCart());

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => store.toggleDarkMode());
    }

    // Language toggle
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => store.toggleLanguage());
    }

    // Search inputs
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => sortProducts(e.target.value));
    }

    // Clear cart button
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من إفراغ السلة؟')) {
                store.clearCart();
            }
        });
    }

    // WhatsApp Order Modal
    const whatsappOrderOverlay = document.getElementById('whatsappOrderOverlay');
    const closeWhatsappModal = document.getElementById('closeWhatsappModal');
    const whatsappOrderForm = document.getElementById('whatsappOrderForm');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const productQuantityInput = document.getElementById('productQuantity');
    
    if (whatsappOrderOverlay) {
        whatsappOrderOverlay.addEventListener('click', closeWhatsAppOrder);
    }
    
    if (closeWhatsappModal) {
        closeWhatsappModal.addEventListener('click', closeWhatsAppOrder);
    }
    
    if (whatsappOrderForm) {
        whatsappOrderForm.addEventListener('submit', submitWhatsAppOrder);
    }
    
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    if (productQuantityInput) {
        productQuantityInput.addEventListener('input', updateOrderSummary);
    }

    // Floating chat button
    const floatingChatBtn = document.getElementById('floatingChatBtn');
    if (floatingChatBtn) {
        floatingChatBtn.addEventListener('click', () => {
            window.open('https://wa.me/201006273308', '_blank');
        });
    }

    // Scroll to top functionality
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuToggle');
        
        if (store.isMobileMenuOpen && mobileMenu && mobileMenuBtn) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                store.toggleMobileMenu();
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key closes modals, cart and mobile menu
        if (e.key === 'Escape') {
            const whatsappModal = document.getElementById('whatsappOrderModal');
            if (whatsappModal && whatsappModal.classList.contains('show')) {
                closeWhatsAppOrder();
            } else if (store.isCartOpen) {
                store.toggleCart();
            } else if (store.isMobileMenuOpen) {
                store.toggleMobileMenu();
            }
        }
        
        // Ctrl/Cmd + K focuses search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput') || document.getElementById('mobileSearchInput');
            if (searchInput) searchInput.focus();
        }
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading screen
    initLoadingScreen();
    
    // Initialize header scroll effect
    initHeaderScroll();
    
    // Initialize event listeners
    initEventListeners();
    
    // Apply dark mode if saved
    if (store.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
    }

    // Apply language settings
    applyLanguageSettings();
    
    // Render initial content
    renderCategories();
    renderProducts();
    store.updateCartUI();
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    console.log('🏥 Pharmacy App Initialized Successfully!');
});

// Export store for global access
window.store = store;
window.scrollToProducts = scrollToProducts;// =
==== MARKETING POSTER FUNCTIONALITY =====

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

// Load poster on page load and periodically check for updates
document.addEventListener('DOMContentLoaded', () => {
    loadMarketingPoster();
    
    // Check for poster updates every 30 seconds
    setInterval(loadMarketingPoster, 30000);
});