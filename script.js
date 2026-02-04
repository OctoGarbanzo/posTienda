
// DOM Elements
const productGrid = document.getElementById('product-grid');
const categoryTabsContainer = document.getElementById('category-tabs');
const featuredSection = document.getElementById('featured-section');
const featuredGrid = document.getElementById('featured-grid');
const searchInput = document.getElementById('search-input');
const menuTitle = document.getElementById('menu-title');

// Cart Elements
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');

// Modal Elements
const productModal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalDesc = document.getElementById('modal-desc');
const modalAddBtn = document.getElementById('modal-add-btn');
const carouselContainer = document.getElementById('carousel-container');
const qtyInput = document.getElementById('qty-input');
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');


// State
let products = [];
let cart = [];
let currentCategory = 'all';
let currentSearch = '';

try {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch (e) {
    console.error('Error parsing cart:', e);
    cart = [];
}

let whatsappNumber = '';
let storeName = 'Tiento Soda & Café';

// Initialize
async function init() {
    try {
        const response = await fetch('products.json?v=' + Date.now());
        if (!response.ok) throw new Error('Failed to load data');

        const data = await response.json();
        products = data.products;
        whatsappNumber = data.settings?.whatsapp || '';
        storeName = data.settings?.storeName || 'Tiento Soda & Café';

        renderTabs(); // Generate category tabs
        renderApp();  // Render lists based on state
        updateCartUI();

        // Event Listeners
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            renderApp();
        });

    } catch (error) {
        console.error('Init error:', error);
        productGrid.innerHTML = `<p style="padding:1rem; color:red">Error cargando productos.</p>`;
    }
}

// Logic: Decide what to show
function renderApp() {
    // 1. Filter Products
    let filtered = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(currentSearch) ||
            (p.description && p.description.toLowerCase().includes(currentSearch));
        const matchesCat = currentCategory === 'all' || p.category === currentCategory;

        return matchesSearch && matchesCat;
    });

    // 2. Featured Section Handling
    // Only show Featured section if: No search active AND Category is 'all'
    const showFeatured = !currentSearch && currentCategory === 'all';

    if (showFeatured) {
        const featuredProducts = products.filter(p => p.isFeatured);
        if (featuredProducts.length > 0) {
            featuredSection.classList.remove('hidden-init');
            renderFeatured(featuredProducts);
        } else {
            featuredSection.classList.add('hidden-init');
        }
        menuTitle.textContent = "Menú Completo";
    } else {
        featuredSection.classList.add('hidden-init');
        menuTitle.textContent = currentSearch ? `Resultados: "${currentSearch}"` : currentCategory;
    }

    // 3. Render Main Grid
    renderProductList(filtered);
}

// Render Category Tabs
function renderTabs() {
    const categories = ['all', ...new Set(products.map(p => p.category))];

    categoryTabsContainer.innerHTML = categories.map(cat => {
        const label = cat === 'all' ? 'Todos' : cat;
        return `<button class="tab-btn ${cat === 'all' ? 'active' : ''}" 
                        onclick="setCategory('${cat}')">${label}</button>`;
    }).join('');
}

window.setCategory = (cat) => {
    currentCategory = cat;

    // Update UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active',
            (cat === 'all' && btn.textContent === 'Todos') ||
            btn.textContent === cat
        );
    });

    renderApp();
};

