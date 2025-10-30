// ===== ADMIN PANEL MANAGEMENT =====

// Admin Store Class
class AdminStore {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.products = [];
        this.orders = [];
        this.credentials = {
            username: 'admin',
            password: 'hisham123'
        };
        
        this.loadData();
        this.initializeDefaultProducts();
    }

    // Load data from Firestore
    async loadData() {
        if (typeof db === 'undefined') {
            console.warn('Firestore not initialized');
            return;
        }
        
        try {
            // Load products
            const productsSnapshot = await db.collection('products').get();
            this.products = [];
            productsSnapshot.forEach(doc => {
                this.products.push({ id: doc.id, ...doc.data() });
            });
            
            // Load credentials from localStorage (for security)
            const storedCredentials = localStorage.getItem('admin-credentials');
            if (storedCredentials) {
                this.credentials = JSON.parse(storedCredentials);
            }
            
            console.log('✅ Data loaded from Firestore');
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Initialize default products if none exist in Firestore
    async initializeDefaultProducts() {
        // Disabled seeding: admin fully controls products; no automatic defaults.
        return;
    }

    // Authentication
    login(username, password) {
        if (username === this.credentials.username && password === this.credentials.password) {
            this.isLoggedIn = true;
            this.currentUser = username;
            return true;
        }
        return false;
    }

    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
    }

    changePassword(currentPassword, newPassword) {
        if (currentPassword === this.credentials.password) {
            this.credentials.password = newPassword;
            this.saveData();
            return true;
        }
        return false;
    }

    // Product Management with Firestore
    async addProduct(productData) {
        try {
            const newProduct = {
                ...productData,
                createdAt: new Date().toISOString(),
                rating: 0,
                reviews: 0
            };
            
            const docRef = await db.collection('products').add(newProduct);
            console.log('✅ Product added with ID:', docRef.id);
            return { id: docRef.id, ...newProduct };
        } catch (error) {
            console.error('Error adding product:', error);
            return null;
        }
    }

    async updateProduct(id, productData) {
        try {
            const updatedData = {
                ...productData,
                updatedAt: new Date().toISOString()
            };
            
            await db.collection('products').doc(id).update(updatedData);
            console.log('✅ Product updated:', id);
            return { id, ...updatedData };
        } catch (error) {
            console.error('Error updating product:', error);
            return null;
        }
    }

    async deleteProduct(id) {
        try {
            await db.collection('products').doc(id).delete();
            console.log('✅ Product deleted:', id);
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }

    getProduct(id) {
        return this.products.find(p => p.id === id);
    }

    // Order Management
    addOrder(orderData) {
        const newOrder = {
            id: Date.now().toString(),
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.orders.push(newOrder);
        this.saveData();
        return newOrder;
    }

    async updateOrderStatus(id, status) {
        try {
            await db.collection('orders').doc(id).update({ status, updatedAt: new Date().toISOString() });
            return true;
        } catch (e) {
            console.error('Error updating order status:', e);
            return false;
        }
    }

    async deleteOrder(id) {
        try {
            await db.collection('orders').doc(id).delete();
            return true;
        } catch (e) {
            console.error('Error deleting order:', e);
            return false;
        }
    }

    // Statistics
    getStatistics() {
        return {
            totalProducts: this.products.length,
            availableProducts: this.products.filter(p => p.available).length,
            totalOrders: this.orders.length,
            pendingOrders: this.orders.filter(o => o.status === 'pending').length,
            deliveredOrders: this.orders.filter(o => o.status === 'delivered').length,
            totalRevenue: this.orders
                .filter(o => o.status === 'delivered')
                .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
        };
    }

    // Toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('adminToast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize admin store
const adminStore = new AdminStore();

// ===== UI MANAGEMENT =====

// Login Management
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (adminStore.login(username, password)) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'grid';
        
        // Start realtime listeners
        await loadProductsFromFirestore();
        listenOrdersFromFirestore();
        updateStatistics();
    } else {
        adminStore.showToast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
}

function handleLogout() {
    adminStore.logout();
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    
    // Clear forms
    document.getElementById('loginForm').reset();
    adminStore.showToast('تم تسجيل الخروج بنجاح', 'success');
}

// Section Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + 'Section').classList.add('active');
    
    // Add active class to selected menu item
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Load section data
    switch(sectionName) {
        case 'products':
            renderProducts();
            break;
        case 'orders':
            renderOrders();
            break;
        case 'statistics':
            updateStatistics();
            break;
    }
}

// Load products from Firestore
async function loadProductsFromFirestore() {
    if (typeof db === 'undefined') return;

    // Real-time listener
    db.collection('products').onSnapshot((snapshot) => {
        adminStore.products = [];
        snapshot.forEach(doc => {
            adminStore.products.push({ id: doc.id, ...doc.data() });
        });
        renderProducts();
        updateStatistics();
    }, (error) => {
        console.error('Error listening products:', error);
        adminStore.products = [];
        renderProducts();
        updateStatistics();
    });
}

// Product Management
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (adminStore.products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <div>لا توجد منتجات</div>
                    <div style="font-size: 0.875rem;">اضغط "إضافة منتج جديد" لإضافة أول منتج</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = adminStore.products.map(product => `
        <tr>
            <td>
                <img src="${product.image}" alt="${product.name}" 
                     class="product-image-cell" 
                     onerror="this.src='https://via.placeholder.com/60x60?text=صورة'">
            </td>
            <td>
                <div style="font-weight: 600;">${product.name}</div>
                ${product.nameEn ? `<div style="font-size: 0.75rem; color: var(--gray-500);">${product.nameEn}</div>` : ''}
            </td>
            <td>${getCategoryDisplayName(product.category)}</td>
            <td>
                <div style="font-weight: 600; color: var(--purple-600);">${product.price} جنيه</div>
                ${product.originalPrice ? `<div style="font-size: 0.75rem; color: var(--gray-500); text-decoration: line-through;">${product.originalPrice} جنيه</div>` : ''}
            </td>
            <td>
                <span class="status-badge ${product.available ? 'status-available' : 'status-unavailable'}">
                    ${product.available ? 'متاح' : 'غير متاح'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editProduct('${product.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteProduct('${product.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getCategoryDisplayName(category) {
    const categoryMap = {
        'painkillers': 'المسكنات',
        'vitamins': 'الفيتامينات',
        'supplements': 'المكملات الغذائية',
        'cold': 'أدوية البرد',
        'baby': 'منتجات الأطفال',
        'skincare': 'العناية بالبشرة',
        'other': 'أخرى'
    };
    return categoryMap[category] || category;
}

function getCategoryKey(displayName) {
    const categoryMap = {
        'المسكنات': 'painkillers',
        'الفيتامينات': 'vitamins',
        'المكملات الغذائية': 'supplements',
        'أدوية البرد': 'cold',
        'منتجات الأطفال': 'baby',
        'العناية بالبشرة': 'skincare',
        'أخرى': 'other'
    };
    return categoryMap[displayName] || displayName;
}

function showProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        const product = adminStore.getProduct(productId);
        if (product) {
            modalTitle.textContent = 'تعديل المنتج';
            document.getElementById('editProductId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category; // استخدام المفتاح مباشرة
            document.getElementById('productStatus').value = product.available.toString();
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productDescription').value = product.description || '';
        }
    } else {
        modalTitle.textContent = 'إضافة منتج جديد';
        form.reset();
        document.getElementById('editProductId').value = '';
    }
    
    modal.classList.add('show');
    document.getElementById('modalOverlay').classList.add('show');
}

function hideProductModal() {
    document.getElementById('productModal').classList.remove('show');
    document.getElementById('modalOverlay').classList.remove('show');
    document.getElementById('productForm').reset();
}

async function handleProductSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('productName') || document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        available: document.getElementById('productStatus').value === 'true',
        image: document.getElementById('productImage').value || 'https://via.placeholder.com/500x500?text=منتج',
        description: document.getElementById('productDescription').value || ''
    };
    
    const editId = document.getElementById('editProductId').value;
    
    if (editId) {
        // Update existing product
        const updated = await adminStore.updateProduct(editId, productData);
        if (updated) {
            adminStore.showToast('تم تحديث المنتج بنجاح', 'success');
            await loadProductsFromFirestore();
            hideProductModal();
        } else {
            adminStore.showToast('فشل في تحديث المنتج', 'error');
        }
    } else {
        // Add new product
        const newProduct = await adminStore.addProduct(productData);
        if (newProduct) {
            adminStore.showToast('تم إضافة المنتج بنجاح', 'success');
            await loadProductsFromFirestore();
            hideProductModal();
        } else {
            adminStore.showToast('فشل في إضافة المنتج', 'error');
        }
    }
    
    updateStatistics();
}

function editProduct(id) {
    showProductModal(id);
}

async function deleteProduct(id) {
    const product = adminStore.getProduct(id);
    if (!product) return;
    
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
        const deleted = await adminStore.deleteProduct(id);
        if (deleted) {
            adminStore.showToast('تم حذف المنتج بنجاح', 'success');
            await loadProductsFromFirestore();
            updateStatistics();
        } else {
            adminStore.showToast('فشل في حذف المنتج', 'error');
        }
    }
}

// Order Management
// Real-time orders listener
function listenOrdersFromFirestore() {
    if (typeof db === 'undefined') return;
    db.collection('orders').onSnapshot((snapshot) => {
        adminStore.orders = [];
        snapshot.forEach(doc => {
            adminStore.orders.push({ id: doc.id, ...doc.data() });
        });
        renderOrders();
        updateStatistics();
    }, (error) => {
        console.error('Error listening orders:', error);
    });
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    const filterValue = document.getElementById('orderStatusFilter')?.value || 'all';
    let filteredOrders = adminStore.orders;
    
    if (filterValue !== 'all') {
        filteredOrders = adminStore.orders.filter(order => order.status === filterValue);
    }
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-500);">
                <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <div>لا توجد طلبات</div>
                <div style="font-size: 0.875rem;">الطلبات ستظهر هنا عندما يطلب العملاء منتجات</div>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = filteredOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">طلب #${order.id}</div>
                    <div class="order-actions">
                        <span class="order-status ${order.status}">${getStatusDisplayName(order.status)}</span>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" style="margin-right: 1rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                        </select>
                        <button class="delete-btn" onclick="deleteOrder('${order.id}')" title="حذف الطلب" style="margin-right: 0.5rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="order-info">
                        <div><strong>العميل:</strong> ${order.customerName}</div>
                        <div><strong>الهاتف:</strong> ${order.customerPhone}</div>
                        <div><strong>المنتج:</strong> ${order.productName}</div>
                        <div><strong>الكمية:</strong> ${order.quantity}</div>
                        <div><strong>السعر الإجمالي:</strong> ${order.totalPrice} جنيه</div>
                        <div><strong>العنوان:</strong> ${order.address}</div>
                        ${order.location ? `<div><strong>الموقع:</strong> <a href="${order.location}" target="_blank">عرض على الخريطة</a></div>` : ''}
                        <div><strong>تاريخ الطلب:</strong> ${new Date(order.createdAt).toLocaleString('ar-EG')}</div>
                    </div>
                </div>
            </div>
        `).join('');
}

function getStatusDisplayName(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'delivered': 'تم التسليم'
    };
    return statusMap[status] || status;
}

