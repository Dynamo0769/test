document.addEventListener('DOMContentLoaded', () => {

    // --- Component & Data Loading ---
    async function loadComponent(url, placeholderId) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            document.getElementById(placeholderId).innerHTML = await response.text();
        } catch (error) { console.error(`Error loading component: ${error}`); }
    }

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
            return await response.json();
        } catch (error) { console.error(error); return null; }
    }

    // --- Dynamic Page Builders ---
    async function buildProductGrid(products) {
        const container = document.getElementById('product-grid-container');
        if (!container) return;
        container.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.imageUrl}" alt="${p.name}">
                <div class="product-info">
                    <h3>${p.name}</h3><p class="price">₱${p.price}</p>
                    <div class="product-buttons"><a href="product-details.html?id=${p.id}" class="btn-details">More Details</a></div>
                </div>
            </div>`).join('');
    }

    async function buildProductDetailsPage(allProducts) {
        const container = document.getElementById('product-details-container');
        if (!container) return;

        const productId = new URLSearchParams(window.location.search).get('id');
        const product = allProducts.find(p => p.id == productId);

        if (!product) { container.innerHTML = '<p>Product not found.</p>'; return; }

        const recommendations = allProducts.filter(p => product.recommendation_ids.includes(p.id));

        container.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-image-gallery"><img src="${product.imageUrl}" alt="${product.name}"></div>
                <div class="product-details-content">
                    <div class="product-main-info">
                        <h1>${product.name}</h1>
                        <div class="product-rating">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))} <span>${product.rating}/5</span></div>
                        <div class="product-price-details">
                            <span class="product-current-price">₱${product.price}</span>
                            ${product.originalPrice ? `<span class="product-original-price">₱${product.originalPrice}</span>` : ''}
                            ${product.discount ? `<span class="product-discount">-${product.discount}%</span>` : ''}
                        </div>
                        <p class="product-description">${product.description}</p>
                        <div class="product-features"><ul>${product.features.map(f => `<li>${f}</li>`).join('')}</ul></div>
                        <div class="product-actions">
                            <div class="quantity-selector"><button id="decrease-qty">-</button><span id="quantity">1</span><button id="increase-qty">+</button></div>
                            <button class="btn-reserve">Reserve</button>
                        </div>
                    </div>
                </div>
            </div>
            <section class="reviews-section">
                <div class="section-header"><h2>Ratings & Reviews</h2><button class="btn-details">Write a Review</button></div>
                <div class="review-grid">${product.reviews.map(r => `<div class="review-card"><div class="product-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><p>"${r.comment}"</p><span class="review-author">- ${r.customer}</span></div>`).join('')}</div>
            </section>
            <section class="recommendations-section">
                <div class="section-header"><h2>Recommendations</h2></div>
                <div class="product-grid">${recommendations.map(p => `<div class="product-card"><img src="${p.imageUrl}" alt="${p.name}"><div class="product-info"><h3>${p.name}</h3><p class="price">₱${p.price}</p><div class="product-buttons"><a href="product-details.html?id=${p.id}" class="btn-details">View</a></div></div></div>`).join('')}</div>
            </section>
        `;
        
        const qtyEl = document.getElementById('quantity');
        document.getElementById('increase-qty').addEventListener('click', () => qtyEl.textContent = parseInt(qtyEl.textContent) + 1);
        document.getElementById('decrease-qty').addEventListener('click', () => {
            let qty = parseInt(qtyEl.textContent);
            if (qty > 1) qtyEl.textContent = qty - 1;
        });
    }

    // --- Script Initializers & Page Routing ---
    const page = window.location.pathname.split('/').pop() || 'index.html';

    async function loadPage() {
        const headerUrl = (page === 'index.html') ? 'components/header-logged-out.html' : 'components/header-logged-in.html';
        if (['index.html', 'dashboard.html', 'product-details.html'].includes(page) || page === '') {
            await Promise.all([
                loadComponent(headerUrl, 'header-placeholder'),
                loadComponent('components/footer.html', 'footer-placeholder')
            ]);
        }

        if (page === 'dashboard.html') {
            const products = await fetchData('data/products.json');
            if (products) await buildProductGrid(products);
        } else if (page === 'product-details.html') {
            const allProducts = await fetchData('data/products.json');
            if (allProducts) await buildProductDetailsPage(allProducts);
        } else if (page === 'login.html') {
            if (new URLSearchParams(window.location.search).get('registered') === 'true') showPopup('success-popup');
            document.getElementById('login-form').addEventListener('submit', e => {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
            });
        } else if (page === 'register.html') {
            document.getElementById('register-form').addEventListener('submit', e => {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => { window.location.href = 'login.html?registered=true'; }, 500);
            });
        }
        
        if (document.querySelector('.main-nav')) highlightActiveLink();
        initializeMainScripts();
    }

    function initializeMainScripts() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) logoutButton.addEventListener('click', () => {
            document.body.classList.add('fade-out');
            setTimeout(() => { window.location.href = 'index.html'; }, 500);
        });
        document.body.addEventListener('click', event => {
            if (event.target.matches('.btn-reserve')) {
                const cartCountEl = document.getElementById('cart-count');
                if(cartCountEl) cartCountEl.textContent = parseInt(cartCountEl.textContent) + parseInt(document.getElementById('quantity').textContent);
            }
        });
    }
    function showPopup(id, dur = 2000) {
        const popup = document.getElementById(id);
        if (popup) { popup.classList.add('show'); setTimeout(() => { popup.classList.remove('show'); }, dur); }
    }
    function highlightActiveLink() {
        const navLinks = document.querySelectorAll('.main-nav a');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }

    loadPage();
});