// Render Featured Carousel (Cards)
function renderFeatured(items) {
    featuredGrid.innerHTML = items.map(p => {
        const imgUrl = (p.media && p.media.length > 0 && p.media[0].url)
            ? p.media[0].url
            : 'https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=Tiento';

        return `
            <div class="featured-card" onclick="openProductModal('${p.id}')">
                <img src="${imgUrl}" class="featured-img" alt="${p.title}" loading="lazy">
                <div class="featured-info">
                    <h3 class="featured-title">${p.title}</h3>
                    <div class="featured-price">₡${p.price}</div>
                </div>
                <button class="featured-add-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Render Main List (Rows)
function renderProductList(items) {
    if (items.length === 0) {
        productGrid.innerHTML = `<div style="padding:1rem">No se encontraron productos.</div>`;
        return;
    }

    productGrid.innerHTML = items.map(p => {
        // Find Image
        const imgUrl = (p.media && p.media.length > 0 && p.media[0].url)
            ? p.media[0].url
            : null; // Don't show image placeholer in list if not needed, or small one

        const imgHtml = imgUrl
            ? `<img src="${imgUrl}" class="list-img" loading="lazy">`
            : `<div class="list-img" style="display:flex;align-items:center;justify-content:center;color:#ccc"><i class="fas fa-utensils"></i></div>`;

        return `
            <div class="list-card" onclick="openProductModal('${p.id}')">
                <div class="list-info">
                    <h3 class="list-title">${p.title}</h3>
                    <p class="list-desc">${p.description || ''}</p>
                    <div class="list-price">₡${p.price}</div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem">
                    ${imgHtml}
                    <button class="list-add-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">
                        <i class="fas fa-plus" style="font-size:0.7rem"></i> Agregar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// --- Modal Logic ---

window.openProductModal = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    modalTitle.textContent = product.title;
    modalPrice.textContent = `₡${product.price}`;
    modalDesc.textContent = product.description;

    qtyInput.value = 1;

    // Image Handling
    let mediaHtml = '';
    if (product.media && product.media.length > 0) {
        // Just show first image for now in this simple version
        // Ideally full carousel logic here
        mediaHtml = `<img src="${product.media[0].url}" class="modal-media-item">`;
    } else {
        mediaHtml = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eee;color:#999"><i class="fas fa-camera fa-3x"></i></div>`;
    }
    carouselContainer.innerHTML = mediaHtml;

    // Button Setup
    modalAddBtn.onclick = () => {
        addToCart(product.id, parseInt(qtyInput.value));
        productModal.classList.remove('visible');
    };

    productModal.classList.add('visible');
};

document.getElementById('close-modal').onclick = () => productModal.classList.remove('visible');
productModal.onclick = (e) => { if (e.target === productModal) productModal.classList.remove('visible'); };

// Qty Controls
qtyMinus.onclick = () => { if (qtyInput.value > 1) qtyInput.value--; };
qtyPlus.onclick = () => { qtyInput.value++; };


// --- Cart Logic ---

window.addToCart = (id, qty = 1) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty, cartId: Date.now() });
    }

    saveCart();
    updateCartUI();

    // Simple notification
    const countBadge = document.getElementById('cart-count');
    countBadge.style.transform = "scale(1.5)";
    setTimeout(() => countBadge.style.transform = "scale(1)", 200);
};

function updateCartUI() {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.textContent = totalQty;

    const total = cart.reduce((acc, item) => acc + (parseInt(item.price) * item.quantity), 0);
    cartTotalEl.textContent = `₡${total.toLocaleString()}`;

    // Update header total
    const headerTotal = document.getElementById('cart-total-header');
    if (headerTotal) {
        headerTotal.textContent = `₡${total.toLocaleString()}`;
    }

    // Update cart count badge attribute for styling
    const countBadge = document.getElementById('cart-count');
    if (countBadge) {
        countBadge.setAttribute('data-count', totalQty);
    }

    // Update floating order button
    const floatingBtn = document.getElementById('floating-order-btn');
    const floatingCount = document.getElementById('floating-count');
    const floatingTotal = document.getElementById('floating-total');

    if (floatingBtn && floatingCount && floatingTotal) {
        floatingCount.textContent = totalQty;
        floatingTotal.textContent = `₡${total.toLocaleString()}`;

        if (totalQty > 0) {
            floatingBtn.classList.remove('hidden-init');
        } else {
            floatingBtn.classList.add('hidden-init');
        }
    }

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-msg">Tu pedido está vacío.</p>`;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">₡${item.price} x ${item.quantity}</div>
                </div>
                <div style="display:flex; align-items:center; gap:0.5rem">
                    <button onclick="updateItemQty(${item.cartId}, -1)" style="border:1px solid #ddd; bg:transparent; width:24px; border-radius:4px">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateItemQty(${item.cartId}, 1)" style="border:1px solid #ddd; bg:transparent; width:24px; border-radius:4px">+</button>
                </div>
            </div>
        `).join('');
    }

    localStorage.setItem('cart', JSON.stringify(cart));
}

window.updateItemQty = (cartId, delta) => {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.cartId !== cartId);
    }
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Cart Modal
document.getElementById('cart-toggle').onclick = () => cartModal.classList.add('visible');
document.getElementById('close-cart').onclick = () => cartModal.classList.remove('visible');
cartModal.onclick = (e) => { if (e.target === cartModal) cartModal.classList.remove('visible'); };

// Floating Order Button - Opens Cart
document.getElementById('floating-order-btn').onclick = () => cartModal.classList.add('visible');

// Checkout
document.getElementById('checkout-btn').onclick = () => {
    if (cart.length === 0) return;

    let msg = `Hola ${storeName}, me gustaría ordenar:\n\n`;
    cart.forEach(item => {
        msg += `- ${item.quantity}x ${item.title}\n`;
    });
    msg += `\nQuedo atento para coordinar el total y el pago.\n\n`;
    msg += `Tipo de entrega:\n[ ] Recoger en local\n[ ] Express (envío a domicilio)\n\n`;

    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
};

init();

// New Order Button - Clear cart
document.getElementById('new-order-btn').onclick = () => {
    if (cart.length === 0) return;

    if (confirm('¿Estás seguro de que deseas vaciar el carrito y crear una nueva orden?')) {
        cart = [];
        saveCart();
        updateCartUI();
        cartModal.classList.remove('visible');
    }
};