function updateOrderStatus(orderId, newStatus) {
    adminStore.updateOrderStatus(orderId, newStatus)
        .then((ok) => {
            if (ok) {
                adminStore.showToast(`تم تحديث حالة الطلب إلى "${getStatusDisplayName(newStatus)}"`, 'success');
            } else {
                adminStore.showToast('فشل في تحديث حالة الطلب', 'error');
            }
        });
}

function deleteOrder(orderId) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        adminStore.deleteOrder(orderId)
            .then((ok) => {
                adminStore.showToast(ok ? 'تم حذف الطلب بنجاح' : 'فشل في حذف الطلب', ok ? 'success' : 'error');
            });
    }
}

// Statistics
function updateStatistics() {
    const stats = adminStore.getStatistics();
    
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('deliveredOrders').textContent = stats.deliveredOrders;
    document.getElementById('pendingOrders').textContent = stats.pendingOrders;
}

// Password Change
function showPasswordModal() {
    document.getElementById('changePasswordModal').classList.add('show');
    document.getElementById('modalOverlay').classList.add('show');
}

function hidePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('show');
    document.getElementById('modalOverlay').classList.remove('show');
    document.getElementById('changePasswordForm').reset();
}

function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        adminStore.showToast('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
        return;
    }
    
    if (adminStore.changePassword(currentPassword, newPassword)) {
        adminStore.showToast('تم تغيير كلمة المرور بنجاح', 'success');
        hidePasswordModal();
    } else {
        adminStore.showToast('كلمة المرور الحالية غير صحيحة', 'error');
    }
}

// Listen for orders from client
function listenForOrders() {
    // Check for new orders periodically
    setInterval(() => {
        const clientOrders = localStorage.getItem('client-orders');
        if (clientOrders) {
            const orders = JSON.parse(clientOrders);
            orders.forEach(order => {
                // Check if order already exists
                if (!adminStore.orders.find(o => o.clientOrderId === order.id)) {
                    adminStore.addOrder({
                        ...order,
                        clientOrderId: order.id
                    });
                }
            });
            
            // Clear client orders after processing
            localStorage.removeItem('client-orders');
            renderOrders();
            updateStatistics();
        }
    }, 2000);
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Product modal
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => showProductModal());
    }
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', hideProductModal);
    }
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideProductModal);
    }
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Password modal
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', showPasswordModal);
    }
    
    const closePasswordModal = document.getElementById('closePasswordModal');
    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', hidePasswordModal);
    }
    
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', hidePasswordModal);
    }
    
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Modal overlay
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            hideProductModal();
            hidePasswordModal();
        });
    }
    
    // Order filter
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', renderOrders);
    }
    
    // Dark mode toggle
    const adminDarkToggle = document.getElementById('adminDarkToggle');
    if (adminDarkToggle) {
        adminDarkToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-mode');
            const isDark = document.documentElement.classList.contains('dark-mode');
            localStorage.setItem('admin-dark-mode', isDark);
        });
        
        // Load saved dark mode preference
        const savedDarkMode = localStorage.getItem('admin-dark-mode');
        if (savedDarkMode === 'true') {
            document.documentElement.classList.add('dark-mode');
        }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideProductModal();
            hidePasswordModal();
        }
    });
    
    // Start listening to Firestore for realtime data
    listenOrdersFromFirestore();

    // Default to orders section for quick verification
    showSection('orders');
    
    console.log('🔧 Admin Panel Initialized Successfully!');
});

// Global functions for onclick handlers
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;